from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import uuid4
from pydantic import BaseModel
from typing import Optional

from ..database import get_db
from .. import models
from ..services.mcq_generator import generate_mcqs_from_resume

router = APIRouter(prefix="/resume", tags=["MCQs"])

class MCQRequest(BaseModel):
    id: str
    extracted_text: str
    filename: str
    job_fit_analysis_id: Optional[str] = None

@router.post("/generate-mcqs")
async def generate_mcqs(request: MCQRequest, db: Session = Depends(get_db)):
    resume = db.query(models.Resume).filter(models.Resume.id == request.id).first()
    if not resume:
        resume = models.Resume(
            id=request.id,
            filename=request.filename,
            extracted_text=request.extracted_text
        )
        db.add(resume)
        db.flush()

    ai_response = generate_mcqs_from_resume(request.extracted_text)
    if "error" in ai_response:
        raise HTTPException(status_code=503, detail=ai_response["error"])

    mcq_list = ai_response.get("mcqs", [])
    for item in mcq_list:
        new_mcq = models.MCQ(
            id=str(uuid4()),
            resume_id=request.id,
            fit_analysis_id=request.job_fit_analysis_id,
            question_text=item.get("question"),
            options=item.get("options"),
            answer=item.get("answer")
        )
        db.add(new_mcq)

    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    return {
        "resume_id": request.id,
        "count": len(mcq_list),
        "mcqs": ai_response["mcqs"]
    }

@router.get("/get-stored-mcqs/{resume_id}")
async def get_stored_mcqs(resume_id: str, db: Session = Depends(get_db)):
    questions = db.query(models.MCQ).filter(models.MCQ.resume_id == resume_id).all()
    if not questions:
        raise HTTPException(status_code=404, detail="No MCQs found for this resume.")
    return questions
