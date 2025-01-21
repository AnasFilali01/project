import React, { useState, useEffect } from 'react';
import { FilteredResult, FilterOptions } from '../types';
import { Filter, X, Search, Mail, Phone } from 'lucide-react';

interface FilterPanelProps {
  results: FilteredResult[];
  onFilterChange: (filters: FilterOptions) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ results, onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    activity: [],
    country: [],
    city: [],
    hasEmail: null,
    hasPhone: null,
    searchTerm: '',
  });

  // Extract unique values for dropdowns
  const uniqueActivities = [...new Set(results.map(r => r.Activity).filter(Boolean))].sort();
  const uniqueCountries = [...new Set(results.map(r => r.Country).filter(Boolean))].sort();
  const uniqueCities = [...new Set(results.map(r => r.City).filter(Boolean))].sort();

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      activity: [],
      country: [],
      city: [],
      hasEmail: null,
      hasPhone: null,
      searchTerm: '',
    });
  };

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-500"
      >
        <Filter className="h-5 w-5" />
        <span>Filters</span>
      </button>

      {isOpen && (
        <div className="mt-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="space-y-6">
            {/* Search Bar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={filters.searchTerm}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                  placeholder="Search in results..."
                  className="pl-10 w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Activity Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Activity
                </label>
                <select
                  multiple
                  value={filters.activity}
                  onChange={(e) => handleFilterChange('activity', 
                    Array.from(e.target.selectedOptions, option => option.value)
                  )}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                >
                  {uniqueActivities.map(activity => (
                    <option key={activity} value={activity}>{activity}</option>
                  ))}
                </select>
              </div>

              {/* Country Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Country
                </label>
                <select
                  multiple
                  value={filters.country}
                  onChange={(e) => handleFilterChange('country',
                    Array.from(e.target.selectedOptions, option => option.value)
                  )}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                >
                  {uniqueCountries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              {/* City Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  City
                </label>
                <select
                  multiple
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city',
                    Array.from(e.target.selectedOptions, option => option.value)
                  )}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                >
                  {uniqueCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Contact Filters */}
            <div className="flex items-center space-x-6">
              <label className="inline-flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.hasEmail === true}
                  onChange={(e) => handleFilterChange('hasEmail', e.target.checked ? true : null)}
                  className="rounded border-gray-300 text-emerald-600 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Has Email</span>
              </label>

              <label className="inline-flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.hasPhone === true}
                  onChange={(e) => handleFilterChange('hasPhone', e.target.checked ? true : null)}
                  className="rounded border-gray-300 text-emerald-600 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Has Phone</span>
              </label>
            </div>

            {/* Clear Filters Button */}
            <div className="flex justify-end">
              <button
                onClick={clearFilters}
                className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500"
              >
                <X className="h-4 w-4" />
                <span>Clear Filters</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;