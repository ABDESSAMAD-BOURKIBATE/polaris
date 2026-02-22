import { useState, useEffect, useRef } from 'react';
import {
  IconDatabaseExport,
  IconShieldExclamation,
  IconDeviceLaptop,
  IconAlertCircle,
  IconLockSquareRounded
} from '@tabler/icons-react';


import type { MetricPoint } from './types/interfaces';


import { Login } from './components/auth/Login';
import {
  KpiGrid,
  LiveAttacks,
  SecurityStats,
  LiveTrafficChart,
  RiskDistribution,
  ThreatFeed
} from './components';
import { useThreatSimulation } from './hooks';
import { generateProfessionalReport } from './utils/reportGenerator';

const MobileSecurityBlock = () => (
  <div className="fixed inset-0 z-[100] bg-[#020610] flex items-center justify-center p-6 overflow-hidden" dir="ltr">
    {/* Background Effects */}
    <div className="absolute inset-0 opacity-20 pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-b from-red-500/10 via-transparent to-red-500/10 animate-scanline"></div>
    </div>

    <div className="relative z-10 max-w-md w-full text-center">
      <div className="mb-8 flex justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full scale-150 animate-pulse"></div>
          <IconShieldExclamation size={80} className="text-red-500 relative z-10 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" stroke={1} />
        </div>
      </div>

      <h1 className="text-2xl font-black text-white tracking-wider mb-2 glitch-text" data-text="SYSTEM ACCESS RESTRICTED">
        SYSTEM ACCESS RESTRICTED
      </h1>

      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-red-500/50 to-transparent mb-6"></div>

      <div className="space-y-4 text-slate-300 font-medium">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-2 text-red-400">
            <IconAlertCircle size={20} />
            <span className="text-sm font-bold uppercase tracking-widest">SECURITY ALERT</span>
          </div>
          <p className="text-sm leading-relaxed text-left">
            Access to the <span className="text-white font-bold">POLARIS</span> system is strictly prohibited on mobile devices or tablets for technical and security reasons.
          </p>
        </div>

        <div className="bg-cyber-900/50 border border-slate-800 rounded-lg p-4 text-left">
          <div className="flex items-center gap-3 mb-2 text-cyber-blue">
            <IconDeviceLaptop size={20} />
            <span className="text-sm font-bold uppercase tracking-widest">SYSTEM REQUIREMENTS</span>
          </div>
          <p className="text-xs text-slate-400">
            Please use a desktop or laptop workstation in full-screen mode to ensure the stability of analysis tools and AI engines.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 mt-8 text-[10px] text-slate-500 font-mono tracking-tighter uppercase">
          <IconLockSquareRounded size={12} />
          <span>Hardware Verification: Failed - Mobile_Device_Detected</span>
        </div>
      </div>
    </div>
  </div>
);


export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [systemStatus, setSystemStatus] = useState('Connecting...');
  const [isExporting, setIsExporting] = useState(false);

  // Real-time metrics
  const [indexedLogs, setIndexedLogs] = useState(842000);

  const [dataStream, setDataStream] = useState<MetricPoint[]>([]);
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);

  // Device detection
  useEffect(() => {
    const checkDevice = () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        || window.innerWidth < 1024;
      setIsMobileDevice(isMobile);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);


  // Persistent user state
  useEffect(() => {
    const token = localStorage.getItem('polaris_token');
    if (token) {
      setIsLoggedIn(true);
      loadProgress();
    }
  }, []);

  const loadProgress = async () => {
    const username = localStorage.getItem('polaris_user');
    if (!username) return;
    try {
      const response = await fetch(`http://127.0.0.1:8000/user/progress?username=${username}`);
      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.indexedLogs) {
          setIndexedLogs(data.data.indexedLogs);
        }
      }
    } catch (err) {
      console.error("Failed to load progress", err);
    }
  };

  const saveProgress = async () => {
    const username = localStorage.getItem('polaris_user');
    if (!username) return;
    try {
      await fetch(`http://127.0.0.1:8000/user/progress?username=${username}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { indexedLogs } })
      });
    } catch (err) {
      console.error("Failed to save progress", err);
    }
  };

  // Sync progress every minute
  useEffect(() => {
    if (isLoggedIn) {
      const interval = setInterval(saveProgress, 60000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, indexedLogs]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await generateProfessionalReport({
        activeThreats: simulationState.activeAlerts.length,
        eventsPerSec: simulationState.ingestRate,
        agents: 12,
        indexedLogs,
        alerts: simulationState.activeAlerts
      });
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('polaris_token');
    localStorage.removeItem('polaris_user');
    setIsLoggedIn(false);
  };


  useEffect(() => {
    if (!isLoggedIn) return;

    console.log("Initializing WebSocket connection...");
    const ws = new WebSocket('ws://127.0.0.1:8000/ws/stream');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected directly to POLARIS!');
      setSystemStatus('Active Live');
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);

        if (payload.type === 'METRICS_UPDATE' && payload.data) {
          setIndexedLogs(prev => prev + payload.data.traffic);

          setDataStream(prev => {
            const newStream = [...prev, { ...payload.data, anomalyScore: payload.data.anomalyScore || 0 }];
            return newStream.slice(-20); // Keep last 20
          });

        }
      } catch (err) {
        console.error("Failed to parse websocket message", err);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket Closed');
      setSystemStatus('Disconnected');
    };

    ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
      setSystemStatus('Error');
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [isLoggedIn]);

  const simulationState = useThreatSimulation();

  if (isMobileDevice) {
    return <MobileSecurityBlock />;
  }

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div
      className="min-h-screen text-slate-200 p-6 relative overflow-hidden"
      style={{
        backgroundImage: 'url(/bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="absolute inset-0 bg-cyber-900/80 backdrop-blur-[2px] z-0"></div>

      <div className="relative z-10">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center">
              <img src="/logo.png" alt="POLARIS Logo" className="w-[60px] h-auto relative z-10" />
              <div className="absolute inset-0 bg-cyber-cyan/20 blur-xl rounded-full -z-10"></div>
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-3xl font-black tracking-tight text-white leading-none mb-1">POLARIS</h1>
              <p className="text-[10px] text-slate-300 uppercase tracking-[0.2em] font-semibold">Autonomous Cyber Intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-cyber-800 rounded-full border border-slate-700">
              <div className={`w-2 h-2 rounded-full ${systemStatus === 'Active Live' ? 'bg-cyber-accent animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium">System {systemStatus}</span>
            </div>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className={`px-5 py-2 bg-cyber-blue hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-all shadow-lg flex items-center gap-2 ${isExporting ? 'opacity-70 cursor-not-allowed scale-95' : 'hover:scale-105 shadow-blue-500/20'}`}
            >
              {isExporting ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <IconDatabaseExport size={16} />
                  <span>Export Report</span>
                </>
              )}
            </button>
            <button
              onClick={handleLogout}
              className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-md border border-slate-700 transition-all hover:scale-105"
            >
              Logout
            </button>
          </div>
        </header>

        {/* KPI Grid Section */}
        <KpiGrid state={simulationState} />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Traffic Chart */}
          <LiveTrafficChart data={[...dataStream, simulationState.currentMetrics]} />

          {/* Risk Distribution */}
          <RiskDistribution data={simulationState.riskDistribution} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Live Attacks Feed */}
          <div className="col-span-2">
            <LiveAttacks />
          </div>

          {/* Infrastructure Health */}
          <div>
            <SecurityStats />
          </div>
        </div>

        {/* Threat Intelligence Feed */}
        <div className="mt-6">
          <ThreatFeed alerts={simulationState.activeAlerts} />
        </div>
      </div>
    </div>
  );
}
