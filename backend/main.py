from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import pikepdf
import io

app = FastAPI()

# --- यहाँ पर सुधार किया गया है ---
# Origins ki list yahan daalein. "*" ka matlab hai sabhi ko allow karna.
origins = [
    "*",  
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# --- सुधार समाप्त ---


@app.get("/")
def read_root():
    return {"message": "PDFkaro.in Backend is running!"}


@app.post("/api/v1/merge")
async def merge_pdfs(files: List[UploadFile] = File(...)):
    if len(files) < 2:
        return {"error": "Please upload at least two PDF files to merge."}

    output_pdf = pikepdf.Pdf.new()

    for file in files:
        try:
            # incoming file ko memory me read karein
            pdf_data = await file.read()
            src_pdf = pikepdf.Pdf.open(io.BytesIO(pdf_data))
            output_pdf.pages.extend(src_pdf.pages)
        except Exception as e:
            return {"error": f"Error processing file {file.filename}: {str(e)}"}
        finally:
            await file.close()
    
    # Merged PDF ko memory me save karein
    output_buffer = io.BytesIO()
    output_pdf.save(output_buffer)
    output_buffer.seek(0)

    # Abhi ke liye success message bhej rahe hain
    # Baad me yahan se file download karne ka logic add karenge
    return {"message": f"Successfully merged {len(files)} PDF files."}

# Split ka logic baad me add karenge
# @app.post("/api/v1/split")
# async def split_pdf(file: UploadFile = File(...)):
#     return {"message": "Split logic will be here."}

