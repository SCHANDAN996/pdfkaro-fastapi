from pdf2image import convert_from_path

# PDF Preview Generation Function
def generate_pdf_preview(pdf_path: str) -> str:
    # Generate the first page of the PDF as a preview image
    images = convert_from_path(pdf_path, first_page=1, last_page=1)  # Only convert the first page
    preview_image_path = "static/images/preview.png"  # Path where preview image will be saved
    images[0].save(preview_image_path, 'PNG')  # Save the first page as PNG
    return preview_image_path
