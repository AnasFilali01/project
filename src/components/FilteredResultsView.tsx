import React, { useState, useMemo } from 'react';
import { FilteredResult, FilterOptions, SortOptions } from '../types';
import FilteredResultsTable from './FilteredResultsTable';
import ResultCard from './ResultCard';
import FilterPanel from './FilterPanel';
import Analytics from './Analytics';
import { LayoutGrid, Table, BarChart } from 'lucide-react';

interface FilteredResultsViewProps {
  results: FilteredResult[];
}

const FilteredResultsView: React.FC<FilteredResultsViewProps> = ({ results }) => {
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'analytics'>('table');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FilterOptions>({
    activity: [],
    country: [],
    city: [],
    hasEmail: null,
    hasPhone: null,
    searchTerm: '',
  });
  const [sortOptions, setSortOptions] = useState<SortOptions>({
    field: 'CompanyName',
    direction: 'asc',
  });

  const resultsPerPage = viewMode === 'table' ? 10 : 12;

  const filteredAndSortedResults = useMemo(() => {
    let filtered = [...results];

    // Apply filters
    if (filters.activity.length > 0) {
      filtered = filtered.filter(r => filters.activity.includes(r.Activity));
    }
    if (filters.country.length > 0) {
      filtered = filtered.filter(r => filters.country.includes(r.Country));
    }
    if (filters.city.length > 0) {
      filtered = filtered.filter(r => filters.city.includes(r.City));
    }
    if (filters.hasEmail !== null) {
      filtered = filtered.filter(r => Boolean(r.Email) === filters.hasEmail);
    }
    if (filters.hasPhone !== null) {
      filtered = filtered.filter(r => Boolean(r.Phone) === filters.hasPhone);
    }
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        r.CompanyName.toLowerCase().includes(searchLower) ||
        r.Description.toLowerCase().includes(searchLower) ||
        r.Activity.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = String(a[sortOptions.field]).toLowerCase();
      const bValue = String(b[sortOptions.field]).toLowerCase();
      return sortOptions.direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });

    return filtered;
  }, [results, filters, sortOptions]);

  const totalPages = Math.ceil(filteredAndSortedResults.length / resultsPerPage);
  const startIndex = (page - 1) * resultsPerPage;
  const paginatedResults = filteredAndSortedResults.slice(startIndex, startIndex + resultsPerPage);

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1);
  }, [filters]);

  const renderContent = () => {
    switch (viewMode) {
      case 'analytics':
        return <Analytics results={filteredAndSortedResults} />;
      case 'cards':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedResults.map((result, index) => (
              <ResultCard key={index} result={result} />
            ))}
          </div>
        );
      default:
        return (
          <FilteredResultsTable 
            results={paginatedResults}
            sortOptions={sortOptions}
            onSort={setSortOptions}
          />
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {filteredAndSortedResults.length} matches found
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'table'
                ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
            title="Table View"
          >
            <Table className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'cards'
                ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
            title="Card View"
          >
            <LayoutGrid className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('analytics')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'analytics'
                ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
            title="Analytics View"
          >
            <BarChart className="h-5 w-5" />
          </button>
        </div>
      </div>

      <FilterPanel results={results} onFilterChange={setFilters} />

      {renderContent()}

      {viewMode !== 'analytics' && totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between bg-white dark:bg-gray-800 px-6 py-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing {startIndex + 1} to {Math.min(startIndex + resultsPerPage, filteredAndSortedResults.length)} of{' '}
            {filteredAndSortedResults.length} matches
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FilteredResultsView;