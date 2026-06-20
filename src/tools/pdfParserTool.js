export const PDFParserTool = {
  name: "PDF Document Parser",
  description: "Utilizes PDF.js in the browser to extract text contents from uploaded PDF documents.",

  async parse(file, onProgress) {
    const pdfjsLib = window.pdfjsLib || window['pdfjs-dist/build/pdf'];
    if (!pdfjsLib) {
      throw new Error("PDF.js engine is not loaded. Please verify your connection or reload.");
    }
    
    // Configure worker source to run PDF extraction in parallel
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

    try {
      if (onProgress) onProgress(10);
      const arrayBuffer = await this.readFileAsArrayBuffer(file);
      if (onProgress) onProgress(30);

      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      
      // Bind progress updates during file stream decode
      loadingTask.onProgress = (progressData) => {
        if (progressData && progressData.total > 0 && onProgress) {
          const loadedPct = 30 + Math.round((progressData.loaded / progressData.total) * 30);
          onProgress(loadedPct); // Scales 30% to 60%
        }
      };

      const pdf = await loadingTask.promise;
      if (onProgress) onProgress(70);

      let fullText = "";
      const numPages = pdf.numPages;

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + "\n";
        
        if (onProgress) {
          const parsedPct = 70 + Math.round((pageNum / numPages) * 30);
          onProgress(parsedPct); // Scales 70% to 100%
        }
      }

      if (!fullText.trim()) {
        throw new Error("PDF parsed successfully, but no select-copyable text could be extracted. The document may be a scanned image; try running OCR instead.");
      }

      return fullText;
    } catch (err) {
      console.error("PDF.js text extraction failed:", err);
      throw new Error(`PDF parsing failed: ${err.message || err}`);
    }
  },

  readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error("Failed to load PDF as binary array buffer."));
      reader.readAsArrayBuffer(file);
    });
  }
};
