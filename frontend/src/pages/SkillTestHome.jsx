import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, BookOpen, Clock, Target, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { extractTextFromPDF } from "../utils/pdfExtractor";
import "../styles/SkillTestHome.css";

export default function SkillTestHome() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const startTest = async () => {
    if (!file) {
      alert("Please upload your resume first to generate tailored questions.");
      return;
    }

    setIsUploading(true);

    try {
      const resumeId = uuidv4();
      const extractedText = await extractTextFromPDF(file);

      const requestData = {
        id: resumeId,
        filename: file.name,
        extracted_text: extractedText,
        job_description_text: ""
      };

      const response = await axios.post(
        "http://localhost:8000/resume/generate-mcqs",
        requestData
      );

      if (response.status === 200) {
        navigate(`/mcqs/${resumeId}`, { 
          state: { questions: response.data.mcqs } 
        });
      }
    } catch (error) {
      console.error("Error generating MCQs:", error);
      alert("Failed to generate test. Please check if the backend is running.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="skill-test-page">
      <div className="skill-test-container">
        <nav className="analysis-navbar">
          <div className="nav-left" onClick={() => navigate("/")}>
            <span className="nav-logo"><ArrowLeft size={18} /> Home</span>
          </div>
          <div className="nav-tabs">
            <span className="nav-tab active">Skill Assessment</span>
          </div>
        </nav>

        <div className="skill-test-content">
          <header className="skill-header">
            <h1>AI Skill Assessment</h1>
            <p>Validate your expertise with questions tailored to your professional profile.</p>
          </header>

          <div className="skill-grid">
            {/* Instructions Card */}
            <div className="instructions-section">
              <div className="card-header">
                <BookOpen className="header-icon" />
                <h3>Instructions</h3>
              </div>

              <div className="instruction-items">
                <div className="instruction-item">
                  <div className="icon-box"><Target size={20} /></div>
                  <div className="text-content">
                    <strong>Tailored Content</strong>
                    <p>Our AI analyzes your resume to generate specific MCQs based on your tech stack.</p>
                  </div>
                </div>

                <div className="instruction-item">
                  <div className="icon-box"><Clock size={20} /></div>
                  <div className="text-content">
                    <strong>Timed Session</strong>
                    <p>You will have 15 minutes to complete 10 questions.</p>
                  </div>
                </div>

                <div className="instruction-item">
                  <div className="icon-box"><AlertCircle size={20} /></div>
                  <div className="text-content">
                    <strong>One Attempt</strong>
                    <p>Ensure a stable connection. Progress is not saved on refresh.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Upload Card */}
            <div className="upload-section">
              <h3>Upload Resume to Start</h3>
              <label className={`upload-dropzone ${file ? "has-file" : ""}`}>
                <input type="file" onChange={handleFileChange} hidden accept=".pdf,.doc,.docx" />
                <div className="upload-visual">
                  <Upload size={48} className="up-icon" />
                  <div className="upload-text">
                    <p>{file ? file.name : "Click to upload or drag & drop"}</p>
                    <span>{file ? "Ready to analyze" : "PDF, DOCX (Max 5MB)"}</span>
                  </div>
                </div>
              </label>
              <button className="generate-btn" onClick={startTest} disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="spinner" size={20} />
                    Generating...
                  </>
                ) : (
                  "Generate Test"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
