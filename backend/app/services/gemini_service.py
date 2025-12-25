import os
import json
from dotenv import load_dotenv
from google import genai

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in .env")

client = genai.Client(api_key=GEMINI_API_KEY)

def get_job_recommendations(resume_text: str) -> list:
    """
    Analyze resume and return 6 matching job openings using Gemini 2.5 Flash.
    Returns a list of job objects in JSON format.
    """
    
    prompt = f"""
You are an expert ATS (Applicant Tracking System). Analyze the following resume text and find 6 real-world current job openings that match the candidate's skills.

RESUME TEXT:
{resume_text}

STRICT RULES:
- Return ONLY a JSON array.
- Do NOT use markdown code blocks.
- Do NOT add text outside JSON.
- 'package' must be in Lakhs (INR), e.g., "₹18L - ₹25L".
- 'match_score' must be an integer (0-100).
- Provide 6 distinct job objects.

JSON STRUCTURE:
[
  {{
    "company": "Company Name",
    "job_title": "Title",
    "location": "City, State",
    "package": "₹24L - ₹32L",
    "skills_required": ["Skill 1", "Skill 2", "Skill 3", "Skill 4"],
    "match_score": 94,
    "apply_link": "URL"
  }}
]
"""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config={'response_mime_type': 'application/json'}
        )

        if not response or not response.text:
            return [{"error": "No response text received from Gemini 2.5 Flash"}]

        raw_text = response.text.strip()
        if raw_text.startswith("```"):
            raw_text = raw_text.replace("```json", "").replace("```", "").strip()

        return json.loads(raw_text)

    except Exception as e:
        return [{
            "error": "Failed to fetch job matches",
            "details": str(e)
        }]
