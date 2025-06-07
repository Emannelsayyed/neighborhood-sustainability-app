#!/usr/bin/env python3
"""Test script to verify Earth Engine setup"""

import sys
import os

# Add the backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

import ee
from core.config import settings

def test_earth_engine():
    try:
        # Initialize Earth Engine with project
        if settings.GOOGLE_CLOUD_PROJECT:
            ee.Initialize(project=settings.GOOGLE_CLOUD_PROJECT)
        else:
            ee.Initialize()
        print("✅ Earth Engine initialized successfully")
        print(f"✅ Using project: {settings.GOOGLE_CLOUD_PROJECT}")
        
        # Test basic functionality with a current image collection
        collection = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
        first_image = collection.first()
        info = first_image.getInfo()
        print("✅ Successfully accessed Earth Engine data")
        
        # Test image collection
        collection = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED").limit(1)
        count = collection.size().getInfo()
        print(f"✅ Successfully accessed image collection (count: {count})")
        
        # Test our service
        print("\n🧪 Testing Earth Engine Service...")
        from services.earth_engine import earth_engine_service
        
        if earth_engine_service.initialized:
            print("✅ Earth Engine Service initialized successfully")
        else:
            print("❌ Earth Engine Service failed to initialize")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Earth Engine test failed: {e}")
        print()
        print("Troubleshooting steps:")
        print("1. Run: gcloud auth application-default login")
        print("2. Ensure Earth Engine API is enabled in Google Cloud Console")
        print("3. Check that you're registered for Earth Engine access")
        print("4. Verify your Google Cloud Project ID is correct")
        print(f"5. Current project ID: {settings.GOOGLE_CLOUD_PROJECT}")
        return False

if __name__ == "__main__":
    success = test_earth_engine()
    sys.exit(0 if success else 1)