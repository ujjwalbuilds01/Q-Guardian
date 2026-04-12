from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uuid
import json
from datetime import datetime
from sqlmodel import Session, select

# Import DB
from app.database import engine, create_db_and_tables, get_session, DBScanJob, DBAsset

# Import Engines
from app.engines.discovery import run_discovery, scan_asset
from app.engines.mosca import calculate_mosca_clocks
from app.engines.scoring import calculate_qtri_score, calculate_cyber_rating
from app.engines.hndl import calculate_hndl_exposure
from app.engines.cbom import CBOMGenerator
from app.engines.migration import get_migration_playbook
from app.engines.reporting import generate_board_brief_pdf
from app.engines.compliance import map_to_rbi_controls
from app.engines.port_scanner import run_port_scan
from app.engines.api_scanner import run_api_scan

from fastapi.responses import StreamingResponse
import io

app = FastAPI(title="Q-Guardian API", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

class ScanRequest(BaseModel):
    domain: str

class ApiScanRequest(BaseModel):
    url: str

@app.get("/")
async def root():
    return {"message": "Q-Guardian Quantum Transition Intelligence Platform API"}

def update_job_progress(job_uuid: str, progress: int, step: str, status: Optional[str] = None, session: Optional[Session] = None):
    # If no session provided, create one
    if session is None:
        with Session(engine) as new_session:
            _perform_update(new_session, job_uuid, progress, step, status)
    else:
        _perform_update(session, job_uuid, progress, step, status)

def _perform_update(session: Session, job_uuid: str, progress: int, step: str, status: Optional[str] = None):
    statement = select(DBScanJob).where(DBScanJob.job_uuid == job_uuid)
    job = session.exec(statement).first()
    if job:
        job.progress = progress
        job.current_step = step
        if status:
            job.status = status
        if status == "COMPLETED":
            job.completed_at = datetime.now().isoformat()
        session.add(job)
        session.commit()

def process_scan_background(job_uuid: str, domain: str):
    try:
        update_job_progress(job_uuid, 5, "Initializing engines...", "SCANNING")
        
        # Discovery Phase
        update_job_progress(job_uuid, 10, f"Running subdomain discovery for {domain}...")
        results = run_discovery(domain)
        
        total_assets = len(results)
        update_job_progress(job_uuid, 30, f"Discovered {total_assets} assets. Starting deep scan...")
        
        for idx, asset in enumerate(results):
            # We open a fresh session for each asset to avoid long-held locks
            with Session(engine) as session:
                # Port Scanning Phase
                progress_base = 30 + (idx / total_assets * 40)
                update_job_progress(job_uuid, int(progress_base), f"Scanning {asset['hostname']} ports...", session=session)
                
                port_result = run_port_scan(asset["hostname"])
                asset["open_ports"] = port_result.get("open_ports", [])
                
                # Analytics Phase
                update_job_progress(job_uuid, int(progress_base + 5), f"Calculating Q-TRI and Mosca metrics for {asset['hostname']}...", session=session)
                qtri = calculate_qtri_score(asset)
                mosca = calculate_mosca_clocks(0.5, asset["sensitivity_tier"])
                hndl = calculate_hndl_exposure(asset)
                
                db_asset = DBAsset(
                    asset_uuid=str(uuid.uuid4()),
                    job_uuid=job_uuid,
                    hostname=asset["hostname"],
                    tls_version=asset["tls_version"],
                    algorithm=asset["algorithm"],
                    key_size=asset["key_size"],
                    cipher_suite=asset["cipher_suite"],
                    forward_secrecy=asset["forward_secrecy"],
                    cert_valid=asset["cert_valid"],
                    cert_expiry=asset["cert_expiry"],
                    sensitivity_tier=asset["sensitivity_tier"],
                    is_pqc=asset["is_pqc"],
                    policy_compliant=asset["policy_compliant"],
                    qtri_score=qtri,
                    mosca_data=json.dumps(mosca),
                    hndl_data=json.dumps(hndl) if hndl else None,
                    last_scanned=datetime.now().isoformat()
                )
                session.add(db_asset)
                session.commit() # Commit each asset to ensure visibility during polling
                
        update_job_progress(job_uuid, 90, "Finalizing report and compliance mapping...")
        update_job_progress(job_uuid, 100, "Scan Complete", "COMPLETED")
    except Exception as e:
        print(f"SCAN ERROR for {domain}: {str(e)}")
        import traceback
        traceback.print_exc()
        update_job_progress(job_uuid, 0, f"Scan Failed: {str(e)}", "FAILED")

@app.post("/api/v1/scan/trigger")
async def trigger_scan(req: ScanRequest, background_tasks: BackgroundTasks, session: Session = Depends(get_session)):
    job_uuid = str(uuid.uuid4())
    job = DBScanJob(job_uuid=job_uuid, domain=req.domain, status="SCANNING")
    session.add(job)
    session.commit()
    
    background_tasks.add_task(process_scan_background, job_uuid, req.domain)
    
    return {"status": "success", "job_id": job_uuid}

@app.post("/api/v1/scan/api")
async def scan_api(req: ApiScanRequest):
    result = run_api_scan(req.url)
    return {"status": "success", "result": result}

@app.get("/api/v1/scan/{job_id}/status")
async def get_scan_status(job_id: str, session: Session = Depends(get_session)):
    job = session.exec(select(DBScanJob).where(DBScanJob.job_uuid == job_id)).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {
        "job_id": job.job_uuid, 
        "status": job.status, 
        "domain": job.domain,
        "progress": job.progress,
        "current_step": job.current_step
    }

@app.get("/api/v1/assets")
async def list_assets(session: Session = Depends(get_session)):
    assets = session.exec(select(DBAsset)).all()
    # Serialize back to dict format expected by frontend
    result = []
    for a in assets:
        adict = a.dict()
        adict["id"] = a.asset_uuid
        adict["mosca"] = json.loads(a.mosca_data)
        adict["hndl"] = json.loads(a.hndl_data) if a.hndl_data else None
        result.append(adict)
    return result

@app.get("/api/v1/enterprise/rating")
async def get_rating(session: Session = Depends(get_session)):
    assets = session.exec(select(DBAsset)).all()
    if not assets:
        return {"score": 0, "status": "N/A", "asset_count": 0}
        
    qtri_scores = [a.qtri_score for a in assets]
    rating = calculate_cyber_rating(qtri_scores)
    
    status = "F — Insecure"
    if rating > 700: status = "A — Excellent"
    elif rating > 400: status = "B/C — Good"
    elif rating > 200: status = "D — Needs Work"
    
    return {
        "score": rating,
        "status": status,
        "asset_count": len(assets)
    }

@app.get("/api/v1/migration/{asset_id}/playbook")
async def get_playbook(asset_id: str, session: Session = Depends(get_session)):
    asset = session.exec(select(DBAsset).where(DBAsset.asset_uuid == asset_id)).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return get_migration_playbook({"algorithm": asset.algorithm, "tls_version": asset.tls_version})

@app.get("/api/v1/reports/board-brief")
async def get_board_brief(session: Session = Depends(get_session)):
    assets = await list_assets(session)
    qtri_scores = [a["qtri_score"] for a in assets]
    rating_score = calculate_cyber_rating(qtri_scores) if qtri_scores else 0
    
    status = "F — Insecure"
    if rating_score > 700: status = "A — Excellent"
    elif rating_score > 400: status = "B/C — Good"
    
    rating = {"score": rating_score, "status": status, "asset_count": len(assets)}
    
    pdf_buffer = generate_board_brief_pdf(assets, rating)
    return StreamingResponse(pdf_buffer, media_type="application/pdf", headers={
        "Content-Disposition": "attachment; filename=PNB_Board_Brief.pdf"
    })

@app.get("/api/v1/compliance/rbi")
async def get_rbi_compliance(session: Session = Depends(get_session)):
    assets = await list_assets(session)
    return map_to_rbi_controls(assets)

class ChatMessage(BaseModel):
    message: str

from app.engines.chatbot import handle_chat_message
from app.engines.threat_intel import fetch_threat_intel

@app.post("/api/v1/chat")
async def chat_with_bot(req: ChatMessage, session: Session = Depends(get_session)):
    assets = await list_assets(session)
    context = {"assets": assets}
    response = handle_chat_message(req.message, context)
    return {"reply": response}

@app.get("/api/v1/threat-intel")
async def get_threat_intel():
    return fetch_threat_intel()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
