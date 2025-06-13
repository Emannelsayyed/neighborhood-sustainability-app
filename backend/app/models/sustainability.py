# app/models/sustainability.py
from pydantic import BaseModel, Field
from typing import Optional, List


class EnvironmentalIndicators(BaseModel):
    # Green Percentage Area (GPA)
    green_area: float = Field(..., ge=0, description="Area with NDVI > 0.2 in square meters")
    total_area: float = Field(..., gt=0, description="Total neighborhood area in square meters")
    
    # Water Percentage Area (WPA)
    water_area: float = Field(..., ge=0, description="Area with MNDWI > 0 in square meters")
    
    # Air Quality (AQ)
    air_quality_aod: float = Field(..., ge=0, le=1, description="Annual average Aerosol Optical Depth (AOD) from Sentinel-5P TROPOMI")
    
    # Land Surface Temperature (LST)
    land_surface_temperature: float = Field(..., ge=0, description="Annual average LST in Celsius from MODIS")
    
    # Ecological Quality Index (EQI) components
    mean_ndvi: float = Field(..., ge=0, le=1, description="Mean NDVI value")
    tasseled_cap_wetness: float = Field(..., ge=-1, le=1, description="Tasseled Cap Wetness component")
    mean_lst_for_eqi: float = Field(..., ge=0, description="Mean LST for EQI calculation in Celsius")
    ndbsi: float = Field(..., ge=0, le=1, description="Normalized Difference Bareness and Soil Index")
    pm25: float = Field(..., ge=0, description="Annual average PM2.5 concentration in µg/m³")

class SocialIndicators(BaseModel):
    total_population: int = Field(..., gt=0, description="Total neighborhood population")
    total_crimes: int = Field(..., ge=0, description="Number of crimes reported")
    adults_with_degree: int = Field(..., ge=0, description="Adults with bachelor's degree or higher")
    total_adult_population: int = Field(..., gt=0, description="Total adult population")
    avg_time_to_transit: float = Field(..., ge=0, description="Average travel time to closest transit stop in minutes")
    avg_time_to_schools: float = Field(..., ge=0, description="Average travel time to closest school in minutes")
    avg_time_to_hospitals: float = Field(..., ge=0, description="Average travel time to closest hospital in minutes")
    avg_time_to_fire_stations: float = Field(..., ge=0, description="Average travel time to closest fire station in minutes")
    avg_time_to_police: float = Field(..., ge=0, description="Average travel time to closest police station in minutes")
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
    green_percentage_area: float
    water_percentage_area: float
    air_quality: float
    land_surface_temperature: float
    ecological_quality_index: float
    
    # Social
    crime_rate: float
    education_level: float
    access_to_transit: float
    access_to_schools: float
    access_to_hospitals: float
    access_to_fire_stations: float
    access_to_police: float
    walkability: float
    
    # Economic
    median_household_income: float
    unemployment_rate: float
    housing_affordability: float

class NormalizedResults(BaseModel):
    # Environmental (normalized 0-1)
    gpa_normalized: float
    wpa_normalized: float
    aq_normalized: float
    lst_normalized: float
    eqi_normalized: float
    
    # Social (normalized 0-1)
    cr_normalized: float
    el_normalized: float
    apt_normalized: float
    as_normalized: float
    ah_normalized: float
    af_normalized: float
    ap_normalized: float
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


    # Geographic models
class PolygonInput(BaseModel):
    coordinates: List[List[float]] = Field(..., description="Polygon coordinates as [[lon, lat], [lon, lat], ...]")

class GeographicSustainabilityInput(BaseModel):
    polygon: PolygonInput
    social: SocialIndicators
    economic: EconomicIndicators