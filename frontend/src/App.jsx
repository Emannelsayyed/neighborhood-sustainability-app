import React, { useState } from 'react';
import { Layout } from './components/Layout/Layout';
import CalculatorForm from './components/Calculator/CalculatorForm';
import ResultsDisplay from './components/Calculator/ResultsDisplay';
import { sustainabilityAPI } from './services/api';
import { LOADING_STATES } from './utils/constants';
import './styles/index.css';

function App() {
  const [loading, setLoading] = useState(false);
  const [loadingState, setLoadingState] = useState(LOADING_STATES.IDLE);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

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
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
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
            {result && (
              <button
                onClick={clearResults}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Clear Results
              </button>
            )}
          </div>
        </div>

        {/* Main Calculator Form */}
        <CalculatorForm 
          onCalculate={handleCalculate}
          loading={loading}
          error={error}
        />

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
      </div>
    </Layout>
  );
}

export default App;