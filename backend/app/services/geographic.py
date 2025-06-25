# app/services/geographic.py
import ee
import json
import base64
from typing import Dict, Any, List, Tuple, Optional
from app.core.config import settings
from app.services.earth_engine import EarthEngineService
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class GeographicService:
    """Service for processing geographic data and extracting environmental indicators"""
    
    @staticmethod
    def initialize_earth_engine():
        """Initialize Earth Engine service"""
        EarthEngineService.initialize()
    
    @staticmethod
    def validate_polygon(coordinates: List[List[float]]) -> bool:
        """Validate polygon coordinates"""
        if not coordinates or len(coordinates) < 3:
            return False
        
        # Check if first and last points are the same (closed polygon)
        if coordinates[0] != coordinates[-1]:
            coordinates.append(coordinates[0])
        
        # Basic validation for coordinate ranges
        for coord in coordinates:
            if len(coord) != 2:
                return False
            lon, lat = coord
            if not (-180 <= lon <= 180) or not (-90 <= lat <= 90):
                return False
        
        return True
    
    @staticmethod
    def get_satellite_image_url(coordinates: List[List[float]], width: int = 800, height: int = 600) -> str:
        """Generate satellite image URL for the given polygon"""
        try:
            GeographicService.initialize_earth_engine()
            
            if not GeographicService.validate_polygon(coordinates):
                raise ValueError("Invalid polygon coordinates")
            
            # Create Earth Engine geometry
            polygon = ee.Geometry.Polygon(coordinates)
            
            # Get recent Sentinel-2 image (last 6 months)
            end_date = datetime.now()
            start_date = end_date - timedelta(days=180)
            
            # Sentinel-2 collection
            s2_collection = (ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
                           .filterBounds(polygon)
                           .filterDate(start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d'))
                           .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
                           .sort('CLOUDY_PIXEL_PERCENTAGE'))
            
            # Get the least cloudy image
            image = s2_collection.first()
            
            # Create RGB visualization
            rgb_image = image.select(['B4', 'B3', 'B2']).multiply(0.0001)
            
            # Get image URL
            url = rgb_image.getThumbURL({
                'region': polygon,
                'dimensions': f'{width}x{height}',
                'format': 'png',
                'min': 0,
                'max': 0.3
            })
            
            return url
            
        except Exception as e:
            logger.error(f"Error generating satellite image URL: {e}")
            raise
    
    @staticmethod
    def get_multi_index_images(coordinates: List[List[float]], width: int = 800, height: int = 600) -> Dict[str, str]:
        """Generate multi-index remote sensing analysis image URLs"""
        try:
            GeographicService.initialize_earth_engine()
            
            if not GeographicService.validate_polygon(coordinates):
                raise ValueError("Invalid polygon coordinates")
            
            polygon = ee.Geometry.Polygon(coordinates)
            
            # Get recent Sentinel-2 and Landsat data
            end_date = datetime.now()
            start_date = end_date - timedelta(days=180)
            
            # Sentinel-2 for high resolution indices
            s2_collection = (ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
                        .filterBounds(polygon)
                        .filterDate(start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d'))
                        .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
                        .sort('CLOUDY_PIXEL_PERCENTAGE'))
            
            # Landsat for Tasseled Cap components
            landsat_collection = (ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
                                .filterBounds(polygon)
                                .filterDate(start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d'))
                                .filter(ee.Filter.lt('CLOUD_COVER', 20))
                                .sort('CLOUD_COVER'))
            
            # Get best images
            s2_image = s2_collection.first()
            landsat_image = landsat_collection.first()
            
            # Calculate indices
            indices = GeographicService._calculate_spectral_indices(s2_image, landsat_image, polygon)
            
            # Generate image URLs
            return {
                'ndvi_url': indices['ndvi'].getThumbURL({
                    'region': polygon,
                    'dimensions': f'{width}x{height}',
                    'format': 'png',
                    'palette': ['red', 'yellow', 'green'],
                    'min': -1,
                    'max': 1
                }),
                'wetness_url': indices['wetness'].getThumbURL({
                    'region': polygon,
                    'dimensions': f'{width}x{height}',
                    'format': 'png',
                    'palette': ['brown', 'yellow', 'blue'],
                    'min': -2000,
                    'max': 2000
                }),
                'dryness_url': indices['dryness'].getThumbURL({
                    'region': polygon,
                    'dimensions': f'{width}x{height}',
                    'format': 'png',
                    'palette': ['blue', 'yellow', 'red'],
                    'min': -2000,
                    'max': 4000
                }),
                'heat_url': indices['heat'].getThumbURL({
                    'region': polygon,
                    'dimensions': f'{width}x{height}',
                    'format': 'png',
                    'palette': ['blue', 'cyan', 'yellow', 'red'],
                    'min': 250,
                    'max': 350
                })
            }
            
        except Exception as e:
            logger.error(f"Error generating multi-index images: {e}")
            raise

    @staticmethod
    def _calculate_spectral_indices(s2_image, landsat_image, polygon):
        """Calculate spectral indices from satellite imagery"""
        try:
            # NDVI from Sentinel-2
            ndvi = s2_image.normalizedDifference(['B8', 'B4']).rename('NDVI')
            
            # Tasseled Cap components from Landsat 8
            wetness = (landsat_image.select('SR_B2').multiply(0.1511)
                    .add(landsat_image.select('SR_B3').multiply(0.1973))
                    .add(landsat_image.select('SR_B4').multiply(0.3283))
                    .add(landsat_image.select('SR_B5').multiply(0.3407))
                    .add(landsat_image.select('SR_B6').multiply(-0.7117))
                    .add(landsat_image.select('SR_B7').multiply(-0.4559))).rename('Wetness')
            
            # Brightness (for dryness calculation)
            brightness = (landsat_image.select('SR_B2').multiply(0.3029)
                        .add(landsat_image.select('SR_B3').multiply(0.2786))
                        .add(landsat_image.select('SR_B4').multiply(0.4733))
                        .add(landsat_image.select('SR_B5').multiply(0.5599))
                        .add(landsat_image.select('SR_B6').multiply(0.5080))
                        .add(landsat_image.select('SR_B7').multiply(0.1872))).rename('Brightness')
            
            # Dryness (inverse of wetness)
            dryness = brightness.subtract(wetness).rename('Dryness')
            
            # Heat (Land Surface Temperature) from MODIS
            end_date = datetime.now()
            start_date = end_date - timedelta(days=30)
            
            lst_collection = (ee.ImageCollection('MODIS/061/MOD11A1')
                            .filterBounds(polygon)
                            .filterDate(start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d'))
                            .select('LST_Day_1km'))
            
            if lst_collection.size().getInfo() > 0:
                heat = lst_collection.mean().multiply(0.02).rename('Heat')
            else:
                # Fallback to constant temperature
                heat = ee.Image.constant(298).rename('Heat')  # ~25°C in Kelvin
            
            return {
                'ndvi': ndvi,
                'wetness': wetness,
                'dryness': dryness,
                'heat': heat
            }
            
        except Exception as e:
            logger.error(f"Error calculating spectral indices: {e}")
            # Return default images
            return {
                'ndvi': ee.Image.constant(0.3),
                'wetness': ee.Image.constant(0),
                'dryness': ee.Image.constant(1000),
                'heat': ee.Image.constant(298)
            }

    
    @staticmethod
    def calculate_area_sqm(coordinates: List[List[float]]) -> float:
        """Calculate polygon area in square meters using Earth Engine"""
        try:
            GeographicService.initialize_earth_engine()
            
            polygon = ee.Geometry.Polygon(coordinates)
            area = polygon.area().getInfo()
            return area
            
        except Exception as e:
            logger.error(f"Error calculating area: {e}")
            raise
    
    @staticmethod
    def extract_green_percentage_area(coordinates: List[List[float]], total_area: float) -> float:
        """Extract green area percentage using NDVI > 0.2"""
        try:
            GeographicService.initialize_earth_engine()
            
            polygon = ee.Geometry.Polygon(coordinates)
            
            # Get recent Sentinel-2 image
            end_date = datetime.now()
            start_date = end_date - timedelta(days=365)  # Last year
            
            s2_collection = (ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
                           .filterBounds(polygon)
                           .filterDate(start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d'))
                           .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20)))
            
            # Calculate median composite
            image = s2_collection.median()
            
            # Calculate NDVI
            ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI')
            
            # Mask for green areas (NDVI > 0.2)
            green_mask = ndvi.gt(0.2)
            
            # Calculate green area
            green_area = green_mask.multiply(ee.Image.pixelArea()).reduceRegion(
                reducer=ee.Reducer.sum(),
                geometry=polygon,
                scale=10,
                maxPixels=1e9
            ).getInfo()
            
            return green_area.get('NDVI', 0)
            
        except Exception as e:
            logger.error(f"Error extracting green area: {e}")
            return 0
    
    @staticmethod
    def extract_water_percentage_area(coordinates: List[List[float]], total_area: float) -> float:
        """Extract water area percentage using MNDWI > 0"""
        try:
            GeographicService.initialize_earth_engine()
            
            polygon = ee.Geometry.Polygon(coordinates)
            
            # Get recent Sentinel-2 image
            end_date = datetime.now()
            start_date = end_date - timedelta(days=365)  # Last year
            
            s2_collection = (ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
                           .filterBounds(polygon)
                           .filterDate(start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d'))
                           .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20)))
            
            # Calculate median composite
            image = s2_collection.median()
            
            # Calculate MNDWI (Modified Normalized Difference Water Index)
            mndwi = image.normalizedDifference(['B3', 'B11']).rename('MNDWI')
            
            # Mask for water areas (MNDWI > 0)
            water_mask = mndwi.gt(0)
            
            # Calculate water area
            water_area = water_mask.multiply(ee.Image.pixelArea()).reduceRegion(
                reducer=ee.Reducer.sum(),
                geometry=polygon,
                scale=10,
                maxPixels=1e9
            ).getInfo()
            
            return water_area.get('MNDWI', 0)
            
        except Exception as e:
            logger.error(f"Error extracting water area: {e}")
            return 0
    
    @staticmethod
    def extract_air_quality_aod(coordinates: List[List[float]]) -> float:
        """Extract air quality using AOD from Sentinel-5P TROPOMI"""
        try:
            GeographicService.initialize_earth_engine()
            
            polygon = ee.Geometry.Polygon(coordinates)
            
            # Get last 12 months of data
            end_date = datetime.now()
            start_date = end_date - timedelta(days=365)
            
            # Sentinel-5P TROPOMI AOD data
            aod_collection = (ee.ImageCollection('COPERNICUS/S5P/NRTI/L3_AER_AI')
                            .filterBounds(polygon)
                            .filterDate(start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d'))
                            .select('absorbing_aerosol_index'))
            
            # Calculate annual average
            aod_mean = aod_collection.mean()
            
            # Get average AOD for the region
            aod_value = aod_mean.reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=polygon,
                scale=1000,
                maxPixels=1e9
            ).getInfo()
            
            # Convert to AOD scale (0-1)
            aod = aod_value.get('absorbing_aerosol_index', 0.3)
            return max(0, min(1, abs(aod) / 10))  # Normalize to 0-1 range
            
        except Exception as e:
            logger.error(f"Error extracting air quality: {e}")
            return 0.3  # Default moderate value
    
    @staticmethod
    def extract_land_surface_temperature(coordinates: List[List[float]]) -> float:
        """Extract land surface temperature from MODIS"""
        try:
            GeographicService.initialize_earth_engine()
            
            polygon = ee.Geometry.Polygon(coordinates)
            
            # Get last 12 months of MODIS LST data
            end_date = datetime.now()
            start_date = end_date - timedelta(days=365)
            
            # MODIS Land Surface Temperature
            lst_collection = (ee.ImageCollection('MODIS/061/MOD11A1')
                            .filterBounds(polygon)
                            .filterDate(start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d'))
                            .select('LST_Day_1km'))
            
            # Check if collection has images
            if lst_collection.size().getInfo() == 0:
                logger.warning("No MODIS LST data available for the specified region and time period")
                return 25.0
            
            # Calculate annual average
            lst_mean = lst_collection.mean()
            
            # Convert from Kelvin to Celsius and scale
            lst_celsius = lst_mean.multiply(0.02).subtract(273.15)
            
            # Get average LST for the region
            lst_result = lst_celsius.reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=polygon,
                scale=1000,
                maxPixels=1e9
            ).getInfo()
            
            lst_value = lst_result.get('LST_Day_1km')
            return lst_value if lst_value is not None else 25.0
            
        except Exception as e:
            logger.error(f"Error extracting land surface temperature: {e}")
            return 25.0  # Default temperature
    
    @staticmethod
    def extract_eqi_components(coordinates: List[List[float]]) -> Dict[str, float]:
        """Extract all components needed for EQI calculation"""
        try:
            GeographicService.initialize_earth_engine()
            
            polygon = ee.Geometry.Polygon(coordinates)
            
            # Get recent Sentinel-2 and Landsat data
            end_date = datetime.now()
            start_date = end_date - timedelta(days=365)
            
            # Sentinel-2 for NDVI and NDBSI
            s2_collection = (ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
                           .filterBounds(polygon)
                           .filterDate(start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d'))
                           .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20)))
            
            s2_image = s2_collection.median()
            
            # Calculate NDVI
            ndvi = s2_image.normalizedDifference(['B8', 'B4'])
            mean_ndvi = ndvi.reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=polygon,
                scale=10,
                maxPixels=1e9
            ).getInfo().get('nd', 0.3)
            
            # Calculate NDBSI (Normalized Difference Bareness and Soil Index)
            # NDBSI = (SWIR - TIR) / (SWIR + TIR) - using B11 and B12
            swir1 = s2_image.select('B11')
            swir2 = s2_image.select('B12')
            ndbsi = swir1.subtract(swir2).divide(swir1.add(swir2))
            
            mean_ndbsi = ndbsi.reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=polygon,
                scale=10,
                maxPixels=1e9
            ).getInfo().get('B11', 0.3)
            
            # Landsat for Tasseled Cap Wetness
            landsat_collection = (ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
                                .filterBounds(polygon)
                                .filterDate(start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d'))
                                .filter(ee.Filter.lt('CLOUD_COVER', 20)))
            
            if landsat_collection.size().getInfo() > 0:
                landsat_image = landsat_collection.median()
                
                # Tasseled Cap Wetness coefficients for Landsat 8
                wetness = (landsat_image.select('SR_B2').multiply(0.1511)
                          .add(landsat_image.select('SR_B3').multiply(0.1973))
                          .add(landsat_image.select('SR_B4').multiply(0.3283))
                          .add(landsat_image.select('SR_B5').multiply(0.3407))
                          .add(landsat_image.select('SR_B6').multiply(-0.7117))
                          .add(landsat_image.select('SR_B7').multiply(-0.4559)))
                
                tasseled_cap_wetness = wetness.reduceRegion(
                    reducer=ee.Reducer.mean(),
                    geometry=polygon,
                    scale=30,
                    maxPixels=1e9
                ).getInfo().get('SR_B2', 0.0)
                
                # Normalize to -1 to 1 range
                tasseled_cap_wetness = max(-1, min(1, tasseled_cap_wetness / 10000))
            else:
                tasseled_cap_wetness = 0.0
            
            # Reuse existing LST method
            mean_lst_for_eqi = GeographicService.extract_land_surface_temperature(coordinates)
            
            # Get real PM2.5 from CAMS (Copernicus Atmosphere Monitoring Service)
            try:
                pm25_collection = (ee.ImageCollection('ECMWF/CAMS/NRT')
                                 .filterBounds(polygon)
                                 .filterDate(start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d'))
                                 .select('particulate_matter_d_less_than_25_um_surface'))
                
                if pm25_collection.size().getInfo() > 0:
                    pm25_mean = pm25_collection.mean()
                    pm25_result = pm25_mean.reduceRegion(
                        reducer=ee.Reducer.mean(),
                        geometry=polygon,
                        scale=40000,  # CAMS data resolution is ~40km
                        maxPixels=1e9
                    ).getInfo()
                    
                    pm25_value = pm25_result.get('particulate_matter_d_less_than_25_um_surface')
                    # Convert from kg/m³ to µg/m³ (multiply by 1e9)
                    pm25 = pm25_value * 1e9 if pm25_value is not None else 20.0
                else:
                    logger.warning("No PM2.5 data available, using default value")
                    pm25 = 20.0
                    
            except Exception as pm25_error:
                logger.warning(f"Error getting PM2.5 data: {pm25_error}, using default value")
                pm25 = 20.0
            
            return {
                'mean_ndvi': max(0, min(1, mean_ndvi)),
                'tasseled_cap_wetness': tasseled_cap_wetness,
                'mean_lst_for_eqi': mean_lst_for_eqi,
                'ndbsi': max(0, min(1, abs(mean_ndbsi))),
                'pm25': max(0, pm25)
            }
            
        except Exception as e:
            logger.error(f"Error extracting EQI components: {e}")
            return {
                'mean_ndvi': 0.3,
                'tasseled_cap_wetness': 0.0,
                'mean_lst_for_eqi': 25.0,
                'ndbsi': 0.3,
                'pm25': 20.0
            }


    @staticmethod
    def extract_all_environmental_indicators(coordinates: List[List[float]]) -> Dict[str, float]:
        """Extract all environmental indicators from satellite imagery"""
        try:
            logger.info(f"Starting environmental indicator extraction for coordinates: {coordinates}")
            
            # Validate coordinates
            if not GeographicService.validate_polygon(coordinates):
                raise ValueError("Invalid polygon coordinates")
            
            # Calculate total area
            total_area = GeographicService.calculate_area_sqm(coordinates)
            logger.info(f"Total area calculated: {total_area} sqm")
            
            # Extract individual indicators
            green_area = GeographicService.extract_green_percentage_area(coordinates, total_area)
            water_area = GeographicService.extract_water_percentage_area(coordinates, total_area)
            air_quality_aod = GeographicService.extract_air_quality_aod(coordinates)
            land_surface_temperature = GeographicService.extract_land_surface_temperature(coordinates)
            eqi_components = GeographicService.extract_eqi_components(coordinates)
            
            result = {
                'green_area': green_area,
                'total_area': total_area,
                'water_area': water_area,
                'air_quality_aod': air_quality_aod,
                'land_surface_temperature': land_surface_temperature,
                'mean_ndvi': eqi_components['mean_ndvi'],
                'tasseled_cap_wetness': eqi_components['tasseled_cap_wetness'],
                'mean_lst_for_eqi': eqi_components['mean_lst_for_eqi'],
                'ndbsi': eqi_components['ndbsi'],
                'pm25': eqi_components['pm25']
            }
            
            logger.info("Environmental indicators extracted successfully")
            return result
            
        except Exception as e:
            logger.error(f"Error extracting environmental indicators: {e}")
            raise