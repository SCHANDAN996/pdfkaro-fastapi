import io
import zipfile
import re
from typing import List
import logging
from fastapi import HTTPException
import pikepdf
from pikepdf.models import PdfError

logger = logging.getLogger(__name__)

class PDFProcessor:
    """
    PDF processing service class that handles all PDF operations
    Separates business logic from API endpoints for better maintainability
    """

    async def merge_pdfs(self, files: List) -> bytes:
        """
        Merge multiple PDF files into a single PDF
        """
        if len(files) < 2:
            raise HTTPException(
                status_code=400, 
                detail="At least 2 PDF files are required for merging"
            )
        
        try:
            merged_pdf = pikepdf.Pdf.new()
            processed_files = 0
            
            for file in files:
                try:
                    content = await file.read()
                    # Reset file pointer for potential reuse
                    await file.seek(0)
                    
                    with pikepdf.Pdf.open(io.BytesIO(content)) as src_pdf:
                        merged_pdf.pages.extend(src_pdf.pages)
                        processed_files += 1
                        logger.info(f"Successfully processed: {file.filename}")
                        
                except Exception as individual_file_error:
                    logger.error(f"Could not process file {file.filename}: {individual_file_error}")
                    raise HTTPException(
                        status_code=400, 
                        detail=f"File {file.filename} is not a valid PDF"
                    )
            
            if processed_files == 0:
                raise HTTPException(
                    status_code=400, 
                    detail="No valid PDF files found in the upload"
                )
                
            # Save merged PDF to memory
            output_buffer = io.BytesIO()
            merged_pdf.save(output_buffer)
            output_buffer.seek(0)
            
            return output_buffer.getvalue()
            
        except Exception as e:
            logger.error(f"An unexpected error occurred during merging: {e}")
            raise HTTPException(status_code=500, detail="An internal server error occurred.")

    async def compress_pdf(self, file, compression_level: int = 2) -> bytes:
        """
        Compress a PDF file with specified compression level
        """
        try:
            content = await file.read()
            # Reset file pointer
            await file.seek(0)
            
            with pikepdf.Pdf.open(io.BytesIO(content)) as pdf:
                # Remove unused resources
                pdf.remove_unreferenced_resources()
                
                # Configure compression based on level
                compression_params = {
                    'compress_streams': True,
                    'linearize': True
                }
                
                if compression_level >= 2:
                    compression_params['object_stream_mode'] = 'preserve'
                    
                if compression_level >= 3:
                    # More aggressive compression options
                    compression_params['stream_compression_level'] = 9
                
                # Save with compression
                output_buffer = io.BytesIO()
                pdf.save(output_buffer, **compression_params)
                output_buffer.seek(0)
                
                logger.info(f"Successfully compressed: {file.filename}")
                return output_buffer.getvalue()
                
        except Exception as e:
            logger.error(f"Compression failed for {file.filename}: {e}")
            raise HTTPException(
                status_code=500, 
                detail=f"PDF compression failed: {str(e)}"
            )

    async def extract_all_pages(self, pdf_content: bytes, original_filename: str) -> bytes:
        """
        Extract all pages as individual PDF files and return as a zip
        """
        zip_buffer = io.BytesIO()
        base_name = original_filename.rsplit('.', 1)[0]  # Remove extension
        
        try:
            with pikepdf.Pdf.open(io.BytesIO(pdf_content)) as pdf:
                total_pages = len(pdf.pages)
                
                with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
                    for page_num in range(total_pages):
                        # Create a new PDF with just this page
                        output_pdf = pikepdf.Pdf.new()
                        output_pdf.pages.append(pdf.pages[page_num])
                        
                        # Save to buffer
                        page_buffer = io.BytesIO()
                        output_pdf.save(page_buffer)
                        page_buffer.seek(0)
                        
                        # Add to zip
                        zip_file.writestr(f"{base_name}_page_{page_num + 1}.pdf", page_buffer.getvalue())
        
        except PdfError as e:
            logger.error(f"Error processing PDF: {e}")
            raise HTTPException(status_code=400, detail=f"Invalid PDF file: {str(e)}")
        
        zip_buffer.seek(0)
        return zip_buffer.getvalue()

    async def extract_page_ranges(self, pdf_content: bytes, page_ranges: str, original_filename: str) -> bytes:
        """
        Extract specific page ranges from a PDF and return as a zip
        """
        # Parse page ranges (e.g., "1-3,5,7-9")
        pages_to_extract = self._parse_page_ranges(page_ranges)
        base_name = original_filename.rsplit('.', 1)[0]  # Remove extension
        
        try:
            with pikepdf.Pdf.open(io.BytesIO(pdf_content)) as pdf:
                total_pages = len(pdf.pages)
                
                # Validate page numbers
                for page in pages_to_extract:
                    if page < 1 or page > total_pages:
                        raise ValueError(f"Page {page} is out of range (1-{total_pages})")
                
                zip_buffer = io.BytesIO()
                
                with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
                    for page_num in pages_to_extract:
                        # Create a new PDF with just this page
                        output_pdf = pikepdf.Pdf.new()
                        output_pdf.pages.append(pdf.pages[page_num - 1])  # 0-indexed
                        
                        # Save to buffer
                        page_buffer = io.BytesIO()
                        output_pdf.save(page_buffer)
                        page_buffer.seek(0)
                        
                        # Add to zip
                        zip_file.writestr(f"{base_name}_page_{page_num}.pdf", page_buffer.getvalue())
        
        except PdfError as e:
            logger.error(f"Error processing PDF: {e}")
            raise HTTPException(status_code=400, detail=f"Invalid PDF file: {str(e)}")
        
        zip_buffer.seek(0)
        return zip_buffer.getvalue()

    def _parse_page_ranges(self, page_ranges: str) -> List[int]:
        """
        Parse page range string into a list of page numbers
        Supports formats like: "1-3,5,7-9"
        """
        pages = []
        ranges = page_ranges.split(',')
        
        for r in ranges:
            r = r.strip()
            if not r:
                continue
                
            if '-' in r:
                start, end = r.split('-')
                try:
                    start_num = int(start)
                    end_num = int(end)
                    if start_num > end_num:
                        raise ValueError(f"Invalid range {r}: start cannot be greater than end")
                    pages.extend(range(start_num, end_num + 1))
                except ValueError:
                    raise ValueError(f"Invalid range format: {r}")
            else:
                try:
                    pages.append(int(r))
                except ValueError:
                    raise ValueError(f"Invalid page number: {r}")
        
        # Remove duplicates and sort
        return sorted(set(pages))

# Create service instance for dependency injection
pdf_processor = PDFProcessor()
