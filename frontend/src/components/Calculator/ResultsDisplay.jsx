import React from 'react';
import { CATEGORIES, GRADE_THRESHOLDS} from '../../utils/constants';

const ResultsDisplay = ({ results }) => {
  if (!results) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-500">No results to display</p>
      </div>
    );
  }

  const getGradeColor = (grade) => {
    const colors = {
      'A': 'text-green-600 bg-green-100',
      'B': 'text-blue-600 bg-blue-100', 
      'C': 'text-yellow-600 bg-yellow-100',
      'D': 'text-orange-600 bg-orange-100',
      'F': 'text-red-600 bg-red-100'
    };
    return colors[grade] || 'text-gray-600 bg-gray-100';
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const categoryScores = [
    { name: 'Environmental', score: results.environmental_score, color: CATEGORIES.ENVIRONMENTAL.color },
    { name: 'Social', score: results.social_score, color: CATEGORIES.SOCIAL.color },
    { name: 'Economic', score: results.economic_score, color: CATEGORIES.ECONOMIC.color }
  ];

  const environmentalIndicators = [
    { key: 'green_percentage_area', label: 'Green Area %', value: results.indicators.green_percentage_area, normalized: results.normalized.gpa_normalized },
    { key: 'water_percentage_area', label: 'Water Area %', value: results.indicators.water_percentage_area, normalized: results.normalized.wpa_normalized },
    { key: 'air_quality', label: 'Air Quality', value: results.indicators.air_quality, normalized: results.normalized.aq_normalized },
    { key: 'land_surface_temperature', label: 'Land Surface Temp', value: results.indicators.land_surface_temperature, normalized: results.normalized.lst_normalized },
    { key: 'ecological_quality_index', label: 'Ecological Quality', value: results.indicators.ecological_quality_index, normalized: results.normalized.eqi_normalized }
  ];

  const socialIndicators = [
    { key: 'crime_rate', label: 'Crime Rate', value: results.indicators.crime_rate, normalized: results.normalized.cr_normalized },
    { key: 'education_level', label: 'Education Level', value: results.indicators.education_level, normalized: results.normalized.el_normalized },
    { key: 'access_to_transit', label: 'Transit Access', value: results.indicators.access_to_transit, normalized: results.normalized.apt_normalized },
    { key: 'access_to_schools', label: 'School Access', value: results.indicators.access_to_schools, normalized: results.normalized.as_normalized },
    { key: 'access_to_hospitals', label: 'Hospital Access', value: results.indicators.access_to_hospitals, normalized: results.normalized.ah_normalized },
    { key: 'access_to_fire_stations', label: 'Fire Station Access', value: results.indicators.access_to_fire_stations, normalized: results.normalized.af_normalized },
    { key: 'access_to_police', label: 'Police Access', value: results.indicators.access_to_police, normalized: results.normalized.ap_normalized },
    { key: 'walkability', label: 'Walkability', value: results.indicators.walkability, normalized: results.normalized.w_normalized }
  ];

  const economicIndicators = [
    { key: 'median_household_income', label: 'Median Income', value: results.indicators.median_household_income, normalized: results.normalized.mhi_normalized },
    { key: 'unemployment_rate', label: 'Unemployment Rate', value: results.indicators.unemployment_rate, normalized: results.normalized.ur_normalized },
    { key: 'housing_affordability', label: 'Housing Affordability', value: results.indicators.housing_affordability, normalized: results.normalized.ha_normalized }
  ];

  const renderIndicatorSection = (title, indicators, color) => (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="font-medium text-gray-800 mb-3" style={{ color }}>{title}</h4>
      <div className="space-y-2">
        {indicators.map(({ key, label, value, normalized }) => (
          <div key={key} className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{label}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium w-16 text-right">
                {typeof value === 'number' ? value.toFixed(2) : value}
              </span>
              <div className="w-12 bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full"
                  style={{ 
                    width: `${Math.max(0, Math.min(100, normalized * 100))}%`,
                    backgroundColor: color
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Sustainability Assessment</h2>
        <div className="flex justify-center items-center gap-6 mb-4">
          <div>
            <div className={`text-6xl font-bold ${getScoreColor(results.sustainability_index)}`}>
              {results.sustainability_index.toFixed(1)}
            </div>
            <div className="text-gray-600">Overall Score</div>
          </div>
          <div className={`px-6 py-3 rounded-full text-2xl font-bold ${getGradeColor(results.grade)}`}>
            Grade {results.grade}
          </div>
        </div>
        <p className="text-gray-700 max-w-2xl mx-auto">{results.interpretation}</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Category Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categoryScores.map(({ name, score, color }) => (
            <div key={name} className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold mb-2" style={{ color }}>
                {score.toFixed(1)}
              </div>
              <div className="text-gray-600 font-medium">{name}</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="h-2 rounded-full"
                  style={{ 
                    width: `${score}%`,
                    backgroundColor: color
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Detailed Indicators</h3>
        <div className="space-y-4">
          {renderIndicatorSection('Environmental Indicators', environmentalIndicators, CATEGORIES.ENVIRONMENTAL.color)}
          {renderIndicatorSection('Social Indicators', socialIndicators, CATEGORIES.SOCIAL.color)}
          {renderIndicatorSection('Economic Indicators', economicIndicators, CATEGORIES.ECONOMIC.color)}
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;