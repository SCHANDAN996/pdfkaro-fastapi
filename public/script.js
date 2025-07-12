document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const response = await fetch('/merge', {
    method: 'POST',
    body: formData
  });

  const outputDiv = document.getElementById('output');
  if (response.ok) {
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    outputDiv.innerHTML = `
      <p>PDF सफलतापूर्वक मर्ज हो गया है!</p>
      <a href="${url}" download="merged.pdf">यहाँ से डाउनलोड करें</a>
    `;
  } else {
    const errorText = await response.text();
    outputDiv.innerHTML = `<p>त्रुटि: ${errorText}</p>`;
  }
});
