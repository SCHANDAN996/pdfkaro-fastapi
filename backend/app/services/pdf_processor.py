import pikepdf
from fastapi import UploadFile
import io

class PDFProcessor:
    """
    यह क्लास सभी PDF से संबंधित तर्क को संभालती है।
    API एंडपॉइंट्स से व्यावसायिक तर्क को अलग करने से कोड को बदलना और परीक्षण करना आसान हो जाता है।
    उदाहरण के लिए, यदि आप pikepdf को किसी अन्य लाइब्रेरी से बदलना चाहते हैं, तो आपको केवल इस फ़ाइल को अपडेट करना होगा।
    """

    async def merge_pdfs(self, files: list[UploadFile]) -> bytes:
        """
        कई PDF फाइलों को एक में मर्ज करता है।
        """
        output_pdf = pikepdf.Pdf.new()
        
        for file in files:
            content = await file.read()
            # सुनिश्चित करें कि कर्सर शुरुआत में है
            await file.seek(0) 
            try:
                with pikepdf.Pdf.open(io.BytesIO(content)) as src_pdf:
                    output_pdf.pages.extend(src_pdf.pages)
            except pikepdf.errors.PdfError as e:
                # यहाँ खराब PDF के लिए बेहतर त्रुटि प्रबंधन जोड़ें
                print(f"Skipping corrupted or invalid PDF: {file.filename}. Error: {e}")
                continue

        # मर्ज की गई PDF को मेमोरी में बाइट्स के रूप में सहेजें
        output_buffer = io.BytesIO()
        output_pdf.save(output_buffer)
        output_buffer.seek(0)
        
        return output_buffer.getvalue()

    async def compress_pdf(self, file: UploadFile, level: int) -> bytes:
        """
        एक PDF फ़ाइल को कंप्रेस करता है।
        (नोट: यह एक सरल कार्यान्वयन है। उन्नत संपीड़न के लिए घोस्टस्क्रिप्ट की आवश्यकता हो सकती है।)
        """
        content = await file.read()
        pdf = pikepdf.Pdf.open(io.BytesIO(content))
        
        # pikepdf छवियों को कंप्रेस करने और अप्रयुक्त वस्तुओं को हटाने के लिए अनुकूलन कर सकता है
        pdf.remove_unreferenced_resources()
        
        output_buffer = io.BytesIO()
        pdf.save(output_buffer, compress_streams=True, linearize=True)
        output_buffer.seek(0)
        
        return output_buffer.getvalue()

# सेवा का एक उदाहरण बनाएँ जिसे निर्भरता इंजेक्शन के माध्यम से उपयोग किया जा सकता है
pdf_processor_service = PDFProcessor()
