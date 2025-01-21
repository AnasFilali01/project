import React, { useMemo } from 'react';
import { FilteredResult } from '../types';
import { PieChart, BarChart2, Globe2, Building2, Mail, Phone, MapPin, Briefcase } from 'lucide-react';

interface AnalyticsProps {
  results: FilteredResult[];
}

interface InsightMetric {
  label: string;
  value: number;
  percentage: number;
  icon: React.ReactNode;
}

interface ChartData {
  label: string;
  value: number;
}

const Analytics: React.FC<AnalyticsProps> = ({ results }) => {
  const metrics = useMemo(() => {
    const totalResults = results.length;
    
    const withEmail = results.filter(r => r.Email).length;
    const withPhone = results.filter(r => r.Phone).length;
    const withBoth = results.filter(r => r.Email && r.Phone).length;
    const withWebsite = results.filter(r => r.URL).length;

    return [
      {
        label: 'Total Companies',
        value: totalResults,
        percentage: 100,
        icon: <Building2 className="h-5 w-5 text-emerald-500" />
      },
      {
        label: 'With Email',
        value: withEmail,
        percentage: (withEmail / totalResults) * 100,
        icon: <Mail className="h-5 w-5 text-blue-500" />
      },
      {
        label: 'With Phone',
        value: withPhone,
        percentage: (withPhone / totalResults) * 100,
        icon: <Phone className="h-5 w-5 text-indigo-500" />
      },
      {
        label: 'Complete Contact Info',
        value: withBoth,
        percentage: (withBoth / totalResults) * 100,
        icon: <Globe2 className="h-5 w-5 text-purple-500" />
      }
    ];
  }, [results]);

  const topActivities = useMemo(() => {
    const activities = results.reduce((acc, curr) => {
      if (curr.Activity) {
        acc[curr.Activity] = (acc[curr.Activity] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(activities)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([label, value]) => ({
        label,
        value,
        percentage: (value / results.length) * 100
      }));
  }, [results]);

  const topLocations = useMemo(() => {
    const locations = results.reduce((acc, curr) => {
      const location = [curr.City, curr.Country].filter(Boolean).join(', ');
      if (location) {
        acc[location] = (acc[location] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(locations)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([label, value]) => ({
        label,
        value,
        percentage: (value / results.length) * 100
      }));
  }, [results]);

  const MetricCard = ({ metric }: { metric: InsightMetric }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{metric.label}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{metric.value}</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {metric.percentage.toFixed(1)}% of total
          </p>
        </div>
        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-full">
          {metric.icon}
        </div>
      </div>
    </div>
  );

  const ChartSection = ({ 
    title, 
    icon, 
    data 
  }: { 
    title: string; 
    icon: React.ReactNode; 
    data: ChartData[] 
  }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      <div className="flex items-center space-x-2 mb-6">
        {icon}
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
      </div>
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
              <span className="text-gray-900 dark:text-white font-medium">
                {item.value} ({((item.value / results.length) * 100).toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-emerald-500 h-2 rounded-full"
                style={{ width: `${(item.value / results.length) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard key={index} metric={metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSection
          title="Top Business Activities"
          icon={<Briefcase className="h-5 w-5 text-emerald-500" />}
          data={topActivities}
        />
        <ChartSection
          title="Top Locations"
          icon={<MapPin className="h-5 w-5 text-emerald-500" />}
          data={topLocations}
        />
      </div>
    </div>
  );
};

export default Analytics;