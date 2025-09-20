import io
import json
import zipfile
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import pikepdf
import docx
import os
import logging
from pydantic import BaseModel
from typing import List, Dict

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="PDFkaro.in Backend")

origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Models for Project Exporter
class FileData(BaseModel):
    path: str
    content: str

class ProcessRequest(BaseModel):
    files: List[FileData]
    output_format: str = "txt"
    include_paths: bool = True
    align_structure: bool = False

@app.get("/")
def read_root():
    return {"message": "PDFkaro.in Backend is running!"}

# --- PDF Tools ---

@app.post("/api/v1/merge")
async def merge_pdfs(files: List[UploadFile] = File(...), pages_data: str = Form(...)):
    # ... (Code is unchanged from original)
    logger.info(f"Received {len(files)} files for merging.")
    try:
        page_instructions = json.loads(pages_data)
        file_map = {file.filename: await file.read() for file in files}
        open_pdfs = {filename: pikepdf.Pdf.open(io.BytesIO(data)) for filename, data in file_map.items()}
        merged_pdf = pikepdf.Pdf.new()
        for instruction in page_instructions:
            source_filename = instruction['sourceFile']
            page_index = instruction['pageIndex']
            rotation = instruction.get('rotation', 0)
            if source_filename in open_pdfs:
                source_pdf = open_pdfs[source_filename]
                page = source_pdf.pages[page_index]
                if rotation != 0:
                    page.rotate(rotation, relative=True)
                merged_pdf.pages.append(page)
        for pdf in open_pdfs.values():
            pdf.close()
        output_buffer = io.BytesIO()
        merged_pdf.save(output_buffer)
        output_buffer.seek(0)
        branded_filename = "merged_by_PDFkaro.in.pdf"
        return StreamingResponse(
            output_buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={branded_filename}"}
        )
    except Exception as e:
        logger.error(f"Error during merging: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/split")
async def split_pdf(file: UploadFile = File(...), pages_to_extract: str = Form(...)):
    # ... (Code is unchanged from original)
    logger.info(f"Received file '{file.filename}' for splitting/extraction.")
    try:
        selected_pages_indices = json.loads(pages_to_extract)
        pdf_bytes = await file.read()
        source_pdf = pikepdf.Pdf.open(io.BytesIO(pdf_bytes))
        
        if selected_pages_indices:
            new_pdf = pikepdf.Pdf.new()
            for index in selected_pages_indices:
                if 0 <= index < len(source_pdf.pages):
                    new_pdf.pages.append(source_pdf.pages[index])
            
            output_buffer = io.BytesIO()
            new_pdf.save(output_buffer)
            output_buffer.seek(0)
            filename = "extracted_pages_by_PDFkaro.in.pdf"
            media_type = "application/pdf"
        
        else: # Split all pages
            output_buffer = io.BytesIO()
            with zipfile.ZipFile(output_buffer, 'w') as zip_file:
                for i, page in enumerate(source_pdf.pages):
                    dst = pikepdf.Pdf.new()
                    dst.pages.append(page)
                    
                    page_buffer = io.BytesIO()
                    dst.save(page_buffer)
                    page_buffer.seek(0)
                    zip_file.writestr(f"page_{i+1}_by_PDFkaro.in.pdf", page_buffer.getvalue())
            
            output_buffer.seek(0)
            filename = "split_files_by_PDFkaro.in.zip"
            media_type = "application/zip"

        return StreamingResponse(
            output_buffer,
            media_type=media_type,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        logger.error(f"Error during splitting: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/extract-single-page")
async def extract_single_page(file: UploadFile = File(...), page_number: int = Form(...)):
    # ... (Code is unchanged from original)
    try:
        pdf_bytes = await file.read()
        source_pdf = pikepdf.Pdf.open(io.BytesIO(pdf_bytes))
        if 0 <= page_number < len(source_pdf.pages):
            new_pdf = pikepdf.Pdf.new()
            new_pdf.pages.append(source_pdf.pages[page_number])
            output_buffer = io.BytesIO()
            new_pdf.save(output_buffer)
            output_buffer.seek(0)
            filename = f"page_{page_number+1}_by_PDFkaro.in.pdf"
            return StreamingResponse(
                output_buffer,
                media_type="application/pdf",
                headers={"Content-Disposition": f"attachment; filename={filename}"}
            )
        else:
            raise HTTPException(status_code=400, detail="Invalid page number.")
    except Exception as e:
        logger.error(f"Error extracting single page: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

# --- Project Exporter Tool ---

def create_tree_structure(files: List[FileData]):
    structure = {}
    for file in files:
        parts = file.path.split('/')
        current_level = structure
        for part in parts[:-1]:
            if part not in current_level:
                current_level[part] = {}
            current_level = current_level[part]
        current_level[parts[-1]] = None
    return structure

def generate_aligned_output(structure: Dict, path_prefix="", is_last=True):
    output = ""
    items = list(structure.items())
    for i, (name, content) in enumerate(items):
        is_current_last = (i == len(items) - 1)
        connector = "└── " if is_current_last else "├── "
        output += f"{path_prefix}{connector}{name}\n"
        if isinstance(content, dict):
            new_prefix = path_prefix + ("    " if is_current_last else "│   ")
            output += generate_aligned_output(content, new_prefix, is_current_last)
    return output

@app.post("/api/v1/process-structure")
async def process_structure(request: ProcessRequest):
    try:
        final_content = ""
        
        if request.align_structure:
            file_structure = create_tree_structure(request.files)
            final_content += "Project Structure:\n"
            final_content += generate_aligned_output(file_structure)
            final_content += "\n" + ("=" * 50) + "\n\n"

        for file_data in request.files:
            if request.include_paths:
                final_content += f"--- File: {file_data.path} ---\n\n"
            final_content += file_data.content + "\n\n"
            if request.include_paths:
                final_content += f"--- End of File: {file_data.path} ---\n\n" + ("=" * 50) + "\n\n"

        if request.output_format == "docx":
            doc = docx.Document()
            doc.add_paragraph(final_content)
            buffer = io.BytesIO()
            doc.save(buffer)
            buffer.seek(0)
            media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            filename = "project_export_by_PDFkaro.in.docx"
        else: # Default is TXT
            buffer = io.BytesIO(final_content.encode('utf-8'))
            media_type = "text/plain"
            filename = "project_export_by_PDFkaro.in.txt"

        return StreamingResponse(
            buffer,
            media_type=media_type,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        logger.error(f"Error processing structure: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
