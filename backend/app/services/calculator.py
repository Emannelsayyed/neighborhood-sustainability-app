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
        'gsp_max': 50,  # 50% green space as benchmark
        'ard_max': 12,  # 12 dwelling units per acre
        'lud_max_types': 4,  # 4 land use types for max diversity
        'cr_max': 100,  # 100 crimes per 1000 as high threshold
        'w_max': 140,  # 140 intersections per sq mile
        'mhi_max': 100000,  # $100,000 as high income benchmark
        'ur_max': 20,  # 20% unemployment as high threshold
    }
    
    # Weights for final aggregation
    WEIGHTS = {
        'environmental': 0.40,
        'social': 0.30,
        'economic': 0.30
    }
    
    @staticmethod
    def calculate_indicators(data: SustainabilityInput) -> IndicatorResults:
        """Calculate raw indicators from input data"""
        env = data.environmental
        soc = data.social
        eco = data.economic
        
        # Environmental indicators
        gsp = (env.green_space_area / env.total_area) * 100
        
        # Convert area to acres for density calculation (1 m² = 0.000247105 acres)
        total_acres = env.total_area * 0.000247105
        ard = env.dwelling_units / total_acres if total_acres > 0 else 0
        
        # Land use diversity (Shannon Index)
        areas = [env.residential_area, env.commercial_area, env.industrial_area, env.green_space_area]
        total_developed = sum(areas)
        if total_developed > 0:
            proportions = [area / total_developed for area in areas if area > 0]
            lud = -sum(p * math.log(p) for p in proportions if p > 0)
        else:
            lud = 0
        
        isp = (env.impervious_surface_area / env.total_area) * 100
        
        # Social indicators
        cr = (soc.total_crimes / soc.total_population) * 1000
        el = (soc.adults_with_degree / soc.total_adult_population) * 100
        apt = (soc.residents_near_transit / soc.total_population) * 100
        as_score = (soc.residents_near_schools / soc.total_population) * 100
        ah = (soc.residents_near_hospitals / soc.total_population) * 100
        af = (soc.residents_near_fire_stations / soc.total_population) * 100
        
        # Convert area to square miles for walkability (1 m² = 3.861e-7 sq miles)
        total_sq_miles = env.total_area * 3.861e-7
        w = soc.street_intersections / total_sq_miles if total_sq_miles > 0 else 0
        
        # Economic indicators
        mhi = eco.median_household_income
        ur = (eco.unemployed_count / eco.labor_force) * 100
        ha = (eco.affordable_housing_units / eco.total_housing_units) * 100
        
        return IndicatorResults(
            green_space_percentage=gsp,
            average_residential_density=ard,
            land_use_diversity=lud,
            impervious_surface_percentage=isp,
            crime_rate=cr,
            education_level=el,
            access_to_transit=apt,
            access_to_schools=as_score,
            access_to_hospitals=ah,
            access_to_fire_stations=af,
            walkability=w,
            median_household_income=mhi,
            unemployment_rate=ur,
            housing_affordability=ha
        )
    
    @staticmethod
    def normalize_indicators(indicators: IndicatorResults) -> NormalizedResults:
        """Normalize indicators to 0-1 scale"""
        
        # Environmental (higher is better except ISP)
        gsp_norm = min(1.0, indicators.green_space_percentage / SustainabilityCalculator.THRESHOLDS['gsp_max'])
        ard_norm = min(1.0, indicators.average_residential_density / SustainabilityCalculator.THRESHOLDS['ard_max'])
        lud_norm = indicators.land_use_diversity / math.log(SustainabilityCalculator.THRESHOLDS['lud_max_types'])
        isp_norm = max(0.0, 1.0 - indicators.impervious_surface_percentage / 100)  # Lower is better
        
        # Social (higher is better except crime rate)
        cr_norm = max(0.0, 1.0 - indicators.crime_rate / SustainabilityCalculator.THRESHOLDS['cr_max'])  # Lower is better
        el_norm = indicators.education_level / 100
        apt_norm = indicators.access_to_transit / 100
        as_norm = indicators.access_to_schools / 100
        ah_norm = indicators.access_to_hospitals / 100
        af_norm = indicators.access_to_fire_stations / 100
        w_norm = min(1.0, indicators.walkability / SustainabilityCalculator.THRESHOLDS['w_max'])
        
        # Economic (higher is better except unemployment)
        mhi_norm = min(1.0, indicators.median_household_income / SustainabilityCalculator.THRESHOLDS['mhi_max'])
        ur_norm = max(0.0, 1.0 - indicators.unemployment_rate / SustainabilityCalculator.THRESHOLDS['ur_max'])  # Lower is better
        ha_norm = indicators.housing_affordability / 100
        
        return NormalizedResults(
            gsp_normalized=gsp_norm,
            ard_normalized=ard_norm,
            lud_normalized=lud_norm,
            isp_normalized=isp_norm,
            cr_normalized=cr_norm,
            el_normalized=el_norm,
            apt_normalized=apt_norm,
            as_normalized=as_norm,
            ah_normalized=ah_norm,
            af_normalized=af_norm,
            w_normalized=w_norm,
            mhi_normalized=mhi_norm,
            ur_normalized=ur_norm,
            ha_normalized=ha_norm
        )
    
    @staticmethod
    def calculate_category_scores(normalized: NormalizedResults) -> Tuple[float, float, float]:
        """Calculate category scores (0-100)"""
        
        # Environmental score (average of 4 indicators)
        env_score = (
            normalized.gsp_normalized + 
            normalized.ard_normalized + 
            normalized.lud_normalized + 
            normalized.isp_normalized
        ) / 4 * 100
        
        # Social score (average of 7 indicators)
        soc_score = (
            normalized.cr_normalized + 
            normalized.el_normalized + 
            normalized.apt_normalized + 
            normalized.as_normalized + 
            normalized.ah_normalized + 
            normalized.af_normalized + 
            normalized.w_normalized
        ) / 7 * 100
        
        # Economic score (average of 3 indicators)
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
            SustainabilityCalculator.WEIGHTS['environmental'] * env_score +
            SustainabilityCalculator.WEIGHTS['social'] * soc_score +
            SustainabilityCalculator.WEIGHTS['economic'] * eco_score
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
            # Environmental
            IndicatorDefinition(
                name="Green Space Percentage",
                description="Proportion of vegetated area indicating environmental health",
                calculation="(Green space area / Total area) × 100",
                category="Environmental",
                weight=12.0,
                threshold=50.0
            ),
            IndicatorDefinition(
                name="Average Residential Density",
                description="Dwelling units per acre reflecting compact development",
                calculation="Total dwelling units / Total area (acres)",
                category="Environmental",
                weight=8.0,
                threshold=12.0
            ),
            IndicatorDefinition(
                name="Land Use Diversity",
                description="Variety of land use types using Shannon Diversity Index",
                calculation="Shannon Index: -Σ(pi × ln(pi))",
                category="Environmental",
                weight=8.0,
                threshold=1.39
            ),
            IndicatorDefinition(
                name="Impervious Surface Percentage",
                description="Non-permeable surfaces affecting runoff and heat",
                calculation="(Impervious area / Total area) × 100",
                category="Environmental",
                weight=12.0
            ),
            # Social indicators...
            IndicatorDefinition(
                name="Crime Rate",
                description="Number of crimes per 1,000 residents",
                calculation="(Total crimes / Population) × 1000",
                category="Social",
                weight=4.0,
                threshold=100.0
            ),
            IndicatorDefinition(
                name="Education Level",
                description="Percentage with bachelor's degree or higher",
                calculation="(Adults with degree / Total adults) × 100",
                category="Social",
                weight=4.0
            ),
            IndicatorDefinition(
                name="Access to Transit",
                description="Percentage within 0.5 miles of public transit",
                calculation="(Residents near transit / Total population) × 100",
                category="Social",
                weight=5.0
            ),
            IndicatorDefinition(
                name="Access to Schools",
                description="Percentage within 0.5 miles of schools",
                calculation="(Residents near schools / Total population) × 100",
                category="Social",
                weight=5.0
            ),
            IndicatorDefinition(
                name="Access to Hospitals",
                description="Percentage within 1 mile of hospitals",
                calculation="(Residents near hospitals / Total population) × 100",
                category="Social",
                weight=5.0
            ),
            IndicatorDefinition(
                name="Access to Fire Stations",
                description="Percentage within 2 miles of fire stations",
                calculation="(Residents near fire stations / Total population) × 100",
                category="Social",
                weight=3.0
            ),
            IndicatorDefinition(
                name="Walkability",
                description="Street intersections per square mile",
                calculation="Street intersections / Total area (sq miles)",
                category="Social",
                weight=4.0,
                threshold=140.0
            ),
            # Economic indicators...
            IndicatorDefinition(
                name="Median Household Income",
                description="Median annual household income",
                calculation="Direct value from census data",
                category="Economic",
                weight=10.0,
                threshold=100000.0
            ),
            IndicatorDefinition(
                name="Unemployment Rate",
                description="Percentage of labor force unemployed",
                calculation="(Unemployed / Labor force) × 100",
                category="Economic",
                weight=10.0,
                threshold=20.0
            ),
            IndicatorDefinition(
                name="Housing Affordability",
                description="Percentage of affordable housing units",
                calculation="(Affordable units / Total units) × 100",
                category="Economic",
                weight=10.0
            )
        ]