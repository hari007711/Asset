"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { addYears, format } from "date-fns";
import {
  ArrowLeft,
  Building2,
  CalendarIcon,
  DollarSign,
  Hash,
  Info,
  Laptop,
  Package,
  Save,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const categories = [
  "laptop",
  "monitor",
  "keyboard",
  "mouse",
  "tablet",
  "phone",
  "headphones",
  "webcam",
  "other",
];

interface Asset {
  id: string;
  asset_name: string;
  model_name: string;
  model_number: string;
  manufacturer: string;
  serial_number: string;
  ant_tag: string;
  category: string;
  cost: string;
  purchase_date: string;
  warranty_expiry: string;
}

interface AssetModel {
  id: string;
  name: string;
  model_number: string;
  manufacturer: string;
  category: string;
}

interface FormData {
  asset_name: string;
  model_name: string;
  model_number: string;
  manufacturer: string;
  serial_number: string;
  ant_tag: string;
  category: string;
  cost: string;
  purchase_date: string;
  warranty_expiry: string;
  selected_model_id: string;
}

export default function AddAssetPage() {
  const [formData, setFormData] = useState<FormData>({
    asset_name: "",
    model_name: "",
    model_number: "",
    manufacturer: "",
    serial_number: "",
    ant_tag: "",
    category: "",
    cost: "",
    purchase_date: "",
    warranty_expiry: "",
    selected_model_id: "",
  });

  const [assetModels, setAssetModels] = useState<AssetModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [messageType, setMessageType] = useState<"success" | "error">("error");

  const router = useRouter();

  useEffect(() => {
    const fetchAssets = async () => {
      const res = await api.getAllAssets();
      setAssets(res);
    };
    fetchAssets();
  }, []);

  useEffect(() => {
    const year = new Date().getFullYear();
    const serial = (assets.length + 1).toString().padStart(3, "0");
    const newTag = `ANT/${year}/${serial}`;
    setFormData((prev) => ({ ...prev, ant_tag: newTag }));
  }, [assets]);

  useEffect(() => {
    const fetchAssetModels = async () => {
      try {
        const models = await api.getAssetModels();
        if (models.length > 0) {
        }
        setAssetModels(models);
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message || "Failed to fetch asset models");
          setMessage(error.message || "Failed to load asset models.");
        } else {
          toast.error("Unknown error occurred");
          setMessage("Unknown error occurred");
        }
        setMessageType("error");
      } finally {
        setModelsLoading(false);
      }
    };

    fetchAssetModels();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleModelSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const modelId = e.target.value;
    const selectedModel = assetModels.find((model) => model.id === modelId);

    if (selectedModel) {
      const newFormData = {
        ...formData,
        selected_model_id: modelId,
        model_name: selectedModel.name || "",
        asset_name: selectedModel.name || "",
        model_number: selectedModel.model_number || "",
        manufacturer: selectedModel.manufacturer || "",
        category: selectedModel.category || "",
      };
      setFormData(newFormData);
    } else {
      setFormData((prev) => ({
        ...prev,
        selected_model_id: "",
        model_name: "",
        model_number: "",
        manufacturer: "",
        category: "",
      }));
    }
  };

  const isModelSelected = formData.selected_model_id !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const payload = {
        asset_name: formData.asset_name,
        model_name: formData.model_name,
        model_number: formData.model_number,
        manufacturer: formData.manufacturer,
        serial_number: formData.serial_number,
        ant_tag: formData.ant_tag,
        category: formData.category,
        cost: formData.cost,
        purchase_date: formData.purchase_date,
        warranty_expiry: formData.warranty_expiry,
      };
      const response = await api.createAsset(payload);
      setMessage("Asset created successfully!");
      setMessageType("success");
      toast.success("Asset created successfully");
      setTimeout(() => {
        router.push(
          `/admin/assets/${response?.data?.inventoryResult?.[0]?.id}`
        );
      }, 1000);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Failed to fetch asset models");
        setMessage(error.message || "Failed to load asset models.");
      } else {
        toast.error("Unknown error occurred");
        setMessage("Unknown error occurred");
      }
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const [warrantyDate, setWarrantyDate] = React.useState<Date | undefined>(
    formData.warranty_expiry ? new Date(formData.warranty_expiry) : undefined
  );

  const [date, setDate] = React.useState<Date | undefined>(
    formData.purchase_date ? new Date(formData.purchase_date) : undefined
  );

  const handleSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      const warranty = addYears(newDate, 1);
      setWarrantyDate(warranty);

      setFormData((prev: FormData) => ({
        ...prev,
        purchase_date: format(newDate, "yyyy-MM-dd"),
        warranty_expiry: format(warranty, "yyyy-MM-dd"),
      }));
    } else {
      setFormData((prev: FormData) => ({
        ...prev,
        purchase_date: "",
        warranty_expiry: "",
      }));
    }
  };

  const handleSelectWarranty = (newDate: Date | undefined) => {
    setWarrantyDate(newDate);
    setFormData((prev: FormData) => ({
      ...prev,
      warranty_expiry: newDate ? format(newDate, "yyyy-MM-dd") : "",
    }));
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] ">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 ">
        <div className="flex items-center gap-4">
          <Button
            className="bg-[#c2c2c2] hover:bg-[#a7a7a7] p-5 cursor-pointer"
            variant="ghost"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="px-10 mx-auto mt-5">
          <Alert className="mb-6 border-blue-200 bg-blue-50/50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Fill in the required information to add a new asset to your
              inventory.
              <span className="font-medium text-red-600 ml-1">
                Required fields are marked with an asterisk (*)
              </span>
            </AlertDescription>
          </Alert>

          <Card className="w-full shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="mx-5 py-5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-xl">Asset Information</CardTitle>
                </div>
              </div>
            </CardHeader>

            <CardContent className="">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Laptop className="w-5 h-5 text-slate-600" />
                    <h3 className="text-lg font-semibold text-slate-900">
                      Quick Setup
                    </h3>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <Label
                      htmlFor="selected_model_id"
                      className="text-sm font-medium text-slate-700"
                    >
                      Pre-configured Asset Model
                    </Label>
                    <select
                      id="selected_model_id"
                      name="selected_model_id"
                      value={formData.selected_model_id}
                      onChange={handleModelSelection}
                      className="mt-2 flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={modelsLoading}
                    >
                      <option value="">
                        Select an asset model (or fill manually below)
                      </option>
                      {assetModels.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.manufacturer} {model.name} -{" "}
                          {model.model_number}
                        </option>
                      ))}
                    </select>

                    <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                      {modelsLoading ? (
                        <span>Loading asset models...</span>
                      ) : assetModels.length > 0 ? (
                        <span>
                          {assetModels.length} pre-configured models available
                        </span>
                      ) : (
                        <span className="text-amber-600">
                          No pre-configured models found
                        </span>
                      )}
                    </div>
                  </div>

                  {isModelSelected && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 p-2 bg-blue-100 rounded-full">
                          <Info className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-blue-900 mb-3">
                            Model Selected - Auto-filled Details
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                              {
                                label: "Manufacturer",
                                value: formData.manufacturer,
                              },
                              { label: "Category", value: formData.category },
                              {
                                label: "Model Name",
                                value: formData.model_name,
                              },
                              {
                                label: "Model Number",
                                value: formData.model_number,
                              },
                            ].map((item, index) => (
                              <div
                                key={index}
                                className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2"
                              >
                                <span className="font-medium text-blue-800 text-xs uppercase tracking-wide">
                                  {item.label}:
                                </span>
                                <Badge
                                  variant="secondary"
                                  className="text-xs bg-blue-100 text-blue-700 w-fit"
                                >
                                  {item.value || "Not specified"}
                                </Badge>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-blue-600 mt-3 italic">
                            Clear the model selection above to edit these fields
                            manually.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Separator className="my-8" />

                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-slate-600" />
                    <h3 className="text-lg font-semibold text-slate-900">
                      Basic Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="lg:col-span-2">
                      <Label
                        htmlFor="asset_name"
                        className="text-sm font-medium text-slate-700"
                      >
                        Asset Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="asset_name"
                        name="asset_name"
                        type="text"
                        placeholder="e.g., MacBook Air M2 - John Doe"
                        value={formData.asset_name}
                        onChange={handleInputChange}
                        required
                        className="mt-2 h-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="manufacturer"
                        className="text-sm font-medium text-slate-700"
                      >
                        Manufacturer <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="manufacturer"
                        name="manufacturer"
                        type="text"
                        placeholder={
                          isModelSelected
                            ? "Auto-filled from model"
                            : "e.g., Apple"
                        }
                        value={formData.manufacturer}
                        onChange={handleInputChange}
                        disabled={isModelSelected}
                        className={`mt-2 h-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500 ${
                          isModelSelected
                            ? "bg-slate-100 cursor-not-allowed text-slate-600"
                            : ""
                        }`}
                        required
                      />
                    </div>

                    {isModelSelected ? (
                      <div>
                        <Label
                          htmlFor="category"
                          className="text-sm font-medium text-slate-700"
                        >
                          Category <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="text"
                          value={formData.category}
                          required
                          disabled={isModelSelected}
                          className="mt-2 h-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    ) : (
                      <div>
                        <Label
                          htmlFor="category"
                          className="text-sm font-medium text-slate-700"
                        >
                          Category <span className="text-red-500">*</span>
                        </Label>
                        <select
                          id="category"
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          disabled={isModelSelected}
                          className={`mt-2 flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${
                            isModelSelected
                              ? "bg-slate-100 cursor-not-allowed text-slate-600"
                              : ""
                          }`}
                          required
                        >
                          <option value="">Select a category</option>
                          {categories.map((category) => (
                            <option key={category} value={category}>
                              {category.charAt(0).toUpperCase() +
                                category.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <Label
                        htmlFor="model_name"
                        className="text-sm font-medium text-slate-700"
                      >
                        Model Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="model_name"
                        name="model_name"
                        type="text"
                        placeholder={
                          isModelSelected
                            ? "Auto-filled from model"
                            : "e.g., MacBook Air"
                        }
                        value={formData.model_name}
                        onChange={handleInputChange}
                        disabled={isModelSelected}
                        className={`mt-2 h-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500 ${
                          isModelSelected
                            ? "bg-slate-100 cursor-not-allowed text-slate-600"
                            : ""
                        }`}
                        required
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="model_number"
                        className="text-sm font-medium text-slate-700"
                      >
                        Model Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="model_number"
                        name="model_number"
                        type="text"
                        placeholder={
                          isModelSelected
                            ? "Auto-filled from model"
                            : "e.g., MBA13-2024"
                        }
                        value={formData.model_number}
                        onChange={handleInputChange}
                        disabled={isModelSelected}
                        className={`mt-2 h-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500 ${
                          isModelSelected
                            ? "bg-slate-100 cursor-not-allowed text-slate-600"
                            : ""
                        }`}
                        required
                      />
                    </div>
                  </div>
                </div>

                <Separator className="my-8" />

                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <Tag className="w-5 h-5 text-slate-600" />
                    <h3 className="text-lg font-semibold text-slate-900">
                      Technical Details
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <Label
                        htmlFor="serial_number"
                        className="text-sm font-medium text-slate-700"
                      >
                        Serial Number <span className="text-red-500">*</span>
                      </Label>
                      <div className="mt-2 relative">
                        <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          id="serial_number"
                          name="serial_number"
                          type="text"
                          placeholder="e.g., SNC02FXVVPQ6L4"
                          value={formData.serial_number}
                          onChange={handleInputChange}
                          className="pl-10 h-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label
                        htmlFor="ant_tag"
                        className="text-sm font-medium text-slate-700"
                      >
                        Asset Tag <span className="text-red-500">*</span>
                      </Label>
                      <div className="mt-2 relative">
                        <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          id="ant_tag"
                          name="ant_tag"
                          type="text"
                          placeholder="e.g., ANT6754"
                          value={formData.ant_tag}
                          readOnly
                          className="pl-10 h-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <Separator className="my-8" />
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-slate-600" />
                    <h3 className="text-lg font-semibold text-slate-900">
                      Financial Information
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div>
                      <Label
                        htmlFor="cost"
                        className="text-sm font-medium text-slate-700"
                      >
                        Purchase Cost
                      </Label>
                      <div className="mt-2 relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          id="cost"
                          name="cost"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={formData.cost}
                          onChange={handleInputChange}
                          className="pl-10 h-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="purchase_date"
                        className="text-sm font-medium text-slate-700"
                      >
                        Purchase Date
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? (
                              format(date, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={handleSelect}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="warranty_expiry"
                        className="text-sm font-medium text-slate-700"
                      >
                        Warranty Expiry
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !warrantyDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {warrantyDate ? (
                              format(warrantyDate, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={warrantyDate}
                            onSelect={handleSelectWarranty}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
                {message && (
                  <Alert
                    variant={
                      messageType === "error" ? "destructive" : "default"
                    }
                    className="mt-6"
                  >
                    <AlertDescription>{message}</AlertDescription>
                  </Alert>
                )}
                <div className="flex flex-col sm:flex-row items-center gap-4 pt-6 border-t border-slate-200">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full cursor-pointer sm:flex-1 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg transition-all duration-200"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Creating Asset...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Create Asset
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    asChild
                    className="w-full sm:w-auto h-11 border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    <Link href="/admin/assets">Cancel</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
