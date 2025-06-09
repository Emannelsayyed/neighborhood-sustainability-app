# app/routers/geographic.py
from fastapi import APIRouter, HTTPException
from app.models.geographic import (
    GeographicAnalysisRequest, 
    GeographicAnalysisResponse,
    EnhancedSustainabilityInput,
    LandCoverAnalysis,
    SatelliteData,
    GeographicBounds
)
from app.services.earth_engine import EarthEngineService
from app.services.calculator import SustainabilityCalculator
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/analyze-area", response_model=GeographicAnalysisResponse)
async def analyze_geographic_area(request: GeographicAnalysisRequest):
    """
    Analyze a geographic area using Google Earth Engine satellite data.
    
    Returns land cover analysis and satellite-derived environmental indicators.
    """
    try:
        # Initialize Earth Engine if not already done
        EarthEngineService.initialize()
        
        # Analyze land cover
        land_cover = EarthEngineService.analyze_land_cover(request.bounds)
        
        # Analyze satellite data if requested
        satellite_data = None
        if request.include_satellite_data:
            satellite_data = EarthEngineService.analyze_satellite_data(request.bounds)
        
        # Generate suggested environmental data based on analysis
        suggested_data = _generate_suggested_environmental_data(land_cover, satellite_data, request.bounds)
        
        return GeographicAnalysisResponse(
            bounds=request.bounds,
            land_cover=land_cover,
            satellite_data=satellite_data,
            suggested_environmental_data=suggested_data
        )
        
    except Exception as e:
        logger.error(f"Error analyzing geographic area: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")

@router.post("/calculate-with-map", response_model=dict)
async def calculate_sustainability_with_map_data(data: EnhancedSustainabilityInput):
    """
    Calculate sustainability index with enhanced geographic data from map selection.
    
    Combines user input with satellite-derived environmental indicators.
    """
    try:
        # If geographic data is provided, use it to enhance environmental indicators
        if data.geographic_data:
            # Update environmental indicators with satellite data
            land_cover = data.geographic_data.land_cover
            
            # Override certain environmental fields with satellite-derived data
            data.environmental.total_area = land_cover.total_area
            data.environmental.green_space_area = land_cover.green_space_area
            data.environmental.impervious_surface_area = land_cover.impervious_surface_area
            
            # Estimate other areas if not provided by user
            if data.environmental.residential_area == 0:
                data.environmental.residential_area = land_cover.urban_area * 0.6  # 60% of urban is residential
            if data.environmental.commercial_area == 0:
                data.environmental.commercial_area = land_cover.urban_area * 0.3   # 30% commercial
            if data.environmental.industrial_area == 0:
                data.environmental.industrial_area = land_cover.urban_area * 0.1   # 10% industrial
        
        # Calculate sustainability index using the enhanced data
        result = SustainabilityCalculator.calculate_sustainability_index(data)
        
        # Add geographic context to result
        response = result.dict()
        if data.geographic_data:
            response['geographic_context'] = {
                'area_analyzed': data.geographic_data.land_cover.total_area,
                'satellite_data_included': data.geographic_data.satellite_data is not None,
                'analysis_bounds': data.geographic_data.bounds.dict()
            }
        
        return response
        
    except Exception as e:
        logger.error(f"Error calculating sustainability with map data: {e}")
        raise HTTPException(status_code=400, detail=f"Calculation error: {str(e)}")

@router.get("/gee-status")
async def check_earth_engine_status():
    """
    Check Google Earth Engine service status.
    """
    try:
        EarthEngineService.initialize()
        return {
            "status": "available",
            "message": "Google Earth Engine is initialized and ready"
        }
    except Exception as e:
        return {
            "status": "unavailable", 
            "message": f"Google Earth Engine error: {str(e)}"
        }

def _generate_suggested_environmental_data(land_cover: LandCoverAnalysis, satellite_data: Optional[SatelliteData], bounds: GeographicBounds) -> Dict[str, Any]:
    """Generate suggested environmental indicator values based on satellite analysis"""
    
    suggestions = {
        "total_area": land_cover.total_area,
        "green_space_area": land_cover.green_space_area,
        "impervious_surface_area": land_cover.impervious_surface_area,
        "residential_area": land_cover.urban_area * 0.6,  # Estimate 60% of urban as residential
        "commercial_area": land_cover.urban_area * 0.3,   # Estimate 30% as commercial
        "industrial_area": land_cover.urban_area * 0.1,   # Estimate 10% as industrial
    }
    
    # Add dwelling units estimation based on area and typical density
    if land_cover.urban_area > 0:
        # Assume average of 25 dwelling units per hectare in urban areas
        urban_hectares = land_cover.urban_area / 10000  # Convert m² to hectares
        suggestions["dwelling_units"] = int(urban_hectares * 25)
    else:
        suggestions["dwelling_units"] = 100  # Default minimum

    # Add air quality data using Earth Engine
    try:
        aod_value = EarthEngineService.analyze_air_quality(bounds)
        suggestions["air_quality_aod"] = aod_value
    except:
        suggestions["air_quality_aod"] = 0.3  # Default moderate air quality    
    
    # Add confidence scores based on satellite data quality
    if satellite_data:
        suggestions["data_confidence"] = {
            "ndvi_quality": "high" if satellite_data.ndvi_std < 0.2 else "medium",
            "built_up_confidence": "high" if satellite_data.built_up_percentage > 10 else "low",
            "vegetation_confidence": "high" if satellite_data.vegetation_percentage > 15 else "medium"
        }
    
    return suggestions