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
    "API7": "Security Misconfiguration"
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
    
    if not base_url.startswith("http"):
        base_url = "https://" + base_url

    # Test basic connectivity
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
    for _ in range(15):
        try:
            r = requests.get(base_url, timeout=2, verify=False)
            if r.status_code == 429:
                rate_limited = True
                break
        except:
            break
            
    if not rate_limited:
        findings.append({
            "id": "API4", 
            "severity": "HIGH", 
            "detail": "No rate limiting detected (HTTP 429 not returned on rapid requests)"
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
        "tls_enforced": base_url.startswith("https"),
        "security_headers": sec_headers,
        "header_score": header_score,
        "owasp_findings": findings,
        "cors_policy": {"allow_origin": cors_origin, "risk": cors_risk},
        "auth_required": auth_required,
        "info_disclosure": info_disclosure,
        "api_risk_score": api_risk_score,
        "endpoints_discovered": endpoints_checked
    }
