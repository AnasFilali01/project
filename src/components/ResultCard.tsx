import React, { useState } from 'react';
import { FilteredResult } from '../types';
import { Building2, MapPin, Phone, Mail, Globe, Briefcase, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EnrichmentService, EnrichmentResult } from '../services/enrichment';
import EnrichmentPanel from './EnrichmentPanel';
import { TokenStorage } from '../lib/token-storage';

interface ResultCardProps {
  result: FilteredResult;
}

const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  const { toggleFavorite, isFavorite } = useApp();
  const resultId = result.id || result.Searchstring;
  const [enrichmentData, setEnrichmentData] = useState<EnrichmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEnrichment, setShowEnrichment] = useState(false);
  const [enrichmentProgress, setEnrichmentProgress] = useState(0);

  const handleEnrichment = async () => {
    if (enrichmentData) {
      setShowEnrichment(!showEnrichment);
      return;
    }

    setIsLoading(true);
    setError(null);
    setEnrichmentProgress(0);

    try {
      const tokens = await TokenStorage.getTokens();
      if (!tokens?.openaiKey) {
        throw new Error('OpenAI API key not configured');
      }

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setEnrichmentProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);

      const data = await EnrichmentService.enrichCompanyData(
        result.CompanyName,
        result.Description,
        `${result.City}, ${result.Country}`,
        result.Activity,
        tokens.openaiKey
      );

      clearInterval(progressInterval);
      setEnrichmentProgress(100);
      setEnrichmentData(data);
      setShowEnrichment(true);
    } catch (err) {
      console.error('Enrichment failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to enrich company data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="border-b dark:border-gray-700 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {result.CompanyName}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {result.Description}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => toggleFavorite(resultId)}
                className={`p-1 rounded-full transition-colors ${
                  isFavorite(resultId)
                    ? 'text-yellow-500 hover:text-yellow-600'
                    : 'text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400'
                }`}
              >
                <Star className="h-5 w-5" fill={isFavorite(resultId) ? 'currentColor' : 'none'} />
              </button>
              <Building2 className="h-6 w-6 text-emerald-600 dark:text-emerald-500 flex-shrink-0" />
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3">
          <div className="flex items-center space-x-3 text-sm">
            <MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            <span className="text-gray-600 dark:text-gray-400">
              {[result.City, result.Country].filter(Boolean).join(', ')}
            </span>
          </div>

          {result.Activity && (
            <div className="flex items-center space-x-3 text-sm">
              <Briefcase className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">{result.Activity}</span>
            </div>
          )}

          {result.Phone && (
            <div className="flex items-center space-x-3 text-sm">
              <Phone className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              <a
                href={`tel:${result.Phone}`}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400"
              >
                {result.Phone}
              </a>
            </div>
          )}

          {result.Email && (
            <div className="flex items-center space-x-3 text-sm">
              <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              <a
                href={`mailto:${result.Email}`}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400"
              >
                {result.Email}
              </a>
            </div>
          )}
        </div>

        {/* Website Link and Enrichment Button */}
        <div className="pt-4 border-t dark:border-gray-700">
          <div className="flex items-center justify-between">
            <a
              href={result.URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-500 dark:hover:text-emerald-400"
            >
              <Globe className="h-4 w-4" />
              <span>Visit Website</span>
            </a>

            <button
              onClick={handleEnrichment}
              disabled={isLoading}
              className="inline-flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {isLoading ? (
                <span>Loading ({Math.round(enrichmentProgress)}%)</span>
              ) : (
                <>
                  <span>Company Insights</span>
                  {showEnrichment ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </>
              )}
            </button>
          </div>

          {/* Progress Bar */}
          {isLoading && (
            <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 overflow-hidden">
              <div 
                className="bg-emerald-600 h-full transition-all duration-300 ease-in-out"
                style={{ width: `${enrichmentProgress}%` }}
              />
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Enrichment Panel */}
        {showEnrichment && enrichmentData && (
          <div className="mt-4">
            <EnrichmentPanel data={enrichmentData} isLoading={isLoading} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultCard;