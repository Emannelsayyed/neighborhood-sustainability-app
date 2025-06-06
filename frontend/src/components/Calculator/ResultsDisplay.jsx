import React from 'react';
import { TrendingUp, Leaf, Users, DollarSign, Award, BarChart3 } from 'lucide-react';

const ResultsDisplay = ({ result }) => {
  if (!result) return null;

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-100';
      case 'B': return 'text-blue-600 bg-blue-100';
      case 'C': return 'text-yellow-600 bg-yellow-100';
      case 'D': return 'text-orange-600 bg-orange-100';
      case 'F': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getProgressBarColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const ProgressBar = ({ value, label, color }) => (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className={`text-sm font-bold ${color}`}>{value.toFixed(1)}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${getProgressBarColor(value)}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        ></div>
      </div>
    </div>
  );

  const indicatorsList = [
    { key: 'green_space_percentage', label: 'Green Space', unit: '%', category: 'env' },
    { key: 'average_residential_density', label: 'Residential Density', unit: 'DU/acre', category: 'env' },
    { key: 'land_use_diversity', label: 'Land Use Diversity', unit: 'index', category: 'env' },
    { key: 'impervious_surface_percentage', label: 'Impervious Surface', unit: '%', category: 'env' },
    { key: 'crime_rate', label: 'Crime Rate', unit: 'per 1,000', category: 'social' },
    { key: 'education_level', label: 'Education Level', unit: '%', category: 'social' },
    { key: 'access_to_transit', label: 'Transit Access', unit: '%', category: 'social' },
    { key: 'access_to_schools', label: 'School Access', unit: '%', category: 'social' },
    { key: 'access_to_hospitals', label: 'Hospital Access', unit: '%', category: 'social' },
    { key: 'access_to_fire_stations', label: 'Fire Station Access', unit: '%', category: 'social' },
    { key: 'walkability', label: 'Walkability', unit: 'intersections/sq mile', category: 'social' },
    { key: 'median_household_income', label: 'Median Income', unit: '$', category: 'econ' },
    { key: 'unemployment_rate', label: 'Unemployment Rate', unit: '%', category: 'econ' },
    { key: 'housing_affordability', label: 'Housing Affordability', unit: '%', category: 'econ' }
  ];

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="flex items-center justify-center mb-4">
          <Award className="w-8 h-8 text-yellow-500 mr-2" />
          <h2 className="text-2xl font-bold text-gray-800">Sustainability Index</h2>
        </div>
        
        <div className="mb-4">
          <div className={`text-5xl font-bold mb-2 ${getScoreColor(result.sustainability_index)}`}>
            {result.sustainability_index}
          </div>
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-xl font-bold ${getGradeColor(result.grade)}`}>
            Grade: {result.grade}
          </div>
        </div>
        
        <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
          {result.interpretation}
        </p>
      </div>

      {/* Category Scores */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <Leaf className="w-6 h-6 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">Environmental</h3>
          </div>
          <div className={`text-3xl font-bold mb-2 ${getScoreColor(result.environmental_score)}`}>
            {result.environmental_score}
          </div>
          <ProgressBar 
            value={result.environmental_score} 
            label="Environmental Score" 
            color={getScoreColor(result.environmental_score)}
          />
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <Users className="w-6 h-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">Social</h3>
          </div>
          <div className={`text-3xl font-bold mb-2 ${getScoreColor(result.social_score)}`}>
            {result.social_score}
          </div>
          <ProgressBar 
            value={result.social_score} 
            label="Social Score" 
            color={getScoreColor(result.social_score)}
          />
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <DollarSign className="w-6 h-6 text-purple-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">Economic</h3>
          </div>
          <div className={`text-3xl font-bold mb-2 ${getScoreColor(result.economic_score)}`}>
            {result.economic_score}
          </div>
          <ProgressBar 
            value={result.economic_score} 
            label="Economic Score" 
            color={getScoreColor(result.economic_score)}
          />
        </div>
      </div>

      {/* Detailed Indicators */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-6">
          <BarChart3 className="w-6 h-6 text-gray-600 mr-2" />
          <h3 className="text-xl font-semibold text-gray-800">Detailed Indicators</h3>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Environmental Indicators */}
          <div>
            <h4 className="font-semibold text-green-700 mb-3 flex items-center">
              <Leaf className="w-4 h-4 mr-1" />
              Environmental
            </h4>
            <div className="space-y-3">
              {indicatorsList.filter(ind => ind.category === 'env').map(indicator => (
                <div key={indicator.key} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{indicator.label}:</span>
                  <span className="font-medium">
                    {result.indicators[indicator.key].toFixed(1)} {indicator.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Social Indicators */}
          <div>
            <h4 className="font-semibold text-blue-700 mb-3 flex items-center">
              <Users className="w-4 h-4 mr-1" />
              Social
            </h4>
            <div className="space-y-3">
              {indicatorsList.filter(ind => ind.category === 'social').map(indicator => (
                <div key={indicator.key} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{indicator.label}:</span>
                  <span className="font-medium">
                    {result.indicators[indicator.key].toFixed(1)} {indicator.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Economic Indicators */}
          <div>
            <h4 className="font-semibold text-purple-700 mb-3 flex items-center">
              <DollarSign className="w-4 h-4 mr-1" />
              Economic
            </h4>
            <div className="space-y-3">
              {indicatorsList.filter(ind => ind.category === 'econ').map(indicator => (
                <div key={indicator.key} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{indicator.label}:</span>
                  <span className="font-medium">
                    {indicator.key === 'median_household_income' 
                      ? '$' + result.indicators[indicator.key].toLocaleString()
                      : result.indicators[indicator.key].toFixed(1) + ' ' + indicator.unit
                    }
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;