from pydantic import BaseModel
from typing import List

class MCQ(BaseModel):
    question: str
    options: List[str]
    answer: str

class AnalysisResult(BaseModel):
    skills_matched: List[str]
    skills_missing: List[str]
    ATS_score: int
    strengths: str
    weaknesses: str
    improvement_suggestions: str
    mcqs: List[MCQ]
    job_matches: List[str]

    class Config:
        orm_mode = True
