# app/routers/sustainability.py
from fastapi import APIRouter, HTTPException
from app.models.sustainability import (
    SustainabilityInput, 
    SustainabilityResult, 
    IndicatorDefinition, 
    GeographicSustainabilityInput, 
    EnvironmentalIndicators  
)
from app.services.geographic import GeographicService
from app.services.calculator import SustainabilityCalculator
from typing import List

router = APIRouter()

@router.post("/calculate", response_model=SustainabilityResult)
async def calculate_sustainability_index(data: SustainabilityInput):
    """
    Calculate the neighborhood sustainability index based on environmental, social, and economic indicators.
    
    Returns a comprehensive sustainability score from 0-100 with detailed breakdowns.
    """
    try:
        result = SustainabilityCalculator.calculate_sustainability_index(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Calculation error: {str(e)}")

@router.get("/indicators", response_model=List[IndicatorDefinition])
async def get_indicator_definitions():
    """
    Get definitions and descriptions of all sustainability indicators.
    
    Returns detailed information about each indicator including calculation methods and weights.
    """
    try:
        definitions = SustainabilityCalculator.get_indicator_definitions()
        return definitions
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving indicators: {str(e)}")

@router.get("/example")
async def get_example_input():
    """
    Get an example input for testing the sustainability calculator.
    
    Returns sample data that can be used to test the API.
    """
    try:
        example = {
            "environmental": {
                # Green Percentage Area
                "green_area": 250000,      # 250,000 m² with NDVI > 0.2
                "total_area": 1000000,     # 1,000,000 m² (1 km²)
                
                # Water Percentage Area
                "water_area": 50000,       # 50,000 m² with MNDWI > 0
                
                # Air Quality
                "air_quality_aod": 0.3,    # AOD from Sentinel-5P TROPOMI
                
                # Land Surface Temperature
                "land_surface_temperature": 25.0,  # 25°C from MODIS
                
                # EQI components
                "mean_ndvi": 0.5,          # Mean NDVI
                "tasseled_cap_wetness": 0.3,  # Tasseled Cap Wetness
                "mean_lst_for_eqi": 25.0,  # Mean LST for EQI
                "ndbsi": 0.4,              # NDBSI
                "pm25": 20.0               # PM2.5 concentration
            },
            "social": {
                "total_population": 10000,
                "total_crimes": 50,
                "adults_with_degree": 3000,
                "total_adult_population": 8000,
                "avg_time_to_transit": 5.0,        # 5 minutes average
                "avg_time_to_schools": 8.0,        # 8 minutes average
                "avg_time_to_hospitals": 12.0,     # 12 minutes average
                "avg_time_to_fire_stations": 6.0,  # 6 minutes average
                "avg_time_to_police": 10.0,        # 10 minutes average
                "street_intersections": 120
            },
            "economic": {
                "median_household_income": 50000,
                "unemployed_count": 500,
                "labor_force": 6000,
                "affordable_housing_units": 700,
                "total_housing_units": 1000
            }
        }
        return example
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating example: {str(e)}")

@router.get("/weights")
async def get_category_weights():
    """
    Get the weighting scheme used for calculating the final sustainability index.
    
    Returns the weights assigned to each category and indicator.
    """
    try:
        weights = {
            "category_weights": {
                "environmental": 40,  # 40%
                "social": 30,         # 30%
                "economic": 30        # 30%
            },
            "indicator_weights": {
                "environmental": {
                    "green_percentage_area": 8,    # 8%
                    "water_percentage_area": 6,    # 6%
                    "air_quality": 8,              # 8%
                    "land_surface_temperature": 6, # 6%
                    "ecological_quality_index": 12 # 12%
                },
                "social": {
                    "crime_rate": 3.75,
                    "education_level": 3.75,
                    "access_to_transit": 3.75,
                    "access_to_schools": 3.75,
                    "access_to_hospitals": 3.75,
                    "access_to_fire_stations": 3.75,
                    "access_to_police": 3.75,
                    "walkability": 3.75
                },
                "economic": {
                    "median_household_income": 10,
                    "unemployment_rate": 10,
                    "housing_affordability": 10
                }
            }
        }
        return weights
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving weights: {str(e)}")
    
@router.post("/calculate-geographic", response_model=SustainabilityResult)
async def calculate_sustainability_from_polygon(data: GeographicSustainabilityInput):
    """
    Calculate sustainability index using polygon coordinates for automatic environmental data extraction.
    
    This endpoint:
    1. Takes polygon coordinates and social/economic data
    2. Automatically extracts environmental indicators from satellite imagery
    3. Calculates the complete sustainability index
    """
    try:
        # Extract environmental indicators from satellite imagery
        env_indicators = GeographicService.extract_all_environmental_indicators(
            data.polygon.coordinates
        )
        
        # Create environmental indicators object
        environmental = EnvironmentalIndicators(**env_indicators)
        
        # Create complete sustainability input
        complete_input = SustainabilityInput(
            environmental=environmental,
            social=data.social,
            economic=data.economic
        )
        
        # Calculate sustainability index
        result = SustainabilityCalculator.calculate_sustainability_index(complete_input)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Calculation error: {str(e)}")