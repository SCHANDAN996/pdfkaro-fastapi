import sys
from pathlib import Path

# Add the backend directory to Python path
current_dir = Path(__file__).parent
sys.path.append(str(current_dir))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.api_router import api_router

app = FastAPI(title="PDFkaro.in Backend")

origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "PDFkaro.in Backend is running!"}

app.include_router(api_router, prefix="/api/v1")
