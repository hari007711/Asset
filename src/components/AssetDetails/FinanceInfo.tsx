import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DollarSign,
  Shield,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";

type AssetType = {
  cost: string;
  purchase_date: string;
  warranty_expiry: string;
};

interface FinanceInfoProps {
  asset: AssetType;
}

export default function FinanceInfo({ asset }: FinanceInfoProps) {
  return (
    <Card className="border-slate-200 shadow-sm p-5">
      <CardHeader className="px-5 py-7 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border-b border-slate-200">
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <div className="bg-green-100 rounded-lg">
            <DollarSign className="w-4 h-4 text-green-600" />
          </div>
          Financial Information
        </CardTitle>
        <CardDescription className="text-slate-600">
          Cost and purchase details
        </CardDescription>
      </CardHeader>
      <CardContent className="">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
            <label className="text-sm font-medium text-green-700 uppercase tracking-wide">
              Purchase Cost
            </label>
            <div className="flex items-center gap-2 mt-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <p className="text-2xl font-bold text-green-700">
                ₹{asset.cost ? asset.cost.toLocaleString() : "N/A"}
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
            <label className="text-sm font-medium text-blue-700 uppercase tracking-wide">
              Purchase Date
            </label>
            <div className="flex items-center gap-2 mt-2">
              <ShoppingCart className="w-4 h-4 text-blue-600" />
              <p className="font-semibold text-blue-800">
                {asset.purchase_date
                  ? new Date(asset.purchase_date).toLocaleDateString()
                  : "Not specified"}
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-200">
            <label className="text-sm font-medium text-purple-700 uppercase tracking-wide">
              Warranty Expiry
            </label>
            <div className="flex items-center gap-2 mt-2">
              <Shield className="w-4 h-4 text-purple-600" />
              <p className="font-semibold text-purple-800">
                {asset.warranty_expiry
                  ? new Date(asset.warranty_expiry).toLocaleDateString()
                  : "Not specified"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
