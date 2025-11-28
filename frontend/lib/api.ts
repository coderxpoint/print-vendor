// lib/api.ts - Fixed API Implementation with Correct Download URL

import type { Stats, Lot } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// API Response types
interface LotsResponse {
  lots: Lot[];
  total: number;
}

interface TokenResponse {
  id: number;
  token: string;
  name: string;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
  usage_count: number;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    username: string;
  };
}

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

// Helper function to handle API responses with proper typing
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `API Error: ${response.status}`);
  }
  
  const data = await response.json();
  console.log("API Response:", data);
  return data;
}

// Lots API
export const lotsAPI = {
  // List lots with filters
  list: async (
    page: number = 1,
    limit: number = 50,
    lotNumber?: string
  ): Promise<LotsResponse> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (lotNumber) {
      params.append("lot_number", lotNumber);
    }

    const url = `${API_BASE_URL}/api/lots?${params.toString()}`;
    console.log("📡 Fetching lots from:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await handleResponse<LotsResponse>(response);
    console.log("✅ Lots API response:", data);
    return data;
  },

  // Get stats - FIXED: Explicit return type
  getStats: async (): Promise<Stats> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const url = `${API_BASE_URL}/api/lots/stats`;
    console.log("📡 Fetching stats from:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await handleResponse<Stats>(response);
    console.log("✅ Stats API response:", data);
    return data;
  },

  // Download lot - FIXED: Correct URL order
  download: async (id: number): Promise<void> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    // FIXED: Changed from /api/lots/${id}/download to /api/lots/download/${id}
    const url = `${API_BASE_URL}/api/lots/download/${id}`;
    console.log("📡 Downloading lot from:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Failed to download file");
    }

    const contentDisposition = response.headers.get("Content-Disposition");
    let filename = `lot_${id}.csv`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

    console.log("✅ File downloaded:", filename);
  },

  // Delete lot
  delete: async (id: number): Promise<void> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const url = `${API_BASE_URL}/api/lots/${id}`;
    console.log("📡 Deleting lot from:", url);

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    await handleResponse<{ message: string }>(response);
    console.log("✅ Lot deleted successfully");
  },
};

// Tokens API
export const tokensAPI = {
  // List all tokens
  list: async (): Promise<TokenResponse[]> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const url = `${API_BASE_URL}/api/tokens`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return await handleResponse<TokenResponse[]>(response);
  },

  // Generate new token
  generate: async (name: string): Promise<TokenResponse> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const url = `${API_BASE_URL}/api/tokens/generate`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });

    return await handleResponse<TokenResponse>(response);
  },

  // Toggle token status
  toggle: async (id: number): Promise<TokenResponse> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const url = `${API_BASE_URL}/api/tokens/${id}/toggle`;
    
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return await handleResponse<TokenResponse>(response);
  },

  // Delete token
  delete: async (id: number): Promise<{ message: string }> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const url = `${API_BASE_URL}/api/tokens/${id}`;
    
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return await handleResponse<{ message: string }>(response);
  },
};

// Auth API
export const authAPI = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    const url = `${API_BASE_URL}/api/auth/login`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    return await handleResponse<AuthResponse>(response);
  },
};