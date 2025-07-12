from flask import Flask, request, send_file, render_template
import PyPDF2
import os

app = Flask(__name__)

# File upload folder
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Allowed file extensions
ALLOWED_EXTENSIONS = {'pdf'}

# Function to check allowed extensions
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Route for uploading and merging PDFs
@app.route('/merge', methods=['POST'])
def merge_pdfs():
    if 'pdfs' not in request.files:
        return "No file part"
    
    files = request.files.getlist('pdfs')
    
    # Create a PDF merger object
    pdf_merger = PyPDF2.PdfMerger()
    
    for file in files:
        if file and allowed_file(file.filename):
            # Save file temporarily to the upload folder
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
            file.save(file_path)
            
            # Append PDF to the merger object
            pdf_merger.append(file_path)
    
    # Output path for the merged PDF
    output_path = os.path.join(app.config['UPLOAD_FOLDER'], 'merged_output.pdf')
    
    # Write the merged PDF to the output path
    pdf_merger.write(output_path)
    
    # Send merged PDF as response
    return send_file(output_path, as_attachment=True)

# Route for home page (HTML form)
@app.route('/')
def index():
    return render_template('index.html')

if __name__ == "__main__":
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    app.run(debug=True)
