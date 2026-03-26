import React, { useState, useEffect } from 'react';
import { ShieldAlert, Activity, CheckCircle2 } from 'lucide-react';
import { getCBOM } from '../api/client';

const PQCPosturePage = () => {
    const [cbom, setCbom] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCBOM().then(res => {
            setCbom(res.data);
            setLoading(false);
        });
    }, []);

    const total = cbom.length;
    const ready = cbom.filter(a => a.pqc_ready).length;
    const progress = total > 0 ? Math.round((ready / total) * 100) : 0;

    return (
        <div className="space-y-6">
            <div className="pnb-card bg-white dark:bg-[#0D1117] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-brand/10 to-transparent"></div>
                
                <h2 className="text-xl font-black text-navy mb-1 uppercase tracking-wider relative z-10">Enterprise PQC Adoption</h2>
                <p className="text-sm text-[var(--text-secondary)] mb-6 relative z-10">Tracking transition progress to ML-KEM and SLH-DSA across all registered endpoints.</p>

                <div className="flex items-center gap-4 mb-2 relative z-10">
                    <span className="text-3xl font-black text-brand">{progress}%</span>
                    <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Migration Complete</span>
                </div>
                
                <div className="w-full h-8 bg-[var(--bg-surface-2)] rounded-full overflow-hidden border border-[var(--border-color)] relative z-10">
                    <div 
                        className="h-full bg-gradient-to-r from-warning to-safe transition-all duration-1000 flex items-center justify-end px-3"
                        style={{ width: `${Math.max(progress, 5)}%` }}
                    >
                        {progress > 10 && <span className="text-[10px] font-black text-white mix-blend-overlay">{ready} / {total} Assets</span>}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="pnb-card bg-white dark:bg-[#0D1117]">
                    <h3 className="text-sm font-bold text-navy uppercase tracking-wider mb-6 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-brand" /> Posture Matrix
                    </h3>
                    
                    <div className="space-y-4">
                        {cbom.map((asset, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-color-soft)] bg-[var(--bg-surface-2)] hover:border-brand transition-colors">
                                <div>
                                    <div className="font-semibold text-[var(--text-primary)] text-sm">{asset.hostname}</div>
                                    <div className="text-[10px] text-[var(--text-muted)] mt-1 font-mono">{asset.algorithm_strength} &rarr; ML-KEM-768 Hybrid</div>
                                </div>
                                <div>
                                    {asset.pqc_ready ? (
                                        <span className="badge-safe flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3"/> COMPLIANT
                                        </span>
                                    ) : (
                                        <span className={`flex items-center gap-1 ${asset.mosca_risk_state === 'CRITICAL' ? 'badge-critical' : 'badge-warning'}`}>
                                            <ShieldAlert className="w-3 h-3"/> VULNERABLE
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && <div className="text-center py-8 text-[var(--text-muted)] animate-pulse">Loading posture matrix...</div>}
                    </div>
                </div>

                <div className="pnb-card bg-[var(--bg-surface-2)] border-dashed border-2 flex flex-col items-center justify-center text-center p-12 h-min">
                    <ShieldAlert className="w-12 h-12 text-[var(--text-muted)] mb-4" />
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Historical Trend Chart</h3>
                    <p className="text-sm text-[var(--text-secondary)]">
                        More scan nodes need to be configured to display the 90-day progress trend line. Run continuous scans to populate this view.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PQCPosturePage;
