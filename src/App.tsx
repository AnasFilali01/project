import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { RefreshCw, Search, Download, Settings as SettingsIcon, Moon, Sun, Star, FileText, History } from 'lucide-react';
import { useApp } from './context/AppContext';
import { useAuth } from './context/AuthContext';
import { SearchHistory } from './components/SearchHistory';
import Settings from './components/Settings';
import AuthForm from './components/auth/AuthForm';
import ProtectedRoute from './components/ProtectedRoute';
import { SearchHistoryManager } from './lib/search-history';
import SearchBar from './components/SearchBar';
import FileUpload from './components/FileUpload';
import FilteredResultsView from './components/FilteredResultsView';
import { searchWithApify } from './services/apify';
import { analyzeResults } from './services/openai';
import { TokenStorage } from './lib/token-storage';
import type { SearchHistory as SearchHistoryType, FilteredResult, ColumnMapping } from './types';

function App() {
  const { settings, toggleDarkMode } = useApp();
  const { user } = useAuth();
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryType[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<FilteredResult[]>([]);
  const [searchProgress, setSearchProgress] = useState(0);

  useEffect(() => {
    if (user && showSearchHistory) {
      loadSearchHistory();
    }
  }, [user, showSearchHistory]);

  const handleSearch = async (query: string) => {
    setError(null);
    setIsSearching(true);
    setSearchProgress(0);
    
    try {
      const tokens = await TokenStorage.getTokens();
      if (!tokens) {
        throw new Error('API keys not configured. Please add them in settings.');
      }

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setSearchProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);

      const searchResults = await searchWithApify(query, tokens.apifyToken);
      const analyzedResults = await analyzeResults(query, searchResults, tokens.openaiKey);
      
      clearInterval(progressInterval);
      setSearchProgress(100);
      setResults(analyzedResults);

      // Add to search history
      await SearchHistoryManager.addToHistory({
        query,
        mode: 'direct',
        is_favorite: false,
        results_count: analyzedResults.length
      });

    } catch (error) {
      console.error('Search failed:', error);
      setError(error instanceof Error ? error.message : 'Search failed');
    } finally {
      setIsSearching(false);
      setSearchProgress(0);
    }
  };

  const handleFileSearch = async (data: any[], mapping: ColumnMapping) => {
    setError(null);
    setIsSearching(true);
    
    try {
      const tokens = await TokenStorage.getTokens();
      if (!tokens) {
        throw new Error('API keys not configured. Please add them in settings.');
      }

      const allResults: FilteredResult[] = [];
      
      for (const row of data) {
        const query = [
          row[mapping.nameCol],
          row[mapping.cityCol],
          row[mapping.countryCol],
          row[mapping.typeCol]
        ].filter(Boolean).join(', ');

        const searchResults = await searchWithApify(query, tokens.apifyToken);
        const analyzedResults = await analyzeResults(query, searchResults, tokens.openaiKey);
        
        allResults.push(...analyzedResults);
      }

      setResults(allResults);

      // Add to search history
      await SearchHistoryManager.addToHistory({
        query: `Batch search from file`,
        mode: 'file',
        is_favorite: false,
        results_count: allResults.length,
        file_name: 'excel_upload.xlsx' // You might want to store the actual file name
      });

    } catch (error) {
      console.error('File search failed:', error);
      setError(error instanceof Error ? error.message : 'File search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const handleHistorySelect = async (entry: SearchHistoryType) => {
    setShowSearchHistory(false);
    handleSearch(entry.query);
  };

  const handleHistoryToggleFavorite = async (id: string) => {
    try {
      await SearchHistoryManager.toggleFavorite(id);
      await loadSearchHistory();
    } catch (error) {
      setError('Failed to update favorite status');
    }
  };

  const handleHistoryDelete = async (id: string) => {
    try {
      await SearchHistoryManager.deleteEntry(id);
      await loadSearchHistory();
    } catch (error) {
      setError('Failed to delete history entry');
    }
  };

  const handleHistoryClear = async () => {
    try {
      await SearchHistoryManager.clearHistory();
      await loadSearchHistory();
    } catch (error) {
      setError('Failed to clear history');
    }
  };

  const loadSearchHistory = async () => {
    setLoadingHistory(true);
    try {
      const history = await SearchHistoryManager.getHistory();
      setSearchHistory(history);
    } catch (error) {
      console.error('Failed to load search history:', error);
      setError('Failed to load search history');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSettingsSave = async (tokens: { apifyToken: string; openaiKey: string }) => {
    try {
      await TokenStorage.storeTokens(tokens);
    } catch (error) {
      setError('Failed to save API keys');
    }
  };

  const MainContent = () => (
    <div className={`min-h-screen ${settings.darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-7 w-7 text-emerald-600 dark:text-emerald-500 animate-spin-slow" />
              <span className="text-2xl font-bold text-gray-800 dark:text-white">Clearlead</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowSearchHistory(!showSearchHistory)}
                className="text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors"
                title="Search History"
              >
                <History className="h-5 w-5" />
              </button>
              <button
                onClick={toggleDarkMode}
                className="text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors"
                title={settings.darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {settings.darkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`transition-colors ${
                  showFavoritesOnly
                    ? 'text-yellow-500 hover:text-yellow-600'
                    : 'text-gray-600 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-yellow-500'
                }`}
                title={showFavoritesOnly ? 'Show all matches' : 'Show favorites only'}
              >
                <Star className="h-5 w-5" fill={showFavoritesOnly ? 'currentColor' : 'none'} />
              </button>
              <button 
                onClick={() => setShowSettings(true)}
                className="text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors"
              >
                <SettingsIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8">
        {error && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <SearchBar 
            onSearch={handleSearch} 
            isLoading={isSearching} 
            progress={searchProgress}
          />
          <FileUpload onFileUpload={handleFileSearch} />
        </div>

        {results.length > 0 && (
          <FilteredResultsView results={showFavoritesOnly ? results.filter(r => settings.favorites.includes(r.id || r.Searchstring)) : results} />
        )}

        {showSearchHistory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Search History</h2>
                  <button
                    onClick={() => setShowSearchHistory(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    ×
                  </button>
                </div>
                <SearchHistory
                  history={searchHistory}
                  onSelect={handleHistorySelect}
                  onToggleFavorite={handleHistoryToggleFavorite}
                  onDelete={handleHistoryDelete}
                  onClear={handleHistoryClear}
                  loading={loadingHistory}
                />
              </div>
            </div>
          </div>
        )}

        {showSettings && (
          <Settings 
            onClose={() => setShowSettings(false)} 
            onSave={handleSettingsSave}
          />
        )}
      </main>
    </div>
  );

  return (
    <Routes>
      <Route path="/auth" element={!user ? <AuthForm /> : <Navigate to="/" replace />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainContent />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;