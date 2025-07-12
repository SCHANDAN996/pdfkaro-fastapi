async function mergePDFs() {
    const files = document.getElementById("pdfFiles").files;
    const formData = new FormData();
    for (let file of files) formData.append("files", file);

    const response = await fetch("/merge", { method: "POST", body: formData });
    const data = await response.json();
    document.getElementById("result").innerHTML = `<a href="${data.output}">डाउनलोड करें</a>`;
}
