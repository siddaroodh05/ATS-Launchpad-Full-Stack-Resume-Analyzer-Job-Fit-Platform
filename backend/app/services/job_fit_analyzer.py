import os
import json
from dotenv import load_dotenv
from google import genai

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in .env")

client = genai.Client(api_key=GEMINI_API_KEY)

def reanalyze_resume(resume_text: str, job_description: str) -> dict:
    """
    Analyzes job fit using Gemini 2.5 Flash.
    Returns structured JSON with extraction and gap analysis.
    """
    
    prompt = f"""
You are an expert HR Data Scientist and ATS Optimizer.

STRICT RULES:
- Respond ONLY in valid JSON.
- Do NOT use markdown code blocks.
- Do NOT add any text outside the JSON object.

Job Description:
{job_description}

Candidate Resume:
{resume_text}

Return JSON with exactly these keys:
- candidate_name: Full name of the candidate.
- job_title: Current or target professional title.
- contact_info: 
    - email: Candidate's email address.
    - location: Candidate's city and country/state.
- job_fit_score: Integer (0-100) representing match percentage.
- strengths: Array of strings (exactly 3) highlighting professional assets relevant to this JD.
- gap_summary: Concise 2-sentence explanation of overall alignment and key missing areas.
- matched_skills: Array of strings representing skills found in both.
- missing_skills: Array of strings representing required skills not found in the resume.
- recommendations: Array of actionable steps to improve fit for THIS role.
"""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        if not response or not response.text:
            return {"error": "No response text received from Gemini 2.5 Flash"}

        raw_text = response.text.strip()
        if raw_text.startswith("```"):
            raw_text = raw_text.replace("```json", "").replace("```", "").strip()

        return json.loads(raw_text)

    except Exception as e:
        return {
            "error": "Failed to analyze job fit with Gemini 2.5 Flash",
            "details": str(e),
            "candidate_name": "Unknown",
            "job_fit_score": 0,
            "matched_skills": [],
            "missing_skills": [],
            "strengths": [],
            "recommendations": ["Ensure the model 'gemini-2.5-flash' is available for this API key."]
        }
