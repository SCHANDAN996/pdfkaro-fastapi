const express = require('express');
const multer = require('multer');
const PDFMerger = require('pdf-merger-js');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Multer setup for file upload
const upload = multer({ dest: 'uploads/' });

// Serve static files (HTML, CSS, JS)
app.use(express.static('public'));

// PDF merge route
app.post('/merge', upload.array('pdfs', 10), async (req, res) => {
  if (!req.files || req.files.length < 2) {
    return res.status(400).send('Please upload at least 2 PDF files');
  }

  const merger = new PDFMerger();

  // Add uploaded PDFs to merger
  for (let file of req.files) {
    const filePath = path.join(__dirname, file.path);
    merger.add(filePath);
  }

  try {
    const outputFile = path.join(__dirname, 'public', 'merged.pdf');
    await merger.save(outputFile);
    res.sendFile(outputFile);
  } catch (error) {
    res.status(500).send('Error while merging PDFs: ' + error.message);
  } finally {
    // Delete uploaded files after merging
    req.files.forEach(file => fs.unlinkSync(file.path));
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
