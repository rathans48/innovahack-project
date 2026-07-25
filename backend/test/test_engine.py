import os
import json
import pytest
import pandas as pd
from engine import compute_metrics

# Helper function to load JSON fixtures
def load_fixture(filename: str) -> pd.DataFrame:
    filepath = os.path.join(os.path.dirname(__file__), "sample_data", filename)
    with open(filepath, "r") as f:
        data = json.load(f)
    return pd.DataFrame(data["transactions"])

def test_healthy_business():
    """Test that a profitable business shows a healthy runway and no negative spikes."""
    df = load_fixture("healthy_business.json")
    metrics = compute_metrics(df)
    
    assert metrics["net_cashflow_avg"] > 0
    assert metrics["runway_status"] == "healthy"
    assert metrics["runway_days"] is None
    
    # Ensure no false positive spikes are generated
    assert len(metrics["expense_spikes"]) == 0

def test_burning_cash():
    """Test that a business spending more than it makes flags a critical runway status."""
    df = load_fixture("burning_cash.json")
    metrics = compute_metrics(df)
    
    assert metrics["net_cashflow_avg"] < 0
    
    # Because overall balance drops below 0 rapidly with massive expenses and low revenue,
    # the runway calculation should accurately mark it as critical.
    assert metrics["runway_status"] == "critical"
    assert isinstance(metrics["runway_days"], int)

def test_spiky_expenses():
    """Test that an isolated jump of >30% in a category triggers an expense spike alert."""
    df = load_fixture("spiky_expenses.json")
    metrics = compute_metrics(df)
    
    # Assert a spike was detected
    assert len(metrics["expense_spikes"]) > 0
    
    # Verify the specific category flagged is Software/Cloud
    spike_categories = [spike["category"] for spike in metrics["expense_spikes"]]
    assert "Software/Cloud" in spike_categories
    
    # Verify the spike logic (Nov/Dec avg was ~2050, Jan was 6500)
    cloud_spike = next(s for s in metrics["expense_spikes"] if s["category"] == "Software/Cloud")
    assert cloud_spike["pct_increase"] > 30.0
    assert cloud_spike["month"] == "2026-01"