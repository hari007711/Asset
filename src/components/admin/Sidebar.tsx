"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Activity, BarChart3, Package, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState<string>("");

  const AdminMenuItems = [
    { name: "Dashboard", href: "/admin", icon: BarChart3 },
    { name: "View Assets", href: "/admin/assets", icon: Package },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Asset History", href: "/admin/history", icon: Activity },
  ];

  const EmployeeMenuItems = [
    { name: "Dashboard", href: "/employee", icon: BarChart3 },
  ];

  useEffect(() => {
    const storedRole = sessionStorage.getItem("role") ?? "";
    setRole(storedRole);
  }, []);

  const menuItems =
    role.toLowerCase() === "employee" ? EmployeeMenuItems : AdminMenuItems;

  return (
    <aside className="flex sm:w-50 md:w-55 w-50 flex-col border-r border-gray-200 bg-white shadow-xl">
      <div className="p-3">
        <div className="flex flex-col items-center gap-4">
          <div className="text-center"></div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-4 h-12 p-3 rounded-xl font-medium transition-all duration-200 group relative overflow-hidden mb-2 cursor-pointer",
                  isActive
                    ? "bg-blue-600 text-white shadow-lg hover:shadow-xl hover:bg-blue-700"
                    : "text-black hover:text-blue-600 hover:bg-blue-50"
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 relative z-10",
                    isActive
                      ? "bg-white/20"
                      : "bg-blue-600 text-white group-hover:bg-blue-700 group-hover:scale-110 shadow-md"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5 transition-all duration-200",
                      isActive ? "text-white" : "text-white"
                    )}
                  />
                </div>
                <span className="relative z-10 text-sm">{item.name}</span>
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
        <div className="text-center">
          <p className="text-xs text-gray-400 font-medium">
            © {new Date().getFullYear()} AMS
          </p>
        </div>
      </div>
    </aside>
  );
}
