import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, ShieldCheck, ChevronRight } from 'lucide-react';
import { getCBOM } from '../api/client';

const MoscaPage = () => {
    const [cbom, setCbom] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCBOM().then(res => {
            setCbom(res.data);
            setLoading(false);
        });
    }, []);

    const criticals = cbom.filter(a => a.mosca_risk_state === 'CRITICAL').slice(0, 3);

    return (
        <div className="space-y-6">
            {/* Hero Clocks */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {criticals.map((asset, idx) => (
                    <div key={idx} className="mosca-clock risk-critical flex flex-col items-center justify-center p-8 bg-white dark:bg-[#0D1117]">
                        <AlertTriangle className="w-8 h-8 text-[var(--color-critical)] mb-4 animate-pulse" />
                        <div className="text-sm font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wide truncate max-w-full" title={asset.hostname}>
                            {asset.hostname}
                        </div>
                        <div className="flex items-baseline gap-2 text-[var(--text-primary)]">
                            <span className="clock-value">{asset.mosca_days_worst}</span>
                            <span className="text-xl font-medium opacity-50 text-[var(--text-muted)]">to {asset.mosca_days_best}</span>
                        </div>
                        <div className="clock-unit text-[var(--color-critical)]">Days Remaining</div>
                        
                        <div className="mt-6 w-full bg-[var(--color-critical-bg)] rounded-xl py-2 px-3 text-center border border-[var(--color-critical-border)]">
                            <span className="text-xs font-bold text-[var(--color-critical)] flex items-center justify-center gap-1">
                                CRITICAL EXPOSURE 
                            </span>
                        </div>
                    </div>
                ))}
                
                {criticals.length === 0 && !loading && (
                    <div className="col-span-3 mosca-clock risk-safe flex flex-col items-center justify-center py-16 bg-white dark:bg-[#0D1117]">
                        <ShieldCheck className="w-12 h-12 text-[var(--color-safe)] mb-4" />
                        <div className="clock-value text-[var(--color-safe)]">0</div>
                        <div className="clock-unit text-[var(--color-safe)]">Assets in Critical Risk Window</div>
                    </div>
                )}
            </div>

            {/* List */}
            <div className="pnb-card p-0 overflow-hidden bg-white dark:bg-[#0D1117]">
                <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-surface-2)] flex justify-between items-center">
                    <h3 className="font-bold text-navy uppercase tracking-wide text-sm flex items-center gap-2">
                        <Clock className="w-4 h-4 text-brand" /> Full Countdown Inventory
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="pnb-table whitespace-nowrap">
                        <thead>
                            <tr>
                                <th>Hostname</th>
                                <th>Sensitivity Shift (Y)</th>
                                <th>Migration Est (X)</th>
                                <th>CRQC Horizon (Z)</th>
                                <th className="text-right">Countdown Window</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-6 text-[var(--text-muted)] animate-pulse">Calculating theorem...</td>
                                </tr>
                            ) : cbom.map((asset, idx) => (
                                <tr key={idx}>
                                    <td className="font-bold text-[var(--text-primary)]">{asset.hostname}</td>
                                    <td>
                                        <span className="badge-info">{asset.sensitivity_tier}</span>
                                    </td>
                                    <td className="text-sm font-medium text-[var(--text-secondary)]">~ {asset.complexity_level === 'HIGH' ? '24' : asset.complexity_level === 'MEDIUM' ? '12' : '4'} weeks</td>
                                    <td className="text-sm text-[var(--text-muted)]">2031 (Median)</td>
                                    <td className="text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <span className="font-mono font-bold text-lg text-navy">
                                                {asset.mosca_days_worst} - {asset.mosca_days_best} <span className="text-xs text-[var(--text-muted)] font-sans font-medium uppercase">days</span>
                                            </span>
                                            <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MoscaPage;
