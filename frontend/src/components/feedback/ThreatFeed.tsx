/**
 * Threat Feed Component
 * Scrollable, auto-updating list of AlertCard components
 * Shows active threats and anomalies in real-time
 */

import { Shield, AlertTriangle, Clock } from 'lucide-react';
import { AlertCard } from './AlertCard';
import type { AlertMessage } from '../../types/interfaces';

interface ThreatFeedProps {
  alerts: AlertMessage[];
  emptyMessage?: string;
  maxHeight?: string;
}

export const ThreatFeed = ({
  alerts,
  emptyMessage = 'No actionable intelligence currently. Monitoring...',
  maxHeight = 'max-h-96'
}: ThreatFeedProps) => {
  // Highlight critical alerts
  const criticalAlerts = alerts.filter(a => a.type === 'Critical');
  const hasHighSeverity = criticalAlerts.length > 0;

  return (
    <div className={`glass-panel p-6 ${hasHighSeverity ? 'border-red-500/50' : 'border-slate-800'} transition-colors`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-3">
          <div className={`p-2 rounded-lg ${hasHighSeverity ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
            {hasHighSeverity ? (
              <AlertTriangle className="text-red-400" size={20} strokeWidth={2} />
            ) : (
              <Shield className="text-amber-400" size={20} strokeWidth={2} />
            )}
          </div>
          Threat Intelligence Feed
        </h2>
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Clock size={14} />
          Live
        </div>
      </div>

      {/* Alert Count */}
      {alerts.length > 0 && (
        <div className="mb-4 flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-white">{alerts.length}</span>
            <span className="text-slate-400">active threat{alerts.length !== 1 ? 's' : ''}</span>
          </div>
          {criticalAlerts.length > 0 && (
            <>
              <span className="text-slate-600">•</span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-400 font-semibold">{criticalAlerts.length} Critical</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Alert List */}
      <div className={`space-y-3 ${maxHeight} overflow-y-auto pr-2 custom-scrollbar`}>
        {alerts.length === 0 ? (
          <div className="h-32 flex items-center justify-center">
            <p className="text-sm text-slate-500 italic text-center">{emptyMessage}</p>
          </div>
        ) : (
          alerts.map((alert, idx) => (
            <AlertCard
              key={`${alert.id}-${idx}`}
              alert={alert}
              isHighlight={alert.type === 'Critical' && idx < 3}
            />
          ))
        )}
      </div>

      {/* Footer Stats */}
      {alerts.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="text-slate-400 mb-1">Oldest Alert</p>
            <p className="font-mono text-slate-300">{alerts[alerts.length - 1].time}</p>
          </div>
          <div>
            <p className="text-slate-400 mb-1">Latest Alert</p>
            <p className="font-mono text-slate-300">{alerts[0].time}</p>
          </div>
        </div>
      )}
    </div>
  );
};
