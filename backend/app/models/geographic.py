# app/models/geographic.py
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from .sustainability import SustainabilityInput

class Coordinate(BaseModel):
    lat: float = Field(..., ge=-90, le=90, description="Latitude")
    lng: float = Field(..., ge=-180, le=180, description="Longitude")

class Polygon(BaseModel):
    coordinates: List[Coordinate] = Field(..., min_items=3, description="Polygon coordinates")

class GeographicBounds(BaseModel):
    geometry: Polygon
    name: Optional[str] = Field(None, description="Area name")
    description: Optional[str] = Field(None, description="Area description")

class SatelliteData(BaseModel):
    ndvi_mean: float = Field(..., description="Mean NDVI value")
    ndvi_std: float = Field(..., description="NDVI standard deviation")
    built_up_percentage: float = Field(..., description="Built-up area percentage")
    water_percentage: float = Field(..., description="Water body percentage")
    vegetation_percentage: float = Field(..., description="Vegetation percentage")
    bare_soil_percentage: float = Field(..., description="Bare soil percentage")

class LandCoverAnalysis(BaseModel):
    total_area: float = Field(..., description="Total area in square meters")
    green_space_area: float = Field(..., description="Green space area in square meters")
    urban_area: float = Field(..., description="Urban/built-up area in square meters")
    water_area: float = Field(..., description="Water body area in square meters")
    impervious_surface_area: float = Field(..., description="Impervious surface area in square meters")

class GeographicAnalysisRequest(BaseModel):
    bounds: GeographicBounds
    analysis_date: Optional[str] = Field(None, description="Analysis date (YYYY-MM-DD)")
    include_satellite_data: bool = Field(True, description="Include satellite imagery analysis")

class GeographicAnalysisResponse(BaseModel):
    bounds: GeographicBounds
    land_cover: LandCoverAnalysis
    satellite_data: Optional[SatelliteData] = None
    suggested_environmental_data: Dict[str, Any] = Field(..., description="Auto-populated environmental indicators")

class EnhancedSustainabilityInput(SustainabilityInput):
    geographic_data: Optional[GeographicAnalysisResponse] = None