import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Activity,
  BarChart3,
  CheckCircle,
  DollarSign,
  Timer,
  User,
  Wrench,
  XCircle,
} from "lucide-react";

type AssetType = {
  cost?: number;
  purchase_date?: string;
  warranty_expiry?: string;
};

type AssetHistoryType = {
  new_status: string;
}[];

interface AssetStatisticsCardProps {
  asset: AssetType;
  assetHistory: AssetHistoryType;
}

export default function AssetStatisticsCard({
  asset,
  assetHistory,
}: AssetStatisticsCardProps) {
  return (
    <Card className="border-gray-200 shadow-sm p-5 bg-white">
      <CardHeader className="px-5 py-7 rounded-2xl bg-blue-50 border-b border-gray-200">
        <CardTitle className="flex items-center gap-2 text-black">
          <div className="p-1.5 bg-blue-100 rounded-lg">
            <BarChart3 className="w-4 h-4 text-blue-600" />
          </div>
          Asset Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-black">Total Activities</span>
            </div>
            <Badge
              variant="secondary"
              className="bg-white text-blue-600 border-blue-200"
            >
              {assetHistory.length}
            </Badge>
          </div>

          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-black">Times Assigned</span>
            </div>
            <Badge className="bg-blue-600 text-white">
              {assetHistory.filter((a) => a.new_status === "allocated").length}
            </Badge>
          </div>

          <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-red-600" />
              <span className="text-sm text-black">Repair History</span>
            </div>
            <Badge className="bg-red-600 text-white">
              {
                assetHistory.filter((a) => a.new_status === "under repair")
                  .length
              }
            </Badge>
          </div>

          <Separator className="bg-gray-200" />

          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-black">Current Value</span>
            </div>
            <div className="text-right">
              <div className="font-semibold text-black">
                ₹{asset.cost ? asset.cost.toLocaleString() : "N/A"}
              </div>
              {asset.purchase_date && (
                <div className="text-xs text-gray-600">
                  {Math.floor(
                    (new Date().getTime() -
                      new Date(asset.purchase_date).getTime()) /
                      (1000 * 3600 * 24 * 365)
                  )}{" "}
                  years old
                </div>
              )}
            </div>
          </div>

          {asset.warranty_expiry && (
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-black">Warranty Status</span>
              </div>
              <div className="text-right">
                {new Date(asset.warranty_expiry) > new Date() ? (
                  <Badge className="bg-green-600 text-white">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                ) : (
                  <Badge className="bg-red-600 text-white">
                    <XCircle className="w-3 h-3 mr-1" />
                    Expired
                  </Badge>
                )}
                <div className="text-xs text-gray-600 mt-1">
                  {new Date(asset.warranty_expiry).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
