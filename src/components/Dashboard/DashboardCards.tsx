"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle,
  Monitor,
  Users,
} from "lucide-react";
import Link from "next/link";

interface AssetCounts {
  total: number;
  allocated: number;
  available: number;
  underRepair: number;
  maintenance: number;
}

export default function DashboardCards({
  assetCounts,
}: {
  assetCounts: AssetCounts;
}) {
  const stats = [
    {
      title: "Total Assets",
      value: assetCounts.total,
      icon: Monitor,
      iconBg: "bg-blue-200",
      change: "+12",
      changeType: "increase",
      description: "Total number of assets in the system",
    },
    {
      title: "Allocated",
      value: assetCounts.allocated,
      icon: Users,
      iconBg: "bg-blue-200",
      change: "+5",
      changeType: "increase",
      description: "Assets currently allocated to employees",
    },
    {
      title: "Available",
      value: assetCounts.available,
      icon: CheckCircle,
      iconBg: "bg-blue-200",
      change: "-3",
      changeType: "decrease",
      description: "Assets available for allocation",
    },
    {
      title: "Maintenance",
      value: assetCounts.maintenance,
      icon: AlertTriangle,
      iconBg: "bg-blue-200",
      change: "+2",
      changeType: "increase",
      description: "Assets sent for maintenance/repair",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-1 mb-6">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className="relative overflow-hidden rounded-2xl border-0  hover:shadow-lg transition-all duration-300 group"
        >
          <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>

          <CardContent className="px-6 py-2 relative">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div
                  className={`p-3 rounded-xl ${stat.iconBg} shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <stat.icon className="2xl:w-6 2xl:h-6 lg:w-4 lg:h-4 text-blue-500" />
                </div>
                <Link
                  href={`/admin/assets?status=${stat.title
                    .toLowerCase()
                    .replace(" ", "")}`}
                >
                  <div className="p-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors duration-200 group/arrow">
                    <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover/arrow:text-gray-600 group-hover/arrow:translate-x-0.5 group-hover/arrow:-translate-y-0.5 transition-all duration-200" />
                  </div>
                </Link>
              </div>
              <div className="space-y-3">
                <h3 className="2xl:text-lg lg:text-md md:text-md font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                  {stat.title}
                </h3>

                <div className="space-y-2">
                  <p className="2xl:text-3xl lg:text-xl md:text-lg font-bold text-gray-900 tracking-tight">
                    {stat.value}
                  </p>
                  <p className="2xl:text-sm lg:text-xs md:text-xs text-gray-500 font-medium">
                    {stat.description}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
