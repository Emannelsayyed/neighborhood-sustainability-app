import React from 'react';
import { CATEGORIES } from '../../utils/constants';

const DataAnalysisReport = ({ results, formData, onClose }) => {
  const getPerformanceLevel = (score) => {
    if (score >= 80) return { level: 'Excellent', color: '#10B981', icon: '🏆' };
    if (score >= 70) return { level: 'Good', color: '#3B82F6', icon: '👍' };
    if (score >= 60) return { level: 'Fair', color: '#F59E0B', icon: '⚠️' };
    if (score >= 50) return { level: 'Poor', color: '#EF4444', icon: '📉' };
    return { level: 'Critical', color: '#DC2626', icon: '🚨' };
  };

  const getRecommendations = (results) => {
    const recommendations = [];
    
    if (results.environmental_score < 70) {
      recommendations.push({
        category: 'Environmental',
        priority: 'High',
        action: 'Increase green spaces and improve air quality monitoring',
        impact: 'Boost environmental score by 15-20 points'
      });
    }
    
    if (results.social_score < 70) {
      recommendations.push({
        category: 'Social',
        priority: 'Medium',
        action: 'Enhance public transportation and reduce crime rates',
        impact: 'Improve community wellbeing and accessibility'
      });
    }
    
    if (results.economic_score < 70) {
      recommendations.push({
        category: 'Economic',
        priority: 'High',
        action: 'Develop affordable housing and job opportunities',
        impact: 'Strengthen economic foundation'
      });
    }
    
    return recommendations;
  };

  const performance = getPerformanceLevel(results.sustainability_index);
  const recommendations = getRecommendations(results);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">📊 Sustainability Data Analysis Report</h1>
              <p className="text-blue-100 mt-2">Comprehensive assessment and actionable insights</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Executive Summary */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">📋 Executive Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-4xl mb-2">{performance.icon}</div>
                <div className="text-2xl font-bold" style={{ color: performance.color }}>
                  {results.sustainability_index.toFixed(1)}
                </div>
                <div className="text-gray-600">Overall Score</div>
                <div className="text-sm font-medium" style={{ color: performance.color }}>
                  {performance.level} Performance
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">🎯</div>
                <div className="text-2xl font-bold text-gray-800">Grade {results.grade}</div>
                <div className="text-gray-600">Assessment Grade</div>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">📈</div>
                <div className="text-2xl font-bold text-gray-800">{recommendations.length}</div>
                <div className="text-gray-600">Key Recommendations</div>
              </div>
            </div>
          </div>

          {/* Category Performance Analysis */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 Category Performance Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Environmental Analysis */}
              <div className="border-l-4 pl-4" style={{ borderColor: CATEGORIES.ENVIRONMENTAL.color }}>
                <h3 className="text-lg font-semibold mb-3" style={{ color: CATEGORIES.ENVIRONMENTAL.color }}>
                  🌱 Environmental ({results.environmental_score.toFixed(1)}/100)
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Green Coverage:</span>
                    <span className="font-medium">{results.indicators.green_percentage_area.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Air Quality:</span>
                    <span className="font-medium">{results.indicators.air_quality.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Temperature:</span>
                    <span className="font-medium">{results.indicators.land_surface_temperature.toFixed(1)}°C</span>
                  </div>
                </div>
                <div className="mt-3 p-2 bg-green-50 rounded text-xs">
                  <strong>Key Insight:</strong> {results.environmental_score >= 70 ? 
                    'Strong environmental foundation with good green coverage.' : 
                    'Environmental improvements needed, focus on green spaces.'}
                </div>
              </div>

              {/* Social Analysis */}
              <div className="border-l-4 pl-4" style={{ borderColor: CATEGORIES.SOCIAL.color }}>
                <h3 className="text-lg font-semibold mb-3" style={{ color: CATEGORIES.SOCIAL.color }}>
                  👥 Social ({results.social_score.toFixed(1)}/100)
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Education Level:</span>
                    <span className="font-medium">{(results.indicators.education_level * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Crime Rate:</span>
                    <span className="font-medium">{(results.indicators.crime_rate * 1000).toFixed(1)}/1k</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transit Access:</span>
                    <span className="font-medium">{results.indicators.access_to_transit.toFixed(1)} min</span>
                  </div>
                </div>
                <div className="mt-3 p-2 bg-blue-50 rounded text-xs">
                  <strong>Key Insight:</strong> {results.social_score >= 70 ? 
                    'Good social infrastructure and community services.' : 
                    'Social services and safety measures need enhancement.'}
                </div>
              </div>

              {/* Economic Analysis */}
              <div className="border-l-4 pl-4" style={{ borderColor: CATEGORIES.ECONOMIC.color }}>
                <h3 className="text-lg font-semibold mb-3" style={{ color: CATEGORIES.ECONOMIC.color }}>
                  💰 Economic ({results.economic_score.toFixed(1)}/100)
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Median Income:</span>
                    <span className="font-medium">${results.indicators.median_household_income.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Unemployment:</span>
                    <span className="font-medium">{(results.indicators.unemployment_rate * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Housing Afford.:</span>
                    <span className="font-medium">{(results.indicators.housing_affordability * 100).toFixed(1)}%</span>
                  </div>
                </div>
                <div className="mt-3 p-2 bg-yellow-50 rounded text-xs">
                  <strong>Key Insight:</strong> {results.economic_score >= 70 ? 
                    'Stable economic conditions with good employment.' : 
                    'Economic development needed, focus on job creation.'}
                </div>
              </div>
            </div>
          </div>

          {/* Visual Data Representation */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">📈 Performance Visualization</h2>
            <div className="space-y-4">
              {[
                { name: 'Environmental', score: results.environmental_score, color: CATEGORIES.ENVIRONMENTAL.color },
                { name: 'Social', score: results.social_score, color: CATEGORIES.SOCIAL.color },
                { name: 'Economic', score: results.economic_score, color: CATEGORIES.ECONOMIC.color }
              ].map(({ name, score, color }) => (
                <div key={name} className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium">{name}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                    <div 
                      className="h-6 rounded-full flex items-center justify-end pr-2 text-white text-sm font-medium"
                      style={{ 
                        width: `${score}%`,
                        backgroundColor: color
                      }}
                    >
                      {score.toFixed(1)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">💡 Strategic Recommendations</h2>
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-800">{rec.category}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        rec.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {rec.priority} Priority
                      </span>
                    </div>
                    <p className="text-gray-700 mb-1">{rec.action}</p>
                    <p className="text-sm text-green-600 font-medium">Expected Impact: {rec.impact}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Quality Assessment */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🔍 Data Quality & Methodology</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Data Sources</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Satellite imagery analysis for environmental metrics</li>
                  <li>• Census and demographic data for social indicators</li>
                  <li>• Economic surveys and housing market data</li>
                  <li>• Geographic information systems (GIS) data</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Assessment Methodology</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Multi-criteria decision analysis (MCDA)</li>
                  <li>• Weighted scoring based on category importance</li>
                  <li>• Normalization for cross-indicator comparison</li>
                  <li>• Grade assignment using established thresholds</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-gray-500 text-sm border-t pt-4">
            Report generated on {new Date().toLocaleDateString()} | 
            Sustainability Assessment Framework v1.0
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataAnalysisReport;