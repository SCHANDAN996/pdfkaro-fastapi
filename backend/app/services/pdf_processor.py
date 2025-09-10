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

    # ... (keep existing merge_pdfs and compress_pdf methods) ...
    
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
