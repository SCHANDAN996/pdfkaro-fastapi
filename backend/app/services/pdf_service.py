# backend/app/services/pdf_service.py
import PyPDF2

def merge_pdfs(file_paths):
    pdf_writer = PyPDF2.PdfMerger()
    for path in file_paths:
        pdf_writer.append(path)
    output_path = "merged_output.pdf"
    pdf_writer.write(output_path)
    return output_path
