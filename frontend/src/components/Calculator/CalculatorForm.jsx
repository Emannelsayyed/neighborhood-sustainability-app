import React, { useState } from 'react';
import { DEFAULT_VALUES, VALIDATION_RULES, FIELD_METADATA } from '../../utils/constants';
import ApiService from '../../services/api';

const CalculatorForm = ({ 
  initialData = null, 
  onSubmit, 
  satelliteData = null,
  loading = false 
}) => {
  const [formData, setFormData] = useState(() => {
  const baseData = {
    environmental: { ...DEFAULT_VALUES.ENVIRONMENTAL },
    social: { ...DEFAULT_VALUES.SOCIAL },
    economic: { ...DEFAULT_VALUES.ECONOMIC }
  };
  
  if (initialData) return initialData;
  
  if (satelliteData) {
    return {
      ...baseData,
      environmental: { ...baseData.environmental, ...satelliteData }
    };
  }
  
  return baseData;
});
  
  const [errors, setErrors] = useState({});

  const validateField = (category, field, value) => {
    const rules = VALIDATION_RULES[category.toUpperCase()][field];
    if (rules.required && (value === '' || value === null || value === undefined)) {
      return 'This field is required';
    }
    if (rules.min !== undefined && value < rules.min) {
      return `Value must be at least ${rules.min}`;
    }
    if (rules.max !== undefined && value > rules.max) {
      return `Value must be at most ${rules.max}`;
    }
    return null;
  };

  const handleFieldChange = (category, field, value) => {
    const numericValue = parseFloat(value) || 0;
    
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: numericValue
      }
    })
  );

    const error = validateField(category, field, numericValue);
    setErrors(prev => ({
      ...prev,
      [`${category}.${field}`]: error
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    ['environmental', 'social', 'economic'].forEach(category => {
      Object.keys(formData[category]).forEach(field => {
        const error = validateField(category, field, formData[category][field]);
        if (error) {
          newErrors[`${category}.${field}`] = error;
          isValid = false;
        }
      });
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  const renderInputField = (category, field) => {
    const metadata = FIELD_METADATA[category.toUpperCase()][field];
    const isSatelliteField = satelliteData && category === 'environmental' && satelliteData[field] !== undefined;
    const errorKey = `${category}.${field}`;
    
    return (
      <div key={field} className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <label className="block text-sm font-medium text-gray-700">
            {metadata.label}
          </label>
          {isSatelliteField && (
            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
              Satellite
            </span>
          )}
        </div>
        <input
          type="number"
          step="any"
          value={formData[category][field]}
          onChange={(e) => handleFieldChange(category, field, e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors[errorKey] ? 'border-red-500' : 'border-gray-300'
          } ${isSatelliteField ? 'bg-green-50' : ''}`}
          title={metadata.description}
        />
        {errors[errorKey] && (
          <p className="text-red-500 text-xs mt-1">{errors[errorKey]}</p>
        )}
        <p className="text-gray-500 text-xs mt-1">{metadata.description}</p>
      </div>
    );
  };

  const renderCategory = (category, title) => (
    <div key={category} className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.keys(formData[category] || {}).map(field => 
          renderInputField(category, field)
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {renderCategory('environmental', 'Environmental Indicators')}
      {renderCategory('social', 'Social Indicators')}
      {renderCategory('economic', 'Economic Indicators')}
      
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Calculating...' : 'Calculate Sustainability Index'}
        </button>
      </div>
    </div>
  );
};

export default CalculatorForm;