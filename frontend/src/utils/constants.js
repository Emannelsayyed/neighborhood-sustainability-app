// Frontend configuration constants for sustainability calculator

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  TIMEOUT: 30000,
  ENDPOINTS: {
    SUSTAINABILITY: {
      CALCULATE: '/sustainability/calculate',
      CALCULATE_GEOGRAPHIC: '/sustainability/calculate-geographic',
      INDICATORS: '/sustainability/indicators',
      EXAMPLE: '/sustainability/example',
      WEIGHTS: '/sustainability/weights'
    },
    GEOGRAPHIC: {
      SATELLITE_IMAGE: '/geographic/satellite-image',
      AREA: '/geographic/area',
      ENVIRONMENTAL_INDICATORS: '/geographic/environmental-indicators',
      TEST_CONNECTION: '/geographic/test-connection'
    }
  }
};

// Form default values
export const DEFAULT_VALUES = {
  ENVIRONMENTAL: {
    green_area: 250000,
    total_area: 1000000,
    water_area: 50000,
    air_quality_aod: 0.3,
    land_surface_temperature: 25.0,
    mean_ndvi: 0.5,
    tasseled_cap_wetness: 0.3,
    mean_lst_for_eqi: 25.0,
    ndbsi: 0.4,
    pm25: 20.0
  },
  SOCIAL: {
    total_population: 10000,
    total_crimes: 50,
    adults_with_degree: 3000,
    total_adult_population: 8000,
    avg_time_to_transit: 5.0,
    avg_time_to_schools: 8.0,
    avg_time_to_hospitals: 12.0,
    avg_time_to_fire_stations: 6.0,
    avg_time_to_police: 10.0,
    street_intersections: 120
  },
  ECONOMIC: {
    median_household_income: 50000,
    unemployed_count: 500,
    labor_force: 6000,
    affordable_housing_units: 700,
    total_housing_units: 1000
  }
};

// Validation rules
export const VALIDATION_RULES = {
  ENVIRONMENTAL: {
    green_area: { min: 0, required: true },
    total_area: { min: 1, required: true },
    water_area: { min: 0, required: true },
    air_quality_aod: { min: 0, max: 1, required: true },
    land_surface_temperature: { min: 0, required: true },
    mean_ndvi: { min: 0, max: 1, required: true },
    tasseled_cap_wetness: { min: -1, max: 1, required: true },
    mean_lst_for_eqi: { min: 0, required: true },
    ndbsi: { min: 0, max: 1, required: true },
    pm25: { min: 0, required: true }
  },
  SOCIAL: {
    total_population: { min: 1, required: true },
    total_crimes: { min: 0, required: true },
    adults_with_degree: { min: 0, required: true },
    total_adult_population: { min: 1, required: true },
    avg_time_to_transit: { min: 0, required: true },
    avg_time_to_schools: { min: 0, required: true },
    avg_time_to_hospitals: { min: 0, required: true },
    avg_time_to_fire_stations: { min: 0, required: true },
    avg_time_to_police: { min: 0, required: true },
    street_intersections: { min: 0, required: true }
  },
  ECONOMIC: {
    median_household_income: { min: 0, required: true },
    unemployed_count: { min: 0, required: true },
    labor_force: { min: 1, required: true },
    affordable_housing_units: { min: 0, required: true },
    total_housing_units: { min: 1, required: true }
  }
};

// Field labels and descriptions
export const FIELD_METADATA = {
  ENVIRONMENTAL: {
    green_area: { label: 'Green Area (m²)', description: 'Area with NDVI > 0.2 in square meters' },
    total_area: { label: 'Total Area (m²)', description: 'Total neighborhood area in square meters' },
    water_area: { label: 'Water Area (m²)', description: 'Area with MNDWI > 0 in square meters' },
    air_quality_aod: { label: 'Air Quality AOD', description: 'Annual average Aerosol Optical Depth' },
    land_surface_temperature: { label: 'Land Surface Temperature (°C)', description: 'Annual average LST in Celsius' },
    mean_ndvi: { label: 'Greenness', description: 'Mean NDVI value' },
    tasseled_cap_wetness: { label: 'Wetness', description: 'Tasseled Cap Wetness component' },
    mean_lst_for_eqi: { label: 'Surface Heat', description: 'Mean LST for EQI calculation' },
    ndbsi: { label: 'Dryness', description: 'Normalized Difference Bareness and Soil Index' },
    pm25: { label: 'Air Quality PM2.5', description: 'Annual average PM2.5 concentration (µg/m³)' }
  },
  SOCIAL: {
    total_population: { label: 'Total Population', description: 'Total neighborhood population' },
    total_crimes: { label: 'Total Crimes', description: 'Number of crimes reported' },
    adults_with_degree: { label: 'Adults with Degree', description: 'Adults with bachelor\'s degree or higher' },
    total_adult_population: { label: 'Total Adult Population', description: 'Total adult population' },
    avg_time_to_transit: { label: 'Transit Access (min)', description: 'Average travel time to transit stop' },
    avg_time_to_schools: { label: 'School Access (min)', description: 'Average travel time to school' },
    avg_time_to_hospitals: { label: 'Hospital Access (min)', description: 'Average travel time to hospital' },
    avg_time_to_fire_stations: { label: 'Fire Station Access (min)', description: 'Average travel time to fire station' },
    avg_time_to_police: { label: 'Police Access (min)', description: 'Average travel time to police station' },
    street_intersections: { label: 'Street Intersections', description: 'Number of street intersections' }
  },
  ECONOMIC: {
    median_household_income: { label: 'Median Household Income ($)', description: 'Median household income in dollars' },
    unemployed_count: { label: 'Unemployed Count', description: 'Number of unemployed residents' },
    labor_force: { label: 'Labor Force', description: 'Total labor force' },
    affordable_housing_units: { label: 'Affordable Housing Units', description: 'Housing units with costs ≤30% of median income' },
    total_housing_units: { label: 'Total Housing Units', description: 'Total housing units' }
  }
};

// Category information
export const CATEGORIES = {
  ENVIRONMENTAL: {
    name: 'Environmental',
    weight: 40,
    color: '#10B981'
  },
  SOCIAL: {
    name: 'Social',
    weight: 30,
    color: '#3B82F6'
  },
  ECONOMIC: {
    name: 'Economic',
    weight: 30,
    color: '#F59E0B'
  }
};

// Grade thresholds
export const GRADE_THRESHOLDS = {
  A: 80,
  B: 70,
  C: 60,
  D: 50,
  F: 0
};

// Map configuration
export const MAP_CONFIG = {
  DEFAULT_CENTER: [31.05, 30.4500], // Elbagour, Menofia coordinates
  DEFAULT_ZOOM: 12,
  SATELLITE_IMAGE_DIMENSIONS: {
    width: 800,
    height: 600
  }
};

// UI constants
export const UI_CONSTANTS = {
  LOADING_MESSAGES: {
    CALCULATING: 'Extracting Calculating Environmental indices...',
    EXTRACTING_DATA: 'Extracting environmental data...',
    LOADING_IMAGE: 'Loading satellite image...'
  },
  ERROR_MESSAGES: {
    CALCULATION_FAILED: 'Failed to calculate sustainability index',
    INVALID_POLYGON: 'Invalid polygon coordinates',
    CONNECTION_ERROR: 'Connection error. Please try again.'
  }
};