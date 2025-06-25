from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import sustainability, geographic, timeseries
from app.core.config import settings
import sys

app = FastAPI(
    title="Neighborhood Sustainability Index API",
    description="API for calculating neighborhood sustainability scores based on environmental, social, and economic indicators with geographic analysis",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(sustainability.router, prefix="/api/sustainability", tags=["sustainability"])
app.include_router(geographic.router, prefix="/api/geographic", tags=["geographic"])
app.include_router(timeseries.router, prefix="/api/timeseries", tags=["timeseries"])

@app.get("/")
async def root():
    return {
        "message": "Neighborhood Sustainability Index API with Geographic Analysis", 
        "version": "1.0.0",
        "features": ["sustainability_calculation", "geographic_analysis", "satellite_data", "time_series_analysis"],
        "python_version": f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy", 
        "message": "API is running properly",
        "services": {
            "sustainability_calculator": "available",
            "geographic_analysis": "available",
            "earth_engine": "check /api/geographic/gee-status"
        },
        "python_version": f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
    }