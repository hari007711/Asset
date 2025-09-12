import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { flexRender, Table as TableType } from "@tanstack/react-table";
import { Activity } from "lucide-react";

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

interface AssetHistoryProps<TData> {
  historyLoading: boolean;
  assetHistory: AssetHistoryEntry[];
  table: TableType<TData>;
}

export default function AssetHistory<TData>({
  historyLoading,
  assetHistory,
  table,
}: AssetHistoryProps<TData>) {
  return (
    <Card className="border-gray-200 shadow-sm p-5 mb-5 bg-white">
      <CardHeader className="mb-0 p-5 rounded-2xl bg-blue-50 border-b border-gray-200">
        <CardTitle className="flex items-center text-black">
          Asset History
        </CardTitle>
      </CardHeader>

      <CardContent className="px-0">
        {historyLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-200 border-t-blue-600" />
              <span className="text-gray-600">Loading history...</span>
            </div>
          </div>
        ) : assetHistory.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-black mb-2">
              No history available
            </h3>
            <p className="text-gray-600 mb-1">
              History will appear here when status changes occur
            </p>
            <p className="text-xs text-gray-500">
              or assignments are made to this asset
            </p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg h-150 overflow-y-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="bg-blue-50 hover:bg-blue-50"
                  >
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="font-semibold text-black"
                      >
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
                      <TableCell key={cell.id} className="py-4">
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
        )}
      </CardContent>
    </Card>
  );
}
