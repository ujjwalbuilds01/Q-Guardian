import React, { useState, useEffect } from 'react';
import { ActivitySquare, ShieldCheck, AlertTriangle } from 'lucide-react';
import { getCBOM } from '../api/client';

const QTRIPage = () => {
    const [cbom, setCbom] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCBOM().then(res => {
            setCbom(res.data);
            setLoading(false);
        });
    }, []);

    return (
        <div className="space-y-6">
            <div className="pnb-card bg-gradient-to-br from-brand to-header text-white border-none relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 p-4">
                    <div className="flex-1">
                        <h2 className="text-3xl font-black mb-2 tracking-tight">Enterprise Rating: B+</h2>
                        <p className="text-blue-100 max-w-md text-sm leading-relaxed">
                            The Quantum Transition Readiness Index (QTRI) aggregates per-component preparedness into a standardized executive metric, aligned with NSA CNSA 2.0.
                        </p>
                    </div>
                    
                    <div className="w-40 h-40 relative flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="10" />
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#FBBC09" strokeWidth="10" strokeDasharray="283" strokeDashoffset="56" className="transform origin-center transition-all duration-1000 ease-out" />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                            <span className="text-4xl font-black">81</span>
                            <span className="text-[10px] uppercase font-bold text-gold tracking-widest mt-1">Avg Score</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {loading ? (
                    <div className="col-span-2 text-center py-12 text-[var(--text-muted)] animate-pulse">Calculating readiness scores...</div>
                ) : cbom.map((asset, idx) => (
                    <div key={idx} className="pnb-card bg-white dark:bg-[#0D1117] flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="font-bold text-[var(--text-primary)] text-base truncate pr-4" title={asset.hostname}>{asset.hostname}</h3>
                                <div className="text-sm text-[var(--text-secondary)] font-medium bg-[var(--bg-surface-2)] px-2 py-1 inline-block rounded mt-1 border border-[var(--border-color)]">
                                    {asset.algorithm_strength}
                                </div>
                            </div>
                            <div className={`flex items-center justify-center w-12 h-12 rounded-full border-4 font-black flex-shrink-0 ${
                                asset.qtri_score >= 80 ? 'border-[var(--color-safe)] text-[var(--color-safe)]' :
                                asset.qtri_score >= 50 ? 'border-[var(--color-warning)] text-[var(--color-warning)]' :
                                'border-[var(--color-critical)] text-[var(--color-critical)]'
                            }`}>
                                {asset.qtri_score}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs font-bold text-[var(--text-secondary)] mb-1.5 px-1 uppercase tracking-wide">
                                    <span>PQC Adoption (30%)</span>
                                </div>
                                <div className="pnb-progress-track bg-[var(--bg-surface-2)] border border-[var(--border-color)]">
                                    <div className={`h-full rounded-full transition-all ${
                                        asset.pqc_ready ? 'bg-[var(--color-safe)] w-full' : 'bg-[var(--color-critical)] w-[10%]'
                                    }`} />
                                </div>
                            </div>
                            
                            <div>
                                <div className="flex justify-between text-xs font-bold text-[var(--text-secondary)] mb-1.5 px-1 uppercase tracking-wide">
                                    <span>Forward Secrecy (15%)</span>
                                </div>
                                <div className="pnb-progress-track bg-[var(--bg-surface-2)] border border-[var(--border-color)]">
                                    <div className={`h-full rounded-full transition-all ${
                                        asset.forward_secrecy ? 'bg-[var(--color-safe)] w-full' : 'bg-[var(--color-warning)] w-[20%]'
                                    }`} />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-[var(--border-color-soft)] flex justify-between items-center mt-2">
                                <span className={`text-xs font-bold uppercase tracking-wide ${
                                    asset.pqc_ready ? 'text-[var(--color-safe)] flex items-center gap-1' : 'text-[var(--color-critical)] flex items-center gap-1'
                                }`}>
                                    {asset.pqc_ready ? <><ShieldCheck className="w-3.5 h-3.5"/> Elite-PQC Base</> : <><AlertTriangle className="w-3.5 h-3.5"/> Legacy Protocol Base</>}
                                </span>
                                <button className="text-xs font-bold text-brand hover:text-brand-light transition-colors">
                                    View Full Component Build &rarr;
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QTRIPage;
