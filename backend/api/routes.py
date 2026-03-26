from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from io import BytesIO
import datetime

from data.database import get_db
from data.models import Asset, ScanHistory
from intelligence.survival_modeling import SurvivalModeler
from intelligence.red_team_simulator import RedTeamSimulator
from intelligence.complexity_model import MigrationComplexityModel
from intelligence.narrative_generator import RiskNarrativeGenerator
from data.crtsh_client import CrtshClient
from data.ssllabs_client import SSLLabsClient
from intelligence.semantic_classifier import SemanticAssetClassifier
from reports.board_brief import generate_board_brief

router = APIRouter()
survival_modeler = SurvivalModeler()
red_team = RedTeamSimulator()
complexity_model = MigrationComplexityModel()
narrator = RiskNarrativeGenerator()
crtsh = CrtshClient()
ssllabs = SSLLabsClient()
classifier = SemanticAssetClassifier()

# ── Request models ──────────────────────────────────────

class ScenarioRequest(BaseModel):
    crqc_year: int = 2031
    migration_start_year: int = 2026

# ── Existing endpoints ──────────────────────────────────

@router.get("/portfolio/summary")
def get_portfolio_summary(db: Session = Depends(get_db)):
    """
    High-level stats for the dashboard header.
    """
    total_assets = db.query(Asset).count()
    quantum_debt = total_assets * 8500
    
    return {
        "assets_scanned": total_assets,
        "quantum_debt_rate": quantum_debt,
        "debt_trend": "+12%",
        "median_survival_horizon": 4.2
    }

@router.get("/portfolio/cbom")
async def get_cbom(db: Session = Depends(get_db)):
    """
    Returns the Cryptographic Bill of Materials enriched with Red Team priority,
    migration complexity, and semantic classification from the SQLite DB.
    """
    assets = db.query(Asset).all()
    db_cbom = [
        {
            "hostname": a.hostname,
            "ip_address": a.ip_address,
            "algorithm_strength": a.algorithm_strength,
            "tls_version": a.tls_version,
            "semantic_classification": a.semantic_classification,
            "semantic_sensitivity_score": a.semantic_sensitivity_score,
            "interceptability_score": a.interceptability_score,
            "estimated_migration_months": a.estimated_migration_months
        }
        for a in assets
    ]

    prioritized = red_team.generate_harvest_priority(db_cbom)
    complexities = complexity_model.predict_batch(db_cbom)
    complexity_lookup = {c["hostname"]: c for c in complexities}

    enriched_cbom = []
    for prio in prioritized:
        orig = next((item for item in db_cbom if item["hostname"] == prio["hostname"]), None)
        if orig:
            merged = {**orig, **prio}
            merged["semantic_classification"] = orig["semantic_classification"]
            merged["semantic_sensitivity_score"] = orig["semantic_sensitivity_score"]

            curve = survival_modeler.calculate_survival_curve(
                algorithm_strength=orig.get("algorithm_strength", "RSA-2048"),
                data_sensitivity=merged["semantic_sensitivity_score"]
            )
            merged["survival_curve"] = curve

            comp = complexity_lookup.get(orig["hostname"], {})
            merged["complexity_level"] = comp.get("complexity_level", "MEDIUM")
    """
    Recalculate survival curves under a custom CRQC arrival / migration scenario.
    """
    original_target = survival_modeler.median_crqc_year
    survival_modeler.median_crqc_year = scenario.crqc_year

    assets = db.query(Asset).all()
    results = []
    for asset in assets:
        curve = survival_modeler.calculate_survival_curve(
            algorithm_strength=asset.algorithm_strength,
            data_sensitivity=asset.semantic_sensitivity_score,
            start_year=scenario.migration_start_year,
        )
        results.append({
            "hostname": asset.hostname,
            "survival_curve": curve,
            "scenario": {
                "crqc_year": scenario.crqc_year,
                "migration_start_year": scenario.migration_start_year,
            }
        })

    survival_modeler.median_crqc_year = original_target
    return {"data": results}

@router.get("/portfolio/narrative/{hostname}")
def get_narrative(hostname: str, db: Session = Depends(get_db)):
    """
    Returns the LLM-generated risk narrative for a specific asset.
    """
    asset = db.query(Asset).filter(Asset.hostname == hostname).first()
    if not asset:
        raise HTTPException(status_code=404, detail=f"Asset '{hostname}' not found")
        
    asset_dict = {
        "hostname": asset.hostname,
        "algorithm_strength": asset.algorithm_strength,
        "semantic_sensitivity_score": asset.semantic_sensitivity_score,
        "interceptability_score": asset.interceptability_score,
        "estimated_migration_months": asset.estimated_migration_months,
        "tls_version": asset.tls_version,
        "semantic_classification": asset.semantic_classification
    }

    prioritized = red_team.generate_harvest_priority([asset_dict])
    enriched = {**asset_dict, **(prioritized[0] if prioritized else {})}

    survival = survival_modeler.calculate_survival_curve(
        algorithm_strength=asset.algorithm_strength,
        data_sensitivity=asset.semantic_sensitivity_score
    )

    narrative = narrator.generate_narrative(enriched, {"curve": survival})
    comp = complexity_model.predict_complexity(asset_dict)

    return {
        "hostname": hostname,
        "narrative": narrative,
        "complexity": comp,
    }

@router.get("/portfolio/cbom/{hostname}/certlogs")
async def get_cert_logs(hostname: str):
    """
    Returns Certificate Transparency log entries for a hostname.
    """
    domain = ".".join(hostname.split(".")[-2:]) if "." in hostname else hostname
    logs = await crtsh.get_certificates(domain)
    return {"hostname": hostname, "domain": domain, "certificates": logs}

@router.get("/reports/board-brief")
def download_board_brief(db: Session = Depends(get_db)):
    """
    Generates and streams a PDF Board Brief.
    """
    total_assets = db.query(Asset).count()
    
    summary = {
        "assets_scanned": total_assets,
        "quantum_debt_rate": total_assets * 8500,
        "debt_trend": "+12%",
    }
    
    assets = db.query(Asset).all()
    db_cbom = [{"hostname": a.hostname, "interceptability_score": a.interceptability_score} for a in assets]
    top_targets = red_team.generate_harvest_priority(db_cbom)[:3]

    pdf_bytes = generate_board_brief(
        summary=summary,
        top_targets=top_targets,
        survival_horizon_years=4.2,
    )

    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": "attachment; filename=Q-Guardian_Board_Brief.pdf"
        }
    )
