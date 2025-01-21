import React, { useState } from 'react';
import { Users, DollarSign, Building2, Users2, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import type { EnrichmentResult } from '../services/enrichment';

interface EnrichmentPanelProps {
  data: EnrichmentResult;
  isLoading?: boolean;
}

const EnrichmentPanel: React.FC<EnrichmentPanelProps> = ({ data, isLoading = false }) => {
  const [expanded, setExpanded] = useState(false);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-center py-4">
          <RefreshCw className="h-6 w-6 text-emerald-600 animate-spin" />
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: data.revenue.currency,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(num);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.7) return 'text-green-600 dark:text-green-400';
    if (confidence >= 0.4) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Company Insights
          </h3>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            {expanded ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Users className="h-4 w-4" />
              <span>Employees</span>
            </div>
            <div className="mt-1">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatNumber(data.employeeCount.estimate)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {formatNumber(data.employeeCount.range.min)} - {formatNumber(data.employeeCount.range.max)}
              </div>
            </div>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <DollarSign className="h-4 w-4" />
              <span>Revenue</span>
            </div>
            <div className="mt-1">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatCurrency(data.revenue.estimate)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {formatCurrency(data.revenue.range.min)} - {formatCurrency(data.revenue.range.max)}
              </div>
            </div>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Building2 className="h-4 w-4" />
              <span>Industry</span>
            </div>
            <div className="mt-1">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {data.industry.primary}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {data.industry.secondary.slice(0, 2).join(', ')}
              </div>
            </div>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Users2 className="h-4 w-4" />
              <span>Competitors</span>
            </div>
            <div className="mt-1">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {data.competitors.length}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Top matches
              </div>
            </div>
          </div>
        </div>

        {expanded && (
          <div className="mt-6 space-y-6">
            {/* Social Profiles */}
            {Object.entries(data.socialProfiles).some(([, url]) => url) && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Social Profiles
                </h4>
                <div className="space-y-2">
                  {Object.entries(data.socialProfiles).map(([platform, url]) => (
                    url && (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {platform.charAt(0).toUpperCase() + platform.slice(1)}
                      </a>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Competitors */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Top Competitors
              </h4>
              <div className="space-y-2">
                {data.competitors.map((competitor, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-900 dark:text-white">
                      {competitor.name}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        {Math.round(competitor.similarity * 100)}% match
                      </span>
                      {competitor.url && (
                        <a
                          href={competitor.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Visit
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Confidence Scores */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Confidence Scores
              </h4>
              <div className="space-y-2">
                {[
                  { label: 'Employee Count', value: data.employeeCount.confidence },
                  { label: 'Revenue', value: data.revenue.confidence },
                  { label: 'Industry', value: data.industry.confidence },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                    <span className={getConfidenceColor(item.value)}>
                      {Math.round(item.value * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnrichmentPanel;