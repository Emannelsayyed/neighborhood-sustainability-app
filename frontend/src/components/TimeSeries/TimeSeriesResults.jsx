import React from 'react';
import { TrendingUp, TrendingDown, Minus, Film } from 'lucide-react';
import YearlyDataCard from './YearlyDataCard';

const TimeSeriesResults = ({ results }) => {
  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'decreasing':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'increasing':
        return 'text-green-600';
      case 'decreasing':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Time Series Analysis Summary</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Analysis Period</p>
            <p className="font-medium">{results.trend_analysis.analysis_period}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Area</p>
            <p className="font-medium">{(results.total_area / 1000000).toFixed(2)} km²</p>
          </div>
        </div>
      </div>

      {/* Yearly Data Cards */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-6">Environmental Changes by Year</h3>
        <div className="grid lg:grid-cols-2 gap-6">
          {results.yearly_data.map((yearData) => (
            <YearlyDataCard key={yearData.year} data={yearData} />
          ))}
        </div>
      </div>

      {/* Animation */}
      {results.animation_gif_url && (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-2 mb-4">
            <Film className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold">Time Series Animation</h3>
            </div>
            <div className="flex justify-center">
            <img
                src={results.animation_gif_url}
                alt="Time series animation"
                className="max-w-full h-auto rounded-lg shadow-lg"
                style={{ maxHeight: '400px' }}
                onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling?.remove(); // Remove any existing fallback
                const fallback = document.createElement('div');
                fallback.className = 'w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500';
                fallback.innerHTML = `<div class="text-center"><p>Time Series Animation</p><p class="text-xs mt-1">Animation loading failed</p><a href="${results.animation_gif_url}" target="_blank" class="text-blue-600 underline text-sm mt-2 block">Open Animation</a></div>`;
                e.target.parentNode.insertBefore(fallback, e.target.nextSibling);
            }}
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
            />
            </div>
            <p className="text-sm text-gray-600 text-center mt-2">
            Animation showing environmental changes over time
            </p>
        </div>
      )}

      {/* Trend Analysis */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Trend Analysis</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Green Area</span>
              {getTrendIcon(results.trend_analysis.green_area_trend)}
            </div>
            <p className={`text-sm ${getTrendColor(results.trend_analysis.green_area_trend)}`}>
              {results.trend_analysis.green_area_trend}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Water Area</span>
              {getTrendIcon(results.trend_analysis.water_area_trend)}
            </div>
            <p className={`text-sm ${getTrendColor(results.trend_analysis.water_area_trend)}`}>
              {results.trend_analysis.water_area_trend}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Vegetation Health</span>
              {getTrendIcon(results.trend_analysis.vegetation_health_trend)}
            </div>
            <p className={`text-sm ${getTrendColor(results.trend_analysis.vegetation_health_trend)}`}>
              {results.trend_analysis.vegetation_health_trend}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Temperature</span>
              {getTrendIcon(results.trend_analysis.temperature_trend)}
            </div>
            <p className={`text-sm ${getTrendColor(results.trend_analysis.temperature_trend)}`}>
              {results.trend_analysis.temperature_trend}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Environment</span>
              {getTrendIcon(results.trend_analysis.overall_environmental_trend)}
            </div>
            <p className={`text-sm ${getTrendColor(results.trend_analysis.overall_environmental_trend)}`}>
              {results.trend_analysis.overall_environmental_trend}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeSeriesResults;