import React from 'react';
import { FIELD_METADATA } from '../../utils/constants';

const GeographicDataDisplay = ({ 
  environmentalData, 
  onUseData, 
  onModifyData, 
  loading = false 
}) => {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!environmentalData) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-500">No environmental data available</p>
      </div>
    );
  }

  const formatValue = (field, value) => {
    if (field.includes('area')) {
      return `${value.toLocaleString()} m²`;
    }
    if (field.includes('temperature')) {
      return `${value.toFixed(1)}°C`;
    }
    if (field === 'pm25') {
      return `${value.toFixed(1)} µg/m³`;
    }
    return value.toFixed(3);
  };

  const getIndicatorStatus = (field, value) => {
    // Simple status indicators based on typical environmental thresholds
    if (field === 'mean_ndvi') {
      if (value > 0.6) return { status: 'good', color: 'green' };
      if (value > 0.3) return { status: 'fair', color: 'yellow' };
      return { status: 'poor', color: 'red' };
    }
    if (field === 'air_quality_aod') {
      if (value < 0.2) return { status: 'good', color: 'green' };
      if (value < 0.5) return { status: 'fair', color: 'yellow' };
      return { status: 'poor', color: 'red' };
    }
    if (field === 'pm25') {
      if (value < 12) return { status: 'good', color: 'green' };
      if (value < 35) return { status: 'fair', color: 'yellow' };
      return { status: 'poor', color: 'red' };
    }
    return { status: 'neutral', color: 'gray' };
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Satellite Analysis Results
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => onUseData(environmentalData)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
          >
            Use This Data
          </button>
          <button
            onClick={() => onModifyData(environmentalData)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Review & Modify
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(environmentalData).map(([field, value]) => {
          const metadata = FIELD_METADATA.ENVIRONMENTAL[field];
          const indicator = getIndicatorStatus(field, value);
          
          return (
            <div key={field} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium text-gray-800">{metadata.label}</h4>
                  <p className="text-sm text-gray-600">{metadata.description}</p>
                </div>
                <div className={`w-3 h-3 rounded-full bg-${indicator.color}-500`}></div>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatValue(field, value)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-2">Analysis Summary</h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">
              {((environmentalData.green_area / environmentalData.total_area) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Green Coverage</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {((environmentalData.water_area / environmentalData.total_area) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Water Coverage</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-600">
              {(environmentalData.total_area / 1000000).toFixed(2)} km²
            </div>
            <div className="text-sm text-gray-600">Total Area</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeographicDataDisplay;