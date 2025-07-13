# backend/app/services/pdf_service.py
import pytesseract
from PyPDF2 import PdfMerger, PdfReader, PdfWriter
from pdf2image import convert_from_path

# Function to merge multiple PDFs
def merge_pdfs(file_paths):
    pdf_writer = PdfMerger()
    for path in file_paths:
        pdf_writer.append(path)  # Add each PDF file to be merged
    output_path = "merged_output.pdf"
    pdf_writer.write(output_path)
    return output_path

# Function to compress a PDF
def compress_pdf(file_path, size_percentage):
    # Read PDF
    reader = PdfReader(file_path)
    writer = PdfWriter()

    # Set compression level (just a placeholder for now)
    for page in reader.pages:
        writer.add_page(page)

    output_path = f"compressed_{size_percentage}%.pdf"
    with open(output_path, "wb") as output_file:
        writer.write(output_file)

    return output_path

# Function to split a PDF
def split_pdf(file_path, start_page, end_page):
    reader = PdfReader(file_path)
    writer = PdfWriter()

    # Split PDF based on specified pages
    for page_num in range(start_page - 1, end_page):
        writer.add_page(reader.pages[page_num])

    output_path = f"split_{start_page}_to_{end_page}.pdf"
    with open(output_path, "wb") as output_file:
        writer.write(output_file)

    return output_path

# Function to process OCR from a PDF or image
def ocr_pdf(file_path):
    # Convert PDF to images
    images = convert_from_path(file_path)

    # Use pytesseract to extract text from images
    extracted_text = ""
    for img in images:
        extracted_text += pytesseract.image_to_string(img)

    return extracted_text
