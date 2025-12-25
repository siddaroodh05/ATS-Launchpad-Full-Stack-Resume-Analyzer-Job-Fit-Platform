import { useState } from "react";
import { UploadCloud, FileText, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { extractTextFromPDF } from "../utils/pdfExtractor"; 
import "../styles/UploadResume.css";

export default function UploadResume() {
  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleAnalyze = async () => {
    if (!file) return alert("Please upload a resume");

    try {
      setIsAnalyzing(true);
      const customId = uuidv4();

      // Extract text from uploaded PDF
      const text = await extractTextFromPDF(file);

      // Send data to backend
      await axios.post("http://127.0.0.1:8000/resume/analyze-text", {
        id: customId,
        extracted_text: text,
        filename: file.name,
        job_description: "" 
      });

      // Navigate to analysis page
      navigate(`/analysis/${customId}`);
    } catch (error) {
      console.error("Analysis failed:", error);
      alert(error.message || "An error occurred during resume analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="upload-page">
      <motion.div
        className="upload-card"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="upload-icon">
          <UploadCloud size={42} />
        </div>
        <h2>Upload Your Resume</h2>
        
        <label className={`upload-box ${file ? "has-file" : ""}`}>
          <input 
            type="file" 
            accept="application/pdf" 
            onChange={handleFileChange} 
            hidden 
          />
          {!file ? (
            <div className="upload-placeholder">
              <FileText size={36} />
              <span>Click to upload PDF</span>
            </div>
          ) : (
            <div className="file-preview">
              <FileText size={28} />
              <span>{file.name}</span>
            </div>
          )}
        </label>

        <button 
          className="analyze-btn" 
          onClick={handleAnalyze} 
          disabled={isAnalyzing || !file}
        >
          {isAnalyzing ? (
            <span className="flex-center">
              <Loader2 className="spinner-icon rotate" size={20} /> 
              Analyzing...
            </span>
          ) : (
            "Analyze Resume"
          )}
        </button>
      </motion.div>
    </div>
  );
}
