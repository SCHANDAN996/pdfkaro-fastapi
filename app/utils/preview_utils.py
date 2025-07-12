from pdf2image import convert_from_path

def create_pdf_preview(pdf_path: str) -> str:
    images = convert_from_path(pdf_path, first_page=1, last_page=1)  # Preview first page
    preview_image_path = "static/images/preview.png"
    images[0].save(preview_image_path, 'PNG')
    return preview_image_path
