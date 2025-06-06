import React, { useState } from 'react';
import { Layout } from './components/Layout/Layout';
import CalculatorForm from './components/Calculator/CalculatorForm';
import ResultsDisplay from './components/Calculator/ResultsDisplay';
import MapSelector from './components/Calculator/MapSelector';
import GeographicDataDisplay from './components/Calculator/GeographicDataDisplay';
import { sustainabilityAPI } from './services/api';
import { LOADING_STATES, GEOGRAPHIC_WORKFLOW_STATES, DATA_SOURCE_TYPES } from './utils/constants';
import './styles/index.css';

function App() {
  // Main app state
  const [loading, setLoading] = useState(false);
  const [loadingState, setLoadingState] = useState(LOADING_STATES.IDLE);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Geographic workflow state
  const [workflowState, setWorkflowState] = useState(GEOGRAPHIC_WORKFLOW_STATES.FORM_INPUT);
  const [dataSourceType, setDataSourceType] = useState(DATA_SOURCE_TYPES.MANUAL);
  const [selectedArea, setSelectedArea] = useState([]);
  const [geographicAnalysis, setGeographicAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleCalculate = async (formData) => {
    try {
      setLoading(true);
      setLoadingState(LOADING_STATES.LOADING);
      setError(null);
      
      const response = await sustainabilityAPI.calculateIndex(formData);
      setResult(response.data);
      setLoadingState(LOADING_STATES.SUCCESS);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          err.message || 
                          'Error calculating sustainability index';
      setError(errorMessage);
      setLoadingState(LOADING_STATES.ERROR);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateWithMap = async (formData, mapData) => {
    try {
      setLoading(true);
      setLoadingState(LOADING_STATES.LOADING);
      setError(null);
      
      const payload = {
        ...formData,
        geographic_data: mapData,
        coordinates: selectedArea
      };
      
      const response = await sustainabilityAPI.calculateWithMap(payload);
      setResult(response.data);
      setLoadingState(LOADING_STATES.SUCCESS);
      setWorkflowState(GEOGRAPHIC_WORKFLOW_STATES.CALCULATION);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          err.message || 
                          'Error calculating sustainability index with map data';
      setError(errorMessage);
      setLoadingState(LOADING_STATES.ERROR);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAreaSelected = (coordinates) => {
    setSelectedArea(coordinates);
    if (coordinates.length >= 3) {
      setWorkflowState(GEOGRAPHIC_WORKFLOW_STATES.AREA_ANALYSIS);
    }
  };

  const handleAnalyzeArea = async (boundsData) => {
    try {
      setAnalyzing(true);
      setError(null);
      
      const response = await sustainabilityAPI.analyzeArea(boundsData);
      setGeographicAnalysis(response.data);
      setWorkflowState(GEOGRAPHIC_WORKFLOW_STATES.DATA_REVIEW);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          err.message || 
                          'Error analyzing selected area';
      setError(errorMessage);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleUseGeographicData = () => {
    setDataSourceType(DATA_SOURCE_TYPES.SATELLITE);
    setWorkflowState(GEOGRAPHIC_WORKFLOW_STATES.FORM_INPUT);
  };

  const handleModifyGeographicData = () => {
    setDataSourceType(DATA_SOURCE_TYPES.HYBRID);
    setWorkflowState(GEOGRAPHIC_WORKFLOW_STATES.FORM_INPUT);
  };

  const loadExample = async () => {
    try {
      setLoading(true);
      setLoadingState(LOADING_STATES.LOADING);
      setError(null);
      
      const response = await sustainabilityAPI.getExample();
      const exampleData = response.data;
      
      // Calculate with example data
      const calcResponse = await sustainabilityAPI.calculateIndex(exampleData);
      setResult(calcResponse.data);
      setLoadingState(LOADING_STATES.SUCCESS);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          err.message || 
                          'Error loading example data';
      setError(errorMessage);
      setLoadingState(LOADING_STATES.ERROR);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const checkHealth = async () => {
    try {
      const response = await sustainabilityAPI.healthCheck();
      alert(`API Status: ${response.data.status}`);
    } catch (err) {
      alert('API is not responding. Please ensure the backend server is running.');
    }
  };

  const clearResults = () => {
    setResult(null);
    setError(null);
    setLoadingState(LOADING_STATES.IDLE);
    setWorkflowState(GEOGRAPHIC_WORKFLOW_STATES.FORM_INPUT);
    setGeographicAnalysis(null);
    setSelectedArea([]);
    setDataSourceType(DATA_SOURCE_TYPES.MANUAL);
  };

  const switchToManualInput = () => {
    setDataSourceType(DATA_SOURCE_TYPES.MANUAL);
    setWorkflowState(GEOGRAPHIC_WORKFLOW_STATES.FORM_INPUT);
    setGeographicAnalysis(null);
    setSelectedArea([]);
  };

  const switchToMapInput = () => {
    setDataSourceType(DATA_SOURCE_TYPES.SATELLITE);
    setWorkflowState(GEOGRAPHIC_WORKFLOW_STATES.MAP_SELECTION);
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Data Source Selection */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Data Input Method</h2>
          <div className="flex flex-wrap gap-4 justify-center mb-4">
            <button
              onClick={switchToManualInput}
              className={`px-4 py-2 rounded-lg transition-colors ${
                dataSourceType === DATA_SOURCE_TYPES.MANUAL
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Manual Input
            </button>
            <button
              onClick={switchToMapInput}
              className={`px-4 py-2 rounded-lg transition-colors ${
                dataSourceType === DATA_SOURCE_TYPES.SATELLITE
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Map-Based Analysis
            </button>
          </div>
          
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={checkHealth}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Check API Health
            </button>
            <button
              onClick={loadExample}
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Loading...' : 'Run Example Calculation'}
            </button>
            {(result || geographicAnalysis) && (
              <button
                onClick={clearResults}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Clear & Start Over
              </button>
            )}
          </div>
        </div>

        {/* Map Selection Workflow */}
        {workflowState === GEOGRAPHIC_WORKFLOW_STATES.MAP_SELECTION && (
          <MapSelector
            onAreaSelected={handleAreaSelected}
            onAnalyzeArea={handleAnalyzeArea}
            analyzing={analyzing}
          />
        )}

        {/* Geographic Data Review */}
        {workflowState === GEOGRAPHIC_WORKFLOW_STATES.DATA_REVIEW && geographicAnalysis && (
          <GeographicDataDisplay
            analysisData={geographicAnalysis}
            onUseData={handleUseGeographicData}
            onModifyData={handleModifyGeographicData}
          />
        )}

        {/* Main Calculator Form */}
        {workflowState === GEOGRAPHIC_WORKFLOW_STATES.FORM_INPUT && (
          <CalculatorForm 
            onCalculate={handleCalculate}
            onCalculateWithMap={handleCalculateWithMap}
            loading={loading}
            error={error}
            dataSourceType={dataSourceType}
            geographicAnalysis={geographicAnalysis}
            selectedArea={selectedArea}
          />
        )}

        {/* Results Display */}
        {result && (
          <div className="mt-8">
            <ResultsDisplay result={result} />
          </div>
        )}

        {/* Loading State Indicator */}
        {loadingState === LOADING_STATES.LOADING && !loading && (
          <div className="text-center py-4">
            <p className="text-gray-600">Processing your request...</p>
          </div>
        )}

        {/* Workflow Status */}
        {dataSourceType !== DATA_SOURCE_TYPES.MANUAL && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-800 mb-2">Workflow Status</h3>
            <div className="flex space-x-4 text-sm">
              <span className={`px-2 py-1 rounded ${
                workflowState === GEOGRAPHIC_WORKFLOW_STATES.MAP_SELECTION 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                1. Select Area
              </span>
              <span className={`px-2 py-1 rounded ${
                workflowState === GEOGRAPHIC_WORKFLOW_STATES.DATA_REVIEW 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                2. Review Data
              </span>
              <span className={`px-2 py-1 rounded ${
                workflowState === GEOGRAPHIC_WORKFLOW_STATES.FORM_INPUT 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                3. Input Data
              </span>
              <span className={`px-2 py-1 rounded ${
                workflowState === GEOGRAPHIC_WORKFLOW_STATES.CALCULATION 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                4. Results
              </span>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default App;