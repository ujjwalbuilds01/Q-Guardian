import React, { useState, useEffect } from 'react';
import { Network, Database, ShieldAlert, ActivitySquare } from 'lucide-react';
import QuantumShadow from '../components/QuantumShadow';
import { getCBOM } from '../api/client';

const HNDLPage = () => {
    const [cbom, setCbom] = useState([]);
    const [crqcYear, setCrqcYear] = useState(2031);

    useEffect(() => {
        getCBOM().then(res => setCbom(res.data));
    }, []);

    const vulnerable = cbom.filter(a => !a.forward_secrecy).length;
    const estVolume = vulnerable * 42.5; // dummy multi

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="pnb-stat-card bg-[#1A2A5E] text-white !border-none md:col-span-2">
                    <h3 className="text-sm font-bold text-white/70 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Network className="w-4 h-4 text-brand" /> Simulated Threat Scope
                    </h3>
                    <div className="flex flex-col md:flex-row gap-8">
                        <div>
                            <p className="text-4xl font-black">{vulnerable}</p>
                            <p className="text-xs uppercase tracking-wide text-white/50 font-bold mt-1">Endpoints Lacking PFS</p>
                        </div>
                        <div className="w-px bg-white/10 hidden md:block"></div>
                        <div>
                            <p className="text-4xl font-black text-brand-light">{estVolume.toFixed(1)} <span className="text-lg text-white/50">TB/mo</span></p>
                            <p className="text-xs uppercase tracking-wide text-brand-light font-bold mt-1">Estimated Data Harvested</p>
                        </div>
                    </div>
                </div>

                <div className="pnb-card bg-brand text-white border-none flex flex-col justify-center relative overflow-hidden">
                     <ShieldAlert className="absolute -right-4 -top-4 w-32 h-32 text-black/10" />
                     <h3 className="text-sm font-bold text-white/70 uppercase tracking-widest mb-2 relative z-10">Adversary Priority</h3>
                     <p className="text-2xl font-black relative z-10">CRITICAL</p>
                     <p className="text-xs text-white/80 mt-2 font-medium relative z-10">Nation-state harvesting is assumed active as of Y2023 baseline.</p>
                </div>
            </div>

            <div className="pnb-card bg-white dark:bg-[#0D1117] p-0 overflow-hidden">
                <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-surface-2)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h3 className="font-bold text-navy uppercase tracking-wide text-sm flex items-center gap-2">
                            <ActivitySquare className="w-4 h-4 text-brand" /> Harvest Exposure Timeline
                        </h3>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">
                            The red zone indicates intercepted traffic that becomes decryptable upon CRQC arrival.
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">CRQC Year:</label>
                        <select 
                            className="bg-white dark:bg-[#0D1117] border border-[var(--border-color)] rounded px-3 py-1 text-sm font-mono text-[var(--text-primary)]"
                            value={crqcYear}
                            onChange={(e) => setCrqcYear(Number(e.target.value))}
                        >
                            <option value="2028">2028 (Aggressive)</option>
                            <option value="2031">2031 (Median)</option>
                            <option value="2035">2035 (Conservative)</option>
                        </select>
                    </div>
                </div>
                
                <div className="p-6 h-[400px]">
                    <QuantumShadow cbom={cbom} crqcYear={crqcYear} />
                </div>
            </div>
        </div>
    );
};

export default HNDLPage;
