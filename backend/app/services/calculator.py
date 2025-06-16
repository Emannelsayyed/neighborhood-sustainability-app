import math
from typing import Tuple, List
from app.models.sustainability import (
    SustainabilityInput, SustainabilityResult, IndicatorResults, 
    NormalizedResults, IndicatorDefinition
)

class SustainabilityCalculator:
    """Calculator for neighborhood sustainability index"""
    
    # Normalization thresholds
    THRESHOLDS = {
        # Environmental thresholds
        'gpa_max': 40,  # 40% green area as benchmark
        'wpa_max': 10,  # 10% water area as benchmark
        'aq_max': 1.0,   # AOD of 1.0 as high pollution threshold
        'lst_min': 15,   # 15°C as minimum LST
        'lst_max': 35,   # 35°C as maximum LST
        'ndvi_min': 0,   # NDVI minimum
        'ndvi_max': 1,   # NDVI maximum
        'wet_min': -0.5, # Wetness minimum
        'wet_max': 0.5,  # Wetness maximum
        'ndbsi_min': 0,  # NDBSI minimum
        'ndbsi_max': 1,  # NDBSI maximum
        'pm25_max': 100, # PM2.5 maximum (µg/m³)
        'pc1_min': -1,   # PC1 minimum (assumed)
        'pc1_max': 1,    # PC1 maximum (assumed)
        
        # Social thresholds
        'cr_max': 100,   # 100 crimes per 1000 as high threshold
        'travel_time_max': 30,  # 30 minutes as maximum acceptable travel time
        'w_max': 140,    # 140 intersections per sq mile
        
        # Economic thresholds
        'mhi_max': 100000,  # $100,000 as high income benchmark
        'ur_max': 30,      # 100% unemployment as maximum
    }
        
    # Weights for final aggregation
    WEIGHTS = {
        'environmental': {
            'gpa': 0.08,  # 8%
            'wpa': 0.06,  # 6%
            'aq': 0.08,   # 8%
            'lst': 0.06,  # 6%
            'eqi': 0.12   # 12%
        },
        'social': 0.30,     # 30% total, divided equally among 8 indicators
        'economic': 0.30    # 30% total, divided equally among 3 indicators
    }
    
    @staticmethod
    def calculate_indicators(data: SustainabilityInput) -> IndicatorResults:
        """Calculate raw indicators from input data"""
        env = data.environmental
        soc = data.social
        eco = data.economic
        
        # Environmental indicators
        # 1. Green Percentage Area (GPA)
        gpa = (env.green_area / env.total_area) * 100
        
        # 2. Water Percentage Area (WPA)
        wpa = (env.water_area / env.total_area) * 100
        
        # 3. Air Quality (AQ) - using AOD directly
        aq = env.air_quality_aod
        
        # 4. Land Surface Temperature (LST)
        lst = env.land_surface_temperature
        
        # 5. Ecological Quality Index (EQI) - PCA calculation
        # Normalize components first
        ndvi_norm = (env.mean_ndvi - SustainabilityCalculator.THRESHOLDS['ndvi_min']) / \
                   (SustainabilityCalculator.THRESHOLDS['ndvi_max'] - SustainabilityCalculator.THRESHOLDS['ndvi_min'])
        
        wet_norm = (env.tasseled_cap_wetness - SustainabilityCalculator.THRESHOLDS['wet_min']) / \
                  (SustainabilityCalculator.THRESHOLDS['wet_max'] - SustainabilityCalculator.THRESHOLDS['wet_min'])
        
        heat_norm = 1 - (env.mean_lst_for_eqi - SustainabilityCalculator.THRESHOLDS['lst_min']) / \
                   (SustainabilityCalculator.THRESHOLDS['lst_max'] - SustainabilityCalculator.THRESHOLDS['lst_min'])
        
        ndbsi_norm = 1 - (env.ndbsi - SustainabilityCalculator.THRESHOLDS['ndbsi_min']) / \
                    (SustainabilityCalculator.THRESHOLDS['ndbsi_max'] - SustainabilityCalculator.THRESHOLDS['ndbsi_min'])
        
        pm25_norm = 1 - (env.pm25 / SustainabilityCalculator.THRESHOLDS['pm25_max'])
        
        # Simple PCA simulation - using weighted average with assumed loadings
        # In practice, you would perform actual PCA
        pca_loadings = [0.4, 0.3, 0.2, 0.1, 0.1]  # Example loadings
        pc1 = (pca_loadings[0] * ndvi_norm + 
               pca_loadings[1] * wet_norm + 
               pca_loadings[2] * heat_norm + 
               pca_loadings[3] * ndbsi_norm + 
               pca_loadings[4] * pm25_norm)
        
        # Normalize PC1 to get EQI
        eqi = (pc1 - SustainabilityCalculator.THRESHOLDS['pc1_min']) / \
              (SustainabilityCalculator.THRESHOLDS['pc1_max'] - SustainabilityCalculator.THRESHOLDS['pc1_min'])
        eqi = max(0, min(1, eqi))  # Keep as 0-1 normalized value
        
        # Social indicators
        cr = (soc.total_crimes / soc.total_population) * 1000
        el = (soc.adults_with_degree / soc.total_adult_population) * 100
        
        # Access indicators now use travel time (lower is better)
        apt = soc.avg_time_to_transit
        as_score = soc.avg_time_to_schools
        ah = soc.avg_time_to_hospitals
        af = soc.avg_time_to_fire_stations
        ap = soc.avg_time_to_police
        
        # Walkability remains the same
        total_sq_miles = env.total_area * 3.861e-7
        w = soc.street_intersections / total_sq_miles if total_sq_miles > 0 else 0
        
        # Economic indicators (unchanged)
        mhi = eco.median_household_income
        ur = (eco.unemployed_count / eco.labor_force) * 100
        ha = (eco.affordable_housing_units / eco.total_housing_units) * 100
        
        return IndicatorResults(
            green_percentage_area=gpa,
            water_percentage_area=wpa,
            air_quality=aq,
            land_surface_temperature=lst,
            ecological_quality_index=eqi,
            crime_rate=cr,
            education_level=el,
            access_to_transit=apt,
            access_to_schools=as_score,
            access_to_hospitals=ah,
            access_to_fire_stations=af,
            access_to_police=ap,
            walkability=w,
            median_household_income=mhi,
            unemployment_rate=ur,
            housing_affordability=ha
        )
    
    @staticmethod
    def normalize_indicators(indicators: IndicatorResults) -> NormalizedResults:
        """Normalize indicators to 0-1 scale"""
        
        # Environmental indicators (higher is better except AQ and LST)
        gpa_norm = min(1.0, indicators.green_percentage_area / SustainabilityCalculator.THRESHOLDS['gpa_max'])
        wpa_norm = min(1.0, indicators.water_percentage_area / SustainabilityCalculator.THRESHOLDS['wpa_max'])
        aq_norm = max(0.0, 1.0 - indicators.air_quality / SustainabilityCalculator.THRESHOLDS['aq_max'])
        lst_norm = max(0.0, 1.0 - (indicators.land_surface_temperature - SustainabilityCalculator.THRESHOLDS['lst_min']) / 
                      (SustainabilityCalculator.THRESHOLDS['lst_max'] - SustainabilityCalculator.THRESHOLDS['lst_min']))
        eqi_norm = indicators.ecological_quality_index  # Already normalized 0-1
        
        # Social indicators
        cr_norm = max(0.0, 1.0 - indicators.crime_rate / SustainabilityCalculator.THRESHOLDS['cr_max'])
        el_norm = indicators.education_level / 100
        
        # Access indicators - travel time (lower is better)
        apt_norm = max(0.0, 1.0 - indicators.access_to_transit / SustainabilityCalculator.THRESHOLDS['travel_time_max'])
        as_norm = max(0.0, 1.0 - indicators.access_to_schools / SustainabilityCalculator.THRESHOLDS['travel_time_max'])
        ah_norm = max(0.0, 1.0 - indicators.access_to_hospitals / SustainabilityCalculator.THRESHOLDS['travel_time_max'])
        af_norm = max(0.0, 1.0 - indicators.access_to_fire_stations / SustainabilityCalculator.THRESHOLDS['travel_time_max'])
        ap_norm = max(0.0, 1.0 - indicators.access_to_police / SustainabilityCalculator.THRESHOLDS['travel_time_max'])
        
        w_norm = min(1.0, indicators.walkability / SustainabilityCalculator.THRESHOLDS['w_max'])
        
        # Economic indicators
        mhi_norm = min(1.0, indicators.median_household_income / SustainabilityCalculator.THRESHOLDS['mhi_max'])
        ur_norm = max(0.0, 1.0 - indicators.unemployment_rate / SustainabilityCalculator.THRESHOLDS['ur_max'])
        ha_norm = indicators.housing_affordability / 100
        
        return NormalizedResults(
            gpa_normalized=gpa_norm,
            wpa_normalized=wpa_norm,
            aq_normalized=aq_norm,
            lst_normalized=lst_norm,
            eqi_normalized=eqi_norm,
            cr_normalized=cr_norm,
            el_normalized=el_norm,
            apt_normalized=apt_norm,
            as_normalized=as_norm,
            ah_normalized=ah_norm,
            af_normalized=af_norm,
            ap_normalized=ap_norm,
            w_normalized=w_norm,
            mhi_normalized=mhi_norm,
            ur_normalized=ur_norm,
            ha_normalized=ha_norm
        )
    
    @staticmethod
    def calculate_category_scores(normalized: NormalizedResults) -> Tuple[float, float, float]:
        """Calculate category scores (0-100) using proper weighting within categories"""
        
        # Environmental score using relative weights within the 40% category
        # Total env weights: 8+6+8+6+12 = 40, so divide each by 0.40 to get relative weights
        env_score = (
            (0.08/0.40) * normalized.gpa_normalized +
            (0.06/0.40) * normalized.wpa_normalized +
            (0.08/0.40) * normalized.aq_normalized +
            (0.06/0.40) * normalized.lst_normalized +
            (0.12/0.40) * normalized.eqi_normalized
        ) * 100
        
        # Social score (equal weights for 8 indicators)
        soc_score = (
            normalized.cr_normalized + 
            normalized.el_normalized + 
            normalized.apt_normalized + 
            normalized.as_normalized + 
            normalized.ah_normalized + 
            normalized.af_normalized + 
            normalized.ap_normalized +
            normalized.w_normalized 

        ) / 8 * 100
        
        # Economic score (equal weights for 3 indicators)
        eco_score = (
            normalized.mhi_normalized + 
            normalized.ur_normalized + 
            normalized.ha_normalized
        ) / 3 * 100
        
        return env_score, soc_score, eco_score
    
    @staticmethod
    def calculate_final_index(env_score: float, soc_score: float, eco_score: float) -> float:
        """Calculate weighted final sustainability index"""
        return (
            0.40 * env_score +  # Environmental: 40%
            0.30 * soc_score +  # Social: 30%
            0.30 * eco_score    # Economic: 30%
        )
    
    @staticmethod
    def get_grade_and_interpretation(index: float) -> Tuple[str, str]:
        """Get letter grade and interpretation based on index score"""
        if index >= 80:
            return "A", "Excellent sustainability - this neighborhood demonstrates outstanding environmental, social, and economic performance."
        elif index >= 70:
            return "B", "Good sustainability - this neighborhood shows strong performance with room for targeted improvements."
        elif index >= 60:
            return "C", "Fair sustainability - this neighborhood has moderate performance with several areas needing attention."
        elif index >= 50:
            return "D", "Poor sustainability - this neighborhood faces significant challenges across multiple indicators."
        else:
            return "F", "Very poor sustainability - this neighborhood requires comprehensive improvements across all categories."
    
    @classmethod
    def calculate_sustainability_index(cls, data: SustainabilityInput) -> SustainabilityResult:
        """Main method to calculate complete sustainability index"""
        
        # Calculate raw indicators
        indicators = cls.calculate_indicators(data)
        
        # Normalize indicators
        normalized = cls.normalize_indicators(indicators)
        
        # Calculate category scores
        env_score, soc_score, eco_score = cls.calculate_category_scores(normalized)
        
        # Calculate final index
        final_index = cls.calculate_final_index(env_score, soc_score, eco_score)
        
        # Get grade and interpretation
        grade, interpretation = cls.get_grade_and_interpretation(final_index)
        
        return SustainabilityResult(
            indicators=indicators,
            normalized=normalized,
            environmental_score=round(env_score, 2),
            social_score=round(soc_score, 2),
            economic_score=round(eco_score, 2),
            sustainability_index=round(final_index, 2),
            grade=grade,
            interpretation=interpretation
        )
    
    @staticmethod
    def get_indicator_definitions() -> List[IndicatorDefinition]:
        """Get definitions of all indicators"""
        return [
            # Environmental indicators
            IndicatorDefinition(
                name="Green Percentage Area (GPA)",
                description="Measures the extent of vegetated areas, crucial for carbon sequestration, habitat provision, and urban cooling",
                calculation="(Area with NDVI > 0.2 / Total area) × 100",
                category="Environmental",
                weight=8.0,
                threshold=40.0
            ),
            IndicatorDefinition(
                name="Water Percentage Area (WPA)",
                description="Indicates the presence of water bodies, important for biodiversity, climate regulation, and recreational opportunities",
                calculation="(Area with MNDWI > 0 / Total area) × 100",
                category="Environmental",
                weight=6.0,
                threshold=10.0
            ),
            IndicatorDefinition(
                name="Air Quality (AQ)",
                description="Assesses air pollution levels using Aerosol Optical Depth (AOD), impacting public health and environmental quality",
                calculation="Annual average AOD over the last 12 months from Sentinel-5P TROPOMI",
                category="Environmental",
                weight=8.0,
                threshold=1.0
            ),
            IndicatorDefinition(
                name="Land Surface Temperature (LST)",
                description="Reflects thermal conditions, indicating urban heat island effects and energy consumption patterns",
                calculation="Annual average LST over the last 12 months from MODIS",
                category="Environmental",
                weight=6.0,
                threshold=35.0
            ),
            IndicatorDefinition(
                name="Ecological Quality Index (EQI)",
                description="A composite index capturing multiple aspects of ecological quality through Principal Component Analysis (PCA) of NDVI, Tasseled Cap Wetness, LST, NDBSI, and PM2.5",
                calculation="First principal component (PC1) from PCA of normalized components: NDVI, Wetness, Heat, Dryness, and Air Quality",
                category="Environmental",
                weight=12.0,
                threshold=1
            ),
            # EQI Components
            IndicatorDefinition(
                name="Greenness (NDVI)",
                description="Mean Normalized Difference Vegetation Index reflecting vegetation density and health",
                calculation="Mean NDVI normalized as (NDVI - min_NDVI) / (max_NDVI - min_NDVI) where min=0, max=1",
                category="Environmental",
                weight=0.0,  # Part of EQI composite
            ),
            IndicatorDefinition(
                name="Wetness (Tasseled Cap)",
                description="Tasseled Cap Wetness component indicating soil and vegetation moisture content",
                calculation="Wetness normalized as (WET - min_WET) / (max_WET - min_WET) where min=-0.5, max=0.5",
                category="Environmental",
                weight=0.0,  # Part of EQI composite
            ),
            IndicatorDefinition(
                name="Heat (LST for EQI)",
                description="Mean Land Surface Temperature component for ecological quality assessment",
                calculation="Heat normalized as 1 - (LST - min_LST) / (max_LST - min_LST) where min=15°C, max=35°C",
                category="Environmental",
                weight=0.0,  # Part of EQI composite
            ),
            IndicatorDefinition(
                name="Dryness (NDBSI)",
                description="Normalized Difference Bare Soil Index indicating soil dryness and bare land coverage",
                calculation="Dryness normalized as 1 - (NDBSI - min_NDBSI) / (max_NDBSI - min_NDBSI) where min=0, max=1",
                category="Environmental",
                weight=0.0,  # Part of EQI composite
            ),
            IndicatorDefinition(
                name="Air Quality (PM2.5)",
                description="Annual average PM2.5 concentrations from global datasets affecting ecological and human health",
                calculation="PM2.5 normalized as 1 - (PM2.5 / max_PM2.5) where max=100 µg/m³",
                category="Environmental",
                weight=0.0,  # Part of EQI composite
            ),
            # Social indicators
            IndicatorDefinition(
                name="Crime Rate (CR)",
                description="Indicates safety and social cohesion",
                calculation="(Number of crimes / Total population) × 1000",
                category="Social",
                weight=3.75,
                threshold=100.0
            ),
            IndicatorDefinition(
                name="Education Level (EL)",
                description="Reflects human capital and educational attainment",
                calculation="(Number with bachelor's degree or higher / Total adult population) × 100",
                category="Social",
                weight=3.75,
            ),
            IndicatorDefinition(
                name="Access to Public Transportation (APT)",
                description="Measures average travel time to the closest transit stop, reflecting mobility and reduced vehicle use",
                calculation="Average travel time (in minutes) to the closest transit stop for all residents",
                category="Social",
                weight=3.75,
                threshold=30.0
            ),
            IndicatorDefinition(
                name="Access to Schools (AS)",
                description="Measures average travel time to the closest school, reflecting educational accessibility",
                calculation="Average travel time (in minutes) to the closest school for all residents",
                category="Social",
                weight=3.75,
                threshold=30.0
            ),
            IndicatorDefinition(
                name="Access to Hospitals (AH)",
                description="Measures average travel time to the closest hospital, reflecting healthcare accessibility",
                calculation="Average travel time (in minutes) to the closest hospital for all residents",
                category="Social",
                weight=3.75,
                threshold=30.0
            ),
            IndicatorDefinition(
                name="Access to Fire Stations (AF)",
                description="Measures average travel time to the closest fire station, reflecting emergency service accessibility",
                calculation="Average travel time (in minutes) to the closest fire station for all residents",
                category="Social",
                weight=3.75,
                threshold=30.0
            ),
            IndicatorDefinition(
                name="Access to Police Stations (APS)",
                description="Measures average travel time to the nearest police station, enhancing safety",
                calculation="Average travel time (in minutes) to the nearest police station for all residents",
                category="Social",
                weight=3.75,
                threshold=30.0
            ),
            IndicatorDefinition(
                name="Walkability (W)",
                description="Reflects pedestrian-friendly design",
                calculation="Number of intersections / Total area (square miles)",
                category="Social",
                weight=3.75,
                threshold=140.0
            ),
            # Economic indicators
            IndicatorDefinition(
                name="Median Household Income (MHI)",
                description="Indicates economic prosperity",
                calculation="Direct value from census data",
                category="Economic",
                weight=10.0,
                threshold=100000.0
            ),
            IndicatorDefinition(
                name="Unemployment Rate (UR)",
                description="Reflects economic stability",
                calculation="(Number unemployed / Labor force) × 100",
                category="Economic",
                weight=10.0,
                threshold=30.0
            ),
            IndicatorDefinition(
                name="Housing Affordability (HA)",
                description="Measures access to affordable housing",
                calculation="(Affordable housing units / Total housing units) × 100",
                category="Economic",
                weight=10.0,
            )
        ]