import requests
import time
import json

API_BASE = "http://localhost:8000/api/v1"
DOMAIN = "manipurrural.bank.in"

def run_test():
    print(f"Triggering scan for {DOMAIN}...")
    try:
        res = requests.post(f"{API_BASE}/scan/trigger", json={"domain": DOMAIN}, timeout=10)
        res.raise_for_status()
        job_id = res.json()["job_id"]
        print(f"Scan triggered successfully. Job ID: {job_id}")
    except Exception as e:
        print(f"Failed to trigger scan: {e}")
        return

    # Polling for completion
    print("Polling for scan completion (this may take a minute)...")
    for _ in range(30): # 60 seconds max
        try:
            status_res = requests.get(f"{API_BASE}/scan/{job_id}/status")
            status_res.raise_for_status()
            status = status_res.json()["status"]
            print(f"Current Status: {status}")
            if status == "COMPLETED":
                break
            if status == "FAILED":
                print("Scan failed on backend.")
                return
        except Exception as e:
            print(f"Polling error: {e}")
        time.sleep(2)
    else:
        print("Scan timed out or still running.")
        return

    # Fetching results
    print("\nFetching scan results...")
    try:
        assets_res = requests.get(f"{API_BASE}/assets")
        assets_res.raise_for_status()
        all_assets = assets_res.data if hasattr(assets_res, 'data') else assets_res.json()
        
        # Filter for current domain
        relevant_assets = [a for a in all_assets if DOMAIN in a["hostname"]]
        
        if not relevant_assets:
            print("No assets found for this domain.")
            return

        print(f"\nDiscovered {len(relevant_assets)} assets:")
        for asset in relevant_assets:
            print(f"- {asset['hostname']}")
            print(f"  QTRI Score: {asset['qtri_score']}")
            print(f"  Algorithm: {asset['algorithm']} ({asset['tls_version']})")
            print(f"  MOSCA Risk: {asset['mosca']['risk_state']}")
            print(f"  Ports: {asset.get('open_ports', [])}")
            print("-" * 20)

        # Rating
        rating_res = requests.get(f"{API_BASE}/enterprise/rating")
        print(f"\nEnterprise Rating: {rating_res.json()}")

    except Exception as e:
        print(f"Failed to fetch results: {e}")

if __name__ == "__main__":
    run_test()
