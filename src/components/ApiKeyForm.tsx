import React from 'react';
import { Key } from 'lucide-react';
import { ApiKeys } from '../types';

interface ApiKeyFormProps {
  onSubmit: (keys: ApiKeys) => void;
}

const ApiKeyForm: React.FC<ApiKeyFormProps> = ({ onSubmit }) => {
  const [apifyToken, setApifyToken] = React.useState('');
  const [openaiKey, setOpenaiKey] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ apifyToken, openaiKey });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center space-x-2 mb-4">
        <Key className="h-5 w-5 text-emerald-600" />
        <h2 className="text-lg font-semibold">API Configuration</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="apifyToken" className="block text-sm font-medium text-gray-700">
            Apify API Token
          </label>
          <input
            type="password"
            id="apifyToken"
            value={apifyToken}
            onChange={(e) => setApifyToken(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            required
          />
        </div>
        <div>
          <label htmlFor="openaiKey" className="block text-sm font-medium text-gray-700">
            OpenAI API Key
          </label>
          <input
            type="password"
            id="openaiKey"
            value={openaiKey}
            onChange={(e) => setOpenaiKey(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors"
        >
          Save API Keys
        </button>
      </form>
    </div>
  );
};

export default ApiKeyForm;