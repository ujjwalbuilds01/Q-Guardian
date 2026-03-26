import React, { useState } from 'react';

// Layout Components
import Sidebar from './components/layout/Sidebar';
import TopNavbar from './components/layout/TopNavbar';

// Page Components
import DashboardPage from './pages/DashboardPage';
import CBOMPage from './pages/CBOMPage';
import MoscaPage from './pages/MoscaPage';
import QTRIPage from './pages/QTRIPage';
import PQCPosturePage from './pages/PQCPosturePage';
import HNDLPage from './pages/HNDLPage';
import MigrationPage from './pages/MigrationPage';
import ReportsPage from './pages/ReportsPage';

const App = () => {
    const [currentModule, setCurrentModule] = useState('dashboard');

    const renderModule = () => {
        switch (currentModule) {
            case 'dashboard': return <DashboardPage />;
            case 'discovery': return <CBOMPage />;
            case 'mosca': return <MoscaPage />;
            case 'qtri': return <QTRIPage />;
            case 'posture': return <PQCPosturePage />;
            case 'simulator': return <HNDLPage />;
            case 'migration': return <MigrationPage />;
            case 'reports': return <ReportsPage />;
            default: return <DashboardPage />;
        }
    };

    const getPageTitle = () => {
        switch (currentModule) {
            case 'dashboard': return 'Executive Overview';
            case 'discovery': return 'Cryptographic Bill of Materials (CBOM)';
            case 'mosca': return 'Mosca Risk Countdown Engine';
            case 'qtri': return 'QTRI Enterprise Scoring';
            case 'posture': return 'PQC Adoption Posture';
            case 'simulator': return 'HNDL Threat Simulator';
            case 'migration': return 'Migration Playbooks';
            case 'reports': return 'Reporting & Compliance Suite';
            default: return 'Executive Overview';
        }
    };

    return (
        <div className="flex bg-[var(--bg-body)] min-h-screen text-[var(--text-primary)] transition-colors duration-300">
            {/* Sidebar */}
            <Sidebar currentModule={currentModule} onNavigate={setCurrentModule} />

            {/* Main Content Area */}
            <div className="flex-1 ml-64 flex flex-col min-h-screen">
                {/* Header */}
                <TopNavbar 
                    title={getPageTitle()} 
                    breadcrumb="Modules" 
                />

                {/* Page Content */}
                <main className="flex-1 mt-16 p-6 md:p-8 lg:p-10 max-w-[1600px] w-full mx-auto animate-in fade-in duration-500">
                    {renderModule()}
                </main>
            </div>
        </div>
    );
};

export default App;
