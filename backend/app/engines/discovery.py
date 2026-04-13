import ssl
import socket
import datetime
import json
import requests
import urllib3
from cryptography import x509

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def get_subdomains_from_crtsh(domain: str):
    url = f"https://crt.sh/?q={domain}&output=json"
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            subdomains = set()
            for entry in data:
                subdomains.update(entry['name_value'].split('\n'))
            return list(subdomains)
    except Exception as e:
        print(f"Error fetching subdomains: {e}")
    return []

def get_real_tls_info(hostname: str):
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    result = {
        "tls_version": "Unknown",
        "cipher_suite": "Unknown",
        "cert_expiry": datetime.datetime.now().isoformat(),
        "algorithm": "Unknown",
        "key_size": 0,
        "cert_valid": False,
        "forward_secrecy": False,
        "is_pqc": False,
        "error": None
    }
    
    try:
        ip = socket.gethostbyname(hostname)
    except Exception as e:
        result["error"] = "DNS Resolution Failed"
        return result

    try:
        with socket.create_connection((hostname, 443), timeout=3) as sock:
            with ctx.wrap_socket(sock, server_hostname=hostname) as ssock:
                cert_bytes = ssock.getpeercert(binary_form=True)
                cipher = ssock.cipher()
                
                result["tls_version"] = cipher[1]
                result["cipher_suite"] = cipher[0]
                
                # Check for forward secrecy
                if "EECDH" in cipher[0] or "DHE" in cipher[0] or "TLS_AES" in cipher[0] or "TLS_CHACHA20" in cipher[0]:
                    result["forward_secrecy"] = True
                    
                # Parse exact cert data securely
                loaded_cert = x509.load_der_x509_certificate(cert_bytes)
                public_key = loaded_cert.public_key()
                result["cert_expiry"] = loaded_cert.not_valid_after_utc.isoformat()
                result["cert_valid"] = True
                
                from cryptography.hazmat.primitives.asymmetric import rsa, ec, x25519
                if isinstance(public_key, rsa.RSAPublicKey):
                    result["algorithm"] = f"RSA-{public_key.key_size}"
                    result["key_size"] = public_key.key_size
                elif isinstance(public_key, ec.EllipticCurvePublicKey):
                    result["algorithm"] = f"ECDSA-{public_key.curve.name}"
                    result["key_size"] = public_key.key_size
                elif isinstance(public_key, x25519.X25519PublicKey):
                    result["algorithm"] = "X25519"
                    result["key_size"] = 256
                else:
                    result["algorithm"] = public_key.__class__.__name__

                if "KYBER" in result["cipher_suite"] or "KEM" in result["cipher_suite"]:
                    result["is_pqc"] = True
    except Exception as e:
        result["error"] = str(e)
        
    return result

def scan_asset(hostname: str):
    is_pnb = "pnb" in hostname
    
    tls_data = get_real_tls_info(hostname)
    
    if tls_data.get("error"):
        tls_version = "Unknown"
        algorithm = "Unknown"
        cipher_suite = "Unknown"
        forward_secrecy = False
        cert_valid = False
    else:
        tls_version = tls_data["tls_version"].replace("TLSv", "")
        algorithm = tls_data["algorithm"]
        cipher_suite = tls_data["cipher_suite"]
        forward_secrecy = tls_data["forward_secrecy"]
        cert_valid = tls_data["cert_valid"]
        
    # Standardize sensitivity
    sensitivity = "S5"
    if "api" in hostname: sensitivity = "S1"
    elif "auth" in hostname: sensitivity = "S2"
    elif "vpn" in hostname: sensitivity = "S3"

    is_pqc = tls_data.get("is_pqc", False)

    return {
        "hostname": hostname,
        "tls_version": tls_version,
        "algorithm": algorithm,
        "key_size": tls_data.get("key_size", 0),
        "cipher_suite": cipher_suite,
        "forward_secrecy": forward_secrecy,
        "cert_valid": cert_valid,
        "cert_expiry": tls_data.get("cert_expiry") or datetime.datetime.now().isoformat(),
        "sensitivity_tier": sensitivity,
        "is_pqc": is_pqc,
        "policy_compliant": True if tls_version == "1.3" else False
    }

def run_discovery(domain: str):
    subdomains = get_subdomains_from_crtsh(domain)
    # Add domain itself if not in subdomains
    if domain not in subdomains:
        subdomains.insert(0, domain)
        
    results = []
    # Limit to top 5 for speed during standard scan
    for sub in subdomains[:5]:
        results.append(scan_asset(sub))
    return results
