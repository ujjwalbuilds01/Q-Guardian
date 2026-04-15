import React, { useState, useEffect, Suspense, lazy } from 'react';
import axios from 'axios';
import { ShieldCheck, Clock, AlertTriangle, FileText, LayoutDashboard, Database, Activity, Terminal } from 'lucide-react';
import Header from './components/Header';
import PlaybookModal from './components/PlaybookModal';
import Chatbot from './components/Chatbot';
import { useToast } from './context/ToastContext.jsx';
import { useAuth } from './context/AuthContext.jsx';
import LoginPage from './components/LoginPage';
import ErrorBoundary from './components/ErrorBoundary';
import { API_BASE } from './lib/api.js';

const Dashboard = lazy(() => import('./components/Dashboard'));
const AssetTable = lazy(() => import('./components/AssetTable'));
const HNDLSimulator = lazy(() => import('./components/HNDLSimulator'));
const CBOMViewer = lazy(() => import('./components/CBOMViewer'));
const DependencyGraph = lazy(() => import('./components/DependencyGraph'));
const ComplianceMapper = lazy(() => import('./components/ComplianceMapper'));
const ApiScanner = lazy(() => import('./components/ApiScanner'));

function App() {
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [assets, setAssets] = useState([]);
  const [rating, setRating] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [polling, setPolling] = useState(false);
  
  const [domain, setDomain] = useState('pnb.bank.in');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [playbook, setPlaybook] = useState(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatusMsg, setScanStatusMsg] = useState('');

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const fetchData = async () => {
    try {
      const [assetsRes, ratingRes] = await Promise.all([
        axios.get(`${API_BASE}/assets`),
        axios.get(`${API_BASE}/enterprise/rating`)
      ]);
      setAssets(Array.isArray(assetsRes.data) ? assetsRes.data : []);
      setRating(ratingRes.data && typeof ratingRes.data === 'object' ? ratingRes.data : null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setAssets([]);
      setRating(null);
    }
  };

  const handleScan = async () => {
    setScanning(true);
    setPolling(false);
    try {
      const res = await axios.post(`${API_BASE}/scan/trigger`, { domain });
      const jobId = res.data.job_id;
      
      // Poll for completion (Adaptive polling for production feel)
      setPolling(true);
      let pollDelay = 1000;
      let active = true;

      const poll = async () => {
          if (!active) return;
          try {
              const statusRes = await axios.get(`${API_BASE}/scan/${jobId}/status`);
              const data = statusRes.data;
              
              setScanProgress(data.progress || 0);
              setScanStatusMsg(data.current_step || 'Processing...');
              
              if (data.status === 'COMPLETED') {
                  active = false;
                  setPolling(false);
                  setScanning(false);
                  setScanProgress(100);
                  setScanStatusMsg('Finalizing...');
                  setTimeout(async () => {
                      await fetchData();
                      setActiveTab('dashboard');
                  }, 1000);
                  return;
              } else if (data.status === 'FAILED') {
                  active = false;
                  setPolling(false);
                  setScanning(false);
                  toast.showError("Scan Error: " + data.current_step);
                  setScanStatusMsg('');
                  return;
              }

              // Adaptive polling: up to 3 seconds
              if (pollDelay < 3000) pollDelay += 500;
              setTimeout(poll, pollDelay);
              
          } catch (e) {
              console.error("Polling error", e);
              setTimeout(poll, 1000); // Retry 
          }
      };

      setTimeout(poll, pollDelay);
      
    } catch (err) {
      toast.showError("Scan failed. Ensure backend is running.");
      setScanning(false);
    }
  };

  const handleOpenPlaybook = async (asset) => {
    setSelectedAsset(asset);
    try {
      const res = await axios.get(`${API_BASE}/migration/${asset.id}/playbook`);
      setPlaybook(res.data);
    } catch (err) {
      console.error("Failed to fetch playbook");
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const navItems = [
    { id: 'dashboard', label: 'POSTURE DASHBOARD', icon: <LayoutDashboard size={14} /> },
    { id: 'assets', label: 'ASSET INVENTORY', icon: <Database size={14} /> },
    { id: 'api_scanner', label: 'API SCANNER', icon: <Terminal size={14} /> },
    { id: 'hndl', label: 'HNDL SIMULATOR', icon: <Activity size={14} /> },
    { id: 'graph', label: 'TOPOLOGY GRAPH', icon: <Activity size={14} /> },
    { id: 'compliance', label: 'RBI MAPPER', icon: <ShieldCheck size={14} /> },
    { id: 'cbom', label: 'CBOM READY', icon: <FileText size={14} /> },
  ];

  return (
    <div className="min-h-screen pt-28 pb-16 bg-[#f8fafc] w-full isolate">
      <Header 
        onScan={handleScan} 
        scanning={scanning} 
        polling={polling}
        domain={domain} 
        setDomain={setDomain} 
        progress={scanProgress}
        statusMessage={scanStatusMsg}
      />
      
      <main className="max-w-[1400px] w-full mx-auto px-4 sm:px-6">
        <nav className="flex gap-2 sm:gap-4 flex-wrap mb-8 justify-center lg:justify-start">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded text-[9px] sm:text-[10px] font-black transition-all border-2 flex items-center gap-2 uppercase tracking-widest bg-white shadow-sm
                ${activeTab === item.id 
                  ? 'border-pnb-maroon text-pnb-maroon translate-y-0.5 shadow-none' 
                  : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-800'}`}
            >
              <span className={activeTab === item.id ? 'text-pnb-maroon' : 'text-slate-400'}>{item.icon}</span> 
              {item.label}
            </button>
          ))}
        </nav>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full min-h-[60vh]">
          <ErrorBoundary>
            <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh] text-slate-400 font-bold uppercase tracking-widest">Loading Module...</div>}>
              {activeTab === 'dashboard' && <Dashboard assets={assets} rating={rating} />}
              {activeTab === 'assets' && <AssetTable assets={assets} onPlaybook={handleOpenPlaybook} />}
              {activeTab === 'api_scanner' && <ApiScanner />}
              {activeTab === 'hndl' && <HNDLSimulator assets={assets} />}
              {activeTab === 'graph' && <DependencyGraph assets={assets} />}
              {activeTab === 'compliance' && <ComplianceMapper />}
              {activeTab === 'cbom' && <CBOMViewer assets={assets} />}
            </Suspense>
          </ErrorBoundary>
        </div>
      </main>

      <Chatbot />

      <PlaybookModal 
        asset={selectedAsset} 
        playbook={playbook} 
        onClose={() => { setSelectedAsset(null); setPlaybook(null); }} 
      />

      <footer className="fixed bottom-0 left-0 right-0 bg-pnb-maroon text-white/60 py-2 px-6 text-[10px] flex justify-between uppercase font-bold tracking-widest z-50">
        <div>&copy; 2026 PUNJAB NATIONAL BANK. ALL RIGHTS RESERVED.</div>
        <div className="flex gap-4">
          <span>PRIVACY POLICY</span>
          <span>DISCLAIMER</span>
          <span>POWERED BY MOSCA RISK COUNTDOWN ENGINE</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
