import React, { useState } from 'react';
import Layout from './components/Layout/Layout';
import MapSelector from './components/Calculator/MapSelector';
import CalculatorForm from './components/Calculator/CalculatorForm'; 
import ResultsDisplay from './components/Calculator/ResultsDisplay';
import DataAnalysisReport from './components/Calculator/DataAnalysisReport';
import TimeSeriesAnalyzer from './components/TimeSeries/TimeSeriesAnalyzer';
import ErrorMessage from './components/Common/ErrorMessage';
import LoadingSpinner from './components/Common/LoadingSpinner';
import ApiService from './services/api';
import { UI_CONSTANTS, DEFAULT_VALUES } from './utils/constants';

function App() { 
  const [polygonCoordinates, setPolygonCoordinates] = useState(null);
  const [environmentalData, setEnvironmentalData] = useState(null);
  const [satelliteImageUrl, setSatelliteImageUrl] = useState('');
  const [area, setArea] = useState(null);
  const [formData, setFormData] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [activeTab, setActiveTab] = useState('calculator');
  const [error, setError] = useState(null);

  const handlePolygonSelected = async (coordinates) => {
    setLoading(true);
    setError(null);
    try {
      const data = await ApiService.extractEnvironmentalIndicators(coordinates);
      setPolygonCoordinates(coordinates);
      setEnvironmentalData(data);
    } catch (err) { 
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAreaCalculated = (areaData) => {
    setArea(areaData);
  };

  const handleSatelliteImage = (imageUrl) => {
    setSatelliteImageUrl(imageUrl);
  };

  const handleFormSubmit = async (data) => {
    setLoading(true);
    setError(null);
    setFormData(data);
    try { 
      const result = await ApiService.calculateSustainabilityIndex(data);
      setResults(result); 
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleManualCalculation = () => {
  setEnvironmentalData(null);
  setPolygonCoordinates(null);
  setSatelliteImageUrl('');
  setArea(null);
  setResults(null);
  setError(null);
  // Force show the form with default values
  setEnvironmentalData({});
  };

  const handleShowReport = (results, formData) => {
    setReportData({ results, formData });
    setShowReport(true);
  };
 
  return (
    <Layout>
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
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
          
          <div className="flex space-x-4 border-t pt-4">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'calculator' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Sustainability Calculator
            </button>
            <button
              onClick={() => setActiveTab('timeseries')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'timeseries' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Time Series Changes
            </button>
          </div>
        </div>

        {error && (
          <ErrorMessage 
            message={error} 
            dismissible 
            onDismiss={() => setError(null)} 
          />
        )}

        {activeTab === 'calculator' && (
          <>
            <MapSelector 
              onPolygonSelected={handlePolygonSelected}
              onAreaCalculated={handleAreaCalculated}
              onSatelliteImage={handleSatelliteImage}
            />

            {loading && (
              <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                <LoadingSpinner size="large" />
                <p className="mt-4 text-gray-600">{UI_CONSTANTS.LOADING_MESSAGES.CALCULATING}</p>
              </div>
            )}

            {environmentalData && (
              <CalculatorForm 
                satelliteData={environmentalData}
                onSubmit={handleFormSubmit}
                loading={loading}
              />
            )}

            {results && (
              <ResultsDisplay 
                results={results} 
                onShowReport={handleShowReport}
                formData={formData} 
              />
            )}

            {showReport && reportData && (
              <DataAnalysisReport 
                results={reportData.results}
                formData={reportData.formData}
                onClose={() => setShowReport(false)}
              />
            )}
          </>
        )}

        {activeTab === 'timeseries' && (
          <TimeSeriesAnalyzer />
        )}
      </div>
    </Layout>
  );
}

export default App;