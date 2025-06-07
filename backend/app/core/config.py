from pydantic_settings import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "Neighborhood Sustainability Index API"
    VERSION: str = "1.0.0"
    
    # CORS Settings
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173", 
        "http://127.0.0.1:5173"
    ]
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Google Earth Engine Settings
    # For development, these can be None - EE will use application default credentials
    GEE_SERVICE_ACCOUNT_EMAIL: Optional[str] = None
    GEE_SERVICE_ACCOUNT_KEY: Optional[str] = None
    GEE_PROJECT_ID: Optional[str] = None
    
    # Your Google Cloud Project ID
    GOOGLE_CLOUD_PROJECT: str = "sustainability-index"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()