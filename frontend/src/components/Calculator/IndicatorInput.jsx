import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

const IndicatorInput = ({ 
  label, 
  field, 
  value, 
  unit, 
  description, 
  placeholder, 
  onChange,
  isPrepopulated = false 
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    onChange(inputValue);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-2">
        <label htmlFor={field} className="block text-sm font-medium text-gray-700">
          {label}
          {isPrepopulated && (
            <span className="ml-1 text-xs text-green-600 font-normal">(Auto-filled)</span>
          )}
        </label>
        {unit && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {unit}
          </span>
        )}
        {description && (
          <div className="relative">
            <HelpCircle
              size={16}
              className="text-gray-400 hover:text-gray-600 cursor-help"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            />
            {showTooltip && (
              <div className="absolute z-10 w-64 p-2 mt-1 text-xs text-white bg-gray-800 rounded-md shadow-lg -translate-x-1/2 left-1/2">
                {description}
                <div className="absolute w-2 h-2 bg-gray-800 transform rotate-45 -translate-x-1/2 -top-1 left-1/2"></div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <input
        type="number"
        id={field}
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
          isPrepopulated 
            ? 'bg-green-50 border-green-300 text-green-900' 
            : 'border-gray-300'
        }`}
        step="any"
        min="0"
      />
    </div>
  );
};

export default IndicatorInput;