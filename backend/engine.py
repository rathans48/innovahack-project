import pandas as pd
import numpy as np

# Keyword mapping for fallback categorization
CATEGORY_KEYWORDS = {
    "Payroll": ["salary", "payroll", "wages"],
    "Rent": ["rent", "lease"],
    "Software/Cloud": ["aws", "azure", "gcp", "saas", "subscription", "software"],
    "Marketing": ["ads", "marketing", "facebook", "google ads"],
    "Utilities": ["electricity", "water", "internet", "utility"],
    "Revenue": [] # Handled dynamically based on positive amounts
}

def auto_categorize(description: str, amount: float) -> str:
    """Fallback logic to categorize transactions based on description and amount."""
    if pd.isna(description):
        return "Uncategorized"
    
    if amount > 0:
        return "Revenue"
        
    desc_lower = str(description).lower()
    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(kw in desc_lower for kw in keywords):
            return category
            
    return "Other Expenses"

def compute_metrics(df: pd.DataFrame) -> dict:
    """
    Computes financial metrics, monthly trends, breakdown, and expense spikes
    from a DataFrame of transactions.
    """
    # Handle empty DataFrame edge case
    if df.empty:
        return _empty_metrics_fallback()

    df = df.copy()
    
    # 1. Ensure date is datetime and amount is float
    df["date"] = pd.to_datetime(df["date"])
    df["amount"] = df["amount"].astype(float)
    
    # 2. Auto-categorization fallback
    if "category" not in df.columns or df["category"].isna().any():
        df["category"] = df.apply(
            lambda r: r["category"] if pd.notna(r.get("category")) else auto_categorize(r.get("description", ""), r["amount"]),
            axis=1
        )

    # Convert dates to Monthly period strings for grouping
    df["month"] = df["date"].dt.to_period("M").astype(str)

    # --- Monthly Aggregates ---
    # Group by month and calculate revenue (sum of positive) and expense (abs sum of negative)
    monthly = df.groupby("month").apply(
        lambda g: pd.Series({
            "revenue": g.loc[g["amount"] > 0, "amount"].sum(),
            "expense": abs(g.loc[g["amount"] < 0, "amount"].sum())
        })
    ).reset_index()
    
    # Fill NaN with 0 for edge cases where a month has only revenue or only expenses
    monthly.fillna({"revenue": 0.0, "expense": 0.0}, inplace=True)
    monthly["net"] = monthly["revenue"] - monthly["expense"]
    
    monthly_revenue_avg = monthly["revenue"].mean()
    monthly_expense_avg = monthly["expense"].mean()
    net_cashflow_avg = monthly_revenue_avg - monthly_expense_avg

    # --- Burn Rate & Runway ---
    burn_rate_monthly = monthly_expense_avg
    current_balance = df["amount"].sum()
    
    if net_cashflow_avg >= 0:
        runway_days = None
        runway_status = "healthy"
    else:
        monthly_net_burn = abs(net_cashflow_avg)
        # Avoid division by zero edge case
        runway_days = int((current_balance / monthly_net_burn) * 30) if monthly_net_burn > 0 else 0
        runway_status = "critical" if runway_days < 90 else ("warning" if runway_days < 180 else "healthy")

    # --- Expense Breakdown ---
    expense_df = df[df["amount"] < 0].copy()
    expense_df["amount_abs"] = expense_df["amount"].abs()
    
    expense_breakdown = []
    if not expense_df.empty:
        breakdown = expense_df.groupby("category")["amount_abs"].sum().sort_values(ascending=False).reset_index()
        total_expense = breakdown["amount_abs"].sum()
        
        if total_expense > 0:
            breakdown["percentage"] = (breakdown["amount_abs"] / total_expense * 100).round(1)
            expense_breakdown = [
                {"category": r["category"], "amount": round(r["amount_abs"], 2), "percentage": r["percentage"]}
                for _, r in breakdown.iterrows()
            ]

    # --- Expense Spike Detection (>30% MoM Jump) ---
    spikes = []
    if not expense_df.empty:
        cat_monthly = expense_df.groupby(["month", "category"])["amount_abs"].sum().reset_index().sort_values("month")
        
        for category, group in cat_monthly.groupby("category"):
            group = group.sort_values("month")
            if len(group) < 2:
                continue
                
            # Compute prior rolling average excluding the current month
            group["prior_avg"] = group["amount_abs"].shift(1).expanding().mean()
            latest = group.iloc[-1]
            
            if pd.notna(latest["prior_avg"]) and latest["prior_avg"] > 0:
                pct_increase = ((latest["amount_abs"] - latest["prior_avg"]) / latest["prior_avg"]) * 100
                if pct_increase > 30:
                    spikes.append({
                        "category": category,
                        "month": str(latest["month"]),
                        "amount": round(latest["amount_abs"], 2),
                        "prior_avg": round(latest["prior_avg"], 2),
                        "pct_increase": round(pct_increase, 1)
                    })

    # Sort spikes by highest percentage increase
    expense_spikes = sorted(spikes, key=lambda x: -x["pct_increase"])

    return {
        "current_balance": round(current_balance, 2),
        "monthly_revenue_avg": round(monthly_revenue_avg, 2),
        "monthly_expense_avg": round(monthly_expense_avg, 2),
        "net_cashflow_avg": round(net_cashflow_avg, 2),
        "burn_rate_monthly": round(burn_rate_monthly, 2),
        "runway_days": runway_days,
        "runway_status": runway_status,
        "expense_breakdown": expense_breakdown,
        "monthly_trend": monthly.to_dict(orient="records"),
        "expense_spikes": expense_spikes
    }

def _empty_metrics_fallback() -> dict:
    """Helper to return empty safe metrics if dataframe has no data."""
    return {
        "current_balance": 0.0,
        "monthly_revenue_avg": 0.0,
        "monthly_expense_avg": 0.0,
        "net_cashflow_avg": 0.0,
        "burn_rate_monthly": 0.0,
        "runway_days": None,
        "runway_status": "healthy",
        "expense_breakdown": [],
        "monthly_trend": [],
        "expense_spikes": []
    }