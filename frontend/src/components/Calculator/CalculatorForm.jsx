import React, { useState, useEffect } from 'react';
import IndicatorInput from './IndicatorInput';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorMessage from '../Common/ErrorMessage';
import { INDICATOR_GROUPS, DEFAULT_VALUES, DATA_SOURCE_TYPES } from '../../utils/constants';

const CalculatorForm = ({ 
  onCalculate, 
  onCalculateWithMap, 
  loading, 
  error, 
  dataSourceType = DATA_SOURCE_TYPES.MANUAL,
  geographicAnalysis = null,
  selectedArea = []
}) => {
  const [formData, setFormData] = useState(DEFAULT_VALUES);
  const [isDataPrepopulated, setIsDataPrepopulated] = useState(false);

  // Pre-populate form with geographic data when available
  useEffect(() => {
    if (geographicAnalysis && geographicAnalysis.suggested_environmental_data && 
        (dataSourceType === DATA_SOURCE_TYPES.SATELLITE || dataSourceType === DATA_SOURCE_TYPES.HYBRID)) {
      
      const { suggested_environmental_data } = geographicAnalysis;
      
      setFormData(prev => ({
        ...prev,
        environmental: {
          ...prev.environmental,
          green_space_area: suggested_environmental_data.green_space_area || prev.environmental.green_space_area,
          total_area: suggested_environmental_data.total_area || prev.environmental.total_area,
          dwelling_units: suggested_environmental_data.dwelling_units || prev.environmental.dwelling_units,
          residential_area: suggested_environmental_data.residential_area || prev.environmental.residential_area,
          commercial_area: suggested_environmental_data.commercial_area || prev.environmental.commercial_area,
          industrial_area: suggested_environmental_data.industrial_area || prev.environmental.industrial_area,
          impervious_surface_area: suggested_environmental_data.impervious_surface_area || prev.environmental.impervious_surface_area,
          air_quality_aod: suggested_environmental_data.air_quality_aod || prev.environmental.air_quality_aod
        }
      }));
      
      setIsDataPrepopulated(true);
    }
  }, [geographicAnalysis, dataSourceType]);

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
    if (dataSourceType === DATA_SOURCE_TYPES.MANUAL) {
      onCalculate(formData);
    } else {
      // Include geographic analysis data with form submission
      onCalculateWithMap(formData, geographicAnalysis);
    }
  };

  const resetForm = () => {
    setFormData(DEFAULT_VALUES);
    setIsDataPrepopulated(false);
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
        impervious_surface_area: 300000,
        air_quality_aod: 0.3
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
        residents_near_police: 9200,
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
    setIsDataPrepopulated(false);
  };

  const restoreGeographicData = () => {
    if (geographicAnalysis && geographicAnalysis.suggested_environmental_data) {
      const { suggested_environmental_data } = geographicAnalysis;
      
      setFormData(prev => ({
        ...prev,
        environmental: {
          ...prev.environmental,
          green_space_area: suggested_environmental_data.green_space_area || 0,
          total_area: suggested_environmental_data.total_area || 0,
          dwelling_units: suggested_environmental_data.dwelling_units || 0,
          residential_area: suggested_environmental_data.residential_area || 0,
          commercial_area: suggested_environmental_data.commercial_area || 0,
          industrial_area: suggested_environmental_data.industrial_area || 0,
          impervious_surface_area: suggested_environmental_data.impervious_surface_area || 0,
          air_quality_aod: suggested_environmental_data.air_quality_aod || 0
        }
      }));
    }
  };

  // Get the input mode description
  const getInputModeDescription = () => {
    switch (dataSourceType) {
      case DATA_SOURCE_TYPES.SATELLITE:
        return "Environmental data has been automatically filled from satellite analysis. You can modify values if needed.";
      case DATA_SOURCE_TYPES.HYBRID:
        return "Environmental data has been pre-filled from satellite analysis as a starting point. Please review and adjust all values.";
      default:
        return "Enter all sustainability indicators manually.";
    }
  };

  // Check if an indicator is pre-populated from satellite data
  const isFieldPrepopulated = (category, field) => {
    if (category !== 'environmental' || !isDataPrepopulated) return false;
    const environmentalFields = ['green_space_area', 'total_area', 'dwelling_units', 
                                'residential_area', 'commercial_area', 'industrial_area', 
                                'impervious_surface_area', 'air_quality_aod'];
    return environmentalFields.includes(field);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Sustainability Calculator</h2>
          <p className="text-sm text-gray-600 mt-1">{getInputModeDescription()}</p>
          
          {/* Data source indicator */}
          <div className="flex items-center mt-2 space-x-2">
            <span className="text-xs font-medium text-gray-500">Data Source:</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              dataSourceType === DATA_SOURCE_TYPES.MANUAL 
                ? 'bg-blue-100 text-blue-800'
                : dataSourceType === DATA_SOURCE_TYPES.SATELLITE
                ? 'bg-green-100 text-green-800'
                : 'bg-purple-100 text-purple-800'
            }`}>
              {dataSourceType === DATA_SOURCE_TYPES.MANUAL ? 'Manual Input' :
               dataSourceType === DATA_SOURCE_TYPES.SATELLITE ? 'Satellite Data' : 'Hybrid (Satellite + Manual)'}
            </span>
          </div>

          {/* Selected area info */}
          {selectedArea.length > 0 && (
            <div className="mt-2 text-xs text-gray-500">
              Selected area: {selectedArea.length} coordinate points
            </div>
          )}
        </div>
        
        <div className="space-x-2">
          <button
            type="button"
            onClick={loadExampleData}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Load Example
          </button>
          {isDataPrepopulated && dataSourceType !== DATA_SOURCE_TYPES.MANUAL && (
            <button
              type="button"
              onClick={restoreGeographicData}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              title="Restore satellite-derived data"
            >
              Restore Satellite Data
            </button>
          )}
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
              {group.category === 'environmental' && isDataPrepopulated && (
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  Satellite Data
                </span>
              )}
            </div>
            <p className="text-gray-600 mb-4">{group.description}</p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.indicators.map((indicator) => (
                <div key={indicator.field} className="relative">
                  <IndicatorInput
                    label={indicator.label}
                    field={indicator.field}
                    value={formData[group.category][indicator.field]}
                    unit={indicator.unit}
                    description={indicator.description}
                    placeholder={indicator.placeholder}
                    onChange={(value) => handleInputChange(group.category, indicator.field, value)}
                    isPrepopulated={isFieldPrepopulated(group.category, indicator.field)}
                  />
                  {isFieldPrepopulated(group.category, indicator.field) && (
                    <div className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" 
                         title="Value from satellite analysis" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Geographic Data Summary (if available) */}
        {geographicAnalysis && dataSourceType !== DATA_SOURCE_TYPES.MANUAL && (
          <div className="border rounded-lg p-6 bg-blue-50">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Geographic Analysis Summary</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              {geographicAnalysis.satellite_data && (
                <>
                  <div>
                    <span className="text-gray-600">NDVI Mean:</span>
                    <span className="ml-2 font-medium">{geographicAnalysis.satellite_data.ndvi_mean?.toFixed(3)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Vegetation:</span>
                    <span className="ml-2 font-medium text-green-600">
                      {geographicAnalysis.satellite_data.vegetation_percentage?.toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Built-up:</span>
                    <span className="ml-2 font-medium">{geographicAnalysis.satellite_data.built_up_percentage?.toFixed(1)}%</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

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