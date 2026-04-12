# QTRI Component Weighting
# PQC Adoption: 30%
# TLS Version: 20%
# Forward Secrecy: 15%
# Cert Hygiene: 15%
# Cipher Suite Strength: 10%
# Policy Compliance: 10%

def calculate_qtri_score(data: dict):
    score = 0
    # PQC Adoption (ML-KEM, SLH-DSA)
    if data.get("is_pqc", False):
        score += 30
    
    # TLS Version
    tls = data.get("tls_version", "1.0")
    if tls == "1.3": score += 20
    elif tls == "1.2": score += 10
    
    # Forward Secrecy
    if data.get("forward_secrecy", False):
        score += 15
        
    # Cert Hygiene (Expiry, Key Size)
    if data.get("cert_valid", False) and data.get("key_size", 0) >= 2048:
        score += 15
        
    # Cipher Strength
    cipher = data.get("cipher_suite", "")
    if "GCM" in cipher or "CHACHA20" in cipher:
        score += 10
        
    # Policy Compliance (Mocked for now)
    score += 10 if data.get("policy_compliant", False) else 0
    
    return min(100, score)

def calculate_cyber_rating(qtri_scores: list):
    if not qtri_scores:
        return 0
    avg_score = sum(qtri_scores) / len(qtri_scores)
    # Scale 0-100 to 0-1000
    return int(avg_score * 10)
