Q-GUARDIAN
Quantum Transition Intelligence Platform
“Not just quantum ready — quantum on time.”
Prototype Model — README
Developed For	PNB Cybersecurity Hackathon 2026 (IIT Kanpur × PNB × DFS)
Status	Prototype / Proof-of-Concept
Target Organizations	Department of Financial Services (DFS) • Punjab National Bank (PNB)
1.  Overview
Q-Guardian is an enterprise-grade cybersecurity intelligence platform designed to address one of the most urgent threats facing the financial sector: the impending arrival of Cryptographically Relevant Quantum Computers (CRQCs). As quantum computing accelerates, traditional encryption algorithms including RSA-2048 and ECC face the risk of being broken, rendering vast swathes of sensitive financial data vulnerable.
Q-Guardian delivers a proactive, automated, and board-ready solution that enables PNB and DFS to discover vulnerable assets, prioritize cryptographic migration, and simulate sophisticated nation-state-level “Harvest Now, Decrypt Later” (HNDL) threats — ensuring the institution is fully prepared for the Post-Quantum Era.
2.  Prototype Scope & Disclaimer
This repository contains a prototype model of Q-Guardian, developed as a proof-of-concept for the PNB Cybersecurity Hackathon 2026. The prototype demonstrates the core architecture and key feature flows of the platform. It is not intended for production deployment in its current state.
•	All asset data, CRQC timelines, and QTRI scores shown in the UI are simulated for demonstration purposes.
•	The HNDL Threat Simulator uses modeled adversarial scenarios, not live threat feeds.
•	Report generation outputs are templated examples, not live LLM integrations.
•	Network scanning capabilities are mocked and require integration with enterprise SIEM/CMDB tooling in a production environment.
3.  Core Modules
Q-Guardian is composed of eight integrated modules, each targeting a distinct phase of quantum risk management:
#	Module	Description
1	Asset Discovery Engine	Actively scans and catalogs endpoints across the enterprise network perimeter, building a complete picture of all cryptographic touchpoints.
2	CBOM — Cryptographic Bill of Materials	A live, dynamic inventory of all cryptographic assets, key material, and algorithms deployed across the organization.
3	Mosca Risk Countdown Engine	Calculates the precise time remaining before each asset’s encryption becomes obsolete in the face of a CRQC, using the Mosca Theorem framework.
4	QTRI Scoring Engine	Generates a dynamic Quantum Threat Readiness Index (0–1000) for individual assets and for the enterprise as a whole, enabling clear risk prioritization.
5	PQC Posture Dashboard	Visualizes the organization’s entire migration journey towards NIST-approved Post-Quantum Cryptography (PQC) standards.
6	HNDL Threat Simulator	Interactive D3.js timelines that model the volume of data exposure to adversaries who are capturing and storing encrypted traffic today for future decryption.
7	Migration Advisor	Generates step-by-step algorithm replacement guides and configuration playbooks for upgrading vulnerable cryptographic endpoints.
8	Reporting Suite	One-click generation of executive Board Brief PDFs and automated, LLM-driven risk narratives tailored for C-suite and regulatory audiences.
4.  Technology Stack (Prototype)
4.1  Frontend
•	React.js — Component-based dashboard UI
•	D3.js — HNDL timeline and risk visualizations
•	Tailwind CSS — Responsive layout and design system
4.2  Backend
•	Python / FastAPI — REST API layer and business logic
•	Mosca Theorem Engine — Custom risk calculation module
•	Mock SIEM/CMDB Connectors — Simulated asset discovery feeds
4.3  Standards & References
•	NIST PQC Finalized Standards — CRYSTALS-Kyber, CRYSTALS-Dilithium, SPHINCS+
•	RBI & SEBI Cyber Regulatory Guidelines
•	MITRE ATT&CK for Financial Sector — Nation-state threat modeling
5.  Getting Started
5.1  Prerequisites
•	Node.js v18+
•	Python 3.10+
•	pip and npm package managers
5.2  Installation
Clone the repository and install dependencies:
git clone https://github.com/your-org/q-guardian
cd q-guardian
npm install          # Frontend dependencies
pip install -r requirements.txt  # Backend dependencies
npm run dev          # Start the prototype
The dashboard will be accessible at http://localhost:3000 by default.
6.  Roadmap (Post-Prototype)
The following capabilities are planned for production development:
1.	Live SIEM/CMDB Integration — Real-time asset discovery from enterprise tooling
2.	PQC Migration Automation — Automated certificate and key rollover workflows
3.	Live LLM Risk Narrative Engine — Dynamic, context-aware board-level reporting
4.	Regulatory Compliance Module — Automated mapping to RBI, SEBI, and DPDP Act requirements
5.	Multi-Institution Deployment — Scalable rollout across DFS-regulated entities
7.  Contributing
This prototype was developed for hackathon purposes. For contributions or queries regarding production adaptation, please raise an issue or contact the development team directly.
8.  License
This prototype is submitted as part of the PNB Cybersecurity Hackathon 2026. All rights reserved by the authors. Unauthorized reproduction or commercial use is prohibited without explicit permission.
Q-Guardian  •  Quantum Transition Intelligence Platform  •  PNB Hackathon 2026
