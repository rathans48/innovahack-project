import os
from dotenv import load_dotenv

# Load environment variables from a .env file if present
load_dotenv()

# Fetch the Gemini API key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")