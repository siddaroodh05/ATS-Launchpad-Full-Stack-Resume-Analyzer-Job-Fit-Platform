import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  ExternalLink,
  Star,
  Loader2
} from "lucide-react";
import axios from "axios";
import "../styles/JobMatchListings.css";

export default function JobMatchListings() {
  const navigate = useNavigate();
  const { resumeId } = useParams();

  const [matchedJobs, setMatchedJobs] = useState([]);
  const [filename, setFilename] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await axios.get(
          `http://127.0.0.1:8000/api/jobs/match/${resumeId}`
        );
        setMatchedJobs(res.data.matches || []);
        setFilename(res.data.filename || "");
      } catch (err) {
        console.error("Failed to fetch job matches:", err);
      } finally {
        setLoading(false);
      }
    };

    if (resumeId) fetchMatches();
  }, [resumeId]);

  if (loading) {
    return (
      <div className="loading-screen">
        <Loader2 className="animate-spin" size={48} color="#818cf8" />
        <p>Retrieving your top matches...</p>
      </div>
    );
  }

  return (
    <div className="listings-page">
      <div className="listings-container">
        <nav className="analysis-navbar">
          <div className="nav-left" onClick={() => navigate("/job-matches")}>
            <span className="nav-logo">
              <ArrowLeft size={18} /> Back
            </span>
          </div>
          <div className="nav-tabs">
            <span className="nav-tab active">Matched Opportunities</span>
          </div>
        </nav>

        <header className="listings-header">
          <div className="title-area">
            <h1>
              Top Matches for <span>{filename || "Your Resume"}</span>
            </h1>
            <p>
              We found {matchedJobs.length} roles aligned with your skills and
              experience.
            </p>
          </div>
        </header>

        <div className="jobs-list">
          {matchedJobs.map((job, index) => (
            <div key={index} className="job-card">
              <div className="job-card-main">
                <div className="job-details">
                  <div className="company-logo-placeholder">
                    {job.company?.charAt(0)}
                  </div>

                  <div className="job-info">
                    <h3>{job.job_title}</h3>
                    <p className="company-name">{job.company}</p>

                    <div className="job-meta">
                      <span>
                        <MapPin size={14} /> {job.location}
                      </span>
                      <span>
                        <Briefcase size={14} /> {job.package}
                      </span>
                      <span>
                        <Star size={14} /> New Opening
                      </span>
                    </div>
                  </div>
                </div>

                <div className="match-score-section">
                  <div
                    className="score-circle"
                    style={{
                      "--score-color":
                        job.match_score >= 85 ? "#10b981" : "#818cf8"
                    }}
                  >
                    <span className="percent">{job.match_score}%</span>
                    <span className="label">Match</span>
                  </div>
                </div>
              </div>

              <div className="job-card-footer">
                <div className="job-tags">
                  {job.skills_required?.map(skill => (
                    <span key={skill} className="tag">
                      {skill}
                    </span>
                  ))}
                </div>

                <a
                  href={job.apply_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="apply-btn"
                >
                  Apply Now <ExternalLink size={16} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
