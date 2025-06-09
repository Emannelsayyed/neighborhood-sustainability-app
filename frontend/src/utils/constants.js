// API Configuration - Use Vite environment variables
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Default form values
export const DEFAULT_VALUES = {
  environmental: {
    green_space_area: 0,
    total_area: 0,
    dwelling_units: 0,
    residential_area: 0,
    commercial_area: 0,
    industrial_area: 0,
    impervious_surface_area: 0,
    air_quality_aod: 0 
  },
  social: {
    total_population: 0,
    total_crimes: 0,
    adults_with_degree: 0,
    total_adult_population: 0,
    residents_near_transit: 0,
    residents_near_schools: 0,
    residents_near_hospitals: 0,
    residents_near_fire_stations: 0,
    residents_near_police: 0,
    street_intersections: 0
  },
  economic: {
    median_household_income: 0,
    unemployed_count: 0,
    labor_force: 0,
    affordable_housing_units: 0,
    total_housing_units: 0
  }
};

// Indicator groups for form organization
export const INDICATOR_GROUPS = [
  {
    category: 'environmental',
    color: 'bg-green-500',
    description: 'Environmental indicators measure green space, land use diversity, and development patterns that affect ecological health.',
    indicators: [
      {
        field: 'green_space_area',
        label: 'Green Space Area',
        unit: 'm²',
        description: 'Total area of parks, gardens, and other vegetated spaces',
        placeholder: 'e.g., 250000'
      },
      {
        field: 'total_area',
        label: 'Total Area',
        unit: 'm²',
        description: 'Total neighborhood area including all land uses',
        placeholder: 'e.g., 1000000'
      },
      {
        field: 'dwelling_units',
        label: 'Dwelling Units',
        unit: 'units',
        description: 'Total number of residential housing units',
        placeholder: 'e.g., 2470'
      },
      {
        field: 'residential_area',
        label: 'Residential Area',
        unit: 'm²',
        description: 'Area designated for residential use',
        placeholder: 'e.g., 400000'
      },
      {
        field: 'commercial_area',
        label: 'Commercial Area',
        unit: 'm²',
        description: 'Area designated for commercial and retail use',
        placeholder: 'e.g., 300000'
      },
      {
        field: 'industrial_area',
        label: 'Industrial Area',
        unit: 'm²',
        description: 'Area designated for industrial and manufacturing use',
        placeholder: 'e.g., 100000'
      },
      {
        field: 'impervious_surface_area',
        label: 'Impervious Surface Area',
        unit: 'm²',
        description: 'Area covered by roads, parking lots, and other non-permeable surfaces',
        placeholder: 'e.g., 300000'
      },
      {
        field: 'air_quality_aod',
        label: 'Air Quality (AOD)',
        unit: 'AOD',
        description: 'Aerosol Optical Depth - measure of air pollution from satellite data',
        placeholder: 'e.g., 0.3'
      }
    ]
  },
  {
    category: 'social',
    color: 'bg-blue-500',
    description: 'Social indicators measure safety, education, accessibility, and quality of life factors that affect community wellbeing.',
    indicators: [
      {
        field: 'total_population',
        label: 'Total Population',
        unit: 'people',
        description: 'Total number of residents in the neighborhood',
        placeholder: 'e.g., 10000'
      },
      {
        field: 'total_crimes',
        label: 'Total Crimes',
        unit: 'incidents',
        description: 'Number of reported crimes in the past year',
        placeholder: 'e.g., 50'
      },
      {
        field: 'adults_with_degree',
        label: 'Adults with Degree',
        unit: 'people',
        description: 'Adults with bachelor\'s degree or higher',
        placeholder: 'e.g., 3000'
      },
      {
        field: 'total_adult_population',
        label: 'Total Adult Population',
        unit: 'people',
        description: 'Total number of adults (18+ years)',
        placeholder: 'e.g., 8000'
      },
      {
        field: 'residents_near_transit',
        label: 'Residents Near Transit',
        unit: 'people',
        description: 'Residents within 0.5 miles of public transit',
        placeholder: 'e.g., 8500'
      },
      {
        field: 'residents_near_schools',
        label: 'Residents Near Schools',
        unit: 'people',
        description: 'Residents within 0.5 miles of schools',
        placeholder: 'e.g., 8000'
      },
      {
        field: 'residents_near_hospitals',
        label: 'Residents Near Hospitals',
        unit: 'people',
        description: 'Residents within 1 mile of hospitals',
        placeholder: 'e.g., 9000'
      },
      {
        field: 'residents_near_fire_stations',
        label: 'Residents Near Fire Stations',
        unit: 'people',
        description: 'Residents within 2 miles of fire stations',
        placeholder: 'e.g., 9500'
      },
      {
        field: 'residents_near_police',
        label: 'Residents Near Police',
        unit: 'people',
        description: 'Residents within 1 mile of police stations',
        placeholder: 'e.g., 9200'
      },
      {
        field: 'street_intersections',
        label: 'Street Intersections',
        unit: 'intersections',
        description: 'Number of street intersections (walkability measure)',
        placeholder: 'e.g., 120'
      }
    ]
  },
  {
    category: 'economic',
    color: 'bg-purple-500',
    description: 'Economic indicators measure income levels, employment rates, and housing affordability that affect economic sustainability.',
    indicators: [
      {
        field: 'median_household_income',
        label: 'Median Household Income',
        unit: '$',
        description: 'Median annual household income',
        placeholder: 'e.g., 50000'
      },
      {
        field: 'unemployed_count',
        label: 'Unemployed Count',
        unit: 'people',
        description: 'Number of unemployed residents',
        placeholder: 'e.g., 500'
      },
      {
        field: 'labor_force',
        label: 'Labor Force',
        unit: 'people',
        description: 'Total number of people in the labor force',
        placeholder: 'e.g., 6000'
      },
      {
        field: 'affordable_housing_units',
        label: 'Affordable Housing Units',
        unit: 'units',
        description: 'Housing units with costs ≤30% of median income',
        placeholder: 'e.g., 700'
      },
      {
        field: 'total_housing_units',
        label: 'Total Housing Units',
        unit: 'units',
        description: 'Total number of housing units',
        placeholder: 'e.g., 1000'
      }
    ]
  }
];

// Grade thresholds and colors
export const GRADE_THRESHOLDS = {
  A: { min: 80, color: 'text-green-600 bg-green-100' },
  B: { min: 70, color: 'text-blue-600 bg-blue-100' },
  C: { min: 60, color: 'text-yellow-600 bg-yellow-100' },
  D: { min: 50, color: 'text-orange-600 bg-orange-100' },
  F: { min: 0, color: 'text-red-600 bg-red-100' }
};

// Indicator categories
export const CATEGORIES = {
  ENVIRONMENTAL: 'environmental',
  SOCIAL: 'social',
  ECONOMIC: 'economic'
};

// Chart colors
export const CHART_COLORS = {
  environmental: '#10b981', // green-500
  social: '#3b82f6',        // blue-500
  economic: '#8b5cf6'       // purple-500
};

// Example data for testing
export const EXAMPLE_DATA = {
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

// API endpoints
export const API_ENDPOINTS = {
  CALCULATE: '/api/calculate',
  INDICATORS: '/api/indicators',
  EXAMPLE: '/api/example',
  WEIGHTS: '/api/weights',
  HEALTH: '/health'
};

// Validation rules
export const VALIDATION_RULES = {
  required: ['total_area', 'total_population', 'total_adult_population', 'labor_force', 'total_housing_units'],
  nonNegative: ['green_space_area', 'dwelling_units', 'residential_area', 'commercial_area', 'industrial_area', 
                'impervious_surface_area', 'total_crimes', 'adults_with_degree', 'residents_near_transit',
                'residents_near_schools', 'residents_near_hospitals', 'residents_near_fire_stations',
                'street_intersections', 'median_household_income', 'unemployed_count', 'affordable_housing_units'],
  positive: ['total_area', 'total_population', 'total_adult_population', 'labor_force', 'total_housing_units']
};

// Loading states
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
};

// Local storage keys
export const STORAGE_KEYS = {
  FORM_DATA: 'sustainability_form_data',
  LAST_RESULT: 'sustainability_last_result'
};

// Geographic Analysis Constants
export const GEOGRAPHIC_CONSTANTS = {
  DEFAULT_MAP_CENTER: [40.7128, -74.0060], // NYC [lat, lng] for Leaflet
  DEFAULT_ZOOM: 13,
  MIN_POLYGON_POINTS: 3,
  ANALYSIS_CONFIDENCE_LEVELS: {
    HIGH: 'high',
    MEDIUM: 'medium', 
    LOW: 'low'
  }
};

// New API endpoints for geographic functionality
export const GEOGRAPHIC_API_ENDPOINTS = {
  ANALYZE_AREA: '/api/geographic/analyze-area',
  CALCULATE_WITH_MAP: '/api/geographic/calculate-with-map',
  GEE_STATUS: '/api/geographic/gee-status'
};

// Geographic workflow states
export const GEOGRAPHIC_WORKFLOW_STATES = {
  MAP_SELECTION: 'map_selection',
  AREA_ANALYSIS: 'area_analysis', 
  DATA_REVIEW: 'data_review',
  FORM_INPUT: 'form_input',
  CALCULATION: 'calculation'
};

// Data source types
export const DATA_SOURCE_TYPES = {
  MANUAL: 'manual',
  SATELLITE: 'satellite',
  HYBRID: 'hybrid'
};

// Confidence level colors for UI
export const CONFIDENCE_COLORS = {
  high: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-red-100 text-red-800'
};