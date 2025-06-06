import React, { useState } from 'react';
import IndicatorInput from './IndicatorInput';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorMessage from '../Common/ErrorMessage';
import { INDICATOR_GROUPS, DEFAULT_VALUES } from '../../utils/constants';

const CalculatorForm = ({ onCalculate, loading, error }) => {
  const [formData, setFormData] = useState(DEFAULT_VALUES);

  const handleInputChange = (category, field, value) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: parseFloat(value) || 0
      }
    }));
  };

  const handleSubmit = () => {
    onCalculate(formData);
  };

  const resetForm = () => {
    setFormData(DEFAULT_VALUES);
  };

  const loadExampleData = () => {
    const exampleData = {
      environmental: {
        green_space_area: 250000,
        total_area: 1000000,
        dwelling_units: 2470,
        residential_area: 400000,
        commercial_area: 300000,
        industrial_area: 100000,
        impervious_surface_area: 300000
      },
      social: {
        total_population: 10000,
        total_crimes: 50,
        adults_with_degree: 3000,
        total_adult_population: 8000,
        residents_near_transit: 8500,
        residents_near_schools: 8000,
        residents_near_hospitals: 9000,
        residents_near_fire_stations: 9500,
        street_intersections: 120
      },
      economic: {
        median_household_income: 50000,
        unemployed_count: 500,
        labor_force: 6000,
        affordable_housing_units: 700,
        total_housing_units: 1000
      }
    };
    setFormData(exampleData);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Sustainability Calculator</h2>
        <div className="space-x-2">
          <button
            type="button"
            onClick={loadExampleData}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Load Example
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="space-y-8">
        {INDICATOR_GROUPS.map((group) => (
          <div key={group.category} className="border rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className={`w-4 h-4 rounded-full mr-3 ${group.color}`}></div>
              <h3 className="text-xl font-semibold text-gray-800 capitalize">
                {group.category} Indicators
              </h3>
            </div>
            <p className="text-gray-600 mb-4">{group.description}</p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.indicators.map((indicator) => (
                <IndicatorInput
                  key={indicator.field}
                  label={indicator.label}
                  field={indicator.field}
                  value={formData[group.category][indicator.field]}
                  unit={indicator.unit}
                  description={indicator.description}
                  placeholder={indicator.placeholder}
                  onChange={(value) => handleInputChange(group.category, indicator.field, value)}
                />
              ))}
            </div>
          </div>
        ))}

        <div className="flex justify-center pt-6">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 py-3 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[200px]"
          >
            {loading ? <LoadingSpinner size="small" /> : 'Calculate Sustainability Index'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalculatorForm;