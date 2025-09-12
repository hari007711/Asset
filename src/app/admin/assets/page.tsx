"use client";

import { ViewAssetsTable } from "@/components/ViewAssetTable";
import { api } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

interface Asset {
  id: number | string;
  asset_name: string;
  model_name?: string;
  model_number?: string;
  manufacturer?: string;
  category: string;
  status: string;
  owner?: string;
  assignedTo?: string;
  ant_tag?: string;
  serial_number?: string;
  email?: string;
  cost?: number;
  purchase_date?: string;
  warranty_expiry?: string;
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      await supabase.auth.getUser();
    };

    const fetchAssets = async () => {
      try {
        const assetsData = await api.getAllAssets();
        setAssets(assetsData);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Failed to fetch assets:", error.message);
        } else {
          console.error("Failed to fetch assets: Unknown error");
        }
        setAssets([]);
      }
    };

    checkUser();
    fetchAssets();
  }, [supabase]);

  return (
    <div className=" min-h-screen bg-[#f4f4f4] dark:bg-gray-900">
      <div className="px-5 py-5">
        <ViewAssetsTable assets={assets} setAssets={setAssets} />
      </div>
    </div>
  );
}
