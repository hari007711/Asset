"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Activity,
  Check,
  Circle,
  Keyboard,
  Laptop,
  Monitor,
  Mouse,
  Package,
  Sigma,
  TriangleAlert,
  X,
} from "lucide-react";

type AssetCounts = {
  allocated: number;
  available: number;
  underRepair: number;
  retired: number;
  total: number;
};

type CategoryCounts = {
  laptop: number;
  monitor: number;
  keyboard: number;
  mouse: number;
};

interface DashboardStatusProps {
  categoryCounts: CategoryCounts;
  assetCounts: AssetCounts;
}

export default function DashboardStatus({
  categoryCounts,
  assetCounts,
}: DashboardStatusProps) {
  return (
    <div className="2xl:flex-col space-y-4 xl:flex-row lg:flex md:flex-row lg:gap-5 lg:justify-between">
      <Card className="lg:w-[50%] 2xl:w-[100%] rounded-2xl border-0 overflow-hidden hover:shadow-xl transition-all duration-300">
        <CardHeader className="relative border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-black">
                Asset Categories
              </CardTitle>
              <CardDescription className="text-sm  font-medium text-gray-600">
                Assets by category
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="">
          <div className="space-y-4">
            {[
              {
                name: "Laptops",
                value: categoryCounts.laptop || 0,
                icon: Laptop,
              },
              {
                name: "Monitors",
                value: categoryCounts.monitor || 0,
                icon: Monitor,
              },
              {
                name: "Keyboards",
                value: categoryCounts.keyboard || 0,
                icon: Keyboard,
              },
              {
                name: "Mouse",
                value: categoryCounts.mouse || 0,
                icon: Mouse,
              },
            ].map((cat, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-xl bg-white border hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-200 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                    <cat.icon className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <span className="text-lg font-semibold text-black">
                      {cat.name}
                    </span>
                    <p className="text-xs text-gray-600 font-medium">
                      Active assets
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    variant="secondary"
                    className="text-lg font-bold px-4 py-2 bg-white text-blue-600 shadow-sm border border-blue-200"
                  >
                    {cat.value}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="lg:w-[50%] 2xl:w-[100%] rounded-2xl border-0 overflow-hidden hover:shadow-xl transition-all duration-300">
        <CardHeader className="relative pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">
                Status Overview
              </CardTitle>
              <CardDescription className="text-sm font-medium text-gray-600">
                Asset status distribution
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="">
          <div className="space-y-4">
            {[
              {
                name: "Allocated",
                value: assetCounts.allocated,
                iconBg: "bg-blue-200",
                bgColor: "bg-green-50 border-green-100",
                hoverBg: "hover:bg-green-100",
                icon: <Check className="w-4 h-4" />,
                description: "Currently in use",
                badgeColor: "text-green-600 border-green-200",
              },
              {
                name: "Available",
                value: assetCounts.available,
                iconBg: "bg-blue-200",
                bgColor: "bg-blue-50 border-blue-100",
                hoverBg: "hover:bg-blue-100",
                icon: <Circle className="w-4 h-4" />,
                description: "Ready for assignment",
                badgeColor: "text-blue-600 border-blue-200",
              },
              {
                name: "Under Repair",
                value: assetCounts.underRepair,
                iconBg: "bg-blue-200",
                bgColor: "bg-red-50 border-red-100",
                hoverBg: "hover:bg-red-100",
                icon: <TriangleAlert className="w-4 h-4" />,
                description: "Being serviced",
                badgeColor: "text-red-600 border-red-200",
              },
              {
                name: "Retired",
                value: assetCounts.retired,
                iconBg: "bg-blue-200",
                bgColor: "bg-gray-50 border-gray-100",
                hoverBg: "hover:bg-gray-100",
                icon: <X className="w-4 h-4" />,
                description: "End of lifecycle",
                badgeColor: "text-gray-600 border-gray-200",
              },
            ].map((status, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-4 rounded-xl border hover:shadow-md transition-all duration-200 group`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 ${status.iconBg} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200`}
                  >
                    <span className="text-blue-500 font-bold">
                      {status.icon}
                    </span>
                  </div>
                  <div>
                    <span className="text-lg font-semibold text-black">
                      {status.name}
                    </span>
                    <p className="text-xs text-gray-500 font-medium">
                      {status.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    variant="secondary"
                    className={`text-lg font-bold px-4 py-2 bg-white shadow-sm border text-blue-600 border-blue-200`}
                  >
                    {status.value}
                  </Badge>
                  <div className="mt-1 flex items-center justify-end"></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Sigma className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-black">Total Assets</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">
                {assetCounts.total}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
