import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const ErrorMessage = ({ 
  message, 
  type = 'error', 
  dismissible = false, 
  onDismiss 
}) => {
  const typeStyles = {
    error: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: 'text-red-500',
      button: 'text-red-500 hover:text-red-700'
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      icon: 'text-yellow-500',
      button: 'text-yellow-500 hover:text-yellow-700'
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: 'text-blue-500',
      button: 'text-blue-500 hover:text-blue-700'
    }
  };

  const styles = typeStyles[type] || typeStyles.error;

  if (!message) return null;

  return (
    <div className={`
      border rounded-lg p-4 mb-4 flex items-start space-x-3
      ${styles.container}
    `}>
      <AlertCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${styles.icon}`} />
      
      <div className="flex-1">
        <p className="text-sm font-medium">
          {typeof message === 'string' ? message : 'An error occurred'}
        </p>
        {typeof message === 'object' && message.details && (
          <p className="text-xs mt-1 opacity-75">
            {message.details}
          </p>
        )}
      </div>

      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className={`
            flex-shrink-0 p-1 rounded-md transition-colors
            ${styles.button}
          `}
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;