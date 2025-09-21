# मैं यहाँ सिर्फ Project Exporter से संबंधित एंडपॉइंट्स दिखा रहा हूँ
# सुनिश्चित करें कि आपकी main.py फाइल में Merge और Split के फंक्शन भी मौजूद हैं।

# ... (FastAPI setup, CORS, and other endpoints like /merge, /split)

class FileData(BaseModel):
    path: str
    content: str

class ProcessRequest(BaseModel):
    files: List[FileData]
    output_format: str = "txt"
    include_paths: bool = True
    align_structure: bool = False

def create_tree_structure(files: List[FileData]):
    # ... (function code is unchanged)
    
def generate_aligned_output(structure: Dict, path_prefix="", is_last=True):
    # ... (function code is unchanged)

@app.post("/api/v1/process-structure")
async def process_structure(request: ProcessRequest):
    try:
        final_content = ""
        if request.align_structure:
            file_structure = create_tree_structure(request.files)
            final_content += "Project Structure:\n"
            final_content += generate_aligned_output(file_structure)
            final_content += "\n" + ("=" * 50) + "\n\n"

        for file_data in request.files:
            if request.include_paths:
                final_content += f"--- File: {file_data.path} ---\n\n"
            final_content += file_data.content + "\n\n"
            if request.include_paths:
                final_content += f"--- End of File: {file_data.path} ---\n\n" + ("=" * 50) + "\n\n"

        if request.output_format == "docx":
            doc = docx.Document()
            doc.add_paragraph(final_content)
            buffer = io.BytesIO()
            doc.save(buffer)
            buffer.seek(0)
            media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            filename = "project_export_by_PDFkaro.in.docx"
        else: # Default is TXT
            buffer = io.BytesIO(final_content.encode('utf-8'))
            media_type = "text/plain"
            filename = "project_export_by_PDFkaro.in.txt"

        return StreamingResponse(
            buffer,
            media_type=media_type,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        logger.error(f"Error processing structure: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/export-zip-structure")
async def export_zip_structure(request: ProcessRequest):
    try:
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            if request.align_structure:
                tree_structure = create_tree_structure(request.files)
                summary_content = "Project Structure:\n"
                summary_content += generate_aligned_output(tree_structure)
                zip_file.writestr("00_project_structure.txt", summary_content)

            for file_data in request.files:
                file_content = ""
                if request.include_paths:
                    file_content += f"--- File: {file_data.path} ---\n\n"
                
                file_content += file_data.content

                if request.output_format == "docx":
                    doc = docx.Document()
                    doc.add_paragraph(file_content)
                    file_buffer = io.BytesIO()
                    doc.save(file_buffer)
                    file_buffer.seek(0)
                    base_name = os.path.splitext(file_data.path)[0]
                    file_name_in_zip = f"{base_name}.docx"
                    zip_file.writestr(file_name_in_zip, file_buffer.getvalue())
                else: # Default to .txt
                    file_name_in_zip = f"{file_data.path}.txt"
                    zip_file.writestr(file_name_in_zip, file_content.encode('utf-8'))

        zip_buffer.seek(0)
        return StreamingResponse(
            zip_buffer,
            media_type="application/zip",
            headers={"Content-Disposition": "attachment; filename=project_export_by_PDFkaro.in.zip"}
        )
    except Exception as e:
        logger.error(f"Error creating zip archive: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
