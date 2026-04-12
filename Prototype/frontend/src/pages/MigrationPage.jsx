import React, { useState, useEffect } from 'react';
import { Wrench, CheckCircle2, ChevronRight, Copy, Terminal } from 'lucide-react';
import { getCBOM } from '../api/client';

const MigrationPage = () => {
    const [cbom, setCbom] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedAsset, setExpandedAsset] = useState(null);

    useEffect(() => {
        getCBOM().then(res => {
            setCbom(res.data);
            setLoading(false);
            if (res.data.length > 0) setExpandedAsset(res.data[0].hostname);
        });
    }, []);

    const getRecommendation = (algo, type) => {
        if (algo.includes('RSA') || algo.includes('ECC')) {
            if (type === 'API' || type === 'WEB_APP') return { target: 'Hybrid: X25519MLKEM768', standard: 'FIPS 203', effort: 'Medium', snippet: nginxSnippet };
            return { target: 'ML-KEM-1024', standard: 'FIPS 203', effort: 'High', snippet: tlsSnippet };
        }
        return { target: 'Already Compliant', standard: '-', effort: 'None', snippet: '' };
    };

    const nginxSnippet = `ssl_protocols TLSv1.3;
ssl_ciphers TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256;
# Enable Hybrid PQC Key Exchange
ssl_ecdh_curve X25519MLKEM768:prime256v1; 
ssl_prefer_server_ciphers off;
add_header Strict-Transport-Security "max-age=63072000" always;`;

    const tlsSnippet = `// Implementation logic based on FIPS 203 target
// ... Configure TLS library to prefer PQC variants ...`;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* List */}
            <div className="lg:col-span-1 pnb-card bg-white dark:bg-[#0D1117] p-0 overflow-y-auto max-h-[calc(100vh-8rem)]">
                <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-surface-2)]">
                    <h3 className="font-bold text-navy uppercase tracking-wide text-xs">Vulnerable Inventory</h3>
                </div>
                
                {loading && <div className="p-8 text-center text-sm text-[var(--text-muted)] animate-pulse">Loading playbooks...</div>}
                
                {cbom.map((asset, idx) => (
                    <div 
                        key={idx} 
                        onClick={() => setExpandedAsset(asset.hostname)}
                        className={`p-4 border-b border-[var(--border-color-soft)] cursor-pointer transition-colors ${
                            expandedAsset === asset.hostname ? 'bg-[rgba(162,14,55,0.05)] border-l-4 border-l-brand' : 'hover:bg-[var(--bg-surface-2)]'
                        }`}
                    >
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-sm text-[var(--text-primary)] truncate max-w-[180px]" title={asset.hostname}>{asset.hostname}</span>
                            <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-[var(--bg-surface-2)] border border-[var(--border-color)] text-[var(--text-secondary)] px-1.5 py-0.5 rounded font-mono">
                                {asset.algorithm_strength}
                            </span>
                            {asset.pqc_ready && <CheckCircle2 className="w-3 h-3 text-[var(--color-safe)]" />}
                        </div>
                    </div>
                ))}
            </div>

            {/* Detail Playbook */}
            <div className="lg:col-span-2 space-y-6">
                {cbom.filter(a => a.hostname === expandedAsset).map((asset, idx) => {
                    const rec = getRecommendation(asset.algorithm_strength, asset.asset_type);
                    return (
                        <React.Fragment key={idx}>
                            <div className="pnb-card bg-white dark:bg-[#0D1117]">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <h2 className="text-xl font-black text-navy mb-1">{asset.hostname}</h2>
                                        <div className="text-sm font-medium text-[var(--text-secondary)]">
                                            Current: <span className="font-mono text-brand bg-[rgba(162,14,55,0.1)] px-1 rounded">{asset.algorithm_strength}</span>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wide ${asset.pqc_ready ? 'badge-safe' : 'badge-warning'}`}>
                                        {asset.pqc_ready ? 'Migrated' : 'Requires Migration'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                    <div className="border border-[var(--border-color)] rounded-lg p-3 bg-[var(--bg-surface-2)]">
                                        <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Target State</div>
                                        <div className="font-mono text-sm font-semibold text-navy">{rec.target}</div>
                                    </div>
                                    <div className="border border-[var(--border-color)] rounded-lg p-3 bg-[var(--bg-surface-2)]">
                                        <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">NIST Reference</div>
                                        <div className="font-mono text-sm font-semibold text-brand">{rec.standard}</div>
                                    </div>
                                    <div className="border border-[var(--border-color)] rounded-lg p-3 bg-[var(--bg-surface-2)]">
                                        <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Effort</div>
                                        <div className="font-mono text-sm font-semibold text-[var(--text-primary)]">{rec.effort}</div>
                                    </div>
                                </div>

                                <h3 className="section-title mb-3"><Terminal className="w-4 h-4 text-brand" /> Implementation Snippet</h3>
                                {rec.snippet ? (
                                    <div className="relative group">
                                        <button className="absolute top-2 right-2 p-2 bg-white/10 hover:bg-white/20 rounded hidden group-hover:block transition-colors" title="Copy">
                                            <Copy className="w-4 h-4 text-white" />
                                        </button>
                                        <pre className="code-block"><code>
<span className="keyword">{rec.snippet.split(';')[0].split(' ')[0]}</span> <span className="string">{rec.snippet.split(';')[0].split(' ')[1]}</span>;<br/>
<span className="keyword">ssl_ciphers</span> <span className="string">TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256</span>;<br/>
<span className="comment"># Enable Hybrid PQC Key Exchange</span><br/>
<span className="keyword">ssl_ecdh_curve</span> <span className="string">X25519MLKEM768:prime256v1</span>; <br/>
<span className="keyword">ssl_prefer_server_ciphers</span> <span className="string">off</span>;<br/>
                                        </code></pre>
                                    </div>
                                ) : (
                                    <div className="p-6 text-center border border-dashed border-[var(--border-color)] rounded-lg text-sm text-[var(--text-muted)] bg-[var(--bg-surface-2)]">
                                        No implementation code required. Asset is compliant.
                                    </div>
                                )}

                                <div className="mt-6 flex justify-end">
                                    <button className="btn-primary flex items-center gap-2">
                                        <Wrench className="w-4 h-4" /> Generate Full Playbook PDF
                                    </button>
                                </div>
                            </div>
                        </React.Fragment>
                    );
                })}

                {!expandedAsset && !loading && (
                    <div className="pnb-card flex items-center justify-center p-16 text-[var(--text-muted)] bg-[var(--bg-surface-2)] border-dashed">
                        Select an asset to view its migration playbook
                    </div>
                )}
            </div>
        </div>
    );
};

export default MigrationPage;
