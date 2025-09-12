"use client";

import EmployeeAssetHistory from "@/components/Employee/EmployeeAssetHistory";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { api } from "@/lib/api";
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import {
  ArrowUpDown,
  Keyboard,
  Laptop,
  Minus,
  Monitor,
  Mouse,
  Package,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

interface Asset {
  id: string;
  asset_name: string;
  model_name: string;
  ant_tag: string;
  category: string;
  status?: string;
  created_at: string;
  current_owner?: string;
  cost: string;
}

interface AssetHistory {
  id: string;
  asset_id: string;
  owned_by?: string;
  new_status: string;
  old_status: string;
  changed_at: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}
interface AssetRow {
  id: string;
  asset_id: string;
  asset_name: string;
  model_name: string;
  category: string;
  ant_tag: string;
  cost: string;
  status: string;
  owned_by?: string;
  new_status: string;
  old_status: string;
  changed_at: string;
}

export default function AdminDashboard() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [assetHistory, setAssetHistory] = useState<AssetHistory[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const fetchAssets = async () => {
    try {
      const assetsData = await api.getAllAssets();
      setAssets(assetsData);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Failed to fetch dashboard data:", error.message);
      } else {
        console.error("Failed to fetch dashboard data: Unknown error");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    const formattedDate = format(new Date(date), "dd-MM-yyyy");
    return formattedDate;
  };

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case "laptop":
        return <Laptop className="text-black" />;
      case "monitor":
        return <Monitor className="text-black" />;
      case "mouse":
        return <Mouse className="text-black" />;
      case "keyboard":
        return <Keyboard className="text-black" />;
      default:
        return <Package className="text-black" />;
    }
  };

  const fetchData = async () => {
    try {
      const [activitiesData, usersData] = await Promise.all([
        api.getAssetStatusHistory(),
        api.getUsers(),
      ]);
      setAssetHistory(activitiesData);
      setUsers(usersData);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Failed to fetch dashboard data:", error.message);
      } else {
        console.error("Failed to fetch dashboard data: Unknown error");
      }
      setAssetHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleAssetClick = (assetId: string) => {
    if (selectedAssetId === assetId) {
      setSelectedAssetId(null);
    } else {
      setSelectedAssetId(assetId);
    }
  };

  const mergedData = useMemo<AssetRow[]>(() => {
    let historyData = assetHistory;

    if (selectedAssetId) {
      historyData = assetHistory.filter(
        (history) => history.asset_id === selectedAssetId
      );
    }

    return historyData
      .map((history) => {
        const asset = filteredAssets.find((a) => a.id === history.asset_id);

        if (!asset) return null;

        return {
          ...history,
          asset_name: asset.asset_name,
          model_name: asset.model_name,
          ant_tag: asset.ant_tag ?? "N/A", 
          category: asset.category,
          cost: asset.cost,
          status: asset.status || history.new_status,
        };
      })
      .filter((row): row is AssetRow => row !== null); 
  }, [assetHistory, filteredAssets, selectedAssetId]);

  const columns: ColumnDef<AssetRow>[] = useMemo(
    () => [
      {
        accessorKey: "asset_name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-slate-50 cursor-pointer"
          >
            Asset Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const assetName = row.original.asset_name || "Unknown Asset";
          const category = row.original.category || "Unknown";
          const antTag = row.original.ant_tag || "N/A";

          return (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-50 rounded-lg">
                {getCategoryIcon(category)}
              </div>
              <div>
                <div className="font-semibold text-slate-900">{assetName}</div>
                <div className="text-xs text-slate-500">{antTag}</div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "owned_by",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-slate-50 cursor-pointer"
          >
            Assigned To
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const ownedByEmail = row.original.owned_by;
          const user = users.find((u) => u.email === ownedByEmail);

          return (
            <div className="flex items-center gap-1">
              {ownedByEmail ? (
                <>
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {(user?.name || ownedByEmail).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">
                      {user?.name || ownedByEmail}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 text-slate-500">
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                    <Minus className="w-4 h-4" />
                  </div>
                  <span className="text-sm">Unassigned</span>
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "changed_at",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-slate-50 cursor-pointer"
          >
            Date & Time
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const date = new Date(row.original.changed_at);
          const formattedDate = date.toLocaleDateString();
          const formattedTime = date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div className="flex gap-3 items-center">
              <div className="font-medium text-slate-900">{formattedDate}</div>
              <div className="text-xs text-slate-500">{formattedTime}</div>
            </div>
          );
        },
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => {
          const category = row.original.category
            ? row.original.category.charAt(0).toUpperCase() +
              row.original.category.slice(1).toLowerCase()
            : "Unknown";

          return (
            <Badge className="bg-green-100 text-green-800">{category}</Badge>
          );
        },
      },
    ],
    [users]
  );

  useEffect(() => {
    if (email) {
      const matchingAssets = assets.filter(
        (asset) => asset.current_owner?.toLowerCase() === email.toLowerCase()
      );

      setFilteredAssets(matchingAssets);
    } else {
      setFilteredAssets(assets);
    }
  }, [assets, email]);

  useEffect(() => {
    fetchAssets();
    const storedEmail = sessionStorage.getItem("email") ?? "";
    const storedRole = sessionStorage.getItem("role") ?? "";
    setEmail(storedEmail);
    setRole(storedRole);
    fetchData();
  }, []);

  const table = useReactTable({
    data: mergedData, 
    columns,
    getPaginationRowModel: getPaginationRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue) => {
      return row.getAllCells().some((cell) =>
        String(cell.getValue() ?? "")
          .toLowerCase()
          .includes(filterValue.toLowerCase())
      );
    },
    state: {
      globalFilter,
    },
  });

  return (
    <div className="min-h-screen bg-[#f4f4f4] dark:bg-gray-900">
      <main className="py-4">
        <div className="px-10 py-2 flex items-center justify-between">
          <h2 className="text-3xl font-bold">Dashboard</h2>
        </div>

        <div className="px-10">
          {loading ? (
            <p>Loading assets...</p>
          ) : filteredAssets.length > 0 ? (
            <>
              <Card className="gap-2">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="w-4 h-4 text-slate-600" />
                    <h4 className="font-medium text-slate-900">
                      Allocated Assets ({filteredAssets.length})
                    </h4>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="border-slate-200 bg-slate-50">
                    <div className="p-5">
                      <div className="grid gap-3">
                        {filteredAssets.map(
                          (asset: Asset, assetIndex: number) => {
                            const assetKey: string =
                              asset?.id ??
                              asset?.ant_tag ??
                              `${asset?.asset_name ?? "asset"}-${assetIndex}`;
                            const isSelected = selectedAssetId === asset?.id;

                            return (
                              <React.Fragment key={assetKey}>
                                <div
                                  className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                                    isSelected
                                      ? "bg-blue-50 border-blue-300 shadow-md"
                                      : "bg-white border-slate-200 hover:shadow-sm hover:border-slate-300"
                                  }`}
                                  onClick={() => handleAssetClick(asset?.id)}
                                >
                                  <div className="flex items-center gap-4">
                                    <div
                                      className={`p-2 rounded-lg ${
                                        isSelected
                                          ? "bg-blue-100 text-blue-600"
                                          : "bg-slate-100 text-slate-600"
                                      }`}
                                    >
                                      {getCategoryIcon(asset?.category)}
                                    </div>
                                    <div>
                                      <p
                                        className={`font-medium ${
                                          isSelected
                                            ? "text-blue-900"
                                            : "text-slate-900"
                                        }`}
                                      >
                                        {asset?.asset_name}
                                      </p>
                                      <p
                                        className={`text-sm ${
                                          isSelected
                                            ? "text-blue-700"
                                            : "text-slate-600"
                                        }`}
                                      >
                                        {asset?.model_name} • {asset?.ant_tag}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <span
                                      className={`font-semibold ${
                                        isSelected
                                          ? "text-blue-700"
                                          : "text-gray-600"
                                      }`}
                                    >
                                      {formatDate(asset?.created_at)}
                                    </span>
                                  </div>
                                </div>

                                {isSelected && (
                                  <div className="ml-4 mr-4 mb-2">
                                    <div className="bg-white rounded-lg border border-blue-200 shadow-sm">
                                      <div className="p-4 bg-blue-50 border-b border-blue-200 rounded-t-lg">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            <Package className="w-4 h-4 text-blue-600" />
                                            <span className="text-blue-900 font-medium">
                                              History for: {asset?.asset_name}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="p-4">
                                        <EmployeeAssetHistory<AssetRow>
                                          historyLoading={historyLoading}
                                          assetHistory={mergedData} 
                                          table={table}
                                          globalFilter={globalFilter}
                                          setGlobalFilter={setGlobalFilter}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </React.Fragment>
                            );
                          }
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <p className="text-gray-500">No assets assigned to {role}</p>
          )}
        </div>
      </main>
    </div>
  );
}
