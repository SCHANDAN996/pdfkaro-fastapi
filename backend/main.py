from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import PyPDF2
import io
from typing import List

# FastAPI app banayein
app = FastAPI(title="PDFkaro.in API")

# CORS (Cross-Origin Resource Sharing) ko enable karein
# Taki hamara React app isse connect kar sake
# "*" ka matlab hai ki koi bhi website isse connect kar sakti hai
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "PDFkaro.in Backend is running!"}

# PDF Merge karne ke liye API endpoint
@app.post("/api/v1/merge")
async def merge_pdfs(files: List[UploadFile] = File(...)):
    merger = PyPDF2.PdfMerger()

    for file in files:
        pdf_content = await file.read()
        merger.append(io.BytesIO(pdf_content))
    
    output_buffer = io.BytesIO()
    merger.write(output_buffer)
    merger.close()
    
    output_buffer.seek(0)
    
    # Abhi ke liye hum sirf success message bhej rahe hain
    print(f"{len(files)} files merged successfully.")
    
    # Asli application me hum yahan se file wapas bhejenge
    return {"message": f"{len(files)} files successfully merged!"}

# PDF Split karne ke liye API endpoint
@app.post("/api/v1/split")
async def split_pdf(file: UploadFile = File(...)):
    # Asli PDF split karne ka logic yahan likha jayega
    print(f"File to split: {file.filename}")
    
    return {"message": f"Splitting logic for '{file.filename}' will be implemented here."}


