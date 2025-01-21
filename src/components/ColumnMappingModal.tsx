import React, { useState } from 'react';
import { Table, Check, X } from 'lucide-react';
import type { ColumnMapping } from '../types';

interface ColumnMappingModalProps {
  columns: string[];
  onMapping: (mapping: ColumnMapping) => void;
  onClose: () => void;
}

const ColumnMappingModal: React.FC<ColumnMappingModalProps> = ({
  columns,
  onMapping,
  onClose,
}) => {
  const [mapping, setMapping] = useState<ColumnMapping>({
    nameCol: '',
    cityCol: '',
    countryCol: '',
    typeCol: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapping.nameCol) {
      alert('Company Name column is required');
      return;
    }
    onMapping(mapping);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full m-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Table className="h-6 w-6 text-emerald-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Map Your Columns
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Please map your Excel columns to the required fields. Company Name is required,
            other fields are optional but recommended for better search results.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company Name Column *
                </label>
                <select
                  value={mapping.nameCol}
                  onChange={(e) => setMapping(prev => ({ ...prev, nameCol: e.target.value }))}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                  required
                >
                  <option value="">Select column</option>
                  {columns.map((col) => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  City Column
                </label>
                <select
                  value={mapping.cityCol}
                  onChange={(e) => setMapping(prev => ({ ...prev, cityCol: e.target.value }))}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                >
                  <option value="">Select column</option>
                  {columns.map((col) => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Country Column
                </label>
                <select
                  value={mapping.countryCol}
                  onChange={(e) => setMapping(prev => ({ ...prev, countryCol: e.target.value }))}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                >
                  <option value="">Select column</option>
                  {columns.map((col) => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Business Type Column
                </label>
                <select
                  value={mapping.typeCol}
                  onChange={(e) => setMapping(prev => ({ ...prev, typeCol: e.target.value }))}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                >
                  <option value="">Select column</option>
                  {columns.map((col) => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4 border-t dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 flex items-center space-x-2"
              >
                <Check className="h-4 w-4" />
                <span>Confirm Mapping</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ColumnMappingModal;