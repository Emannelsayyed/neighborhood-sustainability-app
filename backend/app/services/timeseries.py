# app/services/timeseries.py

import ee
from typing import Dict, List, Any
from datetime import datetime
from app.models.sustainability import TimeSeriesInput, TimeSeriesResult, YearlyEnvironmentalData, EnvironmentalIndicators
from app.services.geographic import GeographicService
from app.services.calculator import SustainabilityCalculator
from app.models.sustainability import SustainabilityInput, SocialIndicators, EconomicIndicators
import logging

logger = logging.getLogger(__name__)

class TimeSeriesService:
    """Service for time series analysis of environmental changes"""
    
    @staticmethod
    async def analyze_time_series(data: TimeSeriesInput) -> TimeSeriesResult:
        """Analyze environmental changes over multiple years"""
        try:
            GeographicService.initialize_earth_engine()
            
            coordinates = data.polygon.coordinates
            years = sorted(data.years)
            
            # Calculate total area once
            total_area = GeographicService.calculate_area_sqm(coordinates)
            
            yearly_data = []
            
            for year in years:
                logger.info(f"Processing year {year}")
                
                # Extract environmental indicators for specific year
                env_indicators = TimeSeriesService._extract_yearly_environmental_indicators(
                    coordinates, year
                )
                
                # Calculate environmental score
                env_score = TimeSeriesService._calculate_yearly_environmental_score(env_indicators)
                
                # Generate satellite image for the year
                image_url = TimeSeriesService._get_yearly_satellite_image(coordinates, year)

                # Generate multi-index images for the year
                multi_index_images = TimeSeriesService._get_yearly_multi_index_images(coordinates, year)

                yearly_data.append(YearlyEnvironmentalData(
                    year=year,
                    green_area=env_indicators['green_area'],
                    total_area=env_indicators['total_area'],
                    water_area=env_indicators['water_area'],
                    air_quality_aod=env_indicators['air_quality_aod'],
                    land_surface_temperature=env_indicators['land_surface_temperature'],
                    mean_ndvi=env_indicators['mean_ndvi'],
                    tasseled_cap_wetness=env_indicators['tasseled_cap_wetness'],
                    mean_lst_for_eqi=env_indicators['mean_lst_for_eqi'],
                    ndbsi=env_indicators['ndbsi'],
                    pm25=env_indicators['pm25'],
                    environmental_score=env_score,
                    satellite_image_url=image_url,
                    ndvi_image_url=multi_index_images['ndvi_url'],
                    wetness_image_url=multi_index_images['wetness_url'],
                    dryness_image_url=multi_index_images['dryness_url'],
                    heat_image_url=multi_index_images['heat_url']
                ))
                            
            # Generate animation GIF
            animation_url = TimeSeriesService._create_time_series_animation(coordinates, years)
            
            # Calculate trend analysis
            trend_analysis = TimeSeriesService._analyze_trends(yearly_data)
            
            return TimeSeriesResult(
                polygon_coordinates=coordinates,
                total_area=total_area,
                yearly_data=yearly_data,
                animation_gif_url=animation_url,
                trend_analysis=trend_analysis
            )
            
        except Exception as e:
            logger.error(f"Error in time series analysis: {e}")
            raise
    
    @staticmethod
    def _extract_yearly_environmental_indicators(coordinates: List[List[float]], year: int) -> Dict[str, float]:
        """Extract environmental indicators for a specific year"""
        try:
            polygon = ee.Geometry.Polygon(coordinates)
            
            # Date range for the year
            start_date = f'{year}-01-01'
            end_date = f'{year}-12-31'
            
            # Calculate total area
            total_area = polygon.area().getInfo()
            
            # Get Landsat collection based on year
            if year >= 2013:
                # Landsat 8
                landsat = (ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
                          .filterBounds(polygon)
                          .filterDate(start_date, end_date)
                          .filter(ee.Filter.lt('CLOUD_COVER', 20)))
            elif year >= 1999:
                # Landsat 7
                landsat = (ee.ImageCollection('LANDSAT/LE07/C02/T1_L2')
                          .filterBounds(polygon)
                          .filterDate(start_date, end_date)
                          .filter(ee.Filter.lt('CLOUD_COVER', 20)))
            else:
                # Landsat 5
                landsat = (ee.ImageCollection('LANDSAT/LT05/C02/T1_L2')
                          .filterBounds(polygon)
                          .filterDate(start_date, end_date)
                          .filter(ee.Filter.lt('CLOUD_COVER', 20)))
            
            # Check if we have data for this year
            if landsat.size().getInfo() == 0:
                logger.warning(f"No Landsat data available for year {year}")
                return TimeSeriesService._get_default_indicators(total_area)
            
            # Get median composite for the year
            image = landsat.median()
            
            # Extract indicators using Landsat bands
            indicators = TimeSeriesService._extract_indicators_from_landsat(image, polygon, total_area)
            
            # Add MODIS LST if available (MODIS starts from 2000)
            if year >= 2000:
                indicators['land_surface_temperature'] = TimeSeriesService._get_modis_lst_for_year(polygon, year)
                indicators['mean_lst_for_eqi'] = indicators['land_surface_temperature']
            else:
                indicators['land_surface_temperature'] = 25.0
                indicators['mean_lst_for_eqi'] = 25.0
            
            # Air quality data (limited historical availability)
            if year >= 2018:
                indicators['air_quality_aod'] = TimeSeriesService._get_sentinel5p_aod_for_year(polygon, year)
                indicators['pm25'] = TimeSeriesService._get_cams_pm25_for_year(polygon, year)
            else:
                indicators['air_quality_aod'] = 0.3
                indicators['pm25'] = 20.0
            
            return indicators
            
        except Exception as e:
            logger.error(f"Error extracting indicators for year {year}: {e}")
            return TimeSeriesService._get_default_indicators(polygon.area().getInfo())
    
    @staticmethod
    def _extract_indicators_from_landsat(image, polygon, total_area):
        """Extract environmental indicators from Landsat image"""
        
        # NDVI calculation
        if image.select('SR_B5').getInfo() and image.select('SR_B4').getInfo():
            # Landsat 8 (NIR=B5, Red=B4)
            ndvi = image.normalizedDifference(['SR_B5', 'SR_B4'])
        else:
            # Landsat 5/7 (NIR=B4, Red=B3)
            ndvi = image.normalizedDifference(['SR_B4', 'SR_B3'])
        
        # Green area (NDVI > 0.2)
        green_mask = ndvi.gt(0.2)
        green_area = green_mask.multiply(ee.Image.pixelArea()).reduceRegion(
            reducer=ee.Reducer.sum(),
            geometry=polygon,
            scale=30,
            maxPixels=1e9
        ).getInfo().get('nd', 0)
        
        # Mean NDVI
        mean_ndvi = ndvi.reduceRegion(
            reducer=ee.Reducer.mean(),
            geometry=polygon,
            scale=30,
            maxPixels=1e9
        ).getInfo().get('nd', 0.3)
        
        # Water area using MNDWI (Green=B3, SWIR=B6 or B11)
        try:
            if image.select('SR_B6').getInfo():
                # Landsat 8
                mndwi = image.normalizedDifference(['SR_B3', 'SR_B6'])
            else:
                # Landsat 5/7
                mndwi = image.normalizedDifference(['SR_B2', 'SR_B5'])
            
            water_mask = mndwi.gt(0)
            water_area = water_mask.multiply(ee.Image.pixelArea()).reduceRegion(
                reducer=ee.Reducer.sum(),
                geometry=polygon,
                scale=30,
                maxPixels=1e9
            ).getInfo().get('nd', 0)
        except:
            water_area = 0
        
        # Tasseled Cap Wetness
        try:
            if image.select('SR_B7').getInfo():
                # Landsat 8 coefficients
                wetness = (image.select('SR_B2').multiply(0.1511)
                          .add(image.select('SR_B3').multiply(0.1973))
                          .add(image.select('SR_B4').multiply(0.3283))
                          .add(image.select('SR_B5').multiply(0.3407))
                          .add(image.select('SR_B6').multiply(-0.7117))
                          .add(image.select('SR_B7').multiply(-0.4559)))
            else:
                # Landsat 5/7 coefficients (simplified)
                wetness = (image.select('SR_B1').multiply(0.0315)
                          .add(image.select('SR_B2').multiply(0.2021))
                          .add(image.select('SR_B3').multiply(0.3102))
                          .add(image.select('SR_B4').multiply(0.1594))
                          .add(image.select('SR_B5').multiply(-0.6806))
                          .add(image.select('SR_B7').multiply(-0.6109)))
            
            tasseled_cap_wetness = wetness.reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=polygon,
                scale=30,
                maxPixels=1e9
            ).getInfo().get('SR_B2', 0) / 10000
        except:
            tasseled_cap_wetness = 0.0
        
        # NDBSI using SWIR bands
        try:
            if image.select('SR_B6').getInfo() and image.select('SR_B7').getInfo():
                # Landsat 8
                ndbsi = image.normalizedDifference(['SR_B6', 'SR_B7'])
            else:
                # Landsat 5/7
                ndbsi = image.normalizedDifference(['SR_B5', 'SR_B7'])
            
            mean_ndbsi = abs(ndbsi.reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=polygon,
                scale=30,
                maxPixels=1e9
            ).getInfo().get('SR_B6', 0.3))
        except:
            mean_ndbsi = 0.3
        
        return {
            'green_area': green_area,
            'total_area': total_area,
            'water_area': water_area,
            'mean_ndvi': max(0, min(1, mean_ndvi)),
            'tasseled_cap_wetness': max(-1, min(1, tasseled_cap_wetness)),
            'ndbsi': max(0, min(1, mean_ndbsi))
        }
    
    @staticmethod
    def _get_modis_lst_for_year(polygon, year):
        """Get MODIS LST for specific year"""
        try:
            start_date = f'{year}-01-01'
            end_date = f'{year}-12-31'
            
            lst_collection = (ee.ImageCollection('MODIS/061/MOD11A1')
                            .filterBounds(polygon)
                            .filterDate(start_date, end_date)
                            .select('LST_Day_1km'))
            
            if lst_collection.size().getInfo() == 0:
                return 25.0
            
            lst_mean = lst_collection.mean()
            lst_celsius = lst_mean.multiply(0.02).subtract(273.15)
            
            result = lst_celsius.reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=polygon,
                scale=1000,
                maxPixels=1e9
            ).getInfo()
            
            return result.get('LST_Day_1km', 25.0)
        except:
            return 25.0
    
    @staticmethod
    def _get_sentinel5p_aod_for_year(polygon, year):
        """Get Sentinel-5P AOD for specific year (available from 2018)"""
        try:
            start_date = f'{year}-01-01'
            end_date = f'{year}-12-31'
            
            aod_collection = (ee.ImageCollection('COPERNICUS/S5P/NRTI/L3_AER_AI')
                            .filterBounds(polygon)
                            .filterDate(start_date, end_date)
                            .select('absorbing_aerosol_index'))
            
            if aod_collection.size().getInfo() == 0:
                return 0.3
            
            aod_mean = aod_collection.mean()
            result = aod_mean.reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=polygon,
                scale=1000,
                maxPixels=1e9
            ).getInfo()
            
            aod = result.get('absorbing_aerosol_index', 0.3)
            return max(0, min(1, abs(aod) / 10))
        except:
            return 0.3
    
    @staticmethod
    def _get_cams_pm25_for_year(polygon, year):
        """Get CAMS PM2.5 for specific year"""
        try:
            start_date = f'{year}-01-01'
            end_date = f'{year}-12-31'
            
            pm25_collection = (ee.ImageCollection('ECMWF/CAMS/NRT')
                             .filterBounds(polygon)
                             .filterDate(start_date, end_date)
                             .select('particulate_matter_d_less_than_25_um_surface'))
            
            if pm25_collection.size().getInfo() == 0:
                return 20.0
            
            pm25_mean = pm25_collection.mean()
            result = pm25_mean.reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=polygon,
                scale=40000,
                maxPixels=1e9
            ).getInfo()
            
            pm25_value = result.get('particulate_matter_d_less_than_25_um_surface')
            return pm25_value * 1e9 if pm25_value else 20.0
        except:
            return 20.0
    
    @staticmethod
    def _calculate_yearly_environmental_score(indicators: Dict[str, float]) -> float:
        """Calculate environmental score for a single year"""
        try:
            # Create dummy social and economic data for calculation
            dummy_social = SocialIndicators(
                total_population=1000, total_crimes=0, adults_with_degree=500,
                total_adult_population=800, avg_time_to_transit=0,
                avg_time_to_schools=0, avg_time_to_hospitals=0,
                avg_time_to_fire_stations=0, avg_time_to_police=0,
                street_intersections=0
            )
            
            dummy_economic = EconomicIndicators(
                median_household_income=50000, unemployed_count=0,
                labor_force=800, affordable_housing_units=700,
                total_housing_units=1000
            )
            
            env_indicators = EnvironmentalIndicators(**indicators)
            
            sustainability_input = SustainabilityInput(
                environmental=env_indicators,
                social=dummy_social,
                economic=dummy_economic
            )
            
            result = SustainabilityCalculator.calculate_sustainability_index(sustainability_input)
            return result.environmental_score
            
        except Exception as e:
            logger.error(f"Error calculating environmental score: {e}")
            return 50.0
    
    @staticmethod
    def _get_yearly_satellite_image(coordinates: List[List[float]], year: int) -> str:
        """Generate satellite image URL for specific year"""
        try:
            polygon = ee.Geometry.Polygon(coordinates)
            start_date = f'{year}-01-01'
            end_date = f'{year}-12-31'
            
            # Use Landsat for historical data with correct band names
            if year >= 2013:
                collection = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
                bands = ['SR_B4', 'SR_B3', 'SR_B2']  # Red, Green, Blue for LC08
            elif year >= 1999:
                collection = ee.ImageCollection('LANDSAT/LE07/C02/T1_L2')
                bands = ['SR_B3', 'SR_B2', 'SR_B1']  # Red, Green, Blue for LE07
            else:
                collection = ee.ImageCollection('LANDSAT/LT05/C02/T1_L2')
                bands = ['SR_B3', 'SR_B2', 'SR_B1']  # Red, Green, Blue for LT05
            
            landsat = (collection
                    .filterBounds(polygon)
                    .filterDate(start_date, end_date)
                    .filter(ee.Filter.lt('CLOUD_COVER', 50)))  # Increased cloud cover threshold
            
            if landsat.size().getInfo() == 0:
                # Try with higher cloud cover if no images found
                landsat = (collection
                        .filterBounds(polygon)
                        .filterDate(start_date, end_date)
                        .filter(ee.Filter.lt('CLOUD_COVER', 80)))
                
                if landsat.size().getInfo() == 0:
                    return ""
            
            image = landsat.median()
            # Scale surface reflectance properly (Collection 2 uses 0.0000275 scale + -0.2 offset)
            rgb_image = image.select(bands).multiply(0.0000275).add(-0.2)
            
            url = rgb_image.getThumbURL({
                'region': polygon,
                'dimensions': '800x600',
                'format': 'png',
                'min': 0,
                'max': 0.25
            })
            
            return url
            
        except Exception as e:
            logger.error(f"Error generating satellite image for year {year}: {e}")
            return ""
    
    @staticmethod
    def _get_yearly_multi_index_images(coordinates: List[List[float]], year: int) -> Dict[str, str]:
        """Generate multi-index images for specific year"""
        try:
            polygon = ee.Geometry.Polygon(coordinates)
            start_date = f'{year}-01-01'
            end_date = f'{year}-12-31'
            
            # Get Landsat collection based on year
            if year >= 2013:
                landsat = (ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
                        .filterBounds(polygon)
                        .filterDate(start_date, end_date)
                        .filter(ee.Filter.lt('CLOUD_COVER', 50)))
            elif year >= 1999:
                landsat = (ee.ImageCollection('LANDSAT/LE07/C02/T1_L2')
                        .filterBounds(polygon)
                        .filterDate(start_date, end_date)
                        .filter(ee.Filter.lt('CLOUD_COVER', 50)))
            else:
                landsat = (ee.ImageCollection('LANDSAT/LT05/C02/T1_L2')
                        .filterBounds(polygon)
                        .filterDate(start_date, end_date)
                        .filter(ee.Filter.lt('CLOUD_COVER', 50)))
            
            if landsat.size().getInfo() == 0:
                return {"ndvi_url": "", "wetness_url": "", "dryness_url": "", "heat_url": ""}
            
            image = landsat.median()
            
            # Calculate indices based on satellite
            if year >= 2013:
                # Landsat 8
                ndvi = image.normalizedDifference(['SR_B5', 'SR_B4'])
                wetness = (image.select('SR_B2').multiply(0.1511)
                        .add(image.select('SR_B3').multiply(0.1973))
                        .add(image.select('SR_B4').multiply(0.3283))
                        .add(image.select('SR_B5').multiply(0.3407))
                        .add(image.select('SR_B6').multiply(-0.7117))
                        .add(image.select('SR_B7').multiply(-0.4559)))
                brightness = (image.select('SR_B2').multiply(0.3029)
                            .add(image.select('SR_B3').multiply(0.2786))
                            .add(image.select('SR_B4').multiply(0.4733))
                            .add(image.select('SR_B5').multiply(0.5599))
                            .add(image.select('SR_B6').multiply(0.5080))
                            .add(image.select('SR_B7').multiply(0.1872)))
            else:
                # Landsat 5/7
                ndvi = image.normalizedDifference(['SR_B4', 'SR_B3'])
                wetness = (image.select('SR_B1').multiply(0.0315)
                        .add(image.select('SR_B2').multiply(0.2021))
                        .add(image.select('SR_B3').multiply(0.3102))
                        .add(image.select('SR_B4').multiply(0.1594))
                        .add(image.select('SR_B5').multiply(-0.6806))
                        .add(image.select('SR_B7').multiply(-0.6109)))
                brightness = (image.select('SR_B1').multiply(0.2043)
                            .add(image.select('SR_B2').multiply(0.4158))
                            .add(image.select('SR_B3').multiply(0.5524))
                            .add(image.select('SR_B4').multiply(0.5741))
                            .add(image.select('SR_B5').multiply(0.3124))
                            .add(image.select('SR_B7').multiply(0.2303)))
            
            dryness = brightness.subtract(wetness)
            
            # Get MODIS LST for heat (available from 2000)
            if year >= 2000:
                lst_collection = (ee.ImageCollection('MODIS/061/MOD11A1')
                                .filterBounds(polygon)
                                .filterDate(start_date, end_date)
                                .select('LST_Day_1km'))
                
                if lst_collection.size().getInfo() > 0:
                    heat = lst_collection.mean().multiply(0.02)
                else:
                    heat = ee.Image.constant(298)
            else:
                heat = ee.Image.constant(298)
            
            return {
                'ndvi_url': ndvi.getThumbURL({
                    'region': polygon, 'dimensions': '800x600', 'format': 'png',
                    'palette': ['red', 'yellow', 'green'], 'min': -1, 'max': 1
                }),
                'wetness_url': wetness.getThumbURL({
                    'region': polygon, 'dimensions': '800x600', 'format': 'png',
                    'palette': ['brown', 'yellow', 'blue'], 'min': -2000, 'max': 2000
                }),
                'dryness_url': dryness.getThumbURL({
                    'region': polygon, 'dimensions': '800x600', 'format': 'png',
                    'palette': ['blue', 'yellow', 'red'], 'min': -2000, 'max': 4000
                }),
                'heat_url': heat.getThumbURL({
                    'region': polygon, 'dimensions': '800x600', 'format': 'png',
                    'palette': ['blue', 'cyan', 'yellow', 'red'], 'min': 250, 'max': 350
                })
            }
            
        except Exception as e:
            logger.error(f"Error generating multi-index images for year {year}: {e}")
            return {"ndvi_url": "", "wetness_url": "", "dryness_url": "", "heat_url": ""}

    @staticmethod
    def _create_time_series_animation(coordinates: List[List[float]], years: List[int]) -> str:
        """Create animation GIF showing time series changes"""
        try:
            polygon = ee.Geometry.Polygon(coordinates)
            
            # Create image collection for animation
            image_list = []
            
            for year in years:
                start_date = f'{year}-01-01'
                end_date = f'{year}-12-31'
                
                # Get best available image for the year
                if year >= 2013:
                    collection = (ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
                                .filterBounds(polygon)
                                .filterDate(start_date, end_date)
                                .filter(ee.Filter.lt('CLOUD_COVER', 50)))
                    bands = ['SR_B4', 'SR_B3', 'SR_B2']
                elif year >= 1999:
                    collection = (ee.ImageCollection('LANDSAT/LE07/C02/T1_L2')
                                .filterBounds(polygon)
                                .filterDate(start_date, end_date)
                                .filter(ee.Filter.lt('CLOUD_COVER', 50)))
                    bands = ['SR_B3', 'SR_B2', 'SR_B1']
                else:
                    collection = (ee.ImageCollection('LANDSAT/LT05/C02/T1_L2')
                                .filterBounds(polygon)
                                .filterDate(start_date, end_date)
                                .filter(ee.Filter.lt('CLOUD_COVER', 50)))
                    bands = ['SR_B3', 'SR_B2', 'SR_B1']
                
                if collection.size().getInfo() > 0:
                    image = collection.median().select(bands).multiply(0.0000275).add(-0.2)
                    # Add year as property for animation
                    image = image.set('year', year)
                    image_list.append(image)
                else:
                    # Try with higher cloud cover
                    if year >= 2013:
                        collection = (ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
                                    .filterBounds(polygon)
                                    .filterDate(start_date, end_date)
                                    .filter(ee.Filter.lt('CLOUD_COVER', 80)))
                    elif year >= 1999:
                        collection = (ee.ImageCollection('LANDSAT/LE07/C02/T1_L2')
                                    .filterBounds(polygon)
                                    .filterDate(start_date, end_date)
                                    .filter(ee.Filter.lt('CLOUD_COVER', 80)))
                    else:
                        collection = (ee.ImageCollection('LANDSAT/LT05/C02/T1_L2')
                                    .filterBounds(polygon)
                                    .filterDate(start_date, end_date)
                                    .filter(ee.Filter.lt('CLOUD_COVER', 80)))
                    
                    if collection.size().getInfo() > 0:
                        image = collection.median().select(bands).multiply(0.0000275).add(-0.2)
                        image = image.set('year', year)
                        image_list.append(image)
            
            if not image_list:
                return ""
            
            # Create image collection from list
            time_series_collection = ee.ImageCollection.fromImages(image_list)
            
            # Generate animation URL
            animation_url = time_series_collection.getVideoThumbURL({
                'region': polygon,
                'dimensions': 512,
                'format': 'gif',
                'min': 0,
                'max': 0.25,
                'framesPerSecond': 1
            })
            
            return animation_url
            
        except Exception as e:
            logger.error(f"Error creating time series animation: {e}")
            return ""
    
    @staticmethod
    def _analyze_trends(yearly_data: List[YearlyEnvironmentalData]) -> Dict[str, Any]:
        """Analyze trends in environmental indicators"""
        try:
            if len(yearly_data) < 2:
                return {}
            
            # Extract values for trend analysis
            years = [data.year for data in yearly_data]
            green_percentages = [(data.green_area / data.total_area) * 100 for data in yearly_data]
            water_percentages = [(data.water_area / data.total_area) * 100 for data in yearly_data]
            ndvi_values = [data.mean_ndvi for data in yearly_data]
            lst_values = [data.land_surface_temperature for data in yearly_data]
            env_scores = [data.environmental_score for data in yearly_data]
            
            # Simple trend calculation (positive/negative/stable)
            def calculate_trend(values):
                if len(values) < 2:
                    return "insufficient_data"
                
                first_half = sum(values[:len(values)//2]) / (len(values)//2)
                second_half = sum(values[len(values)//2:]) / (len(values) - len(values)//2)
                
                change = ((second_half - first_half) / first_half) * 100
                
                if change > 5:
                    return "increasing"
                elif change < -5:
                    return "decreasing"
                else:
                    return "stable"
            
            return {
                "green_area_trend": calculate_trend(green_percentages),
                "water_area_trend": calculate_trend(water_percentages),
                "vegetation_health_trend": calculate_trend(ndvi_values),
                "temperature_trend": calculate_trend(lst_values),
                "overall_environmental_trend": calculate_trend(env_scores),
                "analysis_period": f"{min(years)}-{max(years)}",
                "total_years_analyzed": len(years)
            }
            
        except Exception as e:
            logger.error(f"Error analyzing trends: {e}")
            return {}
    
    @staticmethod
    def _get_default_indicators(total_area: float) -> Dict[str, float]:
        """Return default indicators when no data is available"""
        return {
            'green_area': total_area * 0.3,
            'total_area': total_area,
            'water_area': total_area * 0.05,
            'air_quality_aod': 0.3,
            'land_surface_temperature': 25.0,
            'mean_ndvi': 0.3,
            'tasseled_cap_wetness': 0.0,
            'mean_lst_for_eqi': 25.0,
            'ndbsi': 0.3,
            'pm25': 20.0
        }