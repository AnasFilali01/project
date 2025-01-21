import React from 'react';
import { Clock, Star, Trash2, Search, FileText, RefreshCw, AlertTriangle } from 'lucide-react';
import type { SearchHistory as SearchHistoryType } from '../types';

interface SearchHistoryProps {
  history: SearchHistoryType[];
  onSelect: (entry: SearchHistoryType) => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  loading?: boolean;
}

export const SearchHistory: React.FC<SearchHistoryProps> = ({
  history,
  onSelect,
  onToggleFavorite,
  onDelete,
  onClear,
  loading = false
}) => {
  const favoriteCount = history.filter(entry => entry.is_favorite).length;

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <RefreshCw className="h-6 w-6 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No search history available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Search History</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {favoriteCount} favorite {favoriteCount === 1 ? 'search' : 'searches'}
          </p>
        </div>
        {history.some(entry => !entry.is_favorite) && (
          <div className="flex items-center">
            <div className="relative group">
              <button
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="About clearing history"
              >
                <AlertTriangle className="h-4 w-4 text-gray-400" />
              </button>
              <div className="absolute right-0 w-64 p-2 mt-2 text-xs text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 invisible group-hover:visible">
                Clearing history will remove all non-favorite searches. Favorite searches will be preserved.
              </div>
            </div>
            <button
              onClick={onClear}
              className="ml-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center space-x-1"
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {history.map((entry) => (
          <div
            key={entry.id}
            className={`bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-all ${
              entry.is_favorite ? 'ring-2 ring-yellow-400 dark:ring-yellow-500' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div 
                  onClick={() => onSelect(entry)}
                  className="flex items-center space-x-2 cursor-pointer group"
                >
                  {entry.mode === 'direct' ? (
                    <Search className="h-4 w-4 text-emerald-600 group-hover:text-emerald-500" />
                  ) : (
                    <FileText className="h-4 w-4 text-emerald-600 group-hover:text-emerald-500" />
                  )}
                  <span className="text-gray-900 dark:text-white font-medium group-hover:text-emerald-600 dark:group-hover:text-emerald-500">
                    {entry.query}
                  </span>
                </div>
                
                <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(entry.timestamp).toLocaleString()}</span>
                  </div>
                  {entry.file_name && (
                    <span className="text-gray-400 dark:text-gray-500">
                      File: {entry.file_name}
                    </span>
                  )}
                  <span>{entry.results_count} results</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onToggleFavorite(entry.id)}
                  className={`transition-colors p-1 rounded-full ${
                    entry.is_favorite
                      ? 'text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                      : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-100 dark:text-gray-500 dark:hover:text-yellow-500 dark:hover:bg-gray-700'
                  }`}
                  title={entry.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Star className="h-5 w-5" fill={entry.is_favorite ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={() => onDelete(entry.id)}
                  className="p-1 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 dark:text-gray-500 dark:hover:text-red-400 dark:hover:bg-red-900/20"
                  title="Delete search"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};