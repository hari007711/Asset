"use client";

import AssetBasicInfo from "@/components/AssetDetails/AssetBasicInfo";
import AssetHistory from "@/components/AssetDetails/AssetHistory";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowLeft,
  ArrowUpDown,
  CheckCircle,
  Clock,
  Keyboard,
  Laptop,
  Minus,
  Monitor,
  Mouse,
  Package2,
  Pen,
  Wrench,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type AssetHistoryEntry = {
  id: string;
  asset_id: string;
  old_status: string;
  new_status: string;
  owned_by: string | null;
  changed_by: string;
  changed_at: string;
  asset_name: string;
  model_name: string;
  ant_tag: string;
  category: string;
  manufacturer: string;
  serial_number: string;
  cost: string;
  status: string;
};

type Asset = {
  id: string;
  asset_name: string;
  model_name: string;
  model_number: string;
  manufacturer: string;
  serial_number: string;
  ant_tag: string;
  category: string;
  cost: string;
  purchase_date: string;
  warranty_expiry: string;
  status: string;
  owner: string;
};

type User = {
  id: string;
  name: string;
  email: string;
};

type EditAssetPayload = Partial<{
  asset_name: string;
  serial_number: string;
  cost: number;
  purchase_date: string;
  warranty_expiry: string;
}>;

const getCategoryIcon = (category: string, size: "sm" | "md" | "lg" = "md") => {
  const sizeClass = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }[size];

  const iconProps = { className: `${sizeClass} text-slate-600` };

  switch (category) {
    case "laptop":
      return <Laptop {...iconProps} />;
    case "monitor":
      return <Monitor {...iconProps} />;
    case "mouse":
      return <Mouse {...iconProps} />;
    case "keyboard":
      return <Keyboard {...iconProps} />;
    default:
      return <Package2 {...iconProps} />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "allocated":
      return (
        <Badge className="p-2 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
          <CheckCircle className="w-3 h-3 mr-1" />
          Allocated
        </Badge>
      );
    case "available":
      return (
        <Badge className="p-2 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
          <Clock className="w-3 h-3 mr-1" />
          Available
        </Badge>
      );

    case "under repair":
      return (
        <Badge className="p-2 bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100">
          <Wrench className="w-3 h-3 mr-1" />
          Under Repair
        </Badge>
      );
    case "retired":
      return (
        <Badge className="p-2 bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100">
          <XCircle className="w-3 h-3 mr-1" />
          Retired
        </Badge>
      );
    default:
      return (
        <Badge className="p-2 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
          <Clock className="w-3 h-3 mr-1" />
          Available
        </Badge>
      );
  }
};

export default function AssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const assetId = params.id as string;
  const [asset, setAsset] = useState<Asset | null>(null);
  const [assetHistory, setAssetHistory] = useState<AssetHistoryEntry[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editMessage, setEditMessage] = useState("");
  const [editMessageType, setEditMessageType] = useState<"success" | "error">(
    "error"
  );
  const [editFormData, setEditFormData] = useState({
    asset_name: "",
    serial_number: "",
    cost: "",
    purchase_date: "",
    warranty_expiry: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const columns: ColumnDef<AssetHistoryEntry>[] = useMemo(
    () => [
      {
        accessorKey: "asset_name",
        header: "Asset Name",
        cell: () => {
          const assetName = asset?.asset_name || "Unknown Asset";
          const category = asset?.category || "Unknown";
          return (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-50 rounded-lg">
                {getCategoryIcon(category, "sm")}
              </div>
              <div>
                <div className="font-semibold text-slate-900">{assetName}</div>
              </div>
            </div>
          );
        },
        filterFn: (row, id, value) => {
          const assetName = asset?.asset_name?.toLowerCase() || "";
          const antTag = asset?.ant_tag?.toLowerCase() || "";
          return (
            assetName.includes(value.toLowerCase()) ||
            antTag.includes(value.toLowerCase())
          );
        },
      },
      {
        accessorKey: "owned_by",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="hover:bg-slate-50"
            >
              Assigned To
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const ownedByEmail = row.original.owned_by;
          const user = users.find((u) => u.email === ownedByEmail);
          return (
            <div className="flex items-center gap-3">
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
        sortingFn: (rowA, rowB) => {
          const ownedByA = rowA.original.owned_by;
          const ownedByB = rowB.original.owned_by;
          const nameA = ownedByA
            ? users.find((u) => u.email === ownedByA)?.name || ownedByA
            : "";
          const nameB = ownedByB
            ? users.find((u) => u.email === ownedByB)?.name || ownedByB
            : "";
          return nameA.localeCompare(nameB);
        },
        filterFn: (row, id, value) => {
          const ownedByEmail = row.original.owned_by;
          const user = users.find((u) => u.email === ownedByEmail);
          const userName = user?.name?.toLowerCase() || "";
          return (
            ownedByEmail?.toLowerCase().includes(value.toLowerCase()) ||
            userName.includes(value.toLowerCase())
          );
        },
      },
      {
        accessorKey: "old_status",
        header: "Previous State",
        cell: ({ row }) => {
          const status = row.original.old_status.toLowerCase();
          const getStatusBadge = (s: string) => {
            switch (s) {
              case "allocated":
                return (
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-800"
                  >
                    Allocated
                  </Badge>
                );
              case "unallocated":
                return (
                  <Badge
                    variant="outline"
                    className="bg-blue-100 text-blue-800"
                  >
                    Available
                  </Badge>
                );
              case "available":
                return (
                  <Badge
                    variant="outline"
                    className="border-blue-300 bg-blue-50 text-blue-800"
                  >
                    Available
                  </Badge>
                );
              case "maintenance":
                return (
                  <Badge variant="outline" className="bg-red-100 text-red-800">
                    Maintenance
                  </Badge>
                );
              case "in repair":
                return (
                  <Badge variant="outline" className="bg-gray-100 text-red-800">
                    In Repair
                  </Badge>
                );
              case "retired":
                return (
                  <Badge
                    variant="outline"
                    className="bg-orange-100 text-orange-800"
                  >
                    Retired
                  </Badge>
                );
              default:
                return <Badge variant="secondary">{s}</Badge>;
            }
          };
          return getStatusBadge(status);
        },
      },
      {
        accessorKey: "new_status",
        header: "Current State",
        cell: ({ row }) => {
          const status = row.original.new_status;
          const getStatusBadge = (s: string) => {
            switch (s) {
              case "allocated":
                return (
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-800"
                  >
                    Allocated
                  </Badge>
                );
              case "unallocated":
                return (
                  <Badge
                    variant="outline"
                    className="bg-blue-100 text-blue-800"
                  >
                    Available
                  </Badge>
                );
              case "available":
                return (
                  <Badge
                    variant="outline"
                    className="border-blue-300 bg-blue-50 text-blue-800"
                  >
                    Available
                  </Badge>
                );
              case "maintenance":
                return (
                  <Badge variant="outline" className="bg-red-100 text-red-800">
                    Maintenance
                  </Badge>
                );
              case "in repair":
                return (
                  <Badge variant="outline" className="bg-gray-100 text-red-800">
                    In Repair
                  </Badge>
                );
              case "retired":
                return (
                  <Badge
                    variant="outline"
                    className="bg-orange-100 text-orange-800"
                  >
                    Retired
                  </Badge>
                );
              default:
                return <Badge variant="secondary">{s}</Badge>;
            }
          };
          return getStatusBadge(status);
        },
      },
      {
        accessorKey: "changed_at",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="hover:bg-slate-50"
            >
              Date & Time
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
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
              <div className="text-xs text-slate-500 ">{formattedTime}</div>
            </div>
          );
        },
      },
    ],
    [asset, users]
  );

  const table = useReactTable({
    data: assetHistory,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter: searchTerm,
    },
    onGlobalFilterChange: setSearchTerm,
  });

  useEffect(() => {
    const fetchAssetData = async () => {
      try {
        const [assetsData, usersData] = await Promise.all([
          api.getAllAssets(),
          api.getUsers(),
        ]);
        const foundAsset = (assetsData as Asset[]).find(
          (a) => a.id === assetId
        );

        if (!foundAsset) {
          router.push("/admin/assets");
          return;
        }
        setAsset(foundAsset);
        setUsers(usersData);
        setEditFormData({
          asset_name: foundAsset.asset_name || "",
          serial_number: foundAsset.serial_number || "",
          cost: foundAsset.cost?.toString() || "",
          purchase_date: foundAsset.purchase_date || "",
          warranty_expiry: foundAsset.warranty_expiry || "",
        });
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Failed to fetch asset data:", error.message);
        } else {
          console.error("Failed to fetch asset data: Unknown error");
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchAssetHistory = async () => {
      try {
        const historyData = await api.getAssetStatusHistory();
        const assetSpecificHistory = (
          historyData as AssetHistoryEntry[]
        ).filter((h) => h.asset_id === assetId);

        setAssetHistory(assetSpecificHistory);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Failed to fetch asset history:", error.message);
        } else {
          console.error("Failed to fetch asset history:", error);
        }

        setAssetHistory([]);
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchAssetData();
    fetchAssetHistory();
  }, [assetId, router]);

  const handleAssetUpdate = () => {
    const fetchAsset = async () => {
      try {
        const assetsData = await api.getAllAssets();
        const foundAsset = (assetsData as Asset[]).find(
          (a) => a.id === assetId
        );

        if (foundAsset) {
          setAsset(foundAsset);
          setEditFormData({
            asset_name: foundAsset.asset_name || "",
            serial_number: foundAsset.serial_number || "",
            cost: foundAsset.cost?.toString() || "",
            purchase_date: foundAsset.purchase_date || "",
            warranty_expiry: foundAsset.warranty_expiry || "",
          });
        }
      } catch (error: unknown) {
        console.error("Failed to fetch dashboard data:", error);
      }
    };

    const fetchHistory = async () => {
      try {
        const historyData = await api.getAssetStatusHistory();
        const assetSpecificHistory = (
          historyData as AssetHistoryEntry[]
        ).filter((h) => h.asset_id === assetId);

        setAssetHistory(assetSpecificHistory);
      } catch (error: unknown) {
        console.error("Failed to fetch dashboard data:", error);
      }
    };
    fetchAsset();
    fetchHistory();
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    setEditMessage("");
    try {
      const payload: EditAssetPayload = {};
      if (editFormData.asset_name !== asset?.asset_name) {
        payload.asset_name = editFormData.asset_name;
      }
      if (editFormData.serial_number !== asset?.serial_number) {
        payload.serial_number = editFormData.serial_number;
      }
      if (editFormData.cost !== asset?.cost?.toString()) {
        payload.cost = parseFloat(editFormData.cost) || 0;
      }
      if (editFormData.purchase_date !== asset?.purchase_date) {
        payload.purchase_date = editFormData.purchase_date;
      }
      if (editFormData.warranty_expiry !== asset?.warranty_expiry) {
        payload.warranty_expiry = editFormData.warranty_expiry;
      }
      if (Object.keys(payload).length === 0) {
        setEditMessage("No changes detected");
        setEditMessageType("error");
        return;
      }
      if (!asset?.id) return;

      await api.editAsset(asset.id, payload);
      setEditMessage("Asset updated successfully!");
      setEditMessageType("success");
      handleAssetUpdate();
      setTimeout(() => {
        setEditDialogOpen(false);
        setEditMessage("");
      }, 1500);
    } catch (error: unknown) {
      let message = "Failed to update asset";

      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === "string") {
        message = error;
      }

      setEditMessage(message);
      setEditMessageType("error");
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2" />
        Loading asset details...
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package2 className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Asset not found
          </h2>
          <p className="text-slate-600 mb-4">
            The requested asset could not be located
          </p>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/admin/assets">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Assets
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f4]">
      <div className="">
        <div className=" px-5 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="bg-[#c2c2c2] hover:bg-[#a7a7a7] p-3 cursor-pointer"
              >
                <ArrowLeft className="w-2 h-2" />
              </Button>
              <div>
                <p className="font-semibold text-black text-lg mt-1">
                  {asset.asset_name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="">
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="ml-2 bg-gradient-to-r from-blue-50 to-blue-50 hover:from-blue-100 hover:to-blue-100 border-blue-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
                    >
                      <Pen className=" w-4 h-4 text-blue-600" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-100 rounded-lg">
                          <Pen className="w-4 h-4 text-blue-600" />
                        </div>
                        Edit Asset Details
                      </DialogTitle>
                      <DialogDescription>
                        Update the details for{" "}
                        <span className="font-medium">{asset.asset_name}</span>
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-5">
                      <div className="space-y-2">
                        <Label
                          htmlFor="edit_asset_name"
                          className="text-sm font-medium text-slate-700"
                        >
                          Asset Name
                        </Label>
                        <Input
                          id="edit_asset_name"
                          name="asset_name"
                          value={editFormData.asset_name}
                          onChange={handleEditInputChange}
                          placeholder="Enter asset name"
                          className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="edit_serial_number"
                          className="text-sm font-medium text-slate-700"
                        >
                          Serial Number
                        </Label>
                        <Input
                          id="edit_serial_number"
                          name="serial_number"
                          value={editFormData.serial_number}
                          onChange={handleEditInputChange}
                          placeholder="Enter serial number"
                          className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 font-mono"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="edit_cost"
                          className="text-sm font-medium text-slate-700"
                        >
                          Cost (₹)
                        </Label>
                        <Input
                          id="edit_cost"
                          name="cost"
                          type="number"
                          step="0.01"
                          value={editFormData.cost}
                          onChange={handleEditInputChange}
                          placeholder="Enter cost"
                          className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="edit_purchase_date"
                            className="text-sm font-medium text-slate-700"
                          >
                            Purchase Date
                          </Label>
                          <Input
                            id="edit_purchase_date"
                            name="purchase_date"
                            type="date"
                            value={editFormData.purchase_date}
                            onChange={handleEditInputChange}
                            className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="edit_warranty_expiry"
                            className="text-sm font-medium text-slate-700"
                          >
                            Warranty Expiry
                          </Label>
                          <Input
                            id="edit_warranty_expiry"
                            name="warranty_expiry"
                            type="date"
                            value={editFormData.warranty_expiry}
                            onChange={handleEditInputChange}
                            className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      {editMessage && (
                        <Alert
                          variant={
                            editMessageType === "error"
                              ? "destructive"
                              : "default"
                          }
                          className={
                            editMessageType === "success"
                              ? "bg-green-50 border-green-200 text-green-800"
                              : ""
                          }
                        >
                          <AlertDescription>{editMessage}</AlertDescription>
                        </Alert>
                      )}

                      <div className="flex gap-3 pt-2">
                        <Button
                          type="submit"
                          disabled={editLoading}
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                          {editLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Update Asset
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setEditDialogOpen(false)}
                          disabled={editLoading}
                          className="hover:bg-slate-50"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              {getStatusBadge(asset.status)}
            </div>
          </div>
        </div>
      </div>
      <main className=" px-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-6">
            <AssetHistory
              historyLoading={historyLoading}
              assetHistory={assetHistory}
              table={table}
            />
          </div>
          <div className="space-y-6">
            <AssetBasicInfo
              asset={asset}
              users={users}
              getCategoryIcon={getCategoryIcon}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
