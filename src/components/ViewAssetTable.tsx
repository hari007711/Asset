"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  Keyboard,
  Laptop,
  Monitor,
  Mouse,
  Package,
} from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
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

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { api } from "@/lib/api";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import AssetActions from "./AssetActions";
import { DataTablePagination } from "./Pagination";

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
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case "laptop":
      return <Laptop className="text-blue-400 hover:text-blue-500" />;
    case "monitor":
      return <Monitor className="text-blue-400 hover:text-blue-500" />;
    case "mouse":
      return <Mouse className="text-blue-400 hover:text-blue-500" />;
    case "keyboard":
      return <Keyboard className="text-blue-400 hover:text-blue-500" />;
    default:
      return <Package className="text-blue-400 hover:text-blue-500" />;
  }
};

interface User {
  id: string;
  email: string;
  name?: string | null;
}

export interface Asset {
  id: number | string;
  asset_name: string;
  model_name?: string;
  category: string;
  status: string;
  owner?: string;
  assignedTo?: string;
  ant_tag?: string;
  serial_number?: string;
  email?: string;
  cost?: number;
}

interface ViewAssetsTableProps {
  assets: Asset[];
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
}

export function ViewAssetsTable({ assets, setAssets }: ViewAssetsTableProps) {
  const searchParams = useSearchParams();
  const initialStatusFilter = searchParams.get("status") || "";
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityFilter, setActivityFilter] = useState<string>("all");

  useEffect(() => {
    if (initialStatusFilter && initialStatusFilter !== "totalassets") {
      setColumnFilters([{ id: "status", value: initialStatusFilter }]);
    } else {
      setColumnFilters([]);
    }
  }, [initialStatusFilter]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await api.getUsers();
        setUsers(usersData);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        setUsers([]);
      } finally {
      }
    };

    fetchUsers();
  }, []);

  const handleAssetUpdate = () => {
    const fetchAssets = async () => {
      try {
        const assetsData = await api.getAllAssets();
        setAssets(assetsData);
      } catch (error) {
        console.error("Failed to refresh assets:", error);
      }
    };
    fetchAssets();
  };

  const filteredActivities = React.useMemo(() => {
    const sortedActivities = [...assets];
    return sortedActivities.filter((activity) => {
      const matchesFilter =
        activityFilter === "all" ||
        (activityFilter === "allocated" && activity.status === "allocated") ||
        (activityFilter === "unallocated" && activity.status !== "allocated");

      return matchesFilter;
    });
  }, [assets, activityFilter]);

  const columns: ColumnDef<Asset>[] = [
    {
      accessorKey: "asset_name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="text-left"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Asset
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => {
        const asset = row.original as Asset;
        return (
          <div className="capitalize flex items-center gap-2 cursor-pointer">
            <span className="text-lg">{getCategoryIcon(asset.category)}</span>
            <div className="font-medium ">
              <Link
                href={`/admin/assets/${asset.id}`}
                className=" text-blue-400 hover:text-blue-500 font-bold  dark:text-slate-200  transition-colors"
              >
                {row.getValue("asset_name") || "Unknown"}
              </Link>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "model_name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Model
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div>
            <p className="font-medium">{row.getValue("model_name")}</p>
          </div>
        );
      },
    },

    {
      accessorKey: "ant_tag",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Ant Tag
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div>
          <code className="text-sm bg-muted px-2 py-1 rounded">
            {row.getValue("ant_tag")}
          </code>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Status
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => <div>{getStatusBadge(row.getValue("status"))}</div>,
    },
    {
      accessorKey: "owner",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Assigned To
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => {
        const asset = row.original as Asset;
        return (
          <div>
            {asset.owner ? (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs text-white">
                  {(
                    users.find((u) => u.email === asset.owner)?.name ||
                    asset.owner
                  )
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <span className="text-sm">
                  {users.find((u) => u.email === asset.owner)?.name ||
                    asset.owner}
                </span>
              </div>
            ) : (
              <span className="text-muted-foreground text-sm">Unassigned</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "cost",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Cost
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="font-medium">₹{row.getValue("cost")}</div>
      ),
    },

    {
      id: "actions",
      enableHiding: false,
      header: () => <div>Actions</div>,
      cell: ({ row }) => {
        const asset = row.original as Asset;
        return (
          <div>
            <AssetActions
              asset={{
                ...asset,
                id: asset.id.toString(),
                status: asset.status ?? "",
              }}
              users={users}
              onUpdate={handleAssetUpdate}
            />
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredActivities,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      return String(row.getValue(columnId))
        .toLowerCase()
        .includes(filterValue.toLowerCase());
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Card>
      <CardHeader className="text-xl font-bold">Total Assets</CardHeader>
      <CardContent className="">
        <div className="w-full  ">
          <div className="flex items-center mb-4 ">
            <Input
              placeholder="Search..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="max-w-sm mr-5"
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="capitalize cursor-pointer">
                  <ChevronDown className="mr-2 h-4 w-4" />
                  {activityFilter === "all" ? "All Assets" : activityFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuRadioGroup
                  value={activityFilter}
                  onValueChange={setActivityFilter}
                >
                  <DropdownMenuRadioItem value="all">
                    All Assets
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="allocated">
                    Allocated
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="unallocated">
                    Unallocated
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="overflow-hidden rounded-md border ">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row, index) => (
                    <TableRow
                      key={row.id}
                      className={`hover:bg-blue-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell className="px-5" key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2" />
                          Loading assets...
                        </div>
                      ) : (
                        "No results."
                      )}
                    </TableCell>
                  </TableRow>
                )}
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
      </CardContent>
    </Card>
  );
}
