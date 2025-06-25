#app/routers/timeseries.py

from fastapi import APIRouter, HTTPException
from app.models.sustainability import TimeSeriesInput, TimeSeriesResult
from app.services.timeseries import TimeSeriesService
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/analyze", response_model=TimeSeriesResult)
async def analyze_time_series(data: TimeSeriesInput):
    """
    Analyze environmental changes over time for a given polygon area.
    
    This endpoint:
    1. Takes polygon coordinates and list of years
    2. Extracts environmental indicators for each year
    3. Calculates environmental scores for each year
    4. Generates satellite images for each year
    5. Creates an animation showing changes over time
    """
    try:
        result = await TimeSeriesService.analyze_time_series(data)
        return result
        
    except Exception as e:
        logger.error(f"Time series analysis error: {e}")
        raise HTTPException(status_code=400, detail=f"Time series analysis error: {str(e)}")

@router.get("/available-years")
async def get_available_years():
    """
    Get the range of years available for time series analysis.
    """
    return {
        "start_year": 2000,
        "end_year": 2024,
        "note": "Data availability may vary by location and satellite mission"
    }