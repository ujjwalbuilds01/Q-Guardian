import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { ShieldCheck, Clock, AlertTriangle, FileText, Activity, Database } from 'lucide-react';

import { motion } from 'framer-motion';

const Dashboard = ({ assets, rating }) => {
  const [intel, setIntel] = useState([]);

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api/v1';

useEffect(() => {
    axios.get(`${API_BASE}/threat-intel`)
      .then(res => setIntel(res.data))
      .catch(err => console.error("Failed to fetch threat intel", err));
  }, []);

  if (!rating && assets.length === 0) return (
    <div className="flex flex-col items-center justify-center py-32 gap-4 animate-in fade-in">
        <div className="w-12 h-12 border-4 border-pnb-maroon border-t-transparent rounded-full animate-spin"></div>
        <div className="text-pnb-maroon font-black tracking-[0.2em] text-[10px] uppercase">Initializing Secure Analytical Layer...</div>
    </div>
  );

  if (assets.length === 0) {
      return (
          <div className="glass-card p-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 min-h-[50vh] text-center bg-white/50 animate-in zoom-in-95 duration-500">
              <ShieldCheck size={64} className="text-slate-300 mb-6" />
              <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tighter">PLATFORM READY</h2>
              <p className="text-sm text-slate-500 max-w-lg mb-8 font-medium">
                  Welcome to the **Q-Guardian** Posture Dashboard. There are currently no scanned assets in your inventory. Enter a sector domain (e.g., manipurrural.bank.in) in the header above and trigger a **Global Sector Scan** to begin risk analysis.
              </p>
              <div className="flex gap-4 opacity-60 pointer-events-none grayscale">
                 {/* Preview of core dashboard metrics — shown in greyed state until scan is complete */}
                 <StatCard title="PQC Ready" value="-" icon={<ShieldCheck size={20}/>} color="#059669" />
                 <StatCard title="Critical Risks" value="-" icon={<AlertTriangle size={20}/>} color="#dc2626" />
              </div>
          </div>
      );
  }

  const handleDownloadBrief = () => {
    const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api/v1';
    window.location.href = `${API_BASE}/reports/board-brief`;
  };

  const data = [
    { name: 'Elite-PQC', value: assets.filter(a => a.qtri_score >= 85).length, color: '#059669' },
    { name: 'Advanced', value: assets.filter(a => a.qtri_score >= 70 && a.qtri_score < 85).length, color: '#10b981' },
    { name: 'Standard', value: assets.filter(a => a.qtri_score >= 50 && a.qtri_score < 70).length, color: '#f59e0b' },
    { name: 'Legacy', value: assets.filter(a => a.qtri_score >= 30 && a.qtri_score < 50).length, color: '#d97706' },
    { name: 'Critical', value: assets.filter(a => a.qtri_score < 30).length, color: '#dc2626' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
    >
      <motion.div 
        whileHover={{ scale: 1.01 }}
        className="md:col-span-1 glass-card p-6 flex flex-col items-center justify-center bg-gradient-to-b from-white to-slate-50 border-t-4 border-pnb-maroon relative overflow-hidden group"
      >
        <div className="absolute -right-10 -top-10 text-pnb-maroon/5 group-hover:text-pnb-maroon/10 transition-colors pointer-events-none">
            <ShieldCheck size={200} />
        </div>
        <h3 className="text-pnb-maroon font-black text-[10px] tracking-widest mb-6 z-10 w-full text-center border-b border-pnb-maroon/10 pb-2 uppercase">ENTERPRISE CYBER RATING</h3>
        <div className="relative flex items-center justify-center my-4 z-10">
            <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                key={rating.score}
                className={`text-8xl font-black tracking-tighter drop-shadow-sm ${rating.score > 700 ? 'text-green-600' : rating.score > 400 ? 'text-blue-600' : 'text-pnb-maroon'}`}
            >
                {rating.score}
            </motion.div>
        </div>
        <div className={`mt-2 px-6 py-1.5 rounded-full bg-pnb-maroon text-white text-[10px] font-black uppercase tracking-widest z-10 shadow-lg border-2 border-white/20`}>{rating.status}</div>
        
        <button 
          onClick={handleDownloadBrief}
          className="mt-10 group/btn bg-white text-slate-800 font-extrabold text-[10px] uppercase tracking-[0.15em] border-2 border-slate-200 px-8 py-3 rounded-xl hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all flex items-center gap-3 z-10 shadow-sm hover:shadow-xl"
        >
          <FileText size={16} className="group-hover/btn:scale-110 transition-transform" /> EXPORT BOARD BRIEF
        </button>
      </motion.div>

      <div className="md:col-span-2 glass-card p-6 border-t-4 border-pnb-gold">
        <h3 className="text-pnb-maroon font-black text-sm mb-4">ASSETS BY CLASSIFICATION</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.filter(d => d.value > 0)}>
              <XAxis dataKey="name" fontSize={10} fontWeight="bold" />
              <YAxis fontSize={10} allowDecimals={false} />
              <Tooltip cursor={{fill: 'rgba(162, 12, 57, 0.05)'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Assets" value={assets.length} icon={<Database size={20}/>} color="#1e293b" />
        <StatCard title="PQC Ready" value={assets.filter(a => a.is_pqc).length} icon={<ShieldCheck size={20}/>} color="#059669" />
        <StatCard title="Critical Risks" value={assets.filter(a => a.mosca.risk_state === 'CRITICAL').length} icon={<AlertTriangle size={20}/>} color="#dc2626" />
        <StatCard title="Mosca Warnings" value={assets.filter(a => a.mosca.risk_state === 'WARNING').length} icon={<Clock size={20}/>} color="#fbbf24" />
      </div>

      <div className="md:col-span-3 glass-card p-6 border-l-4 border-pnb-maroon bg-white/50">
         <h4 className="text-pnb-maroon font-black text-sm mb-4 flex items-center gap-2">
           <Activity size={18} /> LIVE THREAT INTELLIGENCE FEED
         </h4>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {intel.map((item, idx) => (
                <IntelItem key={idx} {...item} />
            ))}
         </div>
      </div>
    </motion.div>
  );
};

const IntelItem = ({ date, source, title, impact }) => (
  <div className="border-l-2 border-slate-200 pl-4 hover:border-pnb-gold transition-colors">
    <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] font-black text-pnb-maroon uppercase">{source}</span>
        <span className="text-[9px] text-slate-400 font-bold">{date}</span>
    </div>
    <div className="text-xs font-bold text-slate-700 leading-snug mb-1 line-clamp-2">{title}</div>
    <div className="text-[9px] text-slate-500 font-medium">IMPACT: {impact}</div>
  </div>
);

const StatCard = ({ title, value, icon, color }) => (
  <div className="glass-card p-4 flex items-center gap-4 hover:-translate-y-1 transition-transform border-b-2" style={{borderBottomColor: color}}>
    <div className={`p-3 rounded bg-slate-50`} style={{color: color}}>
      {icon}
    </div>
    <div>
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</div>
      <div className="text-2xl font-black text-slate-800">{value}</div>
    </div>
  </div>
);

export default Dashboard;
