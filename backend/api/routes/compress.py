import io
import json
import zipfile
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from fastapi.responses import StreamingResponse
import pikepdf
from typing import List
import logging
from PIL import Image
import math

router = APIRouter()
logger = logging.getLogger(__name__)

def compress_pdf_with_quality(pdf_bytes: bytes, quality_percent: int) -> bytes:
    """
    Compress PDF based on quality percentage (1-100%)
    """
    try:
        source_pdf = pikepdf.Pdf.open(io.BytesIO(pdf_bytes))
        
        # Map quality percentage to compression parameters
        if quality_percent >= 80:
            # High quality - minimal compression
            target_dpi = 300
            jpeg_quality = 95
        elif quality_percent >= 60:
            # Medium quality
            target_dpi = 200
            jpeg_quality = 85
        elif quality_percent >= 40:
            # Balanced quality
            target_dpi = 150
            jpeg_quality = 75
        elif quality_percent >= 20:
            # Medium compression
            target_dpi = 100
            jpeg_quality = 65
        else:
            # High compression
            target_dpi = 72
            jpeg_quality = 50

        # Compress images in the PDF
        for page in source_pdf.pages:
            for key, image_obj in page.images.items():
                try:
                    raw_image = pikepdf.Raw(image_obj)
                    pil_image = Image.open(io.BytesIO(raw_image.data))
                    
                    # Calculate new dimensions based on DPI
                    original_dpi = pil_image.info.get('dpi', (72, 72))[0]
                    scale_factor = target_dpi / original_dpi
                    new_width = int(pil_image.width * scale_factor)
                    new_height = int(pil_image.height * scale_factor)
                    
                    # Resize image
                    pil_image = pil_image.resize((new_width, new_height), Image.Resampling.LANCZOS)
                    
                    # Save with quality compression
                    img_byte_arr = io.BytesIO()
                    pil_image.save(img_byte_arr, format='JPEG', quality=jpeg_quality, optimize=True)
                    
                    # Replace image in PDF
                    image_obj.write(img_byte_arr.getvalue())
                    
                except Exception as img_e:
                    logger.warning(f"Could not compress an image: {img_e}")
                    continue

        # Save with PDF compression
        output_buffer = io.BytesIO()
        source_pdf.save(output_buffer, 
                       linearize=True, 
                       compress_streams=True, 
                       object_stream_mode=pikepdf.ObjectStreamMode.generate)
        
        return output_buffer.getvalue()
        
    except Exception as e:
        logger.error(f"PDF compression error: {e}")
        raise e

def compress_pdf_to_size(pdf_bytes: bytes, target_size_kb: int) -> bytes:
    """
    Compress PDF to target size (80-100% of requested size)
    """
    try:
        original_size_kb = len(pdf_bytes) / 1024
        
        # If already smaller than target, return as is
        if original_size_kb <= target_size_kb:
            return pdf_bytes
            
        # Calculate target range (80-100% of requested size)
        min_target = target_size_kb * 0.8
        max_target = target_size_kb * 1.0
        
        # Try different quality levels to achieve target size
        quality_levels = [80, 60, 40, 20, 10]
        
        best_result = pdf_bytes
        best_size = original_size_kb
        
        for quality in quality_levels:
            try:
                compressed_pdf = compress_pdf_with_quality(pdf_bytes, quality)
                compressed_size_kb = len(compressed_pdf) / 1024
                
                # If within target range, use this result
                if min_target <= compressed_size_kb <= max_target:
                    return compressed_pdf
                
                # If smaller than current best but larger than min target, update best
                if compressed_size_kb < best_size and compressed_size_kb >= min_target:
                    best_result = compressed_pdf
                    best_size = compressed_size_kb
                    
                # If smaller than min target but closer than previous, update best
                if compressed_size_kb < min_target and compressed_size_kb > best_size:
                    best_result = compressed_pdf
                    best_size = compressed_size_kb
                    
            except Exception as e:
                logger.warning(f"Compression with quality {quality} failed: {e}")
                continue
        
        return best_result
        
    except Exception as e:
        logger.error(f"Size-based compression error: {e}")
        raise e

@router.post("/quality")
async def compress_by_quality(files: List[UploadFile] = File(...), pages_data: str = Form(...), quality: int = Form(50)):
    """
    Compress PDF based on quality percentage
    """
    try:
        logger.info(f"Compressing with quality: {quality}%")
        
        # Parse page instructions
        page_instructions = json.loads(pages_data)
        file_map = {file.filename: await file.read() for file in files}
        
        # Create merged PDF from instructions
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
            
        # Save merged PDF to bytes
        merged_buffer = io.BytesIO()
        merged_pdf.save(merged_buffer)
        merged_pdf_bytes = merged_buffer.getvalue()
        
        # Compress with quality
        compressed_pdf_bytes = compress_pdf_with_quality(merged_pdf_bytes, quality)
        
        # Return compressed PDF
        output_buffer = io.BytesIO(compressed_pdf_bytes)
        output_buffer.seek(0)
        
        return StreamingResponse(
            output_buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=compressed_by_PDFkaro.in.pdf"}
        )
        
    except Exception as e:
        logger.error(f"Quality compression error: {e}")
        raise HTTPException(status_code=500, detail=f"Compression failed: {str(e)}")

@router.post("/size")
async def compress_by_size(files: List[UploadFile] = File(...), pages_data: str = Form(...), target_size: int = Form(...), size_unit: str = Form("KB")):
    """
    Compress PDF to target size
    """
    try:
        # Convert target size to KB
        if size_unit.upper() == "MB":
            target_size_kb = target_size * 1024
        else:
            target_size_kb = target_size
            
        logger.info(f"Compressing to target size: {target_size_kb} KB")
        
        # Parse page instructions
        page_instructions = json.loads(pages_data)
        file_map = {file.filename: await file.read() for file in files}
        
        # Create merged PDF from instructions
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
            
        # Save merged PDF to bytes
        merged_buffer = io.BytesIO()
        merged_pdf.save(merged_buffer)
        merged_pdf_bytes = merged_buffer.getvalue()
        
        # Compress to target size
        compressed_pdf_bytes = compress_pdf_to_size(merged_pdf_bytes, target_size_kb)
        
        # Return compressed PDF
        output_buffer = io.BytesIO(compressed_pdf_bytes)
        output_buffer.seek(0)
        
        return StreamingResponse(
            output_buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=compressed_by_PDFkaro.in.pdf"}
        )
        
    except Exception as e:
        logger.error(f"Size compression error: {e}")
        raise HTTPException(status_code=500, detail=f"Compression failed: {str(e)}")
