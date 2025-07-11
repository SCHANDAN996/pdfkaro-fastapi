// static/js/pdfkaro.js

const apiUrl = 'https://pdfkaro.in/api';

// Merge PDF
const mergeForm = document.getElementById('merge-form');
if (mergeForm) {
  mergeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData();
    const files = document.getElementById('merge-files').files;
    for (let file of files) {
      formData.append('files', file);
    }
    const res = await fetch(`${apiUrl}/merge`, {
      method: 'POST',
      body: formData
    });
    const blob = await res.blob();
    downloadBlob(blob, 'merged.pdf');
  });
}

// Split PDF
const splitForm = document.getElementById('split-form');
if (splitForm) {
  splitForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData();
    const file = document.getElementById('split-file').files[0];
    const splitFrom = document.getElementById('split-from').value;
    const splitTo = document.getElementById('split-to').value;
    formData.append('file', file);
    formData.append('from_page', splitFrom);
    formData.append('to_page', splitTo);
    const res = await fetch(`${apiUrl}/split`, {
      method: 'POST',
      body: formData
    });
    const blob = await res.blob();
    downloadBlob(blob, 'split.pdf');
  });
}

// Compress PDF
const compressForm = document.getElementById('compress-form');
if (compressForm) {
  compressForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData();
    const file = document.getElementById('compress-file').files[0];
    formData.append('file', file);
    const res = await fetch(`${apiUrl}/compress`, {
      method: 'POST',
      body: formData
    });
    const blob = await res.blob();
    downloadBlob(blob, 'compressed.pdf');
  });
}

function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
