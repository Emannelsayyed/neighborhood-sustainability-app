# app/services/earth_engine.py
import ee
import json
from typing import Dict, Any, Optional
from app.models.geographic import GeographicBounds, SatelliteData, LandCoverAnalysis
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class EarthEngineService:
    """Service for Google Earth Engine operations"""
    
    @staticmethod
    def initialize():
        """Initialize Google Earth Engine"""
        try:
            # Check if already initialized
            try:
                ee.data.getInfo(ee.Number(1))
                logger.info("Google Earth Engine already initialized")
                return
            except:
                pass
            
            # For production, use service account authentication
            if (settings.GEE_SERVICE_ACCOUNT_EMAIL and 
                settings.GEE_SERVICE_ACCOUNT_KEY and 
                settings.ENVIRONMENT == "production"):
                
                credentials = ee.ServiceAccountCredentials(
                    settings.GEE_SERVICE_ACCOUNT_EMAIL,
                    settings.GEE_SERVICE_ACCOUNT_KEY
                )
                ee.Initialize(credentials)
                logger.info("Google Earth Engine initialized with service account")
                
            else:
                # For development, use application default credentials
                if settings.GOOGLE_CLOUD_PROJECT:
                    ee.Initialize(project=settings.GOOGLE_CLOUD_PROJECT)
                else:
                    ee.Initialize()
                logger.info("Google Earth Engine initialized with default credentials")
                
        except Exception as e:
            logger.error(f"Failed to initialize Google Earth Engine: {e}")
            logger.error("Make sure you have:")
            logger.error("1. Installed Google Cloud CLI")
            logger.error("2. Run 'gcloud auth application-default login'")
            logger.error("3. Enabled Earth Engine API in Google Cloud Console")
            logger.error("4. Registered for Earth Engine access")
            raise
    
    @staticmethod
    def create_geometry_from_bounds(bounds: GeographicBounds):
        """Convert bounds to Earth Engine geometry"""
        coords = [[coord.lng, coord.lat] for coord in bounds.geometry.coordinates]
        # Close the polygon if not already closed
        if coords[0] != coords[-1]:
            coords.append(coords[0])
        
        return ee.Geometry.Polygon([coords])
    
    @staticmethod
    def analyze_land_cover(bounds: GeographicBounds, year: int = 2022) -> LandCoverAnalysis:
        """Analyze land cover using ESA WorldCover dataset"""
        try:
            geometry = EarthEngineService.create_geometry_from_bounds(bounds)
            
            # Get ESA WorldCover dataset
            worldcover = ee.ImageCollection("ESA/WorldCover/v200").first()
            
            # Clip to area of interest
            clipped = worldcover.clip(geometry)
            
            # Calculate area for each land cover class
            pixel_area = ee.Image.pixelArea()
            area_image = clipped.addBands(pixel_area)
            
            # Define land cover classes
            # ESA WorldCover classes: 10=trees, 20=shrubland, 30=grassland, 40=cropland,
            # 50=built-up, 60=bare/sparse, 70=snow/ice, 80=water, 90=herbaceous wetland, 95=mangroves
            
            # Group classes for our analysis
            green_space_mask = clipped.eq(10).Or(clipped.eq(20)).Or(clipped.eq(30)).Or(clipped.eq(40))
            urban_mask = clipped.eq(50)
            water_mask = clipped.eq(80).Or(clipped.eq(90))
            
            # Calculate areas
            total_area = geometry.area().getInfo()
            
            green_area_stats = area_image.select('area').updateMask(green_space_mask).reduceRegion(
                reducer=ee.Reducer.sum(),
                geometry=geometry,
                scale=10,
                maxPixels=1e9
            ).getInfo()
            
            urban_area_stats = area_image.select('area').updateMask(urban_mask).reduceRegion(
                reducer=ee.Reducer.sum(),
                geometry=geometry,
                scale=10,
                maxPixels=1e9
            ).getInfo()
            
            water_area_stats = area_image.select('area').updateMask(water_mask).reduceRegion(
                reducer=ee.Reducer.sum(),
                geometry=geometry,
                scale=10,
                maxPixels=1e9
            ).getInfo()
            
            # Extract values with defaults
            green_space_area = green_area_stats.get('area', 0)
            urban_area = urban_area_stats.get('area', 0)
            water_area = water_area_stats.get('area', 0)
            
            # Estimate impervious surface as 80% of urban area
            impervious_surface_area = urban_area * 0.8
            
            return LandCoverAnalysis(
                total_area=total_area,
                green_space_area=green_space_area,
                urban_area=urban_area,
                water_area=water_area,
                impervious_surface_area=impervious_surface_area
            )
            
        except Exception as e:
            logger.error(f"Error analyzing land cover: {e}")
            # Return default values if analysis fails
            estimated_area = EarthEngineService._estimate_area_from_bounds(bounds)
            return LandCoverAnalysis(
                total_area=estimated_area,
                green_space_area=estimated_area * 0.25,  # Assume 25% green space
                urban_area=estimated_area * 0.4,         # Assume 40% urban
                water_area=estimated_area * 0.05,        # Assume 5% water
                impervious_surface_area=estimated_area * 0.32  # 80% of urban
            )
    
    @staticmethod
    def analyze_satellite_data(bounds: GeographicBounds, start_date: str = "2023-01-01", 
                             end_date: str = "2023-12-31") -> SatelliteData:
        """Analyze satellite data for vegetation and built-up areas"""
        try:
            geometry = EarthEngineService.create_geometry_from_bounds(bounds)
            
            # Get Sentinel-2 imagery
            s2 = (ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
                  .filterDate(start_date, end_date)
                  .filterBounds(geometry)
                  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
                  .median())
            
            # Calculate NDVI
            ndvi = s2.normalizedDifference(['B8', 'B4']).rename('NDVI')
            
            # Calculate NDVI statistics
            ndvi_stats = ndvi.reduceRegion(
                reducer=ee.Reducer.mean().combine(
                    reducer2=ee.Reducer.stdDev(),
                    sharedInputs=True
                ),
                geometry=geometry,
                scale=10,
                maxPixels=1e9
            ).getInfo()
            
            # Estimate built-up areas using NDBI (Normalized Difference Built-up Index)
            ndbi = s2.normalizedDifference(['B11', 'B8']).rename('NDBI')
            built_up_mask = ndbi.gt(0.1)  # Threshold for built-up areas
            built_up_percentage = built_up_mask.reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=geometry,
                scale=10,
                maxPixels=1e9
            ).getInfo().get('NDBI', 0) * 100
            
            # Estimate land cover percentages based on NDVI
            vegetation_mask = ndvi.gt(0.3)  # High vegetation
            water_mask = ndvi.lt(-0.1)      # Water bodies
            bare_soil_mask = ndvi.gte(-0.1).And(ndvi.lte(0.1))  # Bare soil
            
            vegetation_percentage = vegetation_mask.reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=geometry,
                scale=10,
                maxPixels=1e9
            ).getInfo().get('NDVI', 0) * 100
            
            water_percentage = water_mask.reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=geometry,
                scale=10,
                maxPixels=1e9
            ).getInfo().get('NDVI', 0) * 100
            
            bare_soil_percentage = bare_soil_mask.reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=geometry,
                scale=10,
                maxPixels=1e9
            ).getInfo().get('NDVI', 0) * 100
            
            return SatelliteData(
                ndvi_mean=ndvi_stats.get('NDVI_mean', 0.3),
                ndvi_std=ndvi_stats.get('NDVI_stdDev', 0.1),
                built_up_percentage=built_up_percentage,
                water_percentage=water_percentage,
                vegetation_percentage=vegetation_percentage,
                bare_soil_percentage=bare_soil_percentage
            )
            
        except Exception as e:
            logger.error(f"Error analyzing satellite data: {e}")
            # Return default values if analysis fails
            return SatelliteData(
                ndvi_mean=0.3,
                ndvi_std=0.15,
                built_up_percentage=40.0,
                water_percentage=5.0,
                vegetation_percentage=30.0,
                bare_soil_percentage=25.0
            )
        

    @staticmethod
    def analyze_air_quality(bounds: GeographicBounds, start_date: str = "2023-01-01", 
                        end_date: str = "2023-12-31") -> float:
        """Analyze air quality using Sentinel-5P TROPOMI AOD data"""
        try:
            geometry = EarthEngineService.create_geometry_from_bounds(bounds)
            
            # Get Sentinel-5P TROPOMI Aerosol Index data
            s5p = (ee.ImageCollection("COPERNICUS/S5P/NRTI/L3_AER_AI")
                .filterDate(start_date, end_date)
                .filterBounds(geometry)
                .select('absorbing_aerosol_index'))
            
            # Calculate annual average AOD
            annual_aod = s5p.mean()
            
            # Get statistics for the area
            aod_stats = annual_aod.reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=geometry,
                scale=1113.2,  # Native resolution of S5P data
                maxPixels=1e9
            ).getInfo()
            
            # Extract AOD value, default to 0.3 if no data
            aod_value = aod_stats.get('absorbing_aerosol_index', 0.3)
            
            # Ensure value is within valid range [0, 1]
            return max(0.0, min(1.0, abs(aod_value)))
            
        except Exception as e:
            logger.error(f"Error analyzing air quality: {e}")
            # Return default moderate air quality value
            return 0.3
    
    @staticmethod
    def _estimate_area_from_bounds(bounds: GeographicBounds) -> float:
        """Estimate area from geographic bounds using simple calculation"""
        coords = bounds.geometry.coordinates
        if len(coords) < 3:
            return 1000000  # Default 1 sq km
        
        # Simple bounding box area estimation
        lats = [coord.lat for coord in coords]
        lngs = [coord.lng for coord in coords]
        
        lat_diff = max(lats) - min(lats)
        lng_diff = max(lngs) - min(lngs)
        
        # Rough conversion to meters (very approximate)
        # 1 degree latitude ≈ 111,000 meters
        # 1 degree longitude ≈ 111,000 * cos(latitude) meters
        avg_lat = sum(lats) / len(lats)
        lat_meters = lat_diff * 111000
        lng_meters = lng_diff * 111000 * abs(cos(radians(avg_lat)))
        
        return lat_meters * lng_meters

# Import required math functions
from math import cos, radians