from sqlalchemy import Column, String, JSON, ForeignKey, DateTime, Integer, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(String, primary_key=True)
    filename = Column(String, nullable=False)
    extracted_text = Column(String, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    analysis = relationship("ResumeAnalysis", back_populates="resume", uselist=False)

class ResumeAnalysis(Base):
    __tablename__ = "resume_analysis"

    id = Column(String, primary_key=True)
    resume_id = Column(String, ForeignKey("resumes.id"))
    job_description_id = Column(String, ForeignKey("job_descriptions.id"), nullable=True)
    analysis_result = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    resume = relationship("Resume", back_populates="analysis")

class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    description_text = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class JobFitAnalysis(Base):
    __tablename__ = "job_fit_analysis"

    id = Column(String, primary_key=True)
    resume_id = Column(String, ForeignKey("resumes.id"))
    job_description_id = Column(String, ForeignKey("job_descriptions.id"))

    job_fit_score = Column(Integer)
    gap_summary = Column(Text, nullable=True)
    strengths = Column(JSON)
    matched_skills = Column(JSON)
    missing_skills = Column(JSON)
    recommendations = Column(JSON)

    candidate_name = Column(String, nullable=True)
    candidate_title = Column(String, nullable=True)
    candidate_email = Column(String, nullable=True)
    candidate_location = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

class MCQ(Base):
    __tablename__ = "mcqs"

    id = Column(String, primary_key=True)
    resume_id = Column(String, ForeignKey("resumes.id"), nullable=False)
    fit_analysis_id = Column(String, ForeignKey("job_fit_analysis.id"), nullable=True)
    question_text = Column(Text, nullable=False)
    options = Column(JSON, nullable=False)
    answer = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class JobMatch(Base):
    __tablename__ = "job_matches"

    id = Column(String, primary_key=True)
    resume_id = Column(String, ForeignKey("resumes.id"), nullable=False)
    filename = Column(String, nullable=False)
    match_results = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    resume = relationship("Resume")
