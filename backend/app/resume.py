from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from .database import get_db
from .models import Resume, ResumeAnalysis
from .analyze import analyze_resume
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
from io import BytesIO
from app.services.pdf_generator import generate_analysis_pdf

router = APIRouter(prefix="/resume", tags=["Resume"])

class AnalysisRequest(BaseModel):
    id: str
    extracted_text: str
    filename: str
    job_description: Optional[str] = None

@router.post("/analyze-text")
async def analyze_text_endpoint(request: AnalysisRequest, db: Session = Depends(get_db)):
    existing_resume = db.query(Resume).filter(Resume.id == request.id).first()
    if existing_resume:
        analysis = db.query(ResumeAnalysis).filter(ResumeAnalysis.id == request.id).first()
        return {"analysis_id": analysis.id, "analysis_result": analysis.analysis_result}

    resume = Resume(
        id=request.id,
        filename=request.filename,
        extracted_text=request.extracted_text
    )
    db.add(resume)
    db.commit()

    analysis_json = analyze_resume(
        resume_text=request.extracted_text,
        job_description=request.job_description
    )

    analysis = ResumeAnalysis(
        id=request.id,
        resume_id=resume.id,
        analysis_result=analysis_json
    )
    db.add(analysis)
    db.commit()

    return {
        "analysis_id": request.id,
        "analysis_result": analysis_json
    }

@router.get("/analysis/{analysis_id}")
def get_analysis(analysis_id: str, db: Session = Depends(get_db)):
    analysis = db.query(ResumeAnalysis).filter(ResumeAnalysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    return {
        "analysis_id": analysis.id,
        "resume_id": analysis.resume_id,
        "job_description_id": analysis.job_description_id,
        "analysis_result": analysis.analysis_result,
        "created_at": analysis.created_at
    }
    
@router.get("/analysis/{analysis_id}/download-pdf")
def download_analysis_pdf(analysis_id: str, db: Session = Depends(get_db)):
    analysis = db.query(ResumeAnalysis).filter(ResumeAnalysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    result = analysis.analysis_result
    ats_score = result.get("ats_compatibility_score", 0)
    strengths = result.get("strengths", [])
    weaknesses = result.get("weaknesses", [])
    suggestions = result.get("improvement_suggestions", [])

    pdf_buffer = generate_analysis_pdf(
        analysis_id=analysis.id,
        ats_score=ats_score,
        strengths=strengths,
        weaknesses=weaknesses,
        suggestions=suggestions
    )

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=analysis_{analysis_id}.pdf"}
    )

