
import io
import json
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from fastapi.responses import StreamingResponse
import pikepdf
from typing import List
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/merge")
async def merge_pdfs(files: List[UploadFile] = File(...), pages_data: str = Form(...)):
    # ... (merge_pdfs का पूरा लॉजिक यहाँ कॉपी करें)
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
