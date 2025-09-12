"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, getValidStatusTransitions } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Check, Settings, UserCheck, UserX, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface AssetActionsProps {
  asset: Asset;
  users: User[];
  onUpdate: () => void;
}

interface User {
  id: string;
  email: string;
  name?: string | null;
}

interface Asset {
  id: string;
  asset_name: string;
  status: string;
  owner?: string;
}

export default function AssetActions({
  asset,
  users,
  onUpdate,
}: AssetActionsProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("error");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [dialogOpen, setDialogOpen] = useState("");

  const handleAssignAsset = async () => {
    if (!selectedUser) return;
    setLoading(true);
    setMessage("");
    try {
      await api.allocateAsset(asset.id, selectedUser);
      toast.success("Asset assigned successfully!");
      setMessage("Asset assigned successfully!");
      setMessageType("success");
      onUpdate();
      setTimeout(() => setDialogOpen(""), 1500);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Assignment error:", error.message);
        setMessage(error.message);
      } else {
        setMessage("An unexpected error occurred");
      }
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleUnassignAsset = async () => {
    setLoading(true);
    setMessage("");
    try {
      await api.unallocateAsset(asset.id);
      toast.success("Asset unassigned successfully!");
      setMessage("Asset unassigned successfully!");
      setMessageType("success");
      onUpdate();
      setTimeout(() => setDialogOpen(""), 1500);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to unassign asset";

      toast.error(message);
      setMessage(message);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async () => {
    if (!selectedStatus) return;
    setLoading(true);
    setMessage("");

    try {
      await api.updateAssetStatus(asset.id, selectedStatus);
      toast.success("Asset status updated successfully!");
      setMessage("Asset status updated successfully!");
      setMessageType("success");
      onUpdate();
      setTimeout(() => setDialogOpen(""), 1500);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to unassign asset";

      toast.error(message);
      setMessage(message);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const validStatusTransitions = getValidStatusTransitions(asset.status);

  return (
    <div className="flex items-center gap-2">
      {asset.status === "available" ? (
        <Dialog
          open={dialogOpen === "assign"}
          onOpenChange={(open) => setDialogOpen(open ? "assign" : "")}
        >
          <DialogTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="bg-gradient-to-r from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 border-emerald-200 hover:border-emerald-300 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-emerald-600" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg mx-auto bg-white rounded-2xl shadow-2xl border-0 [&>button.right-4.top-4]:hidden">
            <DialogClose asChild>
              <button className="absolute right-4 top-4 rounded-full bg-gray-50 hover:bg-gray-100 p-2.5 transition-colors duration-200 group cursor-pointer">
                <X className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
              </button>
            </DialogClose>

            <DialogHeader className="pt-6 pb-4 text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <UserCheck className="w-8 h-8 text-white" />
              </div>

              <DialogTitle className="text-2xl font-bold text-gray-900 mb-2 text-center">
                Assign Asset
              </DialogTitle>

              <DialogDescription className="text-gray-600 text-base leading-relaxed px-4 text-center">
                Assign{" "}
                <span className="inline-flex items-center px-2 py-1 mx-1 text-blue-700 bg-blue-100 rounded-full text-sm font-medium">
                  {asset.asset_name}
                </span>{" "}
                to a user
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 px-1">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"></path>
                      <path
                        fillRule="evenodd"
                        d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-800 text-sm">
                      Asset Details
                    </h4>
                    <p className="text-blue-700 text-sm">
                      <span className="font-medium">{asset.asset_name}</span> •
                      Currently Unassigned
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3  gap-3 items-center justify-center text-center">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  Select User
                </label>

                {users.length > 0 ? (
                  <div className="h-40">
                    <Command className="rounded-xl border border-gray-200 shadow-md">
                      <CommandInput
                        placeholder="Search users..."
                        className="p-3"
                      />
                      <CommandList>
                        <CommandEmpty>No users found.</CommandEmpty>
                        <CommandGroup>
                          {users?.map((user: User, index: number) => (
                            <CommandItem
                              key={user?.id ?? user?.email ?? index}
                              value={user?.email}
                              onSelect={() => {
                                setSelectedUser(user.email);
                              }}
                              className="cursor-pointer p-3 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs font-semibold">
                                    {(user?.name || user?.email)
                                      .charAt(0)
                                      .toUpperCase()}
                                  </span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-medium text-gray-900">
                                    {user.name || "No Name"}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {user.email}
                                  </span>
                                </div>
                              </div>
                              <Check
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  selectedUser === user.email
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </div>
                ) : (
                  <Alert className="rounded-xl border-l-4 border-l-red-500 bg-red-50 text-red-800">
                    <div className="flex gap-3">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-4 h-4 text-red-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      </div>
                      <AlertDescription className="font-medium">
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-bold text-red-900 mb-1">
                              Database Setup Issue
                            </h4>
                            <p className="text-sm">
                              No users are available for assignment.
                            </p>
                          </div>

                          <div className="bg-red-100 rounded-lg p-3 space-y-2">
                            <h5 className="font-semibold text-red-900">
                              Root Cause:
                            </h5>
                            <ul className="text-sm space-y-1 ml-4">
                              <li className="flex items-start gap-2">
                                <span className="text-red-600">•</span>
                                Uses{" "}
                                <code className="bg-red-200 px-1 rounded">
                                  NEW.uid
                                </code>{" "}
                                instead of{" "}
                                <code className="bg-red-200 px-1 rounded">
                                  NEW.id
                                </code>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-red-600">•</span>
                                Only UPDATEs users, never INSERTs new ones
                              </li>
                            </ul>
                          </div>

                          <div className="bg-amber-100 rounded-lg p-3 space-y-2">
                            <h5 className="font-semibold text-amber-900">
                              Fix Required:
                            </h5>
                            <p className="text-sm text-amber-800">
                              Update the trigger function in the database to
                              properly sync users from Supabase Auth to the
                              public.users table.
                            </p>
                          </div>

                          <div className="bg-blue-100 rounded-lg p-3 space-y-2">
                            <h5 className="font-semibold text-blue-900">
                              Temporary Workaround:
                            </h5>
                            <p className="text-sm text-blue-800">
                              Manually insert users into the public.users table
                              using the database console.
                            </p>
                          </div>
                        </div>
                      </AlertDescription>
                    </div>
                  </Alert>
                )}
              </div>
              {selectedUser && (
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-emerald-800 text-sm">
                          Assignment Preview
                        </h4>
                        <p className="text-emerald-700 text-sm">
                          {asset.asset_name} →{" "}
                          {users.find((u) => u.email === selectedUser)?.name ||
                            selectedUser}
                        </p>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-emerald-600 bg-emerald-100 rounded-full p-2">
                        Ready to assign
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {message && (
                <Alert
                  variant={messageType === "error" ? "destructive" : "default"}
                  className={`rounded-xl border-l-4 ${
                    messageType === "error"
                      ? "border-l-red-500 bg-red-50 text-red-800"
                      : "border-l-green-500 bg-green-50 text-green-800"
                  }`}
                >
                  <AlertDescription className="font-medium">
                    {message}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleAssignAsset}
                  disabled={loading || !selectedUser || users.length === 0}
                  className="flex-1 bg-blue-500 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Assigning...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4" />
                      Assign Asset
                    </div>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setDialogOpen("")}
                  disabled={loading}
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <X className="w-4 h-4" />
                    Cancel
                  </div>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ) : asset.status === "allocated" ? (
        <Dialog
          open={dialogOpen === "unassign"}
          onOpenChange={(open) => setDialogOpen(open ? "unassign" : "")}
        >
          <DialogTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="bg-gradient-to-r from-red-50 to-orange-50 hover:from-red-100 hover:to-orange-100 border-red-200 hover:border-red-300 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
            >
              <UserX className="w-4 h-4 text-red-600" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md mx-auto [&>button.right-4.top-4]:hidden bg-white rounded-2xl shadow-2xl border-0">
            <DialogClose asChild>
              <button className="absolute right-4 top-4 rounded-full bg-gray-50 hover:bg-gray-100 p-2.5 transition-colors duration-200 group cursor-pointer">
                <X className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
              </button>
            </DialogClose>

            <DialogHeader className="pt-6 pb-4 text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <UserX className="w-8 h-8 text-white" />
              </div>

              <DialogTitle className="text-2xl font-bold text-gray-900 mb-2 text-center">
                Unassign Asset
              </DialogTitle>

              <DialogDescription className="text-gray-600 text-base leading-relaxed px-4 text-center">
                Are you sure you want to unassign{" "}
                <span className="inline-flex items-center px-2 py-1 mx-1 text-blue-700 bg-blue-100 rounded-full text-sm font-medium">
                  {asset.asset_name}
                </span>{" "}
                from{" "}
                <span className="inline-flex items-center px-2 py-1 mx-1 text-emerald-700 bg-emerald-100 rounded-full text-sm font-medium mt-1">
                  {asset.owner}
                </span>
                ?
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 px-1">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Asset
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {asset.asset_name}
                    </span>
                  </div>
                  <div className="w-full h-px bg-gray-200"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Current Owner
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {asset.owner}
                    </span>
                  </div>
                  <div className="w-full h-px bg-gray-200"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      After Unassign
                    </span>
                    <span className="text-sm font-semibold text-blue-500">
                      Unassigned
                    </span>
                  </div>
                </div>
              </div>

              {message && (
                <Alert
                  variant={messageType === "error" ? "destructive" : "default"}
                  className={`rounded-xl border-l-4 ${
                    messageType === "error"
                      ? "border-l-red-500 bg-red-50 text-red-800"
                      : "border-l-green-500 bg-green-50 text-green-800"
                  }`}
                >
                  <AlertDescription className="font-medium">
                    {message}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleUnassignAsset}
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Unassigning...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <UserX className="w-4 h-4" />
                      Unassign Asset
                    </div>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setDialogOpen("")}
                  disabled={loading}
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <X className="w-4 h-4" />
                    Cancel
                  </div>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ) : null}
      {validStatusTransitions &&
        asset.status !== "allocated" &&
        asset.status != "retired" && (
          <Dialog
            open={dialogOpen === "status"}
            onOpenChange={(open) => setDialogOpen(open ? "status" : "")}
          >
            <DialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="bg-gradient-to-r from-blue-50 to-blue-50 hover:from-blue-100 hover:to-blue-100 border-blue-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
              >
                <Settings className="w-4 h-4 text-blue-600" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md mx-auto [&>button.right-4.top-4]:hidden bg-white rounded-2xl shadow-2xl border-0">
              <DialogClose asChild>
                <button className="absolute right-4 top-4 rounded-full bg-gray-50 hover:bg-gray-100 p-2.5 transition-colors duration-200 group cursor-pointer">
                  <X className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                </button>
              </DialogClose>

              <DialogHeader className="pt-6 text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <Settings className="w-8 h-8 text-white" />
                </div>

                <DialogTitle className="text-2xl font-bold text-gray-900 mb-2 text-center">
                  Change Asset Status
                </DialogTitle>

                <DialogDescription className="text-gray-600 text-base leading-relaxed text-center">
                  Update the status of{" "}
                  <span className="inline-flex items-center px-3 py-1 ml-1 text-blue-700 bg-blue-100 rounded-full text-sm font-medium">
                    {asset.asset_name}
                  </span>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 px-1 items-center">
                <div className="space-y-4">
                  <div className="flex justify-between px-20 text-between">
                    <div className="space-y-2 text-center items-center">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        Current Status
                      </label>
                      <div className="p-[7px] bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center">
                        <p className="text-sm font-medium text-gray-800 capitalize flex items-center gap-2">
                          <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                          {asset.status}
                        </p>
                      </div>
                    </div>
                    {asset.status != "retired" && (
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          New Status
                        </label>
                        <Select
                          value={selectedStatus}
                          onValueChange={setSelectedStatus}
                        >
                          <SelectTrigger className="p-3 border-gray-200 rounded-xl hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200">
                            <SelectValue
                              placeholder="Choose status"
                              className="text-gray-500"
                            />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-gray-200 shadow-lg">
                            {validStatusTransitions.map((status) => (
                              <SelectItem
                                key={status}
                                value={status}
                                className="hover:bg-blue-50 focus:bg-blue-50 rounded-lg mx-1 my-0.5 cursor-pointer"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  {status.charAt(0).toUpperCase() +
                                    status.slice(1)}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  {asset.status != "retired" && (
                    <div className="flex items-center justify-center py-2">
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span className="px-2 py-1 bg-gray-100 rounded-full">
                          {asset.status
                            ? asset.status.charAt(0).toUpperCase() +
                              asset.status.slice(1)
                            : "Unknown"}
                        </span>
                        <div className="flex items-center">
                          <div className="w-4 h-0.5 bg-gradient-to-r from-gray-300 to-blue-400"></div>
                          <div className="w-0 h-0 border-l-4 border-l-blue-400 border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
                        </div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                          {selectedStatus.charAt(0).toUpperCase() +
                            selectedStatus.slice(1) || "Select"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {message && (
                  <Alert
                    variant={
                      messageType === "error" ? "destructive" : "default"
                    }
                    className={`rounded-xl border-l-4 ${
                      messageType === "error"
                        ? "border-l-red-500 bg-red-50 text-red-800"
                        : "border-l-green-500 bg-green-50 text-green-800"
                    }`}
                  >
                    <AlertDescription className="font-medium">
                      {message}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handleStatusChange}
                    disabled={loading || !selectedStatus}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Updating...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 ">
                        <Settings className="w-4 h-4" />
                        Update Status
                      </div>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen("")}
                    disabled={loading}
                    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <X className="w-4 h-4" />
                      Cancel
                    </div>
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
    </div>
  );
}
