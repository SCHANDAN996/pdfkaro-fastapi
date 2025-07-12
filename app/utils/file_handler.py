from PyPDF2 import PdfMerger

# Merge PDFs Function
def merge_pdfs(files: list) -> str:
    merger = PdfMerger()
    for file in files:
        merger.append(file)
    output_pdf = "merged_output.pdf"
    merger.write(output_pdf)
    merger.close()
    return output_pdf
