import io
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import pikepdf
from typing import List
import logging

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI(title="PDFkaro.in Backend")

# --- CORS Configuration ---
# Allow all origins for now to ensure connectivity.
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
    logger.info("Root endpoint was hit.")
    return {"message": "PDFkaro.in Backend is running!"}

@app.post("/api/v1/merge")
async def merge_pdfs(files: List[UploadFile] = File(...)):
    logger.info(f"Received {len(files)} files for merging.")
    try:
        merged_pdf = pikepdf.Pdf.new()

        for file in files:
            logger.info(f"Processing file: {file.filename}")
            pdf_bytes = await file.read()
            
            # Use a try-except block for each PDF to handle corrupted files
            try:
                src_pdf = pikepdf.Pdf.open(io.BytesIO(pdf_bytes))
                merged_pdf.pages.extend(src_pdf.pages)
            except Exception as individual_file_error:
                logger.error(f"Could not process file {file.filename}: {individual_file_error}")
                # Optionally, you can skip corrupted files or raise an error
                # For now, we will skip it.
                
        output_buffer = io.BytesIO()
        merged_pdf.save(output_buffer)
        output_buffer.seek(0)
        logger.info("PDFs merged successfully. Sending response.")

        return StreamingResponse(
            output_buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=merged_document.pdf"}
        )
    except Exception as e:
        logger.error(f"An unexpected error occurred during merging: {e}")
        raise HTTPException(status_code=500, detail="An internal server error occurred.")

