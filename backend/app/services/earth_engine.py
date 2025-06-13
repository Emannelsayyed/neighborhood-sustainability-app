# app/services/earth_engine.py
import ee
import json
from typing import Dict, Any, Optional
from app.core.config import settings
import logging
from math import cos, radians

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
    
   

