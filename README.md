Q-Guardian is a full-stack cybersecurity platform purpose-built for Punjab
National Bank (PNB) to address the emerging threat of quantum computing
against classical encryption. It is a "Quantum Transition Intelligence"
tool — meaning it helps the bank understand WHERE its current cryptography
is vulnerable, WHEN quantum computers will be able to break it, and HOW
to migrate to quantum-safe (Post-Quantum Cryptography / PQC) algorithms
before it's too late.

In simpler terms: Quantum computers are coming. When they arrive, every
RSA key, every ECDSA certificate, every non-PQC cipher suite used by the
bank today will be crackable. Q-Guardian is the early-warning system and
migration planner that ensures PNB is ready before that happens.

TECHNOLOGY STACK
--------------------
BACKEND:
  - Python 3.x
  - FastAPI (web framework, async-capable, OpenAPI auto-docs)
  - Uvicorn (ASGI server, production-grade)
  - SQLModel (ORM combining SQLAlchemy + Pydantic)
  - SQLite (lightweight, file-based database — no external DB server)
  - sslyze (SSL/TLS analysis library for certificate inspection)
  - dnspython (DNS resolution for subdomain discovery)
  - requests (HTTP client for external API calls and RSS feeds)
  - reportlab (PDF generation for board briefs)
  - numpy + matplotlib (data processing support)

FRONTEND:
  - React 18.2 (UI library)
  - Vite 5 (build tool, HMR dev server)
  - TailwindCSS 3.3 (utility-first CSS framework)
  - Recharts 2.10 (charting: BarChart, AreaChart, PieChart)
  - Framer Motion 10 (animations and micro-interactions)
  - Lucide React (icon library, consistent SVG icons)
  - react-force-graph-2d (force-directed graph visualization)
  - axios (HTTP client for API communication)

2.3 FOLDER STRUCTURE
--------------------

QGuardian-main/
├── run.ps1                          ← PowerShell script to launch both servers
├── backend/
│   ├── requirements.txt             ← Python dependencies
│   ├── qguardian.db                 ← SQLite database file (auto-created)
│   └── app/
│       ├── main.py                  ← FastAPI application entry point
│       ├── database.py              ← SQLModel ORM models and DB setup
│       └── engines/                 ← All scanning/analysis engines
│           ├── discovery.py         ← Subdomain discovery + TLS scanning
│           ├── port_scanner.py      ← Async TCP port scanner
│           ├── api_scanner.py       ← OWASP API Top 10 scanner
│           ├── scoring.py           ← Q-TRI score calculator
│           ├── mosca.py             ← Mosca countdown clock calculator
│           ├── hndl.py              ← Harvest-Now-Decrypt-Later exposure
│           ├── cbom.py              ← Cryptographic Bill of Materials
│           ├── migration.py         ← PQC migration playbook generator
│           ├── compliance.py        ← RBI CSF 2.0 compliance mapper
│           ├── reporting.py         ← PDF board brief generator
│           ├── chatbot.py           ← Rule-based security chatbot
│           └── threat_intel.py      ← Live RSS threat intelligence feed
│
├── frontend/
│   ├── package.json                 ← Node.js dependencies
│   ├── vite.config.js               ← Vite build configuration
│   ├── tailwind.config.js           ← TailwindCSS theme (PNB colors)
│   ├── postcss.config.js            ← PostCSS plugins
│   ├── index.html                   ← Root HTML (SPA entry)
│   └── src/
│       ├── main.jsx                 ← React root renderer
│       ├── App.jsx                  ← Main application component + routing
│       ├── App.css                  ← Legacy CSS (mostly unused)
│       ├── index.css                ← Global styles + Tailwind directives
│       ├── logo.svg                 ← Q-Guardian SVG logo
│       ├── assets/
│       │   ├── logo.png             ← Q-Guardian logo (PNG)
│       │   └── pnb_logo_secure.png  ← PNB official branding logo
│       └── components/
│           ├── Header.jsx           ← Top navigation + scan controls
│           ├── Dashboard.jsx        ← Posture overview + charts + intel
│           ├── AssetTable.jsx       ← Cryptographic asset inventory table
│           ├── ApiScanner.jsx       ← API security scanning interface
│           ├── HNDLSimulator.jsx    ← HNDL exposure timeline simulator
│           ├── DependencyGraph.jsx  ← Force-directed crypto topology graph
│           ├── ComplianceMapper.jsx ← RBI CSF 2.0 violation viewer
│           ├── CBOMViewer.jsx       ← CBOM JSON viewer + export
│           ├── PlaybookModal.jsx    ← Migration playbook modal dialog
│           └── Chatbot.jsx          ← Floating chatbot widget
│
└── tmp/                             ← Temporary files directory

