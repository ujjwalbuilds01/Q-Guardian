import random
from datetime import datetime, timedelta

# HNDL: Harvest Now, Decrypt Later
# Exposure = Traffic Volume * Redundancy * Sensitivity
# We model the window from "Harvest Start" (e.g. 2023) to "CRQC Arrival" (2030+)

def calculate_hndl_exposure(asset: dict):
    # Only relevant for assets without forward secrecy
    if asset.get("forward_secrecy", False):
        return None
    
    sensitivity_tier = asset.get("sensitivity_tier", "S5")
    sensitivity_multiplier = {
        "S1": 10.0, "S2": 5.0, "S3": 2.0, "S4": 1.0, "S5": 0.5
    }.get(sensitivity_tier, 0.5)
    
    # Deterministic traffic volume (GB/month) based on sensitivity and hostname hash
    base_volume = {
        "S1": 500, "S2": 300, "S3": 150, "S4": 50, "S5": 10
    }.get(sensitivity_tier, 10)
    
    # Add a deterministic pseudo-random factor using hostname length
    traffic_volume = base_volume + (len(asset.get("hostname", "")) * 5)
    
    # Months gathered so far (from 2023-01-01)
    harvest_start = datetime(2023, 1, 1)
    months_captured = (datetime.now() - harvest_start).days // 30
    
    total_gb_at_risk = traffic_volume * months_captured
    risk_value = total_gb_at_risk * sensitivity_multiplier
    
    return {
        "traffic_volume_monthly_gb": traffic_volume,
        "months_captured": months_captured,
        "total_gb_at_risk": total_gb_at_risk,
        "hndl_risk_score": round(risk_value, 2),
        "harvest_start_date": harvest_start.isoformat()
    }
