import { motion } from 'framer-motion';

const AssetTable = ({ assets, onPlaybook }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-card overflow-hidden shadow-2xl border border-slate-200"
    >
      <div className="bg-slate-50 border-b p-4 flex justify-between items-center">
        <h3 className="text-pnb-maroon font-black text-sm tracking-widest flex items-center gap-2">
            <span className="w-2 h-4 bg-pnb-maroon inline-block"></span>
            CRYPTOGRAPHIC ASSET INVENTORY
        </h3>
        <span className="text-[10px] font-black text-slate-400 bg-slate-200 px-3 py-1 rounded">TOTAL ACTIVE: {assets.length}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 text-[10px] font-black uppercase text-slate-500 tracking-wider">
              <th className="px-6 py-4 border-b border-slate-200 whitespace-nowrap text-pnb-maroon/60">Asset Identity</th>
              <th className="px-6 py-4 border-b border-slate-200 whitespace-nowrap text-pnb-maroon/60">Cipher & Authority</th>
              <th className="px-6 py-4 border-b border-slate-200 whitespace-nowrap text-pnb-maroon/60">Network Exposure</th>
              <th className="px-6 py-4 border-b border-slate-200 whitespace-nowrap hidden sm:table-cell text-pnb-maroon/60">Health Rating</th>
              <th className="px-6 py-4 border-b border-slate-200 whitespace-nowrap hidden lg:table-cell text-pnb-maroon/60">Mosca Timeline</th>
              <th className="px-6 py-4 border-b border-slate-200 whitespace-nowrap text-right text-pnb-maroon/60">Protection</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {assets.map((asset, idx) => (
              <motion.tr 
                key={asset.id} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="hover:bg-pnb-maroon/[0.02] transition-colors border-b border-slate-100 group"
              >
                <td className="px-6 py-4">
                    <div className="font-black text-pnb-maroon text-xs tracking-tight">{asset.hostname.toUpperCase()}</div>
                    <div className="text-[10px] text-slate-400 font-bold tracking-widest mt-0.5 uppercase">Tier: {asset.sensitivity_tier}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5 leading-none">
                        {asset.is_pqc && <ShieldCheck size={13} className="text-green-600 drop-shadow-sm" />}
                        {asset.algorithm}
                    </span>
                    <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider mt-1">{asset.tls_version} • {asset.key_size}-BIT</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-1.5 flex-wrap max-w-[150px]">
                    {asset.open_ports?.length > 0 ? (
                        asset.open_ports.map((portInfo, pIdx) => (
                            <span key={pIdx} title={portInfo.service} className="text-[9px] font-black bg-slate-50 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200 flex items-center group-hover:border-pnb-maroon/30 transition-colors">
                                {portInfo.port}
                            </span>
                        ))
                    ) : (
                        <span className="text-[9px] text-slate-400 italic font-medium">No ports visible</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 hidden sm:table-cell">
                   <div className="flex items-center gap-3">
                     <span className="font-black text-xs min-w-[20px] text-right text-slate-700">{asset.qtri_score}</span>
                     <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden shrink-0 border border-slate-200 inner-glow">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${asset.qtri_score}%` }}
                          className={`h-full rounded-full transition-all duration-1000 ${asset.qtri_score > 70 ? 'bg-green-500' : asset.qtri_score > 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                        />
                     </div>
                   </div>
                </td>
                <td className="px-6 py-4 hidden lg:table-cell">
                  <div className="flex flex-col">
                    <span className={`font-black text-[11px] flex items-center gap-1.5 ${asset.mosca.risk_state === 'CRITICAL' ? 'text-red-600 animate-pulse' : asset.mosca.risk_state === 'WARNING' ? 'text-amber-600' : 'text-green-600'}`}>
                      <Clock size={12} /> {asset.mosca.days_remaining_worst} DAYS
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                   <button 
                     onClick={() => onPlaybook(asset)}
                     className="text-[9px] font-black uppercase text-pnb-maroon hover:bg-pnb-maroon hover:text-white border-2 border-pnb-maroon px-4 py-1.5 rounded-lg transition-all active:scale-95 group-hover:shadow-lg tracking-widest"
                   >
                     PLAYBOOK
                   </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default AssetTable;

