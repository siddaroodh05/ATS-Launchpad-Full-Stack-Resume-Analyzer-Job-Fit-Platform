import os
import json
from dotenv import load_dotenv
from google import genai

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in .env")

client = genai.Client(api_key=GEMINI_API_KEY)

def generate_mcqs_from_resume(resume_text: str) -> dict:
    """
    Generates 10 skill-based MCQs from a candidate's resume using Gemini 2.5 Flash.
    Returns a dictionary containing the list of MCQs or an error message.
    """
    
    prompt = f"""
You are a Senior Technical Interviewer. Your task is to validate a candidate's technical expertise through a skill-based assessment.

STRICT GUIDELINES:
1. Do NOT ask questions about the candidate's personal history, internship locations, or specific company names.
2. Identify core technical skills from the resume (e.g., IoT, Python, C Programming, Embedded Systems, Electronics).
3. Generate 10 high-quality, conceptual, or practical MCQs testing deep understanding of those skills.
4. Ensure questions range from basic to intermediate difficulty.
5. The "answer" must be the exact text of the correct option from the "options" list.

Candidate Resume Text:
{resume_text}

Return ONLY a JSON object with this structure:
{{
    "mcqs": [
        {{
            "question": "A technical question",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "answer": "Option B"
        }}
    ]
}}
"""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config={"response_mime_type": "application/json"}
        )
        return json.loads(response.text.strip())
    
    except Exception as e:
        return {"error": str(e), "mcqs": []}
