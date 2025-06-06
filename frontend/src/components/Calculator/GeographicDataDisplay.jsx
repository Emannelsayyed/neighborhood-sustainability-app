import React from 'react';

const GeographicDataDisplay = ({ analysisData, onUseData, onModifyData }) => {
  if (!analysisData) return null;

  const { land_cover, satellite_data, suggested_environmental_data } = analysisData;

  const formatArea = (area) => {
    if (area >= 1000000) {
      return `${(area / 1000000).toFixed(2)} km²`;
    }
    return `${(area / 10000).toFixed(2)} hectares`;
  };

  const formatPercentage = (value) => `${value.toFixed(1)}%`;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Satellite Analysis Results</h3>
        <div className="space-x-2">
          <button
            onClick={onUseData}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            Use This Data
          </button>
          <button
            onClick={onModifyData}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Modify & Use
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Land Cover Analysis */}
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            Land Cover Analysis
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Area:</span>
              <span className="font-medium">{formatArea(land_cover.total_area)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Green Space:</span>
              <span className="font-medium text-green-600">
                {formatArea(land_cover.green_space_area)} 
                ({formatPercentage((land_cover.green_space_area / land_cover.total_area) * 100)})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Urban Area:</span>
              <span className="font-medium text-gray-600">
                {formatArea(land_cover.urban_area)}
                ({formatPercentage((land_cover.urban_area / land_cover.total_area) * 100)})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Water Bodies:</span>
              <span className="font-medium text-blue-600">
                {formatArea(land_cover.water_area)}
                ({formatPercentage((land_cover.water_area / land_cover.total_area) * 100)})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Impervious Surface:</span>
              <span className="font-medium text-red-600">
                {formatArea(land_cover.impervious_surface_area)}
                ({formatPercentage((land_cover.impervious_surface_area / land_cover.total_area) * 100)})
              </span>
            </div>
          </div>
        </div>

        {/* Satellite Data */}
        {satellite_data && (
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
              Satellite Indices
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">NDVI Mean:</span>
                <span className="font-medium">{satellite_data.ndvi_mean.toFixed(3)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">NDVI Std Dev:</span>
                <span className="font-medium">{satellite_data.ndvi_std.toFixed(3)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Built-up:</span>
                <span className="font-medium">{formatPercentage(satellite_data.built_up_percentage)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Vegetation:</span>
                <span className="font-medium text-green-600">{formatPercentage(satellite_data.vegetation_percentage)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Water:</span>
                <span className="font-medium text-blue-600">{formatPercentage(satellite_data.water_percentage)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bare Soil:</span>
                <span className="font-medium text-yellow-600">{formatPercentage(satellite_data.bare_soil_percentage)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Environmental Data */}
      <div className="mt-6 border rounded-lg p-4 bg-blue-50">
        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
          Auto-Generated Environmental Indicators
        </h4>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div className="space-y-1">
            <span className="text-gray-600 block">Total Area:</span>
            <span className="font-medium">{formatArea(suggested_environmental_data.total_area)}</span>
          </div>
          <div className="space-y-1">
            <span className="text-gray-600 block">Green Space:</span>
            <span className="font-medium text-green-600">
              {formatArea(suggested_environmental_data.green_space_area)}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-gray-600 block">Residential Area:</span>
            <span className="font-medium">
              {formatArea(suggested_environmental_data.residential_area)}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-gray-600 block">Commercial Area:</span>
            <span className="font-medium">
              {formatArea(suggested_environmental_data.commercial_area)}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-gray-600 block">Industrial Area:</span>
            <span className="font-medium">
              {formatArea(suggested_environmental_data.industrial_area)}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-gray-600 block">Estimated Dwelling Units:</span>
            <span className="font-medium">
              {suggested_environmental_data.dwelling_units?.toLocaleString() || 'N/A'}
            </span>
          </div>
        </div>

        {suggested_environmental_data.data_confidence && (
          <div className="mt-4 pt-3 border-t border-blue-200">
            <h5 className="font-medium text-gray-700 mb-2">Data Confidence:</h5>
            <div className="flex space-x-4 text-xs">
              <span className={`px-2 py-1 rounded ${
                suggested_environmental_data.data_confidence.ndvi_quality === 'high' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                NDVI: {suggested_environmental_data.data_confidence.ndvi_quality}
              </span>
              <span className={`px-2 py-1 rounded ${
                suggested_environmental_data.data_confidence.built_up_confidence === 'high' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                Built-up: {suggested_environmental_data.data_confidence.built_up_confidence}
              </span>
              <span className={`px-2 py-1 rounded ${
                suggested_environmental_data.data_confidence.vegetation_confidence === 'high' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                Vegetation: {suggested_environmental_data.data_confidence.vegetation_confidence}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeographicDataDisplay;