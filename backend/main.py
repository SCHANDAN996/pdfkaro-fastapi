from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.api_router import api_router

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

# मुख्य API राउटर को ऐप में शामिल करें
app.include_router(api_router, prefix="/api/v1")
