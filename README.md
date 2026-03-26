# Q-GUARDIAN
### Quantum Transition Intelligence Platform
*"Not just quantum ready — quantum on time."*

**Developed for:** PNB Cybersecurity Hackathon 2026 (IIT Kanpur x PNB x DFS)

---

## 📖 Overview

**Q-Guardian** is an enterprise-grade cybersecurity intelligence platform designed for the Department of Financial Services (DFS) and Punjab National Bank (PNB). As quantum computing accelerates towards Cryptographically Relevant Quantum Computers (CRQCs), traditional encryption algorithms (like RSA-2048 and ECC) are at risk of being broken. 

Q-Guardian provides a proactive, automated, and board-ready dashboard to discover vulnerable assets, prioritize migration, and simulate "Harvest Now, Decrypt Later" (HNDL) nation-state threats, ensuring PNB remains secure in the Post-Quantum Era.

## ✨ Core Modules

1. **Asset Discovery Engine:** Actively scans and catalogs endpoints across the enterprise perimeter.
2. **CBOM (Cryptographic Bill of Materials):** A live inventory of all cryptographic assets, keys, and algorithms.
3. **Mosca Risk Countdown Engine:** Calculates the precise time remaining before an asset's encryption is rendered obsolete by a CRQC.
4. **QTRI Scoring Engine:** Generates a dynamic "Quantum Threat Readiness Index" (0–1000) for individual assets and the enterprise as a whole.
5. **PQC Posture Dashboard:** Visualizes the entire migration journey towards NIST-approved Post-Quantum Cryptography (PQC).
6. **HNDL Threat Simulator:** Interactive D3.js timelines modeling data exposure volume to adversaries capturing encrypted traffic today.
7. **Migration Advisor:** Generates step-by-step algorithms and configuration playbooks for upgrading vulnerable endpoints.
8. **Reporting Suite:** 1-click generation of executive Board Brief PDFs and automated LLM-driven risk narratives.

## 🏗️ Technical Architecture

Q-Guardian is split into two decoupled repositories using a modern, scalable stack:

### Frontend (React + Vite)
- **Framework:** React 19 / Vite
- **Styling:** Tailwind CSS v4 + Custom PNB Design System (Burgundy `#A20E37`, Gold `#FBBC09`, Navy `#1A2A5E`)
- **Visualizations:** D3.js (Survival Curves, Quantum Shadows) + Recharts
- **Animations:** Framer Motion

### Backend (FastAPI + SQLite)
- **Framework:** FastAPI (Python 3.13)
- **Database:** SQLite + SQLAlchemy ORM (Persistent `qguardian.db`)
- **Intelligence Engine:** Real-time `asset_streamer.py` that simulates continuous enterprise monitoring, autonomously discovering new network assets and detecting cryptographic configuration drift.
- **Reporting:** ReportLab for automated PDF generation.

---

## 🚀 Running the Project

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Start the Backend API
The backend requires a virtual environment and will automatically seed the SQLite database on its first run.

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
python main.py
```
*The API will be available at `http://localhost:8000`. You can view the swagger docs at `http://localhost:8000/docs`.*

### 2. Start the Frontend Dashboard
```bash
cd frontend
npm install
npm run dev
```
*The PNB-branded platform will be available at `http://localhost:5173`.*

---

## 🔮 Hackathon Demo Highlights
- **Real-Time Discovery:** Keep the dashboard open and refresh periodically. The backend background worker will automatically "discover" new assets and alter the enterprise QTRI score live.
- **HNDL Simulator:** Navigate to the Simulator module to see how "Harvest Now, Decrypt Later" realistically impacts long-lived financial data.
- **Board Brief:** Click the "Download Board Brief" button in the Top Navbar to instantly generate a C-Suite executive PDF summary of the firm's quantum debt.
- **Design System:** Toggle between the default Professional Light Mode and the alternate Dark Mode.
