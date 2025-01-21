import React from 'react';
import { AlertTriangle, XCircle, AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  type?: 'error' | 'warning' | 'info';
  message: string;
  details?: string;
  onDismiss?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  type = 'error',
  message,
  details,
  onDismiss
}) => {
  const styles = {
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-600 dark:text-red-400',
      icon: <XCircle className="h-5 w-5 text-red-500" />
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-600 dark:text-yellow-400',
      icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-600 dark:text-blue-400',
      icon: <AlertCircle className="h-5 w-5 text-blue-500" />
    }
  };

  const style = styles[type];

  return (
    <div className={`rounded-lg ${style.bg} border ${style.border} p-4`}>
      <div className="flex">
        <div className="flex-shrink-0">{style.icon}</div>
        <div className="ml-3 flex-1">
          <p className={`text-sm font-medium ${style.text}`}>{message}</p>
          {details && (
            <p className={`mt-1 text-sm ${style.text} opacity-90`}>{details}</p>
          )}
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <button
              onClick={onDismiss}
              className={`inline-flex rounded-md p-1.5 ${style.text} hover:bg-white dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-${type}-50 focus:ring-${type}-600`}
            >
              <span className="sr-only">Dismiss</span>
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};