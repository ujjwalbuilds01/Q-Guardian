from sqlalchemy import Column, Integer, String, Float, DateTime
from data.database import Base
import datetime

class Asset(Base):
    __tablename__ = "assets"

    hostname = Column(String, primary_key=True, index=True)
    ip_address = Column(String, nullable=True)
    algorithm_strength = Column(String, default="RSA-2048")
    tls_version = Column(String, default="TLS 1.2")
    semantic_classification = Column(String, default="Unknown asset")
    semantic_sensitivity_score = Column(Integer, default=5)
    interceptability_score = Column(Integer, default=5)
    estimated_migration_months = Column(Integer, default=12)
    
    # Track discovery state
    last_scanned = Column(DateTime, default=datetime.datetime.utcnow)

class ScanHistory(Base):
    __tablename__ = "scan_history"
    
    id = Column(Integer, primary_key=True, index=True)
    hostname = Column(String, index=True)
    qtri_score = Column(Float)
    scan_date = Column(DateTime, default=datetime.datetime.utcnow)
