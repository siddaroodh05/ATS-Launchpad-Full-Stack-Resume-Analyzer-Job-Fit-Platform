import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  Search,
  Globe,
  Bell,
  Sparkles,
  ArrowLeft,
  Loader2
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { extractTextFromPDF } from "../utils/pdfExtractor";
import "../styles/JobMatches.css";

export default function JobMatchesHome() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const findMatches = async () => {
    if (!file) {
      alert("Please upload your resume to find matching jobs.");
      return;
    }

    try {
      setIsProcessing(true);

      const resumeId = uuidv4();
      const extractedText = await extractTextFromPDF(file);

      await axios.post("http://127.0.0.1:8000/api/jobs/match", {
        id: resumeId,
        extracted_text: extractedText,
        filename: file.name,
      });

      navigate(`/job-matches/listings/${resumeId}`);
    } catch (error) {
      console.error("Matching failed:", error);
      alert("Failed to find job matches. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="matches-page">
      <div className="matches-container">
        <nav className="analysis-navbar">
          <div className="nav-left" onClick={() => navigate("/")}>
            <span className="nav-logo">
              <ArrowLeft size={18} /> Back
            </span>
          </div>
          <div className="nav-tabs">
            <span className="nav-tab active">Smart Job Matcher</span>
          </div>
        </nav>

        <div className="matches-content">
          <header className="matches-header">
            <h1>
              Discover Your <span>Perfect Role</span>
            </h1>
            <p>
              Upload your resume to instantly find open positions that match your
              skills and experience.
            </p>
          </header>

          <div className="matches-grid">
            <div className="upload-card">
              <div className="card-header">
                <Sparkles size={24} color="#818cf8" />
                <h3>Find Openings</h3>
              </div>

              <label className={`matches-dropzone ${file ? "has-file" : ""}`}>
                <input
                  type="file"
                  hidden
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                />
                <Upload size={40} />
                <div className="dropzone-text">
                  <p>{file ? file.name : "Click to upload your resume"}</p>
                  <span>
                    {file
                      ? "Resume parsed successfully"
                      : "PDF or DOCX (Max 5MB)"}
                  </span>
                </div>
              </label>

              <button
                className="find-btn"
                onClick={findMatches}
                disabled={isProcessing || !file}
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={18} />
                    Scanning live openings...
                  </span>
                ) : (
                  "Search Matching Jobs"
                )}
              </button>
            </div>

            <div className="instructions-card">
              <div className="card-header">
                <Search size={24} color="#818cf8" />
                <h3>What happens next?</h3>
              </div>

              <div className="match-steps">
                <div className="match-step">
                  <div className="m-icon">
                    <Globe size={20} />
                  </div>
                  <div className="m-text">
                    <strong>Real-time Scanning</strong>
                    <p>
                      We scan top job boards and company career pages for roles
                      matching your profile.
                    </p>
                  </div>
                </div>

                <div className="match-step">
                  <div className="m-icon">
                    <Sparkles size={20} />
                  </div>
                  <div className="m-text">
                    <strong>Smart Filtering</strong>
                    <p>
                      Jobs are ranked by relevance to your experience and skill
                      set.
                    </p>
                  </div>
                </div>

                <div className="match-step">
                  <div className="m-icon">
                    <Bell size={20} />
                  </div>
                  <div className="m-text">
                    <strong>Instant Application</strong>
                    <p>
                      Get direct apply links and tailored resume suggestions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="match-notice">
                <p>
                  Currently supporting roles in{" "}
                  <strong>Tech, Design, and Product</strong> worldwide.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
