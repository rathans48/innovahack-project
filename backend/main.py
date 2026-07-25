from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

from models import AnalyzeRequest
from engine import compute_metrics
from ai_advisor import generate_advisory

app = FastAPI(title="SMB Pulse API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/analyze-cashflow")
async def analyze_cashflow(payload: AnalyzeRequest):
    try:
        df = pd.DataFrame([t.model_dump() for t in payload.transactions])
        df["date"] = pd.to_datetime(df["date"])
        
        metrics = compute_metrics(df)
        ai_advisory = await generate_advisory(metrics, payload.company_name, payload.currency)
        
        return {
            "metrics": metrics,
            "ai_advisory": ai_advisory,
            "meta": {
                "analysis_period": {
                    "start": df["date"].min().strftime("%Y-%m-%d"),
                    "end": df["date"].max().strftime("%Y-%m-%d"),
                },
                "transaction_count": len(df),
            },
        }
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Analysis failed: {str(e)}")

@app.get("/health")
async def health():
    return {"status": "ok"}