import asyncio
import random
from datetime import datetime
from data.database import SessionLocal
from data.models import Asset

# Simulated domains that might randomly pop up on PNB's network
DEMO_DOMAINS = [
    "vendor-portal.pnb.com",
    "legacy-payroll.pnb.com",
    "test-api-v2.pnb.com",
    "contractor-vpn.pnb.com",
    "qa-dashboard.pnb.com",
    "archived-db-node.pnb.com",
]

ALGORITHMS = ["RSA-1024", "RSA-2048", "ECDSA-P256", "RSA-4096"]
TLS_VERSIONS = ["TLS 1.0", "TLS 1.1", "TLS 1.2", "TLS 1.3"]

async def run_discovery_stream(interval_seconds: int = 45):
    """
    Simulates continuous asset discovery and vulnerability monitoring.
    Every `interval_seconds`, a new asset is 'discovered' or an existing one changes.
    """
    print("[Streamer] Starting Continuous Asset Monitoring Stream...")
    
    while True:
        await asyncio.sleep(interval_seconds)
        
        try:
            db = SessionLocal()
            
            # 30% chance to degrade an existing asset (configuration drift)
            # 70% chance to discover a new asset
            
            if random.random() < 0.3:
                # Degrade existing
                assets = db.query(Asset).all()
                if assets:
                    target = random.choice(assets)
                    print(f"[Streamer] ALERT: Configuration drift detected on {target.hostname}")
                    target.algorithm_strength = "RSA-1024" # Oh no, a downgrade!
                    target.interceptability_score = min(10, target.interceptability_score + 3)
                    db.commit()
            else:
                # Discover new
                # Find a domain not in DB
                existing_hostnames = {a.hostname for a in db.query(Asset).all()}
                available = [d for d in DEMO_DOMAINS if d not in existing_hostnames]
                
                if available:
                    new_host = random.choice(available)
                    print(f"[Streamer] DISCOVERY: New unmanaged asset found on edge -> {new_host}")
                    
                    new_asset = Asset(
                        hostname=new_host,
                        ip_address=f"10.0.{random.randint(1,255)}.{random.randint(1,255)}",
                        algorithm_strength=random.choice(ALGORITHMS),
                        tls_version=random.choice(TLS_VERSIONS),
                        semantic_classification=f"Automatically discovered endpoint ({new_host.split('.')[0]})",
                        semantic_sensitivity_score=random.randint(3, 9),
                        interceptability_score=random.randint(5, 10),
                        estimated_migration_months=random.randint(6, 24)
                    )
                    db.add(new_asset)
                    db.commit()
                    
        except Exception as e:
            print(f"[Streamer] Error in stream: {e}")
        finally:
            db.close()
