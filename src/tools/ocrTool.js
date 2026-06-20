export const OCRTool = {
  name: "OCR Extractor Tool",
  description: "Leverages Tesseract.js to run Optical Character Recognition (OCR) on image panels in the browser.",

  async process(file, onProgress) {
    // If it's a plain text file, we can read it directly without running OCR
    if (file.type === "text/plain") {
      if (onProgress) onProgress(50);
      const text = await this.readTextFile(file);
      if (onProgress) onProgress(100);
      return text;
    }

    if (!window.Tesseract) {
      throw new Error("Tesseract.js engine is not loaded. Please verify your connection or reload.");
    }

    try {
      const result = await window.Tesseract.recognize(
        file,
        'eng',
        {
          logger: m => {
            if (m && m.status === 'recognizing text' && onProgress) {
              // Convert progress float (0-1) to percentage (0-100)
              onProgress(Math.round(m.progress * 100));
            } else if (m && m.status === 'loading tesseract core' && onProgress) {
              onProgress(15);
            } else if (m && m.status === 'initializing api' && onProgress) {
              onProgress(30);
            }
          }
        }
      );

      if (!result || !result.data || !result.data.text) {
        throw new Error("OCR completed but could not extract any legible text from the image.");
      }

      return result.data.text;
    } catch (err) {
      console.error("Tesseract OCR failed:", err);
      throw new Error(`OCR processing failed: ${err.message || err}`);
    }
  },

  readTextFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error("Failed to read sample text file."));
      reader.readAsText(file);
    });
  }
};
