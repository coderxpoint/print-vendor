// Type definitions for the application

export interface APIToken {
  id: number;
  token: string;
  name: string;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
  usage_count: number;
}

export interface Lot {
  id: number;
  lot_number: string;
  record_count: number;
  file_name: string;
  uploaded_at: string;
  uploaded_by_token: string | null;
}

export interface LotsResponse {
  total: number;
  page: number;
  limit: number;
  lots: Lot[];
}

export interface Stats {
  total_lots: number;
  total_records: number;
  total_uploads: number;
  active_tokens: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  username: string;
  token: string;
}