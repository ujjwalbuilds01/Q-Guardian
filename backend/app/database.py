from sqlmodel import Field, SQLModel, create_engine, Session, select
from typing import Optional, List
from datetime import datetime
import json

sqlite_file_name = "qguardian.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, echo=False, connect_args=connect_args)

class DBScanJob(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    job_uuid: str = Field(index=True)
    domain: str
    status: str = Field(default="PENDING") # PENDING, SCANNING, COMPLETED, FAILED
    progress: int = Field(default=0)
    current_step: str = Field(default="Initializing...")
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())
    completed_at: Optional[str] = None
    
class DBAsset(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    asset_uuid: str = Field(index=True)
    job_uuid: str = Field(index=True)
    hostname: str
    tls_version: str
    algorithm: str
    key_size: int
    cipher_suite: str
    forward_secrecy: bool
    cert_valid: bool
    cert_expiry: str
    sensitivity_tier: str
    is_pqc: bool
    policy_compliant: bool
    qtri_score: int
    
    # Mosca data parsed as JSON
    mosca_data: str 
    
    # HNDL data parsed as JSON
    hndl_data: Optional[str] = None
    
    # Open ports JSON data
    open_ports_data: Optional[str] = None
    
    last_scanned: str

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
