from pydantic import BaseModel, Field
from typing import Optional

class EnvironmentalIndicators(BaseModel):
    green_space_area: float = Field(..., ge=0, description="Area of green space in square meters")
    total_area: float = Field(..., gt=0, description="Total neighborhood area in square meters")
    dwelling_units: int = Field(..., ge=0, description="Total number of dwelling units")
    residential_area: float = Field(..., ge=0, description="Residential area in square meters")
    commercial_area: float = Field(..., ge=0, description="Commercial area in square meters")
    industrial_area: float = Field(..., ge=0, description="Industrial area in square meters")
    impervious_surface_area: float = Field(..., ge=0, description="Area of impervious surfaces in square meters")

class SocialIndicators(BaseModel):
    total_population: int = Field(..., gt=0, description="Total neighborhood population")
    total_crimes: int = Field(..., ge=0, description="Number of crimes reported")
    adults_with_degree: int = Field(..., ge=0, description="Adults with bachelor's degree or higher")
    total_adult_population: int = Field(..., gt=0, description="Total adult population")
    residents_near_transit: int = Field(..., ge=0, description="Residents within 0.5 miles of transit")
    residents_near_schools: int = Field(..., ge=0, description="Residents within 0.5 miles of schools")
    residents_near_hospitals: int = Field(..., ge=0, description="Residents within 1 mile of hospitals")
    residents_near_fire_stations: int = Field(..., ge=0, description="Residents within 2 miles of fire stations")
    street_intersections: int = Field(..., ge=0, description="Number of street intersections")

class EconomicIndicators(BaseModel):
    median_household_income: float = Field(..., ge=0, description="Median household income in dollars")
    unemployed_count: int = Field(..., ge=0, description="Number of unemployed residents")
    labor_force: int = Field(..., gt=0, description="Total labor force")
    affordable_housing_units: int = Field(..., ge=0, description="Housing units with costs ≤30% of median income")
    total_housing_units: int = Field(..., gt=0, description="Total housing units")

class SustainabilityInput(BaseModel):
    environmental: EnvironmentalIndicators
    social: SocialIndicators
    economic: EconomicIndicators

class IndicatorResults(BaseModel):
    # Environmental
    green_space_percentage: float
    average_residential_density: float
    land_use_diversity: float
    impervious_surface_percentage: float
    
    # Social
    crime_rate: float
    education_level: float
    access_to_transit: float
    access_to_schools: float
    access_to_hospitals: float
    access_to_fire_stations: float
    walkability: float
    
    # Economic
    median_household_income: float
    unemployment_rate: float
    housing_affordability: float

class NormalizedResults(BaseModel):
    # Environmental (normalized 0-1)
    gsp_normalized: float
    ard_normalized: float
    lud_normalized: float
    isp_normalized: float
    
    # Social (normalized 0-1)
    cr_normalized: float
    el_normalized: float
    apt_normalized: float
    as_normalized: float
    ah_normalized: float
    af_normalized: float
    w_normalized: float
    
    # Economic (normalized 0-1)
    mhi_normalized: float
    ur_normalized: float
    ha_normalized: float

class SustainabilityResult(BaseModel):
    # Raw indicators
    indicators: IndicatorResults
    
    # Normalized indicators
    normalized: NormalizedResults
    
    # Category scores (0-100)
    environmental_score: float
    social_score: float
    economic_score: float
    
    # Final sustainability index (0-100)
    sustainability_index: float
    
    # Additional info
    grade: str  # A, B, C, D, F based on score
    interpretation: str

class IndicatorDefinition(BaseModel):
    name: str
    description: str
    calculation: str
    category: str
    weight: float
    threshold: Optional[float] = None