/**
 * Alert Card Component
 * Individual threat/alert card with severity badge and details
 */

import { Clock, Signal, AlertCircle } from 'lucide-react';
import type { AlertMessage } from '../../types/interfaces';
import { getSeverityColor, getSeverityGlowColor } from '../../utils/formatters';

interface AlertCardProps {
  alert: AlertMessage;
  isHighlight?: boolean;
}

export const AlertCard = ({ alert, isHighlight = false }: AlertCardProps) => {
  const glowClass = getSeverityGlowColor(alert.type);
  const severityColor = getSeverityColor(alert.type);

  return (
    <div
      className={`p-4 rounded-lg border transition-all duration-300 hover:border-slate-600 cursor-pointer group ${
        isHighlight
          ? `${glowClass} border-slate-700 bg-slate-900/80 backdrop-blur-md`
          : 'border-slate-700/50 bg-slate-900/30 hover:bg-slate-900/50'
      }`}
    >
      {/* Top Row: Badge and Time */}
      <div className="flex items-start justify-between mb-2">
        <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider border ${severityColor}`}>
          {alert.type}
        </span>
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <Clock size={12} />
          <span className="font-mono">{alert.time}</span>
        </div>
      </div>

      {/* Description */}
      <h4 className="text-sm font-semibold text-white mb-2 group-hover:text-slate-100 transition-colors">
        {alert.desc}
      </h4>

      {/* Source and Details */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Signal size={12} />
          <span className="font-mono">{alert.source}</span>
        </div>

        {/* Optional IP and Protocol */}
        {alert.ipAddress && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <AlertCircle size={12} />
            <span className="font-mono">{alert.ipAddress} ({alert.protocol || 'Unknown'})</span>
          </div>
        )}
      </div>

      {/* Severity Score Bar */}
      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${
              alert.type === 'Critical'
                ? 'bg-red-500'
                : alert.type === 'High'
                  ? 'bg-orange-500'
                  : alert.type === 'Suspicious'
                    ? 'bg-yellow-500'
                    : 'bg-blue-500'
            }`}
            style={{ width: `${alert.severity}%` }}
          ></div>
        </div>
        <span className="text-xs font-mono text-slate-400">{Math.round(alert.severity)}</span>
      </div>
    </div>
  );
};
