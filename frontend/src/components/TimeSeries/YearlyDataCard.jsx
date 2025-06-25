import React, { useState } from 'react';
import { Calendar, Leaf, Droplets, Thermometer, Satellite, BarChart3 } from 'lucide-react';
import MultiIndexImageViewer from './MultiIndexImageViewer';

const YearlyDataCard = ({ data }) => {
  const [imageMode, setImageMode] = useState('satellite');

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-blue-600 bg-blue-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    if (score >= 50) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreGrade = (score) => {
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  };

  const hasMultiIndexImages = data.ndvi_image_url || data.wetness_image_url || data.dryness_image_url || data.heat_image_url;

  return (
    <div className="bg-gray-50 rounded-lg p-4 border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-600" />
          <h4 className="font-semibold text-lg">{data.year}</h4>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(data.environmental_score)}`}>
          {getScoreGrade(data.environmental_score)} ({data.environmental_score.toFixed(1)})
        </div>
      </div>

      {/* Image Toggle Buttons */}
      {(data.satellite_image_url || hasMultiIndexImages) && (
        <div className="flex space-x-2 mb-3">
          {data.satellite_image_url && (
            <button
              onClick={() => setImageMode('satellite')}
              className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${
                imageMode === 'satellite' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Satellite className="w-3 h-3" />
              <span>Satellite</span>
            </button>
          )}
          {hasMultiIndexImages && (
            <button
              onClick={() => setImageMode('indices')}
              className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${
                imageMode === 'indices' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <BarChart3 className="w-3 h-3" />
              <span>Indices</span>
            </button>
          )}
        </div>
      )}

      {/* Image Display */}
      <div className="mb-4">
        {imageMode === 'satellite' && data.satellite_image_url && (
          <img
            src={data.satellite_image_url}
            alt={`Satellite image for ${data.year}`}
            className="w-full h-48 object-cover rounded-lg"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling?.remove();
              const fallback = document.createElement('div');
              fallback.className = 'w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500';
              fallback.innerHTML = `<div class="text-center"><p>Satellite Image ${data.year}</p><p class="text-xs mt-1">Image loading failed</p><a href="${data.satellite_image_url}" target="_blank" class="text-blue-600 underline text-sm mt-2 block">Open in New Tab</a></div>`;
              e.target.parentNode.insertBefore(fallback, e.target.nextSibling);
            }}
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
          />
        )}
        
        {imageMode === 'indices' && hasMultiIndexImages && (
          <MultiIndexImageViewer data={data} year={data.year} />
        )}
      </div>

      {/* Environmental Indicators */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center space-x-2">
          <Leaf className="w-4 h-4 text-green-600" />
          <div>
            <p className="text-gray-600">Green Area</p>
            <p className="font-medium">{((data.green_area / data.total_area) * 100).toFixed(1)}%</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Droplets className="w-4 h-4 text-blue-600" />
          <div>
            <p className="text-gray-600">Water Area</p>
            <p className="font-medium">{((data.water_area / data.total_area) * 100).toFixed(1)}%</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Leaf className="w-4 h-4 text-green-500" />
          <div>
            <p className="text-gray-600">NDVI</p>
            <p className="font-medium">{data.mean_ndvi.toFixed(2)}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Thermometer className="w-4 h-4 text-red-600" />
          <div>
            <p className="text-gray-600">Temperature</p>
            <p className="font-medium">{data.land_surface_temperature.toFixed(1)}°C</p>
          </div>
        </div>
      </div>

      {/* Additional Environmental Data */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex justify-between text-xs text-gray-600">
          <span>Air Quality: {data.air_quality_aod.toFixed(3)}</span>
          <span>PM2.5: {data.pm25.toFixed(1)} µg/m³</span>
        </div>
      </div>
    </div>
  );
};

export default YearlyDataCard;