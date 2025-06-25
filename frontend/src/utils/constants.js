// Frontend configuration constants for sustainability calculator

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  TIMEOUT: 30000,
  ENDPOINTS: {
    SUSTAINABILITY: {
      CALCULATE: '/api/sustainability/calculate',
      CALCULATE_GEOGRAPHIC: '/api/sustainability/calculate-geographic',
      INDICATORS: '/api/sustainability/indicators',
      EXAMPLE: '/api/sustainability/example',
      WEIGHTS: '/api/sustainability/weights'
    },
    GEOGRAPHIC: {
      SATELLITE_IMAGE: '/api/geographic/satellite-image',
      MULTI_INDEX_IMAGES: '/api/geographic/multi-index-images',
      AREA: '/api/geographic/area',
      ENVIRONMENTAL_INDICATORS: '/api/geographic/environmental-indicators',
      TEST_CONNECTION: '/api/geographic/test-connection'
    },
    TIMESERIES: {
      ANALYZE: '/api/timeseries/analyze',
      AVAILABLE_YEARS: '/api/timeseries/available-years'
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

// Multi-index image configuration
export const MULTI_INDEX_CONFIG = {
  INDICES: {
    NDVI: {
      name: 'NDVI (Vegetation)',
      description: 'Normalized Difference Vegetation Index - Shows vegetation health',
      color: '#10B981'
    },
    WETNESS: {
      name: 'Wetness',
      description: 'Tasseled Cap Wetness - Shows moisture content',
      color: '#3B82F6'
    },
    DRYNESS: {
      name: 'Dryness',
      description: 'Brightness minus Wetness - Shows dry/bare areas',
      color: '#F59E0B'
    },
    HEAT: {
      name: 'Heat (LST)',
      description: 'Land Surface Temperature - Shows thermal patterns',
      color: '#EF4444'
    }
  },
  DISPLAY_ORDER: ['NDVI', 'WETNESS', 'DRYNESS', 'HEAT']
};

// Time series configuration
export const TIMESERIES_CONFIG = {
  AVAILABLE_YEARS: {
    START: 2000,  
    END: 2024
  },
  DEFAULT_YEARS: [2020, 2021, 2022, 2023, 2024],
  ANIMATION_CONFIG: {
    FRAMES_PER_SECOND: 1,
    DIMENSIONS: 512
  },
  // Add this new section
  IMAGE_FALLBACK: {
    ENABLE_CORS_PROXY: false,
    SHOW_DIRECT_LINKS: true
  }
};

// UI constants
export const UI_CONSTANTS = {
  LOADING_MESSAGES: {
    CALCULATING: 'Extracting Calculating Environmental indices...',
    EXTRACTING_DATA: 'Extracting environmental data...',
    LOADING_IMAGE: 'Loading satellite image...',
    ANALYZING_TIMESERIES: 'Analyzing environmental changes over time...',
    GENERATING_ANIMATION: 'Generating time series animation...',
    EXTRACTING_YEARLY_DATA: 'Extracting data for selected years...'
  },
  ERROR_MESSAGES: {
    CALCULATION_FAILED: 'Failed to calculate sustainability index',
    INVALID_POLYGON: 'Invalid polygon coordinates',
    CONNECTION_ERROR: 'Connection error. Please try again.',
    TIMESERIES_FAILED: 'Failed to analyze time series data',
    INVALID_YEAR_SELECTION: 'Please select valid years for analysis'
  }
};

// CORS and image handling configuration
export const IMAGE_CONFIG = {
  CORS_PROXY: import.meta.env.VITE_CORS_PROXY || '', // Optional CORS proxy
  FALLBACK_ENABLED: true,
  RETRY_ATTEMPTS: 2,
  TIMEOUT: 10000
};