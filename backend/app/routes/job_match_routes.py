from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.services.gemini_service import get_job_recommendations
from app.database import get_db
from app.models import JobMatch, Resume

router = APIRouter(prefix="/api/jobs", tags=["Job Match"])

class MatchRequest(BaseModel):
    id: str
    extracted_text: str
    filename: str

@router.post("/match")
async def create_job_match(request: MatchRequest, db: Session = Depends(get_db)):
    try:
        resume = db.query(Resume).filter(Resume.id == request.id).first()
        if not resume:
            resume = Resume(
                id=request.id,
                filename=request.filename,
                extracted_text=request.extracted_text
            )
            db.add(resume)
            db.flush()

        matches = get_job_recommendations(request.extracted_text)
        if isinstance(matches, list) and len(matches) > 0 and "error" in matches[0]:
            raise HTTPException(status_code=500, detail=matches[0]["error"])

        existing_match = db.query(JobMatch).filter(JobMatch.id == request.id).first()
        if existing_match:
            existing_match.match_results = matches
        else:
            new_match = JobMatch(
                id=request.id,
                resume_id=request.id,
                filename=request.filename,
                match_results=matches
            )
            db.add(new_match)

        db.commit()
        return {"id": request.id, "matches": matches}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/match/{resume_id}")
async def get_stored_matches(resume_id: str, db: Session = Depends(get_db)):
    record = db.query(JobMatch).filter(JobMatch.id == resume_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="No matches found for this ID")

    return {
        "id": record.id,
        "filename": record.filename,
        "matches": record.match_results,
        "created_at": record.created_at
    }
