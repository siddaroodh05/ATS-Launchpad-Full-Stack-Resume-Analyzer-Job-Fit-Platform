import os
from dotenv import load_dotenv
from google import genai
import json

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in .env")

client = genai.Client(api_key=GEMINI_API_KEY)

def analyze_resume(resume_text: str, job_description: str | None) -> dict:
    job_desc_text = job_description if job_description else "No job description provided."

    prompt = f"""
You are an ATS resume analyzer.

STRICT RULES:
- Respond ONLY in valid JSON
- Do NOT use markdown
- Do NOT wrap response in ```json
- Do NOT add explanations outside JSON

Job Description:
{job_desc_text}

Candidate Resume:
{resume_text}

Return JSON with the following keys:
- candidate_name: Full name of the candidate.
- job_title: Current or target professional title (e.g., Frontend Developer).
- contact_info: 
    - email: Candidate's email address.
    - location: Candidate's city and country/state (e.g., Bengaluru, IN).
- professional_summary: A 2-3 sentence overview of their experience and key stack.
- ats_compatibility_score: Integer between 0 and 100.
- strengths: Array of 3 key professional highlights.
- weaknesses: Array of 3 areas for improvement.
- improvement_suggestions: Array of actionable resume tips.
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    raw_text = response.text.strip()

    if raw_text.startswith("```"):
        raw_text = raw_text.replace("```json", "").replace("```", "").strip()

    try:
        return json.loads(raw_text)
    except json.JSONDecodeError:
        return {
            "error": "Invalid JSON returned by Gemini",
            "raw_text": response.text
        }
