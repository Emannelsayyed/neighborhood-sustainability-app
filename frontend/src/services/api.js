// Frontend API service for sustainability calculator
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ApiService {
  // Sustainability endpoints
  static async calculateSustainabilityIndex(data) {
    const response = await fetch(`${API_BASE_URL}/api/sustainability/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Calculation failed');
    }
    
    return response.json();
  }

  static async calculateFromPolygon(data) {
    const response = await fetch(`${API_BASE_URL}/api/sustainability/calculate-geographic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Geographic calculation failed');
    }
    
    return response.json();
  }

  static async getIndicatorDefinitions() {
    const response = await fetch(`${API_BASE_URL}/api/sustainability/indicators`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch indicator definitions');
    }
    
    return response.json();
  }

  static async getExampleInput() {
    const response = await fetch(`${API_BASE_URL}/api/sustainability/example`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch example data');
    }
    
    return response.json();
  }

  static async getCategoryWeights() {
    const response = await fetch(`${API_BASE_URL}/api/sustainability/weights`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch category weights');
    }
    
    return response.json();
  }

  // Geographic endpoints
  static async getSatelliteImage(coordinates, width = 800, height = 600) {
    const response = await fetch(`${API_BASE_URL}/api/geographic/satellite-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coordinates, width, height })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to get satellite image');
    }
    
    return response.json();
  }

  static async calculateArea(coordinates) {
    const response = await fetch(`${API_BASE_URL}/api/geographic/area`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coordinates })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to calculate area');
    }
    
    return response.json();
  }

  static async extractEnvironmentalIndicators(coordinates) {
    const response = await fetch(`${API_BASE_URL}/api/geographic/environmental-indicators`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coordinates })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to extract environmental indicators');
    }
    
    return response.json();
  }

  static async testEarthEngineConnection() {
    const response = await fetch(`${API_BASE_URL}/api/geographic/test-connection`);
    
    if (!response.ok) {
      throw new Error('Failed to test Earth Engine connection');
    }
    
    return response.json();
  }
}

export default ApiService;