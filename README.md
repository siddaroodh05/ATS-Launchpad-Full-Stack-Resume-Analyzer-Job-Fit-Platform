# ATS Launchpod | Full-Stack Resume Analyzer & Job Fit Platform

ATS Launchpod is a full-stack application that empowers job seekers and HR professionals by analyzing resumes, generating skill-based MCQs, calculating job fit scores, and providing AI-driven job recommendations. Built with React, FastAPI, PostgreSQL, and Google Gemini AI, it offers a professional, end-to-end ATS optimization solution.

---

## 🚀 Features

- **Resume Upload & Analysis** – Extract candidate skills, strengths, weaknesses, and improvement suggestions.
- **Job Fit Assessment** – Evaluate resume alignment for a specific job description.
- **MCQ Generation** – Auto-generate technical or skill-based multiple-choice questions.
- **Job Recommendations** – AI-powered suggestions for job openings matching candidate skills.
- **PDF Reports** – Download ATS analysis reports in professional, well-aligned PDFs.
- **Interactive Frontend** – Built with React, Tailwind CSS, and Framer Motion for a smooth UX.
- **Backend** – FastAPI + PostgreSQL + SQLAlchemy for scalable REST APIs.
- **AI Integration** – Powered by Google Gemini AI (Gemini 2.5 Flash) for NLP tasks.

---

## 🛠 Tech Stack

- **Frontend:** React, Tailwind CSS, Framer Motion, React Router  
- **Backend:** FastAPI, SQLAlchemy, PostgreSQL  
- **AI Services:** Google Gemini AI  
- **PDF Generation:** ReportLab  
- **Environment Management:** Python virtual environment, Node.js  

---


---

## ⚡ Getting Started

### Backend Setup

```bash
cd backend
python -m venv myenv         # create virtual environment
# Activate environment:
# Windows: myenv\Scripts\activate
# Mac/Linux: source myenv/bin/activate
pip install -r requirements.txt

##Create a .env file:
GEMINI_API_KEY=<YOUR_GOOGLE_GEMINI_API_KEY>
DATABASE_URL=postgresql://username:password@localhost:5432/atslaunchpad

##Run the backend:

uvicorn app.main:app --reload





