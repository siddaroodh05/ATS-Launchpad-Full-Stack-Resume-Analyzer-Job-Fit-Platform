import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle2, XCircle, RotateCcw, Home, Award } from "lucide-react";
import "../styles/ResultsPage.css";

export default function ResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { results } = location.state || {};

  if (!results) {
    return (
      <div className="results-page empty">
        <div className="results-container">
          <XCircle size={48} color="#ef4444" />
          <h2>No Results Found</h2>
          <p>Please complete the test to view your performance.</p>
          <button className="btn-primary" onClick={() => navigate("/skill-test")}>
            Start Test
          </button>
        </div>
      </div>
    );
  }

  const currentData = results.questionss || [];

  return (
    <div className="results-page">
      <div className="results-container">
        
        {/* Header Section */}
        <div className="results-card main-score-card">
          <div className="score-visual">
            <div className="circular-progress" style={{ "--percent": results.percentage }}>
              <div className="inner-circle">
                <span className="score-number">{results.score}</span>
                <span className="score-total">/{results.total}</span>
              </div>
            </div>
          </div>
          
          <div className="score-text">
            <div className={`status-badge ${results.status.toLowerCase()}`}>
              <Award size={18} /> {results.status}
            </div>
            <h1>Test Completed!</h1>
            <p className="feedback-text">
              {results.percentage >= 70
                ? "Excellent work! You've mastered this topic."
                : "Good effort! A bit more practice will make you perfect."}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Accuracy</span>
            <span className="stat-value">{Math.round(results.percentage)}%</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Time Spent</span>
            <span className="stat-value">{results.timeTaken}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Correct</span>
            <span className="stat-value color-success">{results.score}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Incorrect</span>
            <span className="stat-value color-error">{results.total - results.score}</span>
          </div>
        </div>

        {/* Detailed Review */}
        <div className="review-section">
          <h2>Detailed Review</h2>
          <div className="questions-list">
            {currentData.map((q, index) => {
              const isCorrect = q.userAnswer === q.correctAnswer;

              return (
                <div key={index} className="review-card">
                  <div className="review-header">
                    <span className="question-number">Question {index + 1}</span>
                    {isCorrect ? (
                      <span className="badge-pill success"><CheckCircle2 size={14} /> Correct</span>
                    ) : (
                      <span className="badge-pill error"><XCircle size={14} /> Incorrect</span>
                    )}
                  </div>
                  
                  <p className="review-question-text">{q.questionText}</p>

                  <div className="review-options-list">
                    {q.options?.map((option, optIdx) => {
                      const isUserChoice = q.userAnswer === option;
                      const isCorrectChoice = q.correctAnswer === option;

                      let statusClass = "";
                      if (isUserChoice && isCorrectChoice) statusClass = "correct-choice";
                      else if (isUserChoice && !isCorrectChoice) statusClass = "wrong-choice";
                      else if (!isUserChoice && isCorrectChoice) statusClass = "actual-answer";

                      return (
                        <div key={optIdx} className={`review-option-item ${statusClass}`}>
                          <div className="option-label">{String.fromCharCode(65 + optIdx)}</div>
                          <div className="option-content">{option}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="results-actions">
          <button className="btn-secondary" onClick={() => navigate("/")}>
            <Home size={18} /> Home
          </button>
          <button className="btn-primary" onClick={() => navigate("/skill-test")}>
            <RotateCcw size={18} /> Retake Test
          </button>
        </div>
      </div>
    </div>
  );
}
