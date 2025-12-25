from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import uuid4
from pydantic import BaseModel
from app.services.job_fit_analyzer import reanalyze_resume
from app.database import get_db
from app.models import Resume, JobDescription, JobFitAnalysis

router = APIRouter(prefix="/analysis", tags=["Analysis"])

class JobFitRequest(BaseModel):
    id: str
    extracted_text: str 
    job_description_text: str
    filename: str

@router.post("/analyze-job-fit")
async def analyze_job_fit(request: JobFitRequest, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == request.id).first()
    if not resume:
        resume = Resume(
            id=request.id,
            filename=request.filename,
            extracted_text=request.extracted_text
        )
        db.add(resume)
        db.flush() 

    jd_id = str(uuid4())
    job_desc = JobDescription(
        id=jd_id,
        title="Job Fit Analysis", 
        description_text=request.job_description_text
    )
    db.add(job_desc)
    db.flush() 

    job_fit_data = reanalyze_resume(
        resume_text=str(resume.extracted_text),
        job_description=request.job_description_text
    )

    fit_analysis_id = str(uuid4())
    job_fit = JobFitAnalysis(
        id=fit_analysis_id,
        resume_id=resume.id,
        job_description_id=jd_id,
        job_fit_score=job_fit_data.get("job_fit_score", 0),
        gap_summary=job_fit_data.get("gap_summary"),
        strengths=job_fit_data.get("strengths", []),
        matched_skills=job_fit_data.get("matched_skills", []),
        missing_skills=job_fit_data.get("missing_skills", []),
        recommendations=job_fit_data.get("recommendations", []),
        candidate_name=job_fit_data.get("candidate_name"),
        candidate_title=job_fit_data.get("job_title"),
        candidate_email=job_fit_data.get("contact_info", {}).get("email"),
        candidate_location=job_fit_data.get("contact_info", {}).get("location")
    )
    db.add(job_fit)
    db.commit()

    return {
        "fit_analysis_id": fit_analysis_id,
        "resume_id": request.id,
        "score": job_fit.job_fit_score,
        "candidate": {
            "name": job_fit.candidate_name,
            "email": job_fit.candidate_email,
            "title": job_fit.candidate_title,
            "location": job_fit.candidate_location
        },
        "analysis": {
            "gap_summary": job_fit.gap_summary,
            "strengths": job_fit.strengths,
            "matched": job_fit.matched_skills,
            "missing": job_fit.missing_skills,
            "recommendations": job_fit.recommendations
        }
    }

@router.get("/analysis-result/{analysis_id}")
async def get_analysis_result(analysis_id: str, db: Session = Depends(get_db)):
    result = db.query(JobFitAnalysis).filter(JobFitAnalysis.id == analysis_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Analysis record not found.")
    return result
