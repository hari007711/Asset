"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, ChartPie } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type PieLabelProps = {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  value: number | string;
  index?: number;
};


export type Asset = {
  id: string | number;
  status: "allocated" | "available" | "under repair" | "retired" | string;
  category?: string;
};

type LaptopsOverviewProps = {
  assets: Asset[];
  categoryCounts: Record<string, number>;
};


const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  value,
}: PieLabelProps) => {
  const radius = innerRadius + (outerRadius - innerRadius) / 2;
  const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
  const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={14}
      fontWeight="bold"
    >
      {value}
    </text>
  );
};


export default function LaptopsOverview({
  assets,
  categoryCounts,
}: LaptopsOverviewProps) {
  const [assetCounts, setAssetCounts] = useState({
    total: 0,
    allocated: 0,
    available: 0,
    underRepair: 0,
    retired: 0,
  });

  useEffect(() => {
    const counts = {
      total: assets.length,
      allocated: assets.filter((a) => a.status === "allocated").length,
      available: assets.filter((a) => a.status === "available").length,
      underRepair: assets.filter((a) => a.status === "under repair").length,
      retired: assets.filter((a) => a.status === "retired").length,
    };
    setAssetCounts(counts);
  }, [assets]);

  const barData = [
    { name: "Total", value: assetCounts.total },
    { name: "Allocated", value: assetCounts.allocated },
    { name: "Available", value: assetCounts.available },
    { name: "Under Repair", value: assetCounts.underRepair },
    { name: "Retired", value: assetCounts.retired },
  ];

  const categories = ["Laptops", "Monitors", "Keyboards", "Mice"];
  const pieChartData = categories.map((cat) => {
    const key = cat.toLowerCase().slice(0, -1); 
    return { name: cat, value: categoryCounts[key] || 0 };
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6 mb-6">
      <Card className="rounded-2xl border-0 overflow-hidden group hover:shadow-xl transition-all duration-300">
        <CardHeader className="relative pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                Laptops Overview
              </CardTitle>
              <p className="text-xs md:text-sm text-gray-500 font-medium">
                Distribution by category
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative p-4 md:p-6">
          <div className="h-60 md:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="barGradient1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                  </linearGradient>
                  <linearGradient id="barGradient2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#047857" />
                  </linearGradient>
                  <linearGradient id="barGradient3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#6d28d9" />
                  </linearGradient>
                  <linearGradient id="barGradient4" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6b7280", fontWeight: 500 }}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6b7280", fontWeight: 500 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "none",
                    borderRadius: 12,
                    boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {barData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`url(#barGradient${(index % 4) + 1})`}
                    />
                  ))}
                  <LabelList
                    dataKey="value"
                    position="top"
                    fontSize={12}
                    fontWeight={600}
                    fill="#374151"
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-0 overflow-hidden group hover:shadow-xl transition-all duration-300">
        <CardHeader className="relative pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <ChartPie className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                Assets Overview
              </CardTitle>
              <p className="text-xs md:text-sm text-gray-500 font-medium">
                Status distribution
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative p-4 md:p-6">
          <div className="h-60 md:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  <linearGradient id="pieGradient1" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#1e40af" />
                  </linearGradient>
                  <linearGradient id="pieGradient2" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#047857" />
                  </linearGradient>
                  <linearGradient id="pieGradient3" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>
                  <linearGradient id="pieGradient4" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#dc2626" />
                  </linearGradient>
                </defs>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  label={(props) =>
                    renderCustomizedLabel(props as PieLabelProps)
                  }
                  labelLine={false}
                  outerRadius={85}
                  innerRadius={40}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieChartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`url(#pieGradient${(index % 4) + 1})`}
                    />
                  ))}
                </Pie>

                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "none",
                    borderRadius: 12,
                    boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 14, fontWeight: 500 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
