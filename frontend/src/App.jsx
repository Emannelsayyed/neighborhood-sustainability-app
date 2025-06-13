import React, { useState } from 'react';
import Layout from './components/Layout/Layout';
import MapSelector from './components/Calculator/MapSelector';
import GeographicDataDisplay from './components/Calculator/GeographicDataDisplay';
import CalculatorForm from './components/Calculator/CalculatorForm';
import ResultsDisplay from './components/Calculator/ResultsDisplay';
import ErrorMessage from './components/Common/ErrorMessage';
import LoadingSpinner from './components/Common/LoadingSpinner';
import ApiService from './services/api';
import { UI_CONSTANTS, DEFAULT_VALUES } from './utils/constants';

function App() {
  const [activeTab, setActiveTab] = useState('map');
  const [polygonCoordinates, setPolygonCoordinates] = useState(null);
  const [environmentalData, setEnvironmentalData] = useState(null);
  const [formData, setFormData] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePolygonSelected = async (coordinates) => {
    setLoading(true);
    setError(null);
    try {
      const data = await ApiService.extractEnvironmentalIndicators(coordinates);
      setPolygonCoordinates(coordinates);
      setEnvironmentalData(data);
      setActiveTab('data');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUseData = (data) => {
  setFormData({
    environmental: data,
    social: { ...DEFAULT_VALUES.SOCIAL },
    economic: { ...DEFAULT_VALUES.ECONOMIC }
  });
  setActiveTab('form');
  };

  const handleModifyData = (data) => {
    setFormData({
      environmental: data,
      social: { ...DEFAULT_VALUES.SOCIAL },
      economic: { ...DEFAULT_VALUES.ECONOMIC }
    });
    setActiveTab('form');
  };

  const handleFormSubmit = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const result = await ApiService.calculateSustainabilityIndex(data);
      setResults(result);
      setActiveTab('results');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleManualCalculation = () => {
    setActiveTab('form');
    setFormData(null);
    setEnvironmentalData(null);
    setPolygonCoordinates(null);
  };

  const tabs = [
    { id: 'map', label: 'Select Area', active: polygonCoordinates === null },
    { id: 'data', label: 'Review Data', active: environmentalData !== null },
    { id: 'form', label: 'Enter Data', active: true },
    { id: 'results', label: 'Results', active: results !== null }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sustainability Assessment</h1>
              <p className="text-gray-600">Evaluate neighborhood sustainability across multiple dimensions</p>
            </div>
            <button
              onClick={handleManualCalculation}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Manual Entry
            </button>
          </div>

          <div className="flex space-x-1 border-b">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                disabled={!tab.active}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : tab.active
                    ? 'border-transparent text-gray-500 hover:text-gray-700'
                    : 'border-transparent text-gray-300 cursor-not-allowed'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <ErrorMessage 
            message={error} 
            dismissible 
            onDismiss={() => setError(null)} 
          />
        )}

        {loading && (
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <LoadingSpinner size="large" />
            <p className="mt-4 text-gray-600">{UI_CONSTANTS.LOADING_MESSAGES.CALCULATING}</p>
          </div>
        )}

        {activeTab === 'map' && (
          <MapSelector 
            onPolygonSelected={handlePolygonSelected}
          />
        )}

        {activeTab === 'data' && environmentalData && (
          <GeographicDataDisplay
            environmentalData={environmentalData}
            onUseData={handleUseData}
            onModifyData={handleModifyData}
          />
        )}

        {activeTab === 'form' && (
          <CalculatorForm
            initialData={formData}
            satelliteData={environmentalData}
            onSubmit={handleFormSubmit}
            loading={loading}
          />
        )}

        {activeTab === 'results' && results && (
          <ResultsDisplay results={results} />
        )}
      </div>
    </Layout>
  );
}

export default App;