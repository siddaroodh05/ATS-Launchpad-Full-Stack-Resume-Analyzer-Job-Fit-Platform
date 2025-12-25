import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  CheckCircle,
  Lightbulb,
  Target,
  ArrowLeft
} from "lucide-react";
import "../styles/Analysis.css";

export default function JobFitAnalysis() {
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
          `http://127.0.0.1:8000/analysis/analysis-result/${id}`
        );

        const backendData = response.data;

        setData({
          candidate: backendData.candidate_name || "Unknown Candidate",
          role: backendData.candidate_title || "Target Role",
          score: backendData.job_fit_score || 0,
          summary: backendData.gap_summary || "No summary available.",
          matchedSkills: backendData.matched_skills || [],
          missingSkills: backendData.missing_skills || [],
          strengths: backendData.strengths || [],
          improvements: backendData.recommendations || [],
          email: backendData.candidate_email || "N/A",
          location: backendData.candidate_location || "N/A"
        });
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("We couldn't find the analysis for this ID.");
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };

    if (id) fetchAnalysisData();
  }, [id]);

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
          onClick={() => navigate("/job-fit")}
        >
          Go Back
        </button>
      </div>
    );
  }

  const analysis = data;

  return (
    <div className="analysis-page">
      <div className="analysis-container">
        <nav className="analysis-navbar">
          <div className="nav-left" onClick={() => navigate("/job-fit")}>
            <span className="nav-logo">
              <ArrowLeft size={18} /> Back
            </span>
          </div>
          <div className="nav-tabs">
            <span className="nav-tab active">Job-Fit Analysis</span>
          </div>
        </nav>

        <header className="analysis-header">
          <div className="header-info">
            <h1>Analysis Overview</h1>
            <p>
              Candidate: {analysis.candidate} • {analysis.role}
            </p>
          </div>
          <div className="ats-score-badge">
            <span className="score-val">{analysis.score}</span>
            <span className="score-label">JOB FIT SCORE</span>
          </div>
        </header>

        <div className="analysis-summary-card">
          <div className="candidate-basic">
            <h2>{analysis.candidate}</h2>
            <p className="role-tag">{analysis.role}</p>
            <p className="contact-info">
              {analysis.email} • {analysis.location}
            </p>
          </div>
          <div className="summary-text">
            <p>{analysis.summary}</p>
          </div>
        </div>

        <div className="details-grid">
          <section className="details-card">
            <h3>
              <Target size={20} color="#818cf8" /> Matched Skills
            </h3>
            <div className="skills-tags">
              {analysis.matchedSkills.map(skill => (
                <span key={skill} className="skill-tag">
                  {skill}
                </span>
              ))}
              {analysis.missingSkills.map(skill => (
                <span key={skill} className="skill-tag missing">
                  {skill}
                </span>
              ))}
            </div>
          </section>

          <section className="details-card">
            <h3>
              <CheckCircle size={20} color="#818cf8" /> Strengths
            </h3>
            <ul className="strength-list">
              {analysis.strengths.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>
        </div>

        <section className="improvements-card">
          <h3>
            <Lightbulb size={20} color="#fbbf24" /> Recommended Improvements
          </h3>
          <ul className="improvement-list">
            {analysis.improvements.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>

        <footer className="analysis-footer">
          <button
            className="btn-primary"
            onClick={() => navigate("/job-matches")}
          >
            View Job Matches
          </button>
        </footer>
      </div>
    </div>
  );
}
