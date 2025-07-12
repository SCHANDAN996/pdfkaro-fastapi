from PyPDF2 import PdfMerger
from pdf2image import convert_from_path

# PDF Merge Function
def merge_pdfs(files: list) -> str:
    merger = PdfMerger()
    for file in files:
        merger.append(file)
    output_pdf = "merged_output.pdf"
    merger.write(output_pdf)
    merger.close()
    return output_pdf


# PDF Preview Generation Function (First page as image)
def generate_pdf_preview(pdf_path: str) -> str:
    images = convert_from_path(pdf_path, first_page=1, last_page=1)  # Only convert the first page
    preview_image_path = "static/images/preview.png"  # Path where preview image will be saved
    images[0].save(preview_image_path, 'PNG')  # Save the first page as PNG
    return preview_image_path
