const API_BASE_URL =
  "https://ut9zinvbtl.execute-api.ap-south-1.amazonaws.com/dev";

export interface AssetModel {
  name?: string;
  model_number?: string;
  manufacturer?: string;
  category?: string;
}

export interface AssetAPIResponse {
  id: string | number;
  status: string;
  asset_models?: AssetModel;
  current_owner?: string;
  asset_name: string;
}

export interface User {
  id: string;
  email: string;
  name?: string | null;
}

export const api = {
  createAsset: async (assetData: {
    asset_name: string;
    model_name: string;
    model_number: string;
    manufacturer: string;
    serial_number: string;
    ant_tag: string;
    category: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/inventory/new`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(assetData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create asset: ${response.statusText}`);
    }

    return response.json();
  },

  getAllAssets: async () => {
    const response = await fetch(`${API_BASE_URL}/dashboard/inventory`);

    if (!response.ok) {
      throw new Error(`Failed to fetch assets: ${response.statusText}`);
    }
    const result = await response.json();
    const assets = result.data || [];

    return assets.map((asset: AssetAPIResponse) => ({
      ...asset,
      status: asset.status === "unallocated" ? "available" : asset.status,
      model_name: asset.asset_models?.name || "",
      model_number: asset.asset_models?.model_number || "",
      manufacturer: asset.asset_models?.manufacturer || "",
      category: asset.asset_models?.category || "other",
      owner: asset.current_owner,
    }));
  },

  getUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/dashboard/users`);
    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }
    const result = await response.json();
    return result.data || [];
  },

  allocateAsset: async (assetId: string, userEmail: string) => {
    const response = await fetch(
      `${API_BASE_URL}/inventory/allocate/${assetId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current_owner: userEmail,
        }),
      }
    );

    if (!response.ok) {
      let errorMessage = `Failed to allocate asset: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        console.error("Error parsing response JSON:", e);
      }
      throw new Error(errorMessage);
    }

    return response.json();
  },

  unallocateAsset: async (assetId: string) => {
    const response = await fetch(
      `${API_BASE_URL}/inventory/unallocate/${assetId}`,
      {
        method: "PUT",
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to unallocate asset: ${response.statusText}`);
    }
    return response.json();
  },

  updateAssetStatus: async (assetId: string, status: string) => {
    const response = await fetch(
      `${API_BASE_URL}/inventory/update/status/${assetId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
        }),
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to update asset status: ${response.statusText}`);
    }
    return response.json();
  },

  editAsset: async (
    assetId: string,
    assetData: {
      asset_name?: string;
      serial_number?: string;
      cost?: number;
      purchase_date?: string;
      warranty_expiry?: string;
    }
  ) => {
    const response = await fetch(`${API_BASE_URL}/inventory/edit/${assetId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(assetData),
    });
    if (!response.ok) {
      throw new Error(`Failed to edit asset: ${response.statusText}`);
    }
    return response.json();
  },

  getAssetModels: async () => {
    const response = await fetch(`${API_BASE_URL}/dashboard/asset-models`);

    if (!response.ok) {
      throw new Error(`Failed to fetch asset models: ${response.statusText}`);
    }
    const result = await response.json();
    return result.data || [];
  },

  getAssetStatusHistory: async () => {
    const response = await fetch(
      `${API_BASE_URL}/dashboard/asset-status-history`
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch asset status history: ${response.statusText}`
      );
    }
    const result = await response.json();
    return result.data || [];
  },
};

export const ASSET_STATUSES = [
  "available",
  "allocated",
  "maintenance",
  "in repair",
  "retired",
] as const;

export type AssetStatus = (typeof ASSET_STATUSES)[number];

export const getValidStatusTransitions = (currentStatus: string): string[] => {
  switch (currentStatus) {
    case "available":
    case "unallocated":
      return ["allocated", "maintenance", "in repair", "retired"];
    case "allocated":
      return ["available"];
    case "maintenance":
      return ["available", "retired", "in repair"];
    case "in repair":
      return ["maintenance", "available", "retired"];
    case "retired":
      return [];
    default:
      return [];
  }
};
