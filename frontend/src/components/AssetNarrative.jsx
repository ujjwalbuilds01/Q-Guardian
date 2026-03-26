import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Loader2, ShieldAlert, CheckCircle2, RefreshCw } from 'lucide-react';
import { getNarrative, scanAsset } from '../api/client';

/**
 * AssetNarrative — Displays the LLM-generated risk narrative for a selected asset.
 */
const AssetNarrative = ({ hostname }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [error, setError] = useState(null);

    const fetchNarrative = useCallback((host) => {
        setLoading(true);
        setError(null);
        getNarrative(host)
            .then(res => setData(res))
            .catch(err => setError(err.message || "Failed to load narrative"))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (hostname) {
            fetchNarrative(hostname);
            setScanResult(null);
        }
    }, [hostname, fetchNarrative]);

    const handleRescan = async () => {
        if (!hostname || scanning) return;
        setScanning(true);
        try {
            const res = await scanAsset(hostname);
            setScanResult(res);
            fetchNarrative(hostname);
        } catch (err) {
            console.error("Scan failed:", err);
        } finally {
            setScanning(false);
        }
    };

    if (!hostname) {
        return (
            <div className="p-6 rounded-xl bg-surface border border-[var(--border-color)] shadow-sm h-full flex flex-col items-center justify-center text-center bg-[var(--bg-surface)]">
                <ShieldAlert className="w-8 h-8 text-[var(--text-muted)] mb-3" />
                <p className="text-sm text-[var(--text-secondary)]">Click an asset to view its risk narrative.</p>
            </div>
        );
    }

    const complexityColor = {
        HIGH: 'text-danger border-[var(--color-critical-border)] bg-[var(--color-critical-bg)]',
        MEDIUM: 'text-warning border-[var(--color-warning-border)] bg-[var(--color-warning-bg)]',
        LOW: 'text-success border-[var(--color-safe-border)] bg-[var(--color-safe-bg)]',
    };

    return (
        <div className="p-6 rounded-xl bg-surface border border-[var(--border-color)] shadow-sm h-full flex flex-col bg-[var(--bg-surface)]">
            <div className="flex items-center justify-between mb-4 border-b border-[var(--border-color-soft)] pb-4">
                <h3 className="text-lg font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-brand" />
                    Risk Intelligence
                </h3>
                <button
                    onClick={handleRescan}
                    disabled={scanning || loading}
                    className="p-2 rounded-lg bg-[var(--bg-surface-2)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-brand hover:border-brand transition-all disabled:opacity-50"
                    title="Trigger Live Scan"
                >
                    <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin text-brand' : ''}`} />
                </button>
            </div>

            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 text-brand animate-spin mb-4" />
                        <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest animate-pulse">Analyzing Target...</p>
                    </motion.div>
                ) : error ? (
                    <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm text-danger py-4">{error}</motion.div>
                ) : data ? (
                    <motion.div key={hostname} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-6 flex-1 flex flex-col">
                        
                        <div className="p-4 rounded-lg bg-[var(--bg-surface-2)] border border-[var(--border-color)]">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Asset Identity</span>
                                {data.complexity && (
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${complexityColor[data.complexity.complexity_level] || ''}`}>
                                        {data.complexity.complexity_level} Complexity
                                    </span>
                                )}
                            </div>
                            <p className="text-sm font-mono font-bold text-navy truncate" title={hostname}>{hostname}</p>
                        </div>

                        <div className="relative pl-4 border-l-2 border-brand">
                            <p className="text-sm text-[var(--text-primary)] leading-relaxed italic">"{data.narrative}"</p>
                        </div>

                        {scanResult && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-3 rounded-lg bg-[var(--color-safe-bg)] border border-[var(--color-safe-border)]">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle2 className="w-4 h-4 text-[var(--color-safe)]" />
                                    <span className="text-xs font-bold text-[var(--text-primary)]">Scan Results: {scanResult.status}</span>
                                </div>
                                {scanResult.endpoints?.[0] && (
                                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                                        <div className="text-[var(--text-secondary)] font-medium">Grade: <span className="text-[var(--color-safe)] font-bold">{scanResult.endpoints[0].grade}</span></div>
                                        <div className="text-[var(--text-secondary)] font-medium">IP: <span className="text-[var(--text-primary)] font-mono">{scanResult.endpoints[0].ip_address}</span></div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {data.complexity && (
                            <div className="mt-auto pt-6 border-t border-[var(--border-color-soft)]">
                                <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest mb-4 font-bold flex items-center justify-between">
                                    Migration Complexity Profile
                                    <span className="text-brand font-black">{data.complexity.complexity_score}%</span>
                                </p>
                                <div className="space-y-3">
                                    {Object.entries(data.complexity.contributing_factors || {}).map(([key, val]) => (
                                        <div key={key} className="space-y-1">
                                            <div className="flex justify-between text-[10px] font-medium text-[var(--text-secondary)]">
                                                <span>{key.replace('_', ' ').toUpperCase()}</span>
                                                <span>{val}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-[var(--border-color)] rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${val}%` }}
                                                    transition={{ duration: 1, ease: "easeOut" }}
                                                    className={`h-full bg-gradient-to-r ${val > 70 ? 'from-[#DC2626] to-[#FCA5A5]' : val > 40 ? 'from-[#D97706] to-[#FDE68A]' : 'from-[#059669] to-[#6EE7B7]'}`}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
};

export default AssetNarrative;
