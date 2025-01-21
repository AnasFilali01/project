export interface SearchResult {
  Query: string;
  Title: string;
  URL: string;
  Description: string;
}

export interface FilteredResult {
  Title: string;
  URL: string;
  Description: string;
  CompanyName: string;
  Phone: string;
  City: string;
  Country: string;
  Activity: string;
  Email: string;
  Searchstring: string;
  id?: string;
}

export interface ColumnMapping {
  nameCol: string;
  cityCol: string;
  countryCol: string;
  typeCol: string;
}

export interface ApiKeys {
  apifyToken: string;
  openaiKey: string;
}

export interface AppSettings {
  darkMode: boolean;
  favorites: string[];
  searchHistoryLimit: number;
}

export interface FilterOptions {
  activity: string[];
  country: string[];
  city: string[];
  hasEmail: boolean | null;
  hasPhone: boolean | null;
  searchTerm: string;
}

export interface SortOptions {
  field: keyof FilteredResult;
  direction: 'asc' | 'desc';
}

export interface SearchHistory {
  id: string;
  user_id: string;
  query: string;
  mode: 'direct' | 'file';
  timestamp: string;
  is_favorite: boolean;
  results_count: number;
  file_name?: string;
  tags?: string[];
  notes?: string;
  last_accessed?: string;
  view_count?: number;
  search_parameters?: Record<string, any>;
}