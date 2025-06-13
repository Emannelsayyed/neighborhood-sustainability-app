# app/routers/geographic.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any
from app.services.geographic import GeographicService
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class PolygonCoordinates(BaseModel):
    coordinates: List[List[float]] = Field(..., description="Polygon coordinates as [[lon, lat], [lon, lat], ...]")

class SatelliteImageRequest(BaseModel):
    coordinates: List[List[float]] = Field(..., description="Polygon coordinates")
    width: int = Field(default=800, ge=400, le=1200, description="Image width in pixels")
    height: int = Field(default=600, ge=300, le=900, description="Image height in pixels")

class EnvironmentalIndicatorsResponse(BaseModel):
    green_area: float
    total_area: float
    water_area: float
    air_quality_aod: float
    land_surface_temperature: float
    mean_ndvi: float
    tasseled_cap_wetness: float
    mean_lst_for_eqi: float
    ndbsi: float
    pm25: float

@router.post("/satellite-image")
async def get_satellite_image(request: SatelliteImageRequest):
    """
    Get satellite image URL for a given polygon area.
    
    Returns a URL to a satellite image of the specified area.
    """
    try:
        image_url = GeographicService.get_satellite_image_url(
            coordinates=request.coordinates,
            width=request.width,
            height=request.height
        )
        
        return {
            "image_url": image_url,
            "coordinates": request.coordinates,
            "dimensions": {
                "width": request.width,
                "height": request.height
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting satellite image: {e}")
        raise HTTPException(status_code=400, detail=f"Error getting satellite image: {str(e)}")

@router.post("/area", response_model=Dict[str, float])
async def calculate_area(polygon: PolygonCoordinates):
    """
    Calculate the area of a polygon in square meters.
    
    Returns the area in square meters and square kilometers.
    """
    try:
        area_sqm = GeographicService.calculate_area_sqm(polygon.coordinates)
        area_sqkm = area_sqm / 1_000_000
        
        return {
            "area_sqm": area_sqm,
            "area_sqkm": area_sqkm
        }
        
    except Exception as e:
        logger.error(f"Error calculating area: {e}")
        raise HTTPException(status_code=400, detail=f"Error calculating area: {str(e)}")

@router.post("/environmental-indicators", response_model=EnvironmentalIndicatorsResponse)
async def extract_environmental_indicators(polygon: PolygonCoordinates):
    """
    Extract all environmental indicators from satellite imagery for the given polygon.
    
    This endpoint processes satellite imagery to automatically extract:
    - Green area (NDVI > 0.2)
    - Water area (MNDWI > 0)
    - Air quality (AOD from Sentinel-5P)
    - Land surface temperature (MODIS)
    - EQI components (NDVI, Tasseled Cap Wetness, LST, NDBSI, PM2.5)
    """
    try:
        logger.info(f"Extracting environmental indicators for polygon: {polygon.coordinates}")
        
        indicators = GeographicService.extract_all_environmental_indicators(polygon.coordinates)
        
        return EnvironmentalIndicatorsResponse(**indicators)
        
    except Exception as e:
        logger.error(f"Error extracting environmental indicators: {e}")
        raise HTTPException(status_code=400, detail=f"Error extracting environmental indicators: {str(e)}")

@router.get("/test-connection")
async def test_earth_engine_connection():
    """
    Test Google Earth Engine connection.
    
    Returns connection status and basic information.
    """
    try:
        GeographicService.initialize_earth_engine()
        
        # Simple test to verify connection
        import ee
        test_result = ee.Number(1).add(1).getInfo()
        
        return {
            "status": "connected",
            "message": "Google Earth Engine connection successful",
            "test_result": test_result
        }
        
    except Exception as e:
        logger.error(f"Earth Engine connection test failed: {e}")
        return {
            "status": "error",
            "message": f"Google Earth Engine connection failed: {str(e)}",
            "test_result": None 
        }