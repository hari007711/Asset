"use client";

import { DataTablePagination } from "@/components/Pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Activity,
  ArrowUpDown,
  ChevronDown,
  Hammer,
  Keyboard,
  Laptop,
  Monitor,
  Mouse,
  Package,
  Search,
  UserCheck,
  UserX,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Activity = {
  id: string;
  asset_id: string;
  old_status: string;
  new_status: string;
  owned_by: string | null;
  changed_by: string;
  changed_at: string;
};

type Asset = {
  id: string;
  asset_name: string;
  ant_tag: string;
  category: string;
  model_name: string;
};

type User = {
  email: string;
  name: string;
};

export default function HistoryPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activityFilter, setActivityFilter] = useState<string>("all");
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      await supabase.auth.getUser();
    };

    const fetchData = async () => {
      try {
        const [activitiesData, assetsData, usersData] = await Promise.all([
          api.getAssetStatusHistory(),
          api.getAllAssets(),
          api.getUsers(),
        ]);
        setActivities(activitiesData);
        setAssets(assetsData);
        setUsers(usersData);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Failed to fetch data:", error.message);
        } else {
          console.error("Failed to fetch data: Unknown error");
        }
        setActivities([]);
        setAssets([]);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
    fetchData();
  }, [supabase, router]);

  const filteredActivities = useMemo(() => {
    const sortedActivities = [...activities].sort(
      (a, b) =>
        new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime()
    );
    return sortedActivities.filter((activity) => {
      const matchesFilter =
        activityFilter === "all" ||
        (activityFilter === "assignments" &&
          activity.old_status === "unallocated" &&
          activity.new_status === "allocated") ||
        (activityFilter === "unassignments" &&
          activity.old_status === "allocated" &&
          activity.new_status === "unallocated") ||
        (activityFilter === "repairs" &&
          activity.new_status === "under repair");

      return matchesFilter;
    });
  }, [activities, activityFilter]);


  const columns: ColumnDef<Activity>[] = useMemo(
    () => [
      {
        accessorKey: "asset_name",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Asset
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const activity = row.original;
          const asset = assets.find((a) => a.id === activity.asset_id);
          const assetName = asset?.asset_name || "Unknown Asset";
          const category = asset?.category || "Unknown";

          const getEmoji = (cat: string) => {
            switch (cat) {
              case "laptop":
                return <Laptop className="text-blue-400 hover:text-blue-500" />;
              case "monitor":
                return (
                  <Monitor className="text-blue-400 hover:text-blue-500" />
                );
              case "mouse":
                return <Mouse className="text-blue-400 hover:text-blue-500" />;
              case "keyboard":
                return (
                  <Keyboard className="text-blue-400 hover:text-blue-500" />
                );
              default:
                return (
                  <Package className="text-blue-400 hover:text-blue-500" />
                );
            }
          };
          return (
            <div className="flex items-center gap-2 cursor-pointer">
              <span className="text-xl text-blue-400">
                {getEmoji(category.toLowerCase())}
              </span>
              <div className="font-medium ">
                <Link
                  href={`/admin/assets/${activity.asset_id}`}
                  className=" text-blue-400 hover:text-blue-500 font-bold  dark:text-slate-200  transition-colors"
                >
                  {assetName}
                </Link>
              </div>
            </div>
          );
        },
        sortingFn: (rowA, rowB) => {
          const assetA = assets.find((a) => a.id === rowA.original.asset_id);
          const assetB = assets.find((a) => a.id === rowB.original.asset_id);
          const nameA = assetA?.asset_name || "Unknown Asset";
          const nameB = assetB?.asset_name || "Unknown Asset";
          return nameA.localeCompare(nameB);
        },
        filterFn: (row, id, value) => {
          const asset = assets.find((a) => a.id === row.original.asset_id);
          const assetName = asset?.asset_name?.toLowerCase() || "";
          const antTag = asset?.ant_tag?.toLowerCase() || "";
          return (
            assetName.includes(value.toLowerCase()) ||
            antTag.includes(value.toLowerCase())
          );
        },
      },
      {
        accessorKey: "assigned_to_employee",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Assigned to
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const activity = row.original;
          const ownedByEmail =
            activity.new_status === "allocated" ? activity.owned_by : null;
          const user = ownedByEmail
            ? users.find((u) => u.email === ownedByEmail)
            : null;
          return (
            <div className="flex items-center gap-2">
              {ownedByEmail ? (
                <div className="font-medium">{user?.name || ownedByEmail}</div>
              ) : (
                <div className="text-center">--</div>
              )}
            </div>
          );
        },
        sortingFn: (rowA, rowB) => {
          const userA = users.find((u) => u.email === rowA.original.owned_by);
          const userB = users.find((u) => u.email === rowB.original.owned_by);
          const nameA = userA?.name || rowA.original.owned_by || "";
          const nameB = userB?.name || rowB.original.owned_by || "";
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
            >
              Date
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
          const now = new Date();
          const diffInMinutes = Math.floor(
            (now.getTime() - date.getTime()) / (1000 * 60)
          );
          let timeAgo;
          if (diffInMinutes < 1) timeAgo = "Just now";
          else if (diffInMinutes < 60) timeAgo = `${diffInMinutes}m ago`;
          else if (diffInMinutes < 1440)
            timeAgo = `${Math.floor(diffInMinutes / 60)}h ago`;
          else timeAgo = `${Math.floor(diffInMinutes / 1440)}d ago`;

          return (
            <div className="flex flex-col text-sm text-muted-foreground">
              <div className="font-medium">{formattedDate}</div>
              <div className="text-xs">
                {formattedTime} ({timeAgo})
              </div>
            </div>
          );
        },
      },
    ],
    [assets, users]
  );

  const table = useReactTable({
    data: filteredActivities,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter: searchTerm,
    },
    onGlobalFilterChange: setSearchTerm,
  });

  return (
    <div className="min-h-screen bg-[#f4f4f4]">
      <main className=" p-5">
        <div className="space-y-6">
          {!loading && activities.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{activities.length}</p>
                      <p className="text-sm text-muted-foreground">
                        Total Activities
                      </p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Activity className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">
                        {
                          activities.filter((a) => a.new_status === "allocated")
                            .length
                        }
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Assignments
                      </p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <UserCheck className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">
                        {
                          activities.filter(
                            (a) =>
                              a.old_status === "allocated" &&
                              a.new_status === "unallocated"
                          ).length
                        }
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Unassignments
                      </p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <UserX className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">
                        {
                          activities.filter(
                            (a) => a.new_status === "under repair"
                          ).length
                        }
                      </p>
                      <p className="text-sm text-muted-foreground">Repairs</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Hammer className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <Card className="">
            <CardHeader>
              <CardTitle>All Activities</CardTitle>
              <CardDescription>
                Complete history of asset status changes and assignments
              </CardDescription>
            </CardHeader>
            <div className="px-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex flex-col md:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search activities..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="capitalize cursor-pointer"
                    >
                      <ChevronDown className="mr-2 h-4 w-4" />
                      {activityFilter === "all"
                        ? "All Activities"
                        : activityFilter}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuRadioGroup
                      value={activityFilter}
                      onValueChange={setActivityFilter}
                    >
                      <DropdownMenuRadioItem value="all">
                        All Activities
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="assignments">
                        Assignments
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="unassignments">
                        Unassignments
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="repairs">
                        Repairs
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2" />
                  Loading assets...
                </div>
              ) : filteredActivities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {activities.length === 0 ? (
                    <div>
                      <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No activities found</p>
                      <p className="text-xs mt-1">
                        Activities will appear here when assets are assigned or
                        status changes occur
                      </p>
                    </div>
                  ) : (
                    <p>No activities match your search criteria</p>
                  )}
                </div>
              ) : (
                <div>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                          <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                              <TableHead key={header.id}>
                                {header.isPlaceholder
                                  ? null
                                  : flexRender(
                                      header.column.columnDef.header,
                                      header.getContext()
                                    )}
                              </TableHead>
                            ))}
                          </TableRow>
                        ))}
                      </TableHeader>
                      <TableBody>
                        {table.getRowModel().rows.map((row, index) => (
                          <TableRow
                            key={row.id}
                            className={`hover:bg-blue-50 transition-colors ${
                              index % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }`}
                          >
                            {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id}>
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex items-center justify-end space-x-2 py-4">
                    <div className="text-muted-foreground flex-1 text-sm">
                      <DataTablePagination table={table} />
                    </div>
                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
