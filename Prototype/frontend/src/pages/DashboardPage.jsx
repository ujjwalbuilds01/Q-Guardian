import React, { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, Activity, BarChart3, Database, ShieldCheck, Download, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { getPortfolioSummary, getCBOM } from '../api/client';
import SurvivalCurve from '../components/SurvivalCurve';
import ScenarioSliders from '../components/ScenarioSliders';

const DashboardPage = () => {
    const [summary, setSummary] = useState(null);
    const [cbom, setCbom] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [activeCurve, setActiveCurve] = useState(null);
    const [crqcYear, setCrqcYear] = useState(2031);

    useEffect(() => {
        async function fetchData() {
            try {
                const [sumRes, cbomRes] = await Promise.all([
                    getPortfolioSummary(),
                    getCBOM()
                ]);
                setSummary(sumRes);
                setCbom(cbomRes.data);
                if (cbomRes.data.length > 0) {
                    setActiveCurve(cbomRes.data[0].survival_curve);
                    setSelectedAsset(cbomRes.data[0].hostname);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleScenarioUpdate = useCallback((scenarioData, newCrqcYear) => {
        setCrqcYear(newCrqcYear);
        if (scenarioData && scenarioData.length > 0) {
            const selected = scenarioData.find(d => d.hostname === selectedAsset);
            setActiveCurve(selected ? selected.survival_curve : scenarioData[0].survival_curve);
        }
    }, [selectedAsset]);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex animate-pulse space-x-4 mb-8">
                    <div className="h-32 bg-surface rounded-xl w-full border border-border-color" />
                    <div className="h-32 bg-surface rounded-xl w-full border border-border-color" />
                    <div className="h-32 bg-surface rounded-xl w-full border border-border-color" />
                </div>
                <div className="h-64 bg-surface rounded-xl animate-pulse border border-border-color" />
            </div>
        );
    }

    // Calculate enterprise risk gauge
    const totalAssets = cbom.length;
    const criticalAssets = cbom.filter(a => a.mosca_risk_state === 'CRITICAL' || a.target_priority === 'CRITICAL').length;
    const cyberRating = Math.max(0, 1000 - (criticalAssets * 150)); // simplistic demo metric

    return (
        <div className="space-y-6">
            {/* Top Stat row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                {/* Enterprise Cyber Rating - Highlight Card */}
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="pnb-stat-card bg-[#1A2A5E] !border-none text-white relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand/20 to-transparent pointer-events-none" />
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div className="flex justify-between items-start">
                            <h3 className="text-sm font-medium text-white/70 uppercase tracking-widest mt-1">Cyber Rating</h3>
                            <ShieldCheck className="w-6 h-6 text-gold" />
                        </div>
                        <div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black">{cyberRating}</span>
                                <span className="text-sm text-white/50">/ 1000</span>
                            </div>
                            <div className="mt-1 flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${cyberRating > 700 ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                                    {cyberRating > 700 ? 'GRADE: B' : 'GRADE: D'}
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Normal Stat Cards */}
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="pnb-card flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Assets Discovered</h3>
                        <Database className="w-4 h-4 text-brand" />
                    </div>
                    <div>
                        <p className="text-3xl font-black text-brand">{summary?.assets_scanned || 0}</p>
                        <div className="mt-1 text-xs text-[var(--color-safe)] flex items-center font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-safe)] animate-pulse mr-1.5" /> Live mapping
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="pnb-card flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Post-Quantum Debt</h3>
                        <Activity className="w-4 h-4 text-warning" />
                    </div>
                    <div>
                        <p className="text-3xl font-black text-navy">${(summary?.quantum_debt_rate || 0).toLocaleString()}<span className="text-sm text-[var(--text-muted)] font-medium">/mo</span></p>
                        <div className="mt-1 text-xs text-[var(--color-critical)] font-medium">
                            {summary?.debt_trend} vs last quarter
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="pnb-card flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Median Survival</h3>
                        <Clock className="w-4 h-4 text-gold" />
                    </div>
                    <div>
                        <p className="text-3xl font-black text-navy">{summary?.median_survival_horizon || 0}<span className="text-sm text-[var(--text-muted)] font-medium"> yrs</span></p>
                        <div className="mt-1 text-xs text-[var(--text-secondary)]">
                            Under {crqcYear} baseline
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Slider / Scenario Control */}
            <div className="pt-2">
                <ScenarioSliders onScenarioUpdate={handleScenarioUpdate} />
            </div>

            {/* Main Survival Curve View */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="gradient-border-card bg-surface z-10 p-0 overflow-hidden flex flex-col lg:flex-row">
                
                {/* Left side: Assets List */}
                <div className="w-full lg:w-1/3 border-r border-[#E5E7EB] dark:border-[#30363D] max-h-[400px] overflow-y-auto bg-[var(--bg-surface-2)]">
                    <div className="p-4 border-b border-[#E5E7EB] dark:border-[#30363D] sticky top-0 bg-[var(--bg-surface-2)] z-10 shadow-sm">
                        <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Target Analytics</h3>
                    </div>
                    {cbom.map((asset, idx) => (
                        <div 
                            key={idx} 
                            onClick={() => {
                                setSelectedAsset(asset.hostname);
                                setActiveCurve(asset.survival_curve);
                            }}
                            className={`p-4 border-b border-[#E5E7EB] dark:border-[#30363D] cursor-pointer transition-colors flex items-center justify-between ${
                                selectedAsset === asset.hostname ? 'bg-[rgba(162,14,55,0.05)] border-l-4 border-l-brand' : 'hover:bg-[rgba(0,0,0,0.02)] dark:hover:bg-[rgba(255,255,255,0.02)]'
                            }`}
                        >
                            <div>
                                <div className="font-semibold text-sm mb-1">{asset.hostname}</div>
                                <div className="text-xs font-mono text-[var(--text-muted)]">{asset.algorithm_strength}</div>
                            </div>
                            <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                                asset.target_priority === 'CRITICAL' ? 'badge-critical' :
                                asset.target_priority === 'HIGH' ? 'badge-warning' : 'badge-safe'
                            }`}>
                                ROI: {asset.roi_score}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Right side: Curve Chart */}
                <div className="w-full lg:w-2/3 p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-brand" />
                                Cryptographic Survival Probability
                            </h3>
                            <p className="text-xs text-[var(--text-secondary)] mt-1">
                                Bayesian modeling of data exposure timeline
                            </p>
                        </div>
                        <span className="badge-gold">
                            {selectedAsset || 'Select Asset'}
                        </span>
                    </div>
                    
                    <div className="flex-1 bg-white dark:bg-[#0D1117] rounded-xl border border-[var(--border-color)] p-4 shadow-inner">
                        {activeCurve && (
                            <SurvivalCurve data={activeCurve} />
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default DashboardPage;
