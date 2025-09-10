from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    """
    एप्लिकेशन सेटिंग्स को प्रबंधित करने के लिए Pydantic BaseSettings का उपयोग करता है।
    यह.env फ़ाइल से स्वचालित रूप से पर्यावरण चर (environment variables) लोड करता है।
    """
    PROJECT_NAME: str = "PDFkaro.in"
    API_V1_STR: str = "/api/v1"
    
    # CORS (Cross-Origin Resource Sharing) सेटिंग्स
    # भविष्य में अपने लाइव फ्रंटएंड URL को यहाँ जोड़ें।
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    # AWS S3 सेटिंग्स
    AWS_ACCESS_KEY_ID: str
    AWS_SECRET_ACCESS_KEY: str
    AWS_REGION: str = "ap-south-1"  # अपनी पसंद का क्षेत्र चुनें
    S3_BUCKET_NAME: str

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()

# In your config.py
BACKEND_CORS_ORIGINS: List[str] = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://pdfkaro.in",
    "https://www.pdfkaro.in",
    "https://pdfkaro-frontend.onrender.com",
    "https://*.onrender.com"
]
