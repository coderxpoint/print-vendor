import axios from 'axios';
import type { APIToken, LotsResponse, Stats, TokenResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Auth API
export const authAPI = {
  login: async (username: string, password: string): Promise<TokenResponse> => {
    const response = await api.post<TokenResponse>('/api/auth/login', {
      username,
      password,
    });
    return response.data;
  },
};

// Tokens API
export const tokensAPI = {
  generate: async (name: string): Promise<APIToken> => {
    const response = await api.post<APIToken>('/api/tokens/generate', { name });
    return response.data;
  },

  list: async (): Promise<APIToken[]> => {
    const response = await api.get<APIToken[]>('/api/tokens');
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/tokens/${id}`);
  },

  toggle: async (id: number): Promise<{ is_active: boolean }> => {
    const response = await api.patch(`/api/tokens/${id}/toggle`);
    return response.data;
  },
};

// Lots API
export const lotsAPI = {
  list: async (page: number = 1, limit: number = 50, lot_number?: string): Promise<LotsResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (lot_number) {
      params.append('lot_number', lot_number);
    }
    const response = await api.get<LotsResponse>(`/api/lots?${params}`);
    return response.data;
  },

  download: async (id: number): Promise<void> => {
    const response = await api.get(`/api/lots/download/${id}`, {
      responseType: 'blob',
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Get filename from Content-Disposition header
    const contentDisposition = response.headers['content-disposition'];
    const filename = contentDisposition
      ? contentDisposition.split('filename=')[1].replace(/"/g, '')
      : 'download.csv';
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  downloadMultiple: async (ids: number[]): Promise<void> => {
    const response = await api.post('/api/lots/download-multiple', { lot_ids: ids });
    
    // Download each lot
    for (const lot of response.data.lots) {
      if (lot.available) {
        await lotsAPI.download(lot.lot_id);
      }
    }
  },

  getStats: async (): Promise<Stats> => {
    const response = await api.get<Stats>('/api/lots/stats');
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/lots/${id}`);
  },
};

export default api;