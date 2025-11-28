// types/index.ts or types.ts - Comprehensive Type Definitions

// Lot interface - represents a single lot/upload
export interface Lot {
  id: number;
  lot_number: string;
  file_name: string;
  record_count: number;
  uploaded_at: string;
  uploaded_by_token: string | null;
  created_at?: string;
  updated_at?: string;
}

// Stats interface - dashboard statistics
export interface Stats {
  total_lots: number;
  total_records: number;
  total_uploads: number;
  active_tokens: number;
}

// API Token interface
export interface APIToken {
  id: number;
  token: string;
  name: string;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
  usage_count: number;
}

// User interface
export interface User {
  id: number;
  username: string;
  email?: string;
  role?: string;
  created_at?: string;
}

// Auth response
export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// Pagination interface
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

// Filter params for lots
export interface LotFilterParams extends PaginationParams {
  lot_number?: string;
  file_name?: string;
  uploaded_by?: string;
  date_from?: string;
  date_to?: string;
}

// API response wrappers
export interface LotsResponse {
  lots: Lot[];
  total: number;
}

export interface ApiError {
  detail: string;
  status?: number;
}

// Component prop types
export interface StatsCardsProps {
  stats: Stats | null;
  loading: boolean;
}

export interface LotsTableProps {
  lots: Lot[];
  loading: boolean;
  onRefresh: () => void;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  selectedLots: number[];
  onSelectionChange: (selected: number[]) => void;
}

export interface TokenListProps {
  tokens: APIToken[];
  onRefresh: () => void;
}

// Form types
export interface LoginFormData {
  username: string;
  password: string;
}

export interface TokenGenerateFormData {
  name: string;
}

// Utility types
export type SortOrder = "asc" | "desc";
export type LoadingState = boolean;
export type ErrorState = string | null;