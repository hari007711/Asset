import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Clock, User } from "lucide-react";

type AssetType = {
  owner?: string;
  status: string;
};

type UserType = {
  email: string;
  name: string;
};

interface CurrentAssignmentProps {
  asset: AssetType;
  users: UserType[];
  getStatusBadge: (status: string) => React.ReactNode;
}

export default function CurrentAssignment({
  asset,
  users,
  getStatusBadge,
}: CurrentAssignmentProps) {
  const assignedUser =
    users.find((u) => u.email === asset.owner)?.name || asset.owner;

  return (
    <Card className="border-gray-200 shadow-sm p-5 bg-white">
      <CardHeader className="px-5 py-7 rounded-2xl bg-blue-50 border-b border-gray-200">
        <CardTitle className="flex items-center gap-2 text-black">
          <div className="p-1.5 bg-blue-100 rounded-lg">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          Current Assignment
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        {asset.owner ? (
          <div className="space-y-4">
            <div className="xl:flex md:flex-1 lg:flex-1 2xl:flex-1 items-center gap-4">
              <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-sm">
                {assignedUser?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-black">{assignedUser}</p>
                <p className="text-sm text-gray-600">{asset.owner}</p>
              </div>
            </div>

            <Separator className="bg-gray-200" />

            <div className="flex gap-3 items-center">
              <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Assignment Status
              </label>
              <div>{getStatusBadge(asset.status)}</div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="font-semibold text-black mb-1">Unassigned</h3>
            <p className="text-sm text-gray-600 mb-3">
              This asset is available for assignment
            </p>
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-600 border-blue-200"
            >
              <Clock className="w-3 h-3 mr-1" />
              Available
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
