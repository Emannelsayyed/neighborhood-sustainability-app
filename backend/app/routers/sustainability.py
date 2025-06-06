from fastapi import APIRouter, HTTPException
from app.models.sustainability import SustainabilityInput, SustainabilityResult, IndicatorDefinition
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
                "green_space_area": 250000,  # 250,000 m²
                "total_area": 1000000,       # 1,000,000 m² (1 km²)
                "dwelling_units": 2470,      # 2,470 units
                "residential_area": 400000,  # 400,000 m²
                "commercial_area": 300000,   # 300,000 m²
                "industrial_area": 100000,   # 100,000 m²
                "impervious_surface_area": 300000  # 300,000 m²
            },
            "social": {
                "total_population": 10000,
                "total_crimes": 50,
                "adults_with_degree": 3000,
                "total_adult_population": 8000,
                "residents_near_transit": 8500,
                "residents_near_schools": 8000,
                "residents_near_hospitals": 9000,
                "residents_near_fire_stations": 9500,
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
                    "green_space_percentage": 12,
                    "average_residential_density": 8,
                    "land_use_diversity": 8,
                    "impervious_surface_percentage": 12
                },
                "social": {
                    "crime_rate": 4,
                    "education_level": 4,
                    "access_to_transit": 5,
                    "access_to_schools": 5,
                    "access_to_hospitals": 5,
                    "access_to_fire_stations": 3,
                    "walkability": 4
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