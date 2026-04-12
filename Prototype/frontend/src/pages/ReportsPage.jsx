import React, { useState } from 'react';
import { FileText, Download, Share2, Mail, LayoutTemplate } from 'lucide-react';
import { downloadBoardBrief } from '../api/client';
import AssetNarrative from '../components/AssetNarrative';

const ReportsPage = () => {
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        setDownloading(true);
        try {
            await downloadBoardBrief();
        } catch (err) {
            console.error("PDF download failed:", err);
        } finally {
            setDownloading(false);
        }
    };

    const reports = [
        { title: "Executive Board Brief", desc: "2-page non-technical summary with Mosca clocks and clear action items.", icon: LayoutTemplate, type: "pdf", primary: true, action: handleDownload },
        { title: "Technical Inventory CBOM", desc: "Full structured export of all cryptographic assets and parameters.", icon: DatabaseIcon, type: "json", primary: false, action: () => console.log('Download JSON') },
        { title: "Compliance Export", desc: "Findings mapped to RBI CSF, NIST IR 8547, and DORA requirements.", icon: ShieldIcon, type: "csv", primary: false, action: () => console.log('Download CSV') }
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-black text-navy tracking-tight mb-2">Automated Reporting Suite</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-3xl">Generate regulatory-grade extracts and boardroom presentations automatically from live telemetry data.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {reports.map((r, i) => (
                    <div key={i} className={`pnb-card flex flex-col justify-between ${r.primary ? 'border-brand shadow-[0_4px_16px_rgba(162,14,55,0.1)]' : 'bg-white dark:bg-[#0D1117]'}`}>
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-[var(--text-primary)] text-base">{r.title}</h3>
                                <r.icon className={`w-5 h-5 ${r.primary ? 'text-brand' : 'text-[var(--text-muted)]'}`} />
                            </div>
                            <p className="text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">{r.desc}</p>
                        </div>
                        
                        <div className="flex gap-2">
                            <button 
                                onClick={r.action}
                                disabled={r.primary && downloading}
                                className={`flex-1 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wide py-2.5 rounded-lg transition-all ${
                                r.primary ? 'bg-brand text-white hover:bg-brand-light shadow-md' : 'btn-secondary text-brand hover:bg-[rgba(162,14,55,0.05)]'
                            }`}>
                                {r.primary && downloading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Download className="w-4 h-4" />}
                                {r.primary && downloading ? 'Generating...' : `Export ${r.type}`}
                            </button>
                            <button className="p-2 border border-[var(--border-color)] rounded-lg text-[var(--text-muted)] hover:text-brand hover:border-brand transition-colors" title="Schedule / Email">
                                <Mail className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="pnb-card bg-[var(--bg-surface-2)] p-0">
                <div className="border-b border-[var(--border-color)] p-4 bg-white dark:bg-[#0D1117] rounded-t-xl">
                    <h3 className="font-bold text-navy uppercase tracking-wide text-sm flex items-center gap-2">
                        <FileText className="w-4 h-4 text-brand" /> Interactive Risk Narrative Preview
                    </h3>
                </div>
                <div className="p-6">
                    <AssetNarrative hostname="payment-api.pnb.bank.in" />
                </div>
            </div>
        </div>
    );
};

// Helper icons
function DatabaseIcon(props) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>; }
function ShieldIcon(props) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>; }

export default ReportsPage;
