import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.mjs?url";

// Initialize the worker once globally
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

/**
 * Extracts text from a PDF file.
 * @param {File} file - The PDF file object.
 * @returns {Promise<string>} - The extracted text content.
 */
export const extractTextFromPDF = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ 
        data: arrayBuffer,
        useWorkerFetch: true, // Improves performance in modern browsers
        isEvalSupported: false 
    });

    const pdf = await loadingTask.promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      
      const pageText = content.items
        .map((item) => item.str)
        .join(" ");
      
      fullText += pageText + "\n";
    }

    if (!fullText.trim()) {
      throw new Error("No readable text found. This PDF might be an image/scan.");
    }

    return fullText;
  } catch (err) {
    console.error("Extraction Error:", err);
    throw new Error(err.message || "Failed to parse PDF content.");
  }
};