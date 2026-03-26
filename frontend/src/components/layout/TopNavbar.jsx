import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { downloadBoardBrief } from '../../api/client';
import ThemeToggle from './ThemeToggle';

const TopNavbar = ({ title, breadcrumb }) => {
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        setDownloading(true);
        try {
            await downloadBoardBrief();
        } catch (err) {
            console.error("PDF download failed:", err);
        } finally {
            setDownloading(false);
        }
    };

    return (
        <nav className="h-16 bg-header fixed top-0 right-0 left-64 border-b border-[#C41245] shadow-md flex items-center justify-between px-8 z-30 transition-all">
            {/* Title / Breadcrumb */}
            <div className="flex flex-col text-white">
                <div className="flex items-center gap-2 text-sm font-semibold tracking-wide">
                    <span className="text-gold uppercase tracking-wider text-[11px] font-bold">{breadcrumb}</span>
                    <span className="text-white/50">/</span>
                    <h1 className="text-base m-0 leading-none">{title}</h1>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
                <ThemeToggle />
                
                <div className="h-6 w-px bg-white/20"></div>

                <div className="flex items-center gap-2 text-white/90 text-sm">
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs ring-1 ring-white/20">
                        C
                    </div>
                    <div className="flex flex-col leading-tight mr-4">
                        <span className="font-semibold text-xs">CISO View</span>
                        <span className="text-[10px] text-white/60">Enterprise Admin</span>
                    </div>
                </div>

                <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-brand rounded-lg text-sm font-bold shadow-sm hover:bg-gold hover:text-[#111] transition-all disabled:opacity-50"
                >
                    {downloading ? (
                        <>
                            <span className="w-4 h-4 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
                            Generating…
                        </>
                    ) : (
                        <>
                            <Download className="w-4 h-4" />
                            Board Brief
                        </>
                    )}
                </button>
            </div>
        </nav>
    );
};

export default TopNavbar;
