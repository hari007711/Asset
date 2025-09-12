"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import {
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Keyboard,
  Laptop,
  Mail,
  Monitor,
  Mouse,
  Package,
  Search,
  TrendingUp,
  User,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Asset {
  id: string;
  asset_name: string;
  model_name: string;
  ant_tag: string;
  category: string;
  status: "allocated" | "available" | "under repair" | "retired";
  cost: number | string; 
  owner?: string; 
}

interface User {
  id: string;
  name: string;
  email: string;
  role?: "Admin" | "Employee";
  avatar?: string;
  created_at?: string;
}

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case "laptop":
      return <Laptop className="text-black" />;
    case "monitor":
      return <Monitor className="text-black" />;
    case "mouse":
      return <Mouse className="text-black" />;
    case "keyboard":
      return <Keyboard className="text-black" />;
    default:
      return <Package className="text-black" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "allocated":
      return <Badge className="bg-green-100 text-green-800">Allocated</Badge>;
    case "available":
      return <Badge className="bg-blue-100 text-blue-800">Available</Badge>;
    case "under repair":
      return <Badge className="bg-red-100 text-red-800">Under Repair</Badge>;
    case "retired":
      return <Badge className="bg-gray-100 text-gray-800">Retired</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const parseCost = (val: unknown): number => {
  if (typeof val === "number") return isFinite(val) ? val : 0;
  if (typeof val === "string") return Number(val.replace(/,/g, "")) || 0;
  return 0;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await api.getUsers();
        setUsers(Array.isArray(usersData) ? usersData : []);
      } catch (error: unknown) {
        console.error("Failed to fetch users:", error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchAssets = async () => {
      try {
        const assetsData = await api.getAllAssets();
        setAssets(Array.isArray(assetsData) ? assetsData : []);
      } catch (error: unknown) {
        console.error("Failed to fetch users:", error);
        setUsers([]);
      }
    };

    fetchUsers();
    fetchAssets();
  }, [router, supabase]);

  const filteredUsers = users.filter(
    (user) =>
      user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUserAssets = (userEmail: string) =>
    assets.filter(
      (asset) => asset?.owner === userEmail && asset?.status === "allocated"
    );

  const toggleUserExpansion = (userKey: string) => {
    setExpandedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(userKey)) next.delete(userKey);
      else next.add(userKey);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4]">
      <main className=" p-5">
        <div className="space-y-8">
          {!loading && users.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-slate-900">
                        {users.length}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">Total Users</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-slate-900">
                        {
                          users.filter(
                            (u) => getUserAssets(u?.email).length > 0
                          ).length
                        }
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        Users with Assets
                      </p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <UserCheck className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-slate-900">
                        {users.length -
                          users.filter(
                            (u) => getUserAssets(u?.email).length > 0
                          ).length}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        Users without Assets
                      </p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <UserX className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-slate-900">
                        {
                          assets.filter(
                            (asset) => asset?.status === "allocated"
                          ).length
                        }
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        Total Allocated Assets
                      </p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <Users className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <CardTitle>All Users</CardTitle>
                  <CardDescription>
                    Complete list of users and their asset assignments
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-3 px-6">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search users by name or email..."
                    className="pl-11 bg-slate-50 border-slate-200 focus:bg-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                <User className="w-4 h-4" />
                Showing {filteredUsers.length} users
              </div>
            </div>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2" />
                  Loading users...
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  {users.length === 0 ? (
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                        <Users className="w-8 h-8 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-slate-900 font-medium">
                          No users found
                        </p>
                        <p className="text-slate-600 text-sm mt-1">
                          Users will appear here once they sign up and are
                          synced to the database
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                        <Search className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-slate-600">
                        No users match your search criteria
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4 h-150 overflow-x-hidden overflow-scroll">
                  {filteredUsers.map((user, index) => {
                    const userKey: string =
                      user?.id ?? user?.email ?? `user-${index}`;

                    const userAssets = getUserAssets(user?.email);
                    const isExpanded = expandedUsers.has(userKey);

                    const totalValue = userAssets.reduce(
                      (sum, asset) => sum + parseCost(asset?.cost),
                      0
                    );

                    const avatarText =
                      user?.avatar ||
                      user?.name?.[0]?.toUpperCase() ||
                      user?.email?.[0]?.toUpperCase() ||
                      "?";

                    return (
                      <div
                        key={userKey}
                        className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200"
                      >
                        <div
                          className="p-5 cursor-pointer hover:bg-slate-50 transition-colors duration-200"
                          onClick={() => toggleUserExpansion(userKey)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-semibold text-lg shadow-md">
                                  {avatarText}
                                </div>
                                {userAssets.length > 0 && (
                                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-3 h-3 text-white" />
                                  </div>
                                )}
                              </div>

                              <div>
                                <div className="flex items-center gap-3 mb-1">
                                  <h3 className="font-semibold text-slate-900 text-lg">
                                    {user?.name || user?.email}
                                  </h3>
                                  <Badge
                                    variant={
                                      user?.role === "Employee"
                                        ? "outline"
                                        : "default"
                                    }
                                  >
                                    {user?.role || "Employee"}
                                  </Badge>
                                </div>

                                <div className="flex items-center gap-4 text-sm text-slate-600">
                                  <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    {user?.email}
                                  </div>
                                  {user?.created_at && (
                                    <div className="flex items-center gap-2">
                                      <Calendar className="w-4 h-4" />
                                      Joined{" "}
                                      {new Date(
                                        user.created_at
                                      ).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="text-right">
                                <div className="flex items-center gap-2 mb-1">
                                  <Package className="w-4 h-4 text-slate-500" />
                                  <span className="font-semibold text-slate-900">
                                    {userAssets.length}
                                  </span>
                                  <span className="text-sm text-slate-600">
                                    asset{userAssets.length !== 1 ? "s" : ""}
                                  </span>
                                </div>
                                {userAssets.length > 0 && (
                                  <div className="text-sm text-slate-500">
                                    ₹{totalValue.toLocaleString()} total value
                                  </div>
                                )}
                              </div>

                              {userAssets.length > 0 && (
                                <div className="text-slate-400">
                                  {isExpanded ? (
                                    <ChevronDown className="w-5 h-5" />
                                  ) : (
                                    <ChevronRight className="w-5 h-5" />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        {isExpanded && userAssets.length > 0 && (
                          <div className="border-t border-slate-200 bg-slate-50">
                            <div className="p-5">
                              <div className="flex items-center gap-2 mb-4">
                                <Package className="w-4 h-4 text-slate-600" />
                                <h4 className="font-medium text-slate-900">
                                  Allocated Assets ({userAssets.length})
                                </h4>
                              </div>
                              <div className="grid gap-3">
                                {userAssets.map(
                                  (asset: Asset, assetIndex: number) => {
                                    const assetKey: string =
                                      asset?.id ??
                                      asset?.ant_tag ??
                                      `${
                                        asset?.asset_name ?? "asset"
                                      }-${assetIndex}`;
                                    return (
                                      <div
                                        key={assetKey}
                                        className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200 hover:shadow-sm transition-shadow duration-200"
                                      >
                                        <div className="flex items-center gap-4">
                                          <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                                            {getCategoryIcon(asset?.category)}
                                          </div>
                                          <div>
                                            <p className="font-medium text-slate-900">
                                              {asset?.asset_name}
                                            </p>
                                            <p className="text-sm text-slate-600">
                                              {asset?.model_name} •{" "}
                                              {asset?.ant_tag}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                          {getStatusBadge(asset?.status)}
                                          <span className="font-semibold text-slate-900">
                                            ₹
                                            {parseCost(
                                              asset?.cost
                                            ).toLocaleString()}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                        {isExpanded && userAssets.length === 0 && (
                          <div className="border-t border-slate-200 bg-slate-50 p-5">
                            <p className="text-sm text-slate-600 text-center">
                              No assets currently allocated to this user
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
