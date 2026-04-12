import React, { useState } from 'react';
import axios from 'axios';
import { Activity, ShieldCheck, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const API_BASE = "http://localhost:8000/api/v1";

const ApiScanner = () => {
  const [apiUrl, setApiUrl] = useState("api.pnb.bank.in");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleScan = async () => {
    setScanning(true);
    setResult(null);
    setError(null);
    try {
      const res = await axios.post(`${API_BASE}/scan/api`, { url: apiUrl });
      if (res.data.result.error) {
          setError(res.data.result.error);
      } else {
          setResult(res.data.result);
      }
    } catch (err) {
      setError("Failed to connect to backend scanner.");
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 bg-pnb-maroon text-white border-b-4 border-pnb-gold">
         <h3 className="font-black text-sm uppercase flex items-center gap-2">
           <Activity size={20} /> API SECURITY SCANNER (OWASP TOP 10)
         </h3>
         <p className="text-[10px] opacity-70 mt-1">REAL-TIME ENDPOINT DISCOVERY & VULNERABILITY TESTING</p>
         
         <div className="mt-6 flex items-center gap-3">
            <input 
              type="text" 
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="Enter API Base URL (e.g. api.pnb.bank.in)"
              className="flex-1 px-4 py-2 rounded-md border border-white/20 bg-white/10 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-pnb-gold text-sm font-mono"
            />
            <button 
              onClick={handleScan}
              disabled={scanning || !apiUrl}
              className="bg-pnb-gold text-pnb-maroon font-black uppercase py-2 px-8 rounded-md hover:bg-white transition-colors disabled:opacity-50 text-sm"
            >
              {scanning ? 'SCANNING API...' : 'RUN SECURITY SCAN'}
            </button>
         </div>
      </div>

      {error && (
          <div className="glass-card p-6 border-l-4 border-red-500 text-red-600 bg-red-50 font-bold flex items-center gap-3">
              <AlertTriangle size={24} /> {error}
          </div>
      )}

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Score Card */}
            <div className="md:col-span-1 glass-card p-6 flex flex-col items-center justify-center border-t-4 border-pnb-maroon">
                <h4 className="text-xs font-black text-pnb-maroon mb-6">API SECURITY GRADE</h4>
                <div className="relative flex justify-center items-center w-40 h-40 rounded-full border-8 border-slate-100 mb-4">
                    <div className="absolute inset-0 rounded-full border-8 border-pnb-maroon" style={{ clipPath: `polygon(0 0, 100% 0, 100% ${result.api_risk_score}%, 0 ${result.api_risk_score}%)` }}></div>
                    <span className="text-5xl font-black text-slate-800">{result.api_risk_score}</span>
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">SCORE OUT OF 100</div>
                <div className={`mt-4 px-4 py-1 text-xs font-black rounded ${result.api_risk_score > 80 ? 'bg-green-100 text-green-700' : result.api_risk_score > 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                    {result.api_risk_score > 80 ? 'A - SECURE' : result.api_risk_score > 60 ? 'C - NEEDS IMPROVEMENT' : 'F - CRITICAL RISK'}
                </div>
            </div>

            {/* HTTP Headers */}
            <div className="md:col-span-2 glass-card p-6 border-t-4 border-pnb-gold">
                <h4 className="text-xs font-black text-pnb-maroon mb-4">SECURITY HEADERS SCORECARD</h4>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.entries(result.security_headers).map(([header, present]) => (
                        <div key={header} className={`p-3 rounded border flex items-center justify-between ${present ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                            <span className="text-[10px] font-bold text-slate-700 font-mono truncate mr-2">{header}</span>
                            {present ? <CheckCircle size={16} className="text-green-500 shrink-0"/> : <XCircle size={16} className="text-red-500 shrink-0"/>}
                        </div>
                    ))}
                </div>
                <div className="mt-6 flex items-center justify-between border-t pt-4">
                     <div>
                        <div className="text-[10px] font-black text-slate-500">CORS POLICY RISK</div>
                        <div className={`text-sm font-black ${result.cors_policy.risk === 'HIGH' ? 'text-red-600' : 'text-green-600'}`}>
                            {result.cors_policy.allow_origin || "RESTRICTED"} 
                            {result.cors_policy.risk === 'HIGH' && " (WILDCARD DETECTED)"}
                        </div>
                     </div>
                     <div className="text-right">
                        <div className="text-[10px] font-black text-slate-500">TLS ENFORCEMENT</div>
                        <div className={`text-sm font-black ${result.tls_enforced ? 'text-green-600' : 'text-red-600'}`}>
                            {result.tls_enforced ? "ENABLED" : "MISSING"}
                        </div>
                     </div>
                </div>
            </div>

            {/* OWASP Findings */}
            <div className="md:col-span-3 glass-card p-6 border-l-4 border-red-500">
                <h4 className="text-xs font-black text-pnb-maroon mb-4">OWASP API TOP 10 FINDINGS</h4>
                {result.owasp_findings.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 font-bold bg-slate-50 rounded">NO CRITICAL OWASP FINDINGS DETECTED</div>
                ) : (
                    <div className="space-y-3">
                        {result.owasp_findings.map((f, i) => (
                            <div key={i} className="flex gap-4 p-4 border rounded bg-white items-start">
                                <span className={`px-2 py-1 text-[10px] font-black rounded ${f.severity === 'CRITICAL' ? 'bg-red-600 text-white' : f.severity === 'HIGH' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                                    {f.severity}
                                </span>
                                <div>
                                    <div className="text-sm font-black text-slate-800">{f.id} VULNERABILITY</div>
                                    <div className="text-xs text-slate-600 mt-1 font-mono bg-slate-50 p-2 rounded">{f.detail}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6 border-t border-slate-200">
                    <h4 className="text-xs font-black text-slate-500 mb-4">DISCOVERED ENDPOINTS</h4>
                    <ul className="space-y-2">
                        {result.endpoints_discovered.map((ep, i) => (
                            <li key={i} className="flex justify-between items-center text-xs border-b pb-2">
                                <span className="font-mono text-pnb-maroon truncate max-w-[70%]">{ep.url}</span>
                                <span className={`font-black ${ep.status === 200 ? 'text-green-600' : ep.status === 401 || ep.status === 403 ? 'text-blue-600' : 'text-slate-500'}`}>HTTP {ep.status}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="glass-card p-6 border-t border-slate-200">
                    <h4 className="text-xs font-black text-slate-500 mb-4">INFORMATION DISCLOSURE</h4>
                    {result.info_disclosure.length === 0 ? (
                        <div className="text-xs text-slate-400 italic">No leaked server signatures detected.</div>
                    ) : (
                        <ul className="space-y-2 list-disc pl-4 text-xs text-amber-600 font-mono">
                            {result.info_disclosure.map((info, i) => <li key={i}>{info}</li>)}
                        </ul>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ApiScanner;
