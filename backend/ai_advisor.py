import os
import json
import asyncio
from google import genai
from config import GEMINI_API_KEY

# Exact prompt defined in Section 4.3
SYSTEM_PROMPT = """You are a senior financial advisor for small and medium
businesses (SMBs). You will receive structured cashflow metrics for a
business. Your job is to produce a strict JSON response - no markdown,
no prose outside the JSON - following EXACTLY this schema:

{
  "health_score": <integer 1-100>,
  "executive_summary": "<2-3 plain-English sentences, no jargon>",
  "alerts": [
    {
      "severity": "<high|medium|low>",
      "title": "<short 3-6 word title>",
      "message": "<1 sentence explaining the concern>"
    }
  ],
  "actionable_recommendations": [
    "<specific, concrete recommendation>",
    "<specific, concrete recommendation>",
    "<specific, concrete recommendation>"
  ]
}

Rules:
- health_score reflects runway length, cashflow trend direction, and
  expense volatility (100 = excellent, <40 urgent concern).
- Generate 1-4 alerts based on actual anomalies in the data (spikes,
  negative net cashflow, short runway, expense concentration risk).
- If nothing concerning exists, return a single "low" severity
  informational alert praising a specific strength.
- actionable_recommendations must be exactly 3 items, specific to the
  numbers given (reference actual category names and amounts), never
  generic advice like "reduce costs."
- Never invent numbers not present in the input data.
- Output ONLY valid JSON. No preamble, no code fences, no trailing text."""

def get_fallback_advisory() -> dict:
    """Used if the LLM call fails or times out - keeps the demo alive."""
    return {
        "health_score": 60,
        "executive_summary": "Financial analysis completed based on transaction data. AI components are currently warming up.",
        "alerts": [
            {
                "severity": "low", 
                "title": "AI Advisory Unavailable", 
                "message": "Metrics calculated successfully, but AI insights timed out."
            }
        ],
        "actionable_recommendations": [
            "Review the expense breakdown chart for your largest cost categories.",
            "Check the spike alerts panel for any unusual monthly increases.",
            "Re-run the analysis in a moment to retrieve AI-generated insights."
        ]
    }

async def _call_gemini_api(metrics: dict, company_name: str, currency: str) -> dict:
    """Internal helper to format the prompt and execute the Gemini API call."""
    user_prompt = (
        f"Business: {company_name}\n"
        f"Currency: {currency}\n"
        f"Metrics:\n{json.dumps(metrics, indent=2, default=str)}\n\n"
        "Analyze this and return the JSON advisory now."
    )
    
    # Initialize genai client using our config
    client = genai.Client(api_key=GEMINI_API_KEY)
    
    # Define our preferred models in order (newest/best first)
    # Define our preferred models in order (active 2026 free-tier models)
    preferred_models = [
        "gemini-3.5-flash",
        "gemini-3-flash-preview",
        "gemini-2.5-flash"
    ]
    
    for model_name in preferred_models:
        try:
            print(f"Attempting to use model: {model_name}...")
            response = await client.aio.models.generate_content(
                model=model_name,
                contents=user_prompt,
                config={
                    "system_instruction": SYSTEM_PROMPT,
                    "response_mime_type": "application/json",
                }
            )
            print(f"Success! Generated advisory using {model_name}.")
            return json.loads(response.text)
            
        except Exception as e:
            # If it's a quota error or the model is down, catch it and loop to the next one
            print(f"Model {model_name} failed. Moving to next available model. Error: {str(e).split('.')[0]}")
            continue
            
    # If it loops through all models and they ALL fail, raise an error 
    # so the main generate_advisory function can return our safe fallback JSON.
    raise Exception("All available Gemini models exhausted or failed.")

async def generate_advisory(metrics: dict, company_name: str, currency: str) -> dict:
    """
    Calls Google Gemini API for an AI advisory report.
    Includes a 30-second timeout, one JSONDecodeError retry, and a fallback safe response.
    """
    max_retries = 1
    
    for attempt in range(max_retries + 1):
        try:
            # Increased timeout to 30 seconds for the first "cold start" API call
            return await asyncio.wait_for(
                _call_gemini_api(metrics, company_name, currency),
                timeout=30.0
            )
        except json.JSONDecodeError:
            if attempt < max_retries:
                continue 
            print("Failed to decode JSON from LLM after retry. Falling back.")
            return get_fallback_advisory()
        except asyncio.TimeoutError:
            print("LLM call timed out. Falling back.")
            return get_fallback_advisory()
        except Exception as e:
            print(f"LLM call failed with error: {str(e)}. Falling back.")
            return get_fallback_advisory()
            
    return get_fallback_advisory()