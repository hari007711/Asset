"use client";

import DashboardCards from "@/components/Dashboard/DashboardCards";
import DashboardStatus from "@/components/Dashboard/DashboardStatus";
import DashboardTable, { ActivityForTable, AssetForTable } from "@/components/Dashboard/DashboardTable";
import LaptopsOverview from "@/components/LaptopsOverview";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

interface AssetModel {
  category: string;
}

interface Asset {
  id: string;
  status: string;
  asset_models?: AssetModel;
}

export default function AdminDashboard() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [assetCounts, setAssetCounts] = useState({
    total: 0,
    allocated: 0,
    available: 0,
    underRepair: 0,
    retired: 0,
    maintenance: 0,
  });
  const [recentActivities, setRecentActivities] = useState<ActivityForTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("laptop");

  const fetchDashboardData = useCallback(async () => {
    try {
      const assetsData: Asset[] = await api.getAllAssets();
      setAssets(assetsData);
      calculateCounts(assetsData, statusFilter);

      try {
        const activities = await api.getAssetStatusHistory();
        const sortedActivities: ActivityForTable[] = activities
          .sort(
            (a: ActivityForTable, b: ActivityForTable) =>
              new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime()
          )
          .slice(0, 4);
        setRecentActivities(sortedActivities);
      } catch (activityError: unknown) {
        console.error("Failed to fetch activities:", activityError);
        setRecentActivities([]);
      }
    } catch (error: unknown) {
      console.error("Failed to fetch dashboard data:", error);
      setAssets([]);
      setAssetCounts({
        total: 0,
        allocated: 0,
        available: 0,
        underRepair: 0,
        retired: 0,
        maintenance: 0,
      });
      setRecentActivities([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  const calculateCounts = (assetsData: Asset[], filter: string) => {
    let filteredAssets = assetsData;
    if (filter !== "all") {
      filteredAssets = assetsData.filter(
        (asset) =>
          asset.asset_models?.category.toLowerCase() === filter.toLowerCase()
      );
    }

    setAssetCounts({
      total: filteredAssets.length,
      allocated: filteredAssets.filter((a) => a.status === "allocated").length,
      available: filteredAssets.filter((a) => a.status === "available").length,
      underRepair: filteredAssets.filter((a) => a.status === "under repair").length,
      maintenance: filteredAssets.filter((a) => a.status === "maintenance").length,
      retired: filteredAssets.filter((a) => a.status === "retired").length,
    });
  };

  useEffect(() => {
    if (assets.length > 0) {
      calculateCounts(assets, statusFilter);
    }
  }, [statusFilter, assets]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const tableAssets: AssetForTable[] = assets.map((a) => ({
    id: a.id,
    asset_name: a.asset_models?.category || "Unknown",
  }));

  const categoryCounts = {
    laptop: assets.filter(a => a.asset_models?.category.toLowerCase() === "laptop").length,
    monitor: assets.filter(a => a.asset_models?.category.toLowerCase() === "monitor").length,
    keyboard: assets.filter(a => a.asset_models?.category.toLowerCase() === "keyboard").length,
    mouse: assets.filter(a => a.asset_models?.category.toLowerCase() === "mouse").length,
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] dark:bg-gray-900">
      <main className="py-4">
        <div className="px-10 py-2 flex items-center justify-between">
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <div className="flex gap-5">
            <Select onValueChange={setStatusFilter} defaultValue="laptop">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="laptop">Laptops</SelectItem>
                <SelectItem value="monitor">Monitors</SelectItem>
                <SelectItem value="keyboard">Keyboards</SelectItem>
                <SelectItem value="mouse">Mouse</SelectItem>
              </SelectContent>
            </Select>
            <Button asChild className="bg-blue-600 hover:bg-blue-700 p-3">
              <Link href="/admin/assets/new">
                <Plus className="w-6 h-6" />
                <span>Add Asset</span>
              </Link>
            </Button>
          </div>
        </div>

        <div className="px-10 py-2 flex 2xl:flex-row lg:flex-col gap-6">
          <div className="space-y-4 w-full 2xl:w-[80%]">
            <DashboardCards assetCounts={assetCounts} />
            <LaptopsOverview categoryCounts={categoryCounts} assets={assets} />
            <div className="mt-7 gap-8">
              <DashboardTable
                recentActivities={recentActivities}
                assets={tableAssets}
                loading={loading}
              />
            </div>
          </div>

          <div className="space-y-4 mt-1 w-full 2xl:w-[20%]">
            <DashboardStatus
              categoryCounts={categoryCounts}
              assetCounts={assetCounts}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
