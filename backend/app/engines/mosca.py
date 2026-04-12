import math

# Mosca countdown logic
# X + Y > Z (Threat exists)
# X: Migration time
# Y: Data shelf life (Sensitivity)
# Z: Time until CRQC

SENSITIVITY_SHELF_LIFE = {
    "S1": 10,  # 10 years (Core payment)
    "S2": 7,   # 7 years (KYC/Identity)
    "S3": 5,   # 5 years (Transaction History)
    "S4": 3,   # 3 years (Internal Business)
    "S5": 1    # 1 year (Public Info)
}

CRQC_TIMELINE_YEARS = {
    "worst_case": 5,  # 5 years until CRQC
    "best_case": 15   # 15 years until CRQC
}

def calculate_mosca_clocks(migration_complexity: float, sensitivity_tier: str):
    # X = migration_complexity (normalized to years, 0.5 to 3 years)
    x = 0.5 + (migration_complexity * 2.5)
    y = SENSITIVITY_SHELF_LIFE.get(sensitivity_tier, 1)
    
    # Calculate days remaining until X+Y hits Z
    # Risk window onset: Z - (X + Y)
    
    z_worst = CRQC_TIMELINE_YEARS["worst_case"]
    z_best = CRQC_TIMELINE_YEARS["best_case"]
    
    days_remaining_worst = (z_worst - (x + y)) * 365.25
    days_remaining_best = (z_best - (x + y)) * 365.25
    
    risk_state = "SAFE"
    if days_remaining_worst <= 0:
        risk_state = "CRITICAL"
    elif days_remaining_worst < 365:
        risk_state = "WARNING"
    elif days_remaining_best < 365 * 3:
        risk_state = "MONITOR"
        
    return {
        "x_migration_years": x,
        "y_shelf_life": y,
        "days_remaining_worst": max(0, int(days_remaining_worst)),
        "days_remaining_best": int(days_remaining_best),
        "risk_state": risk_state
    }
