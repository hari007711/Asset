"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Separator } from "../ui/separator";

export default function ProfilePopover() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");

  const handleSignOut = async () => {
    try {
      sessionStorage.clear();
      localStorage.clear();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    const storedName = sessionStorage.getItem("name") ?? "";
    const storedEmail = sessionStorage.getItem("email") ?? "";
    setName(storedName);
    setEmail(storedEmail);
  }, []);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <span>
          <Button variant="outline" className="cursor-pointer">
            <User className="w-3 h-3 mr-1" />
            {name}
          </Button>
        </span>
      </PopoverTrigger>
      <PopoverContent className=" p-0" align="end" sideOffset={8}>
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="">
              <p>{name}</p>
              <p>{email}</p>
            </div>
          </div>
          <Separator className="my-3" />
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full cursor-pointer justify-start text-left text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
