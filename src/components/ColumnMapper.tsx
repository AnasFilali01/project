import React from 'react';
import { Table } from 'lucide-react';
import { ColumnMapping } from '../types';

interface ColumnMapperProps {
  columns: string[];
  onMapping: (mapping: ColumnMapping) => void;
}

const ColumnMapper: React.FC<ColumnMapperProps> = ({ columns, onMapping }) => {
  const [mapping, setMapping] = React.useState<ColumnMapping>({
    nameCol: '',
    cityCol: '',
    countryCol: '',
    typeCol: '',
  });

  const handleChange = (field: keyof ColumnMapping, value: string) => {
    const newMapping = { ...mapping, [field]: value };
    setMapping(newMapping);
    onMapping(newMapping);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center space-x-2 mb-4">
        <Table className="h-5 w-5 text-emerald-600" />
        <h2 className="text-lg font-semibold">Column Mapping</h2>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Company Name Column
          </label>
          <select
            value={mapping.nameCol}
            onChange={(e) => handleChange('nameCol', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
          >
            <option value="">Select column</option>
            {columns.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            City Column
          </label>
          <select
            value={mapping.cityCol}
            onChange={(e) => handleChange('cityCol', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
          >
            <option value="">Select column</option>
            {columns.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Country Column
          </label>
          <select
            value={mapping.countryCol}
            onChange={(e) => handleChange('countryCol', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
          >
            <option value="">Select column</option>
            {columns.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Company Type Column
          </label>
          <select
            value={mapping.typeCol}
            onChange={(e) => handleChange('typeCol', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
          >
            <option value="">Select column</option>
            {columns.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default ColumnMapper;