from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .resume import router as resume_router
from app.routes import analysis, mcq
from app.routes.job_match_routes import router as job_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="ATSLaunchPod Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "ATSLaunchPod API is running"}

app.include_router(resume_router)
app.include_router(analysis.router)
app.include_router(mcq.router)
app.include_router(job_router)
