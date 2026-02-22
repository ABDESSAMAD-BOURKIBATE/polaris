import { useState, useEffect, useRef } from 'react';
import {
  IconActivityHeartbeat,
  IconAlertTriangle,
  IconNetwork,
  IconServerCog,
  IconDatabaseExport,
  IconShieldExclamation,
  IconDeviceLaptop,
  IconAlertCircle,
  IconLockSquareRounded
} from '@tabler/icons-react';
import type { Icon } from '@tabler/icons-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: Icon;
  colorClass: string;
}

const StatCard = ({ title, value, icon: Icon, colorClass }: StatCardProps) => (
  <div className="glass-panel p-6 flex items-center justify-between">
    <div>
      <p className="text-slate-400 text-sm font-medium">{title}</p>
      <h3 className="text-3xl font-bold mt-1">{value}</h3>
    </div>
    <div className={`p-4 rounded-full ${colorClass}`}>
      <Icon size={24} />
    </div>
  </div>
);

interface MetricPoint {
  time: string;
  threats: number;
  traffic: number;
}

interface AlertMessage {
  id: number;
  type: string;
  source: string;
  desc: string;
  time: string;
}

import { Login } from './components/auth/Login';
import { LiveAttacks } from './components/metrics/LiveAttacks';
import { SecurityStats } from './components/metrics/SecurityStats';
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
  const [activeThreats, setActiveThreats] = useState(0);
  const [eventsPerSec, setEventsPerSec] = useState(0);
  const [agents] = useState(12);
  const [indexedLogs, setIndexedLogs] = useState(842000);

  const [dataStream, setDataStream] = useState<MetricPoint[]>([]);
  const [alerts, setAlerts] = useState<AlertMessage[]>([]);
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
        activeThreats,
        eventsPerSec,
        agents,
        indexedLogs,
        alerts
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

  // Fetch real logs from DB initially
  useEffect(() => {
    if (isLoggedIn) {
      fetch('http://127.0.0.1:8000/logs')
        .then(res => res.json())
        .then(data => {
          const formattedAlerts = data.map((log: any) => ({
            id: log.id,
            type: log.type,
            source: log.source,
            desc: log.description,
            time: new Date(log.timestamp).toLocaleTimeString()
          }));
          setAlerts(formattedAlerts);
        })
        .catch(err => console.error("Error fetching logs", err));
    }
  }, [isLoggedIn]);

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
          const { time, threats, traffic } = payload.data;

          setActiveThreats(threats);
          setEventsPerSec(traffic);
          setIndexedLogs(prev => prev + traffic);

          setDataStream(prev => {
            const newStream = [...prev, { time, threats, traffic }];
            return newStream.slice(-20); // Keep last 20
          });

          if (payload.alert) {
            setAlerts(prev => [payload.alert, ...prev].slice(0, 8));
          }
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Active Threats" value={activeThreats} icon={IconAlertTriangle} colorClass="bg-red-500/10 text-red-400" />
          <StatCard title="Network Events/s" value={eventsPerSec.toLocaleString()} icon={IconNetwork} colorClass="bg-blue-500/10 text-blue-400" />
          <StatCard title="System Agents" value={agents} icon={IconServerCog} colorClass="bg-emerald-500/10 text-emerald-400" />
          <StatCard title="Logs Indexed" value={(indexedLogs / 1000).toFixed(1) + 'K'} icon={IconDatabaseExport} colorClass="bg-purple-500/10 text-purple-400" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-panel p-6 col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <IconActivityHeartbeat className="text-cyber-blue" size={24} stroke={1.5} />
                Real-time Threat Activity
              </h2>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dataStream}>
                  <defs>
                    <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} vertical={false} />
                  <XAxis dataKey="time" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '8px' }}
                    itemStyle={{ color: '#E2E8F0' }}
                  />
                  <Area type="monotone" dataKey="threats" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorThreats)" isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel p-6">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <IconShieldExclamation className="text-cyber-warning" size={24} stroke={1.5} />
              Actionable Intelligence
            </h2>
            <div className="space-y-4 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
              {alerts.length === 0 ? (
                <p className="text-sm text-slate-500 italic">No actionable intelligence currently. Monitoring...</p>
              ) : alerts.map((alert, idx) => (
                <div key={alert.id || idx} className="p-4 rounded-lg bg-cyber-900/50 border border-slate-700/50 hover:border-slate-600 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider
                    ${alert.type === 'Critical' ? 'bg-red-500/20 text-red-400' :
                        alert.type === 'High' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-yellow-500/20 text-yellow-400'}`}>
                      {alert.type}
                    </span>
                    <span className="text-xs text-slate-500">{alert.time}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-white mb-1">{alert.desc}</h4>
                  <p className="text-xs text-slate-400 font-mono">{alert.source}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="col-span-2">
            <LiveAttacks />
          </div>
          <div>
            <SecurityStats />
          </div>
        </div>
      </div>
    </div>
  );
}
