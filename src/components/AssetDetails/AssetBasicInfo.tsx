import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AssetType = {
  asset_name: string;
  category: string;
  ant_tag: string;
  status: string;
  manufacturer?: string;
  model_name?: string;
  model_number?: string;
  serial_number?: string;
  cost: string;
  purchase_date: string;
  warranty_expiry: string;
  owner: string;
};
type UserType = {
  email: string;
  name: string;
};

interface AssetBasicInfoProps {
  asset: AssetType;
  users: UserType[];
  getCategoryIcon: (
    category: string,
    size?: "sm" | "md" | "lg"
  ) => React.ReactNode;
}

export default function AssetBasicInfo({
  asset,
  users,
  getCategoryIcon,
}: AssetBasicInfoProps) {
  const assignedUser =
    users.find((u) => u.email === asset.owner)?.name || asset.owner;
  return (
    <Card className="border-gray-200 shadow-sm p-5 bg-white">
      <CardHeader className="p-5 rounded-2xl bg-blue-50 border-b border-gray-200">
        <CardTitle className="flex items-center gap-2 text-black">
          Basic Information
        </CardTitle>
      </CardHeader>

      <CardContent className="">
        <div className="grid md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="group">
              <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Category
              </label>
              <div className="flex items-center gap-2 mt-1">
                {getCategoryIcon(asset.category, "sm")}
                <p className="font-medium text-black capitalize">
                  {asset.category}
                </p>
              </div>
            </div>

            <div className="group">
              <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Asset Tag
              </label>
              <div className="flex items-center gap-2 mt-1">
                <p className="font-medium text-black">{asset.ant_tag}</p>
              </div>
            </div>
            <div className="group">
              <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Cost
              </label>
              <div className="flex items-center gap-2 mt-1">
                <p className="font-medium text-black">
                  {asset.cost ? asset.cost.toLocaleString() : "N/A"}
                </p>
              </div>
            </div>
            <div className="group">
              <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Purchase Date
              </label>
              <div className="mt-1">
                <p className="font-medium text-black">
                  {asset.purchase_date
                    ? new Date(asset.purchase_date).toLocaleDateString()
                    : "Not specified"}
                </p>
              </div>
            </div>
            <div className="group">
              <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Warranty Expiry
              </label>
              <div className="mt-1">
                <p className="font-medium text-black">
                  {asset.warranty_expiry
                    ? new Date(asset.warranty_expiry).toLocaleDateString()
                    : "Not specified"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="group">
              <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Manufacturer
              </label>
              <div className="flex items-center gap-2 mt-1">
                <p className="font-medium text-black">
                  {asset.manufacturer || "Not specified"}
                </p>
              </div>
            </div>

            <div className="group">
              <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Model
              </label>
              <p className="font-medium text-black mt-1">
                {asset.model_name || "Not specified"}
              </p>
            </div>

            <div className="group">
              <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Model Number
              </label>
              <div className="mt-1">
                <p className="font-medium text-black">
                  {asset.model_number || "Not specified"}
                </p>
              </div>
            </div>

            <div className="group">
              <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Serial Number
              </label>
              <div className="mt-1">
                <p className="font-medium text-black">{asset.serial_number}</p>
              </div>
            </div>
            <div className="group">
              {asset.owner && (
                <>
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Current Assignment
                  </label>
                  <div className="">
                    <div className="space-y-4">
                      <div className="xl:flex md:flex-1 lg:flex-1 2xl:flex-1 items-center gap-4">
                        <div className="flex-1">
                          <p className="font-semibold text-black">
                            {assignedUser}
                          </p>
                          <p className="text-sm text-gray-600">{asset.owner}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
