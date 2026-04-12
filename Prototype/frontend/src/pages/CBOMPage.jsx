import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Plus, CheckCircle2, ShieldAlert } from 'lucide-react';
import { getCBOM } from '../api/client';

const CBOMPage = () => {
    const [cbom, setCbom] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        getCBOM().then(res => {
            setCbom(res.data);
            setLoading(false);
        });
    }, []);

    const filteredCbom = cbom.filter(asset => 
        asset.hostname.toLowerCase().includes(filter.toLowerCase()) || 
        asset.algorithm_strength.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="pnb-card flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-[#0D1117]">
                <div className="relative w-full md:w-96">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <input 
                        type="text"
                        placeholder="Search domains, algorithms, IPs..." 
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-[var(--bg-surface-2)] border border-[var(--border-color)] rounded-lg text-sm focus:outline-none focus:border-brand transition-colors text-[var(--text-primary)]"
                    />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button className="btn-secondary flex items-center justify-center gap-2 flex-1 md:flex-none">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                    <button className="btn-secondary flex items-center justify-center gap-2 flex-1 md:flex-none">
                        <Download className="w-4 h-4" /> Export JSON
                    </button>
                    <button className="btn-primary flex items-center justify-center gap-2 flex-1 md:flex-none">
                        <Plus className="w-4 h-4" /> New Scan
                    </button>
                </div>
            </div>

            <div className="pnb-card p-0 overflow-hidden bg-white dark:bg-[#0D1117]">
                <div className="overflow-x-auto">
                    <table className="pnb-table whitespace-nowrap">
                        <thead>
                            <tr>
                                <th>Hostname / IP</th>
                                <th>Asset Type</th>
                                <th>Algorithm Core</th>
                                <th>Risk State</th>
                                <th>Data Tier</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-[var(--text-muted)] animate-pulse">Loading Asset Inventory...</td>
                                </tr>
                            ) : filteredCbom.map((asset, idx) => (
                                <tr key={idx}>
                                    <td>
                                        <div className="font-semibold text-brand">{asset.hostname}</div>
                                        <div className="text-[10px] text-[var(--text-muted)] font-mono">{asset.ip_address}</div>
                                    </td>
                                    <td>
                                        <span className="bg-[var(--bg-surface-2)] border border-[var(--border-color)] px-2 py-1 rounded text-xs text-[var(--text-secondary)] font-medium">
                                            {asset.asset_type}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="font-mono text-xs font-bold text-navy">{asset.algorithm_strength}</div>
                                        <div className="text-[10px] text-[var(--text-muted)]">{asset.cipher_suite}</div>
                                    </td>
                                    <td>
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                                            asset.mosca_risk_state === 'CRITICAL' ? 'badge-critical' :
                                            asset.mosca_risk_state === 'WARNING' ? 'badge-warning' : 'badge-safe'
                                        }`}>
                                            {asset.mosca_risk_state}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)]">
                                            <div className={`w-2 h-2 rounded-full ${
                                                asset.sensitivity_tier === 'S1' || asset.sensitivity_tier === 'S2' ? 'bg-danger' :
                                                asset.sensitivity_tier === 'S3' ? 'bg-warning' : 'bg-info'
                                            }`}></div>
                                            {asset.sensitivity_tier}
                                        </div>
                                    </td>
                                    <td>
                                        {asset.pqc_ready ? (
                                            <div className="flex items-center gap-1 text-[var(--color-safe)] text-xs font-bold">
                                                <CheckCircle2 className="w-4 h-4" /> Ready
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1 text-[var(--color-critical)] text-xs font-bold">
                                                <ShieldAlert className="w-4 h-4" /> Vulnerable
                                            </div>
                                        )}
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

export default CBOMPage;
