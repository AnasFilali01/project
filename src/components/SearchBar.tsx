import React, { useState } from 'react';
import { Search, Loader } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => Promise<void>;
  isLoading?: boolean;
  progress?: number;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading = false, progress }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      await onSearch(query.trim());
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
      <div className="flex items-center space-x-2 mb-4">
        <Search className="h-5 w-5 text-emerald-600" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Direct Search</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="searchQuery" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Enter company name or keywords
          </label>
          <div className="relative">
            <input
              type="text"
              id="searchQuery"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., Tech Company in New York"
              className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              disabled={isLoading}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>
        <button
          type="submit"
          disabled={!query.trim() || isLoading}
          className="w-full bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <Loader className="h-5 w-5 animate-spin" />
              <span>Searching{progress ? ` (${Math.round(progress)}%)` : '...'}</span>
            </>
          ) : (
            <>
              <Search className="h-5 w-5" />
              <span>Search</span>
            </>
          )}
        </button>
        {isLoading && progress && (
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-emerald-600 h-full transition-all duration-300 ease-in-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchBar;