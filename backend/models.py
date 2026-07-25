from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date

class Transaction(BaseModel):
    date: date
    description: str
    amount: float
    category: Optional[str] = None

class AnalyzeRequest(BaseModel):
    company_name: str = "Your Business"
    currency: str = "USD"
    transactions: List[Transaction] = Field(..., min_length=3)