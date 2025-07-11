const apiUrl = 'https://pdfkaro.in/api';  // or 'http://localhost:8000/api' for local testing

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

    if (!res.ok) {
      alert("Failed to merge PDFs");
      return;
    }

    const blob = await res.blob();
    downloadBlob(blob, 'merged.pdf');
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
