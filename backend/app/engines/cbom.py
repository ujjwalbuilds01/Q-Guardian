import json
from datetime import datetime

class CBOMGenerator:
    @staticmethod
    def generate_json(assets: list):
        cbom = {
            "metadata": {
                "timestamp": datetime.now().isoformat(),
                "tool": "Q-Guardian v2.0",
                "format": "CycloneDX-Compatible"
            },
            "components": []
        }
        
        for asset in assets:
            cbom["components"].append({
                "name": asset["hostname"],
                "type": "service",
                "cryptography": {
                    "algorithm": asset["algorithm"],
                    "key_size": asset["key_size"],
                    "tls_version": asset["tls_version"],
                    "forward_secrecy": asset["forward_secrecy"]
                },
                "risk": {
                    "qtri_score": asset.get("qtri_score"),
                    "mosca_status": asset.get("mosca_risk_state")
                }
            })
        return cbom

    @staticmethod
    def export_pdf(cbom_json: dict):
        # Placeholder for reportlab implementation
        return "PDF data would be here"
