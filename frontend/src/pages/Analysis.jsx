import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Analysis.css";
import { Target, Briefcase, HelpCircle, Eye } from "lucide-react";

function Analysis() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://127.0.0.1:8000/resume/analysis/${id}`
        );
        setData(response.data.analysis_result);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError(
          "We couldn't find the analysis for this ID. It might still be processing or doesn't exist."
        );
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };

    if (id) fetchAnalysisData();
  }, [id]);

  const handlePreview = async () => {
    const previewWindow = window.open("", "_blank");
    if (previewWindow) {
      previewWindow.document.write(
        "<p style='font-family:sans-serif; text-align:center; margin-top:50px;'>Generating your professional report...</p>"
      );
    }

    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/resume/analysis/${id}/download-pdf`,
        { responseType: "blob" }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      if (previewWindow) {
        previewWindow.location.href = url;
      }

      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
    } catch (err) {
      console.error("Preview Error:", err);
      if (previewWindow) previewWindow.close();
      alert("Could not generate preview. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="analysis-loading">
        <div className="loading-spinner" />
        <p>Fetching your results...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="error-view">
        <h2>Oops!</h2>
        <p>{error}</p>
        <button
          className="bottom-btn primary-btn"
          onClick={() => navigate("/upload")}
        >
          Go Back to Upload
        </button>
      </div>
    );
  }

  return (
    <div className="analysis-page">
      <div className="analysis-container">
        <nav className="analysis-navbar">
          <div className="nav-left">
            <span
              className="nav-logo"
              onClick={() => navigate("/")}
              style={{ cursor: "pointer" }}
            >
              ← Home
            </span>
          </div>
          <div className="nav-tabs">
            <span className="nav-tab active">Resume Analysis</span>
          </div>
        </nav>

        <header className="analysis-header">
          <div>
            <h1>Analysis Overview</h1>
            <p className="resume-subtitle">
              Candidate: {data.candidate_name} · {data.job_title}
            </p>
          </div>

          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-number">
                {data.ats_compatibility_score}
              </span>
              <span className="stat-label">ATS Score</span>
            </div>
          </div>
        </header>

        <section className="resume-preview">
          <div className="resume-left">
            <h2 className="resume-name">{data.candidate_name}</h2>
            <p className="resume-role">{data.job_title}</p>
            <p className="resume-contact">
              {data.contact_info.email} | {data.contact_info.location}
            </p>
          </div>

          <div className="resume-right">
            <p className="resume-summary">{data.professional_summary}</p>
          </div>
        </section>

        <main className="analysis-main">
          <section className="analysis-grid two-cols">
            <article className="analysis-card">
              <h3>Strengths</h3>
              <ul className="recommendations-list">
                {data.strengths.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="analysis-card">
              <h3>Weaknesses</h3>
              <ul className="recommendations-list">
                {data.weaknesses.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </article>
          </section>

          <section className="analysis-grid one-col">
            <article className="analysis-card">
              <h3>Recommended Improvements</h3>
              <ul className="recommendations-list">
                {data.improvement_suggestions.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </article>
          </section>

          <section className="bottom-buttons">
            <button
              className="bottom-btn primary-btn"
              onClick={() => navigate("/job-fit")}
            >
              <Target size={18} />
              <span>Check Job Fit</span>
            </button>

            <button className="bottom-btn outline-btn" onClick={()=>navigate("/job-matches")}>
              <Briefcase size={18} />
              <span>View Matches</span>
            </button>

            <button className="bottom-btn outline-btn" onClick={()=>navigate("/skill-test")}>
              <HelpCircle size={18} />
              <span>Skill Test</span>
            </button>

            <button className="bottom-btn outline-btn" onClick={handlePreview}>
              <Eye size={18} />
              <span>Preview & Print</span>
            </button>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Analysis;