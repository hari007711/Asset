"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Activity as ActivityIcon, ArrowUpRight, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "../ui/badge";

export type AssetForTable = {
  id: string;
  asset_name: string;
};

export type ActivityForTable = {
  id: string;
  asset_id: string;
  old_status: string;
  new_status: string;
  owned_by: string | null;
  changed_at: string;
};

interface DashboardTableProps {
  recentActivities: ActivityForTable[];
  assets: AssetForTable[];
  loading: boolean;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "allocated":
      return <Badge className="bg-green-100 text-green-800">Allocated</Badge>;
    case "available":
      return <Badge className="bg-blue-100 text-blue-800">Available</Badge>;
    case "maintenance":
      return <Badge className="bg-red-100 text-red-800">Maintenance</Badge>;
    case "in repair":
      return <Badge className="bg-gray-100 text-red-800">In Repair</Badge>;
    case "retired":
      return <Badge className="bg-orange-100 text-orange-800">Retired</Badge>;
    case "unallocated":
      return (
        <Badge className="bg-orange-100 text-orange-800">Unallocated</Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const DashboardTable = ({
  recentActivities,
  assets,
  loading,
}: DashboardTableProps) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");

  const assetMap = useMemo(() => {
    const map: Record<string, string> = {};
    assets.forEach((a) => {
      map[a.id] = a.asset_name;
    });
    return map;
  }, [assets]);

  const filteredActivities = useMemo(() => {
    let data = [...recentActivities];

    if (search.trim()) {
      data = data.filter(
        (activity) =>
          activity.owned_by?.toLowerCase().includes(search.toLowerCase()) ||
          assetMap[activity.asset_id]
            ?.toLowerCase()
            .includes(search.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      data = data.filter(
        (activity) =>
          activity.new_status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    data.sort((a, b) => {
      const assetA = assetMap[a.asset_id] || "";
      const assetB = assetMap[b.asset_id] || "";

      switch (sortBy) {
        case "date-asc":
          return (
            new Date(a.changed_at).getTime() - new Date(b.changed_at).getTime()
          );
        case "date-desc":
          return (
            new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime()
          );
        case "asset":
          return assetA.localeCompare(assetB);
        case "employee":
          return (a.owned_by || "").localeCompare(b.owned_by || "");
        default:
          return 0;
      }
    });

    return data;
  }, [recentActivities, assetMap, search, statusFilter, sortBy]);

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            Recent Activities
          </CardTitle>
          <CardDescription>
            Latest asset management activities and changes
          </CardDescription>
        </div>
        <Link href="/admin/history">
          <div className="p-3 rounded-lg bg-[#f7f7f7] cursor-pointer hover:bg-[#e6e6e6]">
            <ArrowUpRight className="w-6 h-6 text-gray-400" />
          </div>
        </Link>
      </CardHeader>

      <CardContent>
        <div className="flex justify-between flex-col md:flex-row gap-4 mb-4 items-center">
          <div className="flex gap-5">
            <Select onValueChange={setStatusFilter} defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="allocated">Allocated</SelectItem>
                <SelectItem value="under repair">Under Repair</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={setSortBy} defaultValue="date-desc">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Newest First</SelectItem>
                <SelectItem value="date-asc">Oldest First</SelectItem>
                <SelectItem value="asset">Asset Name</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2" />
            Loading activities...
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ActivityIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">No matching activities found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Previous Status</TableHead>
                <TableHead>Current Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredActivities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell className="font-medium py-3">
                    <Link
                      href={`/admin/assets/${activity.asset_id}`}
                      className="text-blue-700 hover:text-primary transition-colors"
                    >
                      {assetMap[activity.asset_id] || "Unknown Asset"}
                    </Link>
                  </TableCell>
                  <TableCell>{activity.owned_by || "Unassigned"}</TableCell>
                  <TableCell>{getStatusBadge(activity.old_status)}</TableCell>
                  <TableCell>{getStatusBadge(activity.new_status)}</TableCell>
                  <TableCell>
                    {new Date(activity.changed_at).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardTable;
