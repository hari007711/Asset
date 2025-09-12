"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import ProfilePopover from "../Dashboard/PopOver";

export function Header() {
  const [role, setRole] = useState<string>("");

  useEffect(() => {
    const storedRole = sessionStorage.getItem("role") ?? "";
    setRole(storedRole);
  }, []);

  return (
    <header className="border-b bg-card bg-gradient-to-b from-slate-50 to-white shadow-xl">
      <div className="px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="m flex w-12 h-12 rounded-xl overflow-hidden shadow-lg ring-3 ring-blue-100 bg-white">
            <Image
              src="/antstack.svg"
              alt="Logo"
              width={48}
              height={48}
              className="w-full h-full object-cover"
              priority 
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Asset Management
            </h1>
            <p className="text-sm text-muted-foreground">
              {role.toLowerCase() === "employee"
                ? "Employee Dashboard"
                : "Admin Dashboard"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3"></div>
          <ProfilePopover />
        </div>
      </div>
    </header>
  );
}
