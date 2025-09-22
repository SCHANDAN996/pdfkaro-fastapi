import io
import json
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from fastapi.responses import StreamingResponse
import pikepdf
from typing import List
import logging
from PIL import Image

router = APIRouter()
logger = logging.getLogger(__name__)

def _compose_pdf_from_instructions(pages_data: str, file_map: dict) -> bytes:
    page_instructions = json.loads(pages_data)
    open_pdfs = {filename: pikepdf.Pdf.open(io.BytesIO(data)) for filename, data in file_map.items()}
    composed_pdf = pikepdf.Pdf.new()
    for instruction in page_instructions:
        source_filename = instruction['sourceFile']
        page_index = instruction['pageIndex']
        rotation = instruction.get('rotation', 0)
        if source_filename in open_pdfs:
            source_pdf = open_pdfs[source_filename]
            page = source_pdf.pages[page_index]
            if rotation != 0:
                page.rotate(rotation, relative=True)
            composed_pdf.pages.append(page)
    for pdf in open_pdfs.values():
        pdf.close()
    
    buffer = io.BytesIO()
    composed_pdf.save(buffer)
    return buffer.getvalue()

def _compress_pdf_images(pdf_bytes: bytes, target_dpi: int, jpeg_quality: int) -> bytes:
    pdf = pikepdf.Pdf.open(io.BytesIO(pdf_bytes))
    for page in pdf.pages:
        for key in list(page.images.keys()):
            try:
                raw_image = pikepdf.Raw(page.images[key])
                pil_image = Image.open(io.BytesIO(raw_image.data))
                if pil_image.mode == 'RGBA':
                    pil_image = pil_image.convert('RGB')
                
                original_dpi = pil_image.info.get('dpi', (72, 72))[0]
                if original_dpi > target_dpi:
                    scale_factor = target_dpi / original_dpi
                    new_width = int(pil_image.width * scale_factor)
                    new_height = int(pil_image.height * scale_factor)
                    pil_image = pil_image.resize((new_width, new_height), Image.Resampling.LANCZOS)
                
                img_byte_arr = io.BytesIO()
                pil_image.save(img_byte_arr, format='JPEG', quality=jpeg_quality, optimize=True)
                page.images[key].write(img_byte_arr.getvalue(), stream_decode_parameters=None)
            except Exception as e:
                logger.warning(f"Could not compress an image: {e}")
                continue
    
    buffer = io.BytesIO()
    pdf.save(buffer, linearize=True, compress_streams=True, object_stream_mode=pikepdf.ObjectStreamMode.generate)
    return buffer.getvalue()

@router.post("/quality")
async def compress_by_quality(files: List[UploadFile] = File(...), pages_data: str = Form(...), quality: float = Form(0.5)):
    try:
        file_map = {file.filename: await file.read() for file in files}
        composed_pdf_bytes = _compose_pdf_from_instructions(pages_data, file_map)
        target_dpi = 72 + (quality * (300 - 72))
        jpeg_quality = int(30 + (quality * 60))
        compressed_bytes = _compress_pdf_images(composed_pdf_bytes, target_dpi, jpeg_quality)
        return StreamingResponse(io.BytesIO(compressed_bytes), media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=compressed_by_PDFkaro.in.pdf"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/size")
async def compress_to_size(files: List[UploadFile] = File(...), pages_data: str = Form(...), target_size_kb: int = Form(...)):
    try:
        file_map = {file.filename: await file.read() for file in files}
        composed_pdf_bytes = _compose_pdf_from_instructions(pages_data, file_map)
        
        if len(composed_pdf_bytes) / 1024 <= target_size_kb:
            return StreamingResponse(io.BytesIO(composed_pdf_bytes), media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=compressed_by_PDFkaro.in.pdf"})

        max_size_bytes = target_size_kb * 1024
        presets = [{'dpi': 72, 'quality': 50}, {'dpi': 100, 'quality': 75}, {'dpi': 150, 'quality': 85}]
        
        best_result_bytes = None

        for preset in presets:
            compressed_bytes = _compress_pdf_images(composed_pdf_bytes, preset['dpi'], preset['quality'])
            if len(compressed_bytes) <= max_size_bytes:
                best_result_bytes = compressed_bytes
                break
            best_result_bytes = compressed_bytes

        return StreamingResponse(io.BytesIO(best_result_bytes), media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=compressed_by_PDFkaro.in.pdf"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
