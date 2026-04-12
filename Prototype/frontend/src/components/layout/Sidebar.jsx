import React from 'react';
import { 
    LayoutDashboard, 
    Search, 
    Clock, 
    ShieldAlert, 
    ActivitySquare, 
    Network, 
    Wrench, 
    FileText 
} from 'lucide-react';

const Sidebar = ({ currentModule, onNavigate }) => {
    
    const navItems = [
        { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
        { id: 'discovery', label: 'Asset Discovery & CBOM', icon: Search },
        { id: 'mosca', label: 'Mosca Countdown', icon: Clock },
        { id: 'qtri', label: 'QTRI Scoring', icon: ActivitySquare },
        { id: 'posture', label: 'PQC Posture', icon: ShieldAlert },
        { id: 'simulator', label: 'HNDL Simulator', icon: Network },
        { id: 'migration', label: 'Migration Advisor', icon: Wrench },
        { id: 'reports', label: 'Reporting Suite', icon: FileText },
    ];

    return (
        <aside className="w-64 bg-sidebar h-screen fixed left-0 top-0 border-r border-[#2A3B73] flex flex-col z-40">
            {/* Logo Area */}
            <div className="h-16 flex items-center px-6 border-b border-[#2A3B73] bg-[#152250] text-white">
                <div className="w-8 h-8 rounded bg-gold flex items-center justify-center mr-3 font-bold text-[#111] tracking-tighter shadow-[0_0_15px_rgba(251,188,9,0.3)]">
                    QG
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-sm tracking-wide leading-tight">Q-GUARDIAN</span>
                    <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">DFS Platform 3.0</span>
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                <div className="text-[10px] font-bold text-[#A2AEE4] uppercase tracking-wider mb-3 px-2">Intelligence Modules</div>
                
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className={`nav-item w-full text-left ${currentModule === item.id ? 'active' : ''}`}
                    >
                        <item.icon className="nav-icon" />
                        {item.label}
                    </button>
                ))}
            </nav>

            {/* Bottom branding */}
            <div className="p-4 border-t border-[#2A3B73] text-center">
                <p className="text-[10px] text-[#A2AEE4] mb-1">Developed for</p>
                <div className="text-xs font-bold text-white tracking-widest uppercase flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand"></span>
                    PNB Hackathon
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
