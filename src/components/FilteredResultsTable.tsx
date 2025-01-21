import React from 'react';
import { FilteredResult, SortOptions } from '../types';
import { ChevronDown, ChevronUp, ExternalLink, Mail, Phone, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface FilteredResultsTableProps {
  results: FilteredResult[];
  sortOptions: SortOptions;
  onSort: (options: SortOptions) => void;
}

const FilteredResultsTable: React.FC<FilteredResultsTableProps> = ({ 
  results, 
  sortOptions, 
  onSort 
}) => {
  const { toggleFavorite, isFavorite } = useApp();

  const handleSort = (field: keyof FilteredResult) => {
    onSort({
      field,
      direction: 
        field === sortOptions.field && sortOptions.direction === 'asc' 
          ? 'desc' 
          : 'asc'
    });
  };

  const SortIcon = ({ field }: { field: keyof FilteredResult }) => {
    if (field !== sortOptions.field) return null;
    return sortOptions.direction === 'asc' 
      ? <ChevronUp className="h-4 w-4" /> 
      : <ChevronDown className="h-4 w-4" />;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th className="w-10 px-6 py-3"></th>
              {[
                { key: 'CompanyName', label: 'Company' },
                { key: 'Activity', label: 'Activity' },
                { key: 'City', label: 'Location' },
                { key: 'Phone', label: 'Contact' },
                { key: 'URL', label: 'Website' }
              ].map(({ key, label }) => (
                <th
                  key={key}
                  onClick={() => handleSort(key as keyof FilteredResult)}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>{label}</span>
                    <SortIcon field={key as keyof FilteredResult} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {results.map((result, index) => {
              const resultId = result.id || result.Searchstring;
              return (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleFavorite(resultId)}
                      className={`transition-colors ${
                        isFavorite(resultId)
                          ? 'text-yellow-500 hover:text-yellow-600'
                          : 'text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400'
                      }`}
                    >
                      <Star className="h-5 w-5" fill={isFavorite(resultId) ? 'currentColor' : 'none'} />
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {result.CompanyName}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {result.Description}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {result.Activity}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">{result.City}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{result.Country}</div>
                  </td>
                  <td className="px-6 py-4">
                    {result.Phone && (
                      <div className="flex items-center space-x-2 text-sm text-gray-900 dark:text-white mb-2">
                        <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span>{result.Phone}</span>
                      </div>
                    )}
                    {result.Email && (
                      <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-500 hover:text-blue-800 dark:hover:text-blue-400">
                        <Mail className="h-4 w-4" />
                        <a href={`mailto:${result.Email}`}>{result.Email}</a>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href={result.URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-500 hover:text-blue-800 dark:hover:text-blue-400"
                    >
                      <span>Visit Website</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FilteredResultsTable;