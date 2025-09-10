import io
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from PyPDF2 import PdfMerger
from typing import List

# FastAPI application instance
app = FastAPI(title="PDF Karo API")

# CORS (Cross-Origin Resource Sharing) middleware
# Yeh zaroori hai taaki aapka frontend (website) is backend se baat kar sake.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Aap yahan apne domain ka naam daal sakte hain jaise ["https://pdfkaro.in"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    """
    Root endpoint to check if the API is running.
    """
    return {"message": "Welcome to PDF Karo API!"}

@app.get("/health")
def health_check():
    """
    Health check endpoint for Render to monitor the service.
    """
    return {"status": "ok"}

@app.post("/api/merge")
async def merge_pdfs(files: List[UploadFile] = File(...)):
    """
    Endpoint to merge multiple PDF files.
    Receives a list of uploaded PDF files and returns a single merged PDF.
    """
    merger = PdfMerger()

    for file in files:
        # Read uploaded file into a BytesIO object
        pdf_stream = io.BytesIO(await file.read())
        merger.append(pdf_stream)
        pdf_stream.close()

    # Create an in-memory BytesIO stream for the merged PDF
    merged_pdf_stream = io.BytesIO()
    merger.write(merged_pdf_stream)
    merger.close()

    # Move the cursor to the beginning of the stream
    merged_pdf_stream.seek(0)

    # Return the merged PDF as a downloadable file
    return StreamingResponse(
        merged_pdf_stream,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=merged.pdf"}
    )

# Note: Uvicorn will be used to run this app from the Render Start Command.
# You do not need to add the uvicorn.run() call here.
