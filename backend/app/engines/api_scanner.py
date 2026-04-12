import requests
import time
from urllib.parse import urljoin
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

OWASP_CHECKS = {
    "API1": "Broken Object Level Authorization",
    "API2": "Broken Authentication",
    "API3": "Excessive Data Exposure",
    "API4": "Lack of Rate Limiting",
    "API5": "Broken Function Level Authorization",
    "API6": "Server-Side Request Forgery",
    "API7": "Security Misconfiguration",
    "API8": "Insecure TLS / Automations",
    "API9": "Improper Assets Management",
    "API10": "Unsafe Consumption of APIs"
}

def analyze_security_headers(headers):
    # Normalize headers to lower case for case-insensitive lookup
    headers_lower = {k.lower(): v for k, v in headers.items()}
    
    security_headers = {
        "HSTS": "strict-transport-security" in headers_lower,
        "CSP": "content-security-policy" in headers_lower,
        "X-Frame-Options": "x-frame-options" in headers_lower,
        "X-Content-Type-Options": "x-content-type-options" in headers_lower,
        "X-XSS-Protection": "x-xss-protection" in headers_lower,
        "Cache-Control": "cache-control" in headers_lower and "no-store" in headers_lower.get("cache-control", ""),
        "CORS": "access-control-allow-origin" in headers_lower
    }
    
    score = sum(1 for val in security_headers.values() if val)
    total = len(security_headers)
    return security_headers, int((score / total) * 100), headers_lower.get("access-control-allow-origin")

def run_api_scan(base_url):
    findings = []
    info_disclosure = []
    endpoints_checked = []
    
    tls_enforced = False
    if base_url.startswith("https"):
        tls_enforced = True
        # Pass 1: Strict TLS Verification
        try:
            requests.get(base_url, timeout=4, verify=True)
        except requests.exceptions.SSLError as ssl_err:
            findings.append({
                "id": "API8",
                "severity": "CRITICAL",
                "detail": f"TLS Validation Failed. The API endpoints use an invalid/self-signed certificate, making it vulnerable to MITM interception."
            })
        except:
            pass # Other generic connection errors handled by main pass

    # Pass 2: Application Layer Scan
    try:
        response = requests.get(base_url, timeout=5, verify=False)
        endpoints_checked.append({"url": base_url, "status": response.status_code})
    except Exception as e:
        return {"error": f"Could not connect to {base_url}: {e}"}

    sec_headers, header_score, cors_origin = analyze_security_headers(response.headers)
    
    # Check Server Header (Info Disclosure)
    if "server" in response.headers:
        info_disclosure.append(f"Server header exposed: {response.headers['server']}")
    if "x-powered-by" in response.headers:
        info_disclosure.append(f"Framework exposed: {response.headers['x-powered-by']}")

    # Rate Limiting Check (API4)
    rate_limited = False
    start_time = time.time()
    for _ in range(20):
        try:
            r = requests.get(base_url, timeout=1, verify=False)
            if r.status_code in [429, 403, 503]:
                rate_limited = True
                break
        except:
            break
            
    total_time = time.time() - start_time
    avg_latency = total_time / 20
    
    if not rate_limited and avg_latency < 1.0:
        findings.append({
            "id": "API4", 
            "severity": "HIGH", 
            "detail": f"No rate limiting detected on rapid automated sweeps (Avg Response: {avg_latency:.2f}s)"
        })

    # CORS Policy Check
    cors_risk = "LOW"
    if cors_origin == "*":
        cors_risk = "HIGH"
        findings.append({
            "id": "API7",
            "severity": "MEDIUM",
            "detail": "Wildcard CORS origin (*) allowed"
        })

    # Endpoint Discovery & Auth Check
    common_paths = ['/api', '/v1', '/api/v1', '/swagger.json', '/openapi.json', '/health']
    auth_required = False
    
    for path in common_paths:
        target = urljoin(base_url, path)
        try:
            r = requests.get(target, timeout=3, verify=False)
            if r.status_code in [401, 403]:
                auth_required = True
            if r.status_code == 200:
                endpoints_checked.append({"url": target, "status": 200})
                if 'swagger' in path or 'openapi' in path:
                    info_disclosure.append(f"API documentation exposed at {target}")
                    findings.append({
                        "id": "API3",
                        "severity": "MEDIUM",
                        "detail": "Exposed API specs can lead to excessive data exposure"
                    })
        except:
            pass

    if not auth_required:
        findings.append({
            "id": "API2",
            "severity": "CRITICAL",
            "detail": "No authentication mechanism detected on common endpoints"
        })

    api_risk_score = header_score - (len(findings) * 10)
    api_risk_score = max(0, min(100, api_risk_score))

    return {
        "url": base_url,
        "status_code": response.status_code,
        "tls_enforced": tls_enforced,
        "security_headers": sec_headers,
        "header_score": header_score,
        "owasp_findings": findings,
        "cors_policy": {"allow_origin": cors_origin, "risk": cors_risk},
        "auth_required": auth_required,
        "info_disclosure": info_disclosure,
        "api_risk_score": api_risk_score,
        "endpoints_discovered": endpoints_checked
    }
