/**
 * Header Component
 * Main application header with branding and system status indicator
 */

import { Shield } from 'lucide-react';
import type { SystemState } from '../../types/interfaces';

interface HeaderProps {
  systemStatus: SystemState;
  onExportReport?: () => void;
}

export const Header = ({ systemStatus, onExportReport }: HeaderProps) => {
  const isActive = systemStatus.status === 'Active Live';

  return (
    <header className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        {/* Logo with glow effect */}
        <div className="relative flex items-center justify-center">
          <Shield
            size={52}
            className="text-cyan-400 opacity-90"
            strokeWidth={1.5}
          />
          <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full -z-10"></div>
        </div>

        {/* Branding */}
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl font-black tracking-tight text-white leading-none mb-1">
            POLARIS
          </h1>
          <p className="text-[10px] text-slate-300 uppercase tracking-[0.2em] font-semibold">
            Autonomous Cyber Intelligence
          </p>
        </div>
      </div>

      {/* Status and Export */}
      <div className="flex items-center gap-4">
        {/* Status Indicator */}
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 backdrop-blur-md rounded-full border border-slate-800 hover:border-slate-700 transition-colors">
          <div
            className={`w-2 h-2 rounded-full ${isActive
                ? 'bg-green-400 animate-pulse'
                : systemStatus.status === 'Connecting...'
                  ? 'bg-yellow-400 animate-pulse'
                  : 'bg-red-500'
              }`}
          ></div>
          <span className="text-sm font-medium text-slate-200">
            System {systemStatus.status}
          </span>
        </div>

        {/* Export Button */}
        <button
          onClick={onExportReport}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-md transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 active:scale-95"
        >
          Export Report
        </button>
      </div>
    </header>
  );
};
