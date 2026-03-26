from data.database import engine, Base, SessionLocal
from data.models import Asset
from data.mock_data import MOCK_CBOM

def init_db():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    print("Checking if database is empty...")
    if db.query(Asset).count() == 0:
        print("Seeding initial PNB assets...")
        for asset_data in MOCK_CBOM:
            new_asset = Asset(
                hostname=asset_data["hostname"],
                ip_address=asset_data["ip_address"],
                algorithm_strength=asset_data["algorithm_strength"],
                tls_version=asset_data["tls_version"],
                semantic_classification=asset_data["semantic_classification"],
                semantic_sensitivity_score=asset_data["semantic_sensitivity_score"],
                interceptability_score=asset_data["interceptability_score"],
                estimated_migration_months=asset_data["estimated_migration_months"]
            )
            db.add(new_asset)
        
        db.commit()
        print("Database seeded successfully with ", len(MOCK_CBOM), " assets.")
    else:
        print("Database already contains data. Skipping seed phase.")

    db.close()

if __name__ == "__main__":
    init_db()
