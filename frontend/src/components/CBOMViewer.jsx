import React from 'react';
import { FileCode, Download, ShieldCheck } from 'lucide-react';

const CBOMViewer = ({ assets }) => {
  const cbom = {
    metadata: {
      timestamp: new Date().toISOString(),
      tool: "Q-Guardian v2.0",
      format: "CycloneDX-Compatible",
      organization: "Punjab National Bank"
    },
    components: assets.map(asset => ({
      name: asset.hostname,
      type: "service",
      cryptography: {
        algorithm: asset.algorithm,
        key_size: asset.key_size,
        tls_version: asset.tls_version,
        forward_secrecy: asset.forward_secrecy
      },
      risk: {
        qtri_score: asset.qtri_score,
        mosca_status: asset.mosca.risk_state
      }
    }))
  };

  const handleDownload = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cbom, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "PNB_CBOM_Export.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 flex justify-between items-center bg-pnb-maroon text-white border-b-4 border-pnb-gold">
         <div>
            <h3 className="font-black text-sm uppercase flex items-center gap-2 animate-pulse">
                <FileCode size={20} /> LIVE CRYPTOGRAPHIC BILL OF MATERIALS (CBOM)
            </h3>
            <p className="text-[10px] opacity-70 mt-1">REAL-TIME INVENTORY OF ENTERPRISE CIPHERS AND CERTIFICATES</p>
         </div>
         <button 
           onClick={handleDownload}
           className="bg-pnb-gold text-pnb-maroon px-6 py-2 rounded font-black text-xs hover:bg-white transition-colors"
         >
           EXPORT JSON
         </button>
      </div>

      <div className="glass-card p-6 bg-slate-900 overflow-hidden relative">
        <div className="absolute top-4 right-4 text-slate-600 font-mono text-[10px]">READ_ONLY</div>
        <pre className="text-green-500 font-mono text-xs overflow-auto max-h-[500px] scrollbar-hide">
          {JSON.stringify(cbom, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default CBOMViewer;
