import React, { useState } from 'react';
import { Upload, X, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import ColumnMappingModal from './ColumnMappingModal';
import type { ColumnMapping } from '../types';

interface FileUploadProps {
  onFileUpload: (data: any[], mapping: ColumnMapping) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showMapping, setShowMapping] = useState(false);
  const [fileData, setFileData] = useState<any[] | null>(null);
  const [columns, setColumns] = useState<string[]>([]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      const data = await readExcelFile(file);
      if (data.length > 0) {
        setFileName(file.name);
        setFileData(data);
        setColumns(Object.keys(data[0]));
        setShowMapping(true);
      } else {
        setError('The uploaded file appears to be empty');
      }
    } catch (error) {
      console.error('Error reading file:', error);
      setError('Failed to read the Excel file. Please make sure it\'s a valid .xlsx or .xls file.');
    }
  };

  const readExcelFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const data = event.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = (error) => reject(error);
      reader.readAsBinaryString(file);
    });
  };

  const handleReset = () => {
    setFileName(null);
    setError(null);
    setFileData(null);
    setColumns([]);
    setShowMapping(false);
  };

  const handleMapping = (mapping: ColumnMapping) => {
    if (fileData) {
      onFileUpload(fileData, mapping);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
      <div className="flex items-center space-x-2 mb-4">
        <Upload className="h-5 w-5 text-emerald-600" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upload Data</h2>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {fileName ? (
        <div className="flex items-center justify-between p-4 border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
          <div className="flex items-center space-x-3">
            <FileSpreadsheet className="h-6 w-6 text-emerald-600 dark:text-emerald-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">{fileName}</span>
          </div>
          <button
            onClick={handleReset}
            className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-800 rounded-full transition-colors"
            title="Remove file"
          >
            <X className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
          </button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer inline-flex flex-col items-center"
          >
            <Upload className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Drop your Excel file here or click to upload
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Supports .xlsx and .xls files
            </span>
          </label>
        </div>
      )}

      {showMapping && (
        <ColumnMappingModal
          columns={columns}
          onMapping={handleMapping}
          onClose={() => setShowMapping(false)}
        />
      )}
    </div>
  );
};

export default FileUpload;