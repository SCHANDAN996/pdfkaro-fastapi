from pydantic_settings import BaseSettings
from typing import List
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings(BaseSettings):
    """
    Application settings management using Pydantic BaseSettings
    Automatically loads environment variables from .env file
    """
    # Application Settings
    PROJECT_NAME: str = "PDFkaro.in"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = False
    
    # Server Settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # CORS Settings (Cross-Origin Resource Sharing)
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "https://pdfkaro.in",
        "https://www.pdfkaro.in",
        "https://pdfkaro-frontend.onrender.com",
        "https://*.onrender.com"
    ]

    # AWS S3 Settings for file storage
    AWS_ACCESS_KEY_ID: str = os.getenv("AWS_ACCESS_KEY_ID", "")
    AWS_SECRET_ACCESS_KEY: str = os.getenv("AWS_SECRET_ACCESS_KEY", "")
    AWS_REGION: str = os.getenv("AWS_REGION", "ap-south-1")
    S3_BUCKET_NAME: str = os.getenv("S3_BUCKET_NAME", "pdfkaro-bucket")
    
    # File Upload Settings
    MAX_FILE_SIZE: int = 50 * 1024 * 1024  # 50MB
    ALLOWED_FILE_TYPES: List[str] = ["application/pdf"]
    
    # Database Settings (Future use)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./pdfkaro.db")

    class Config:
        case_sensitive = True
        env_file = ".env"
        env_file_encoding = "utf-8"

# Create settings instance
settings = Settings()
