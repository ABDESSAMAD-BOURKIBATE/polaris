/**
 * KPI Card Component
 * Individual metric card with icon and status indicator
 */

import type { LucideIcon } from 'lucide-react';
import { getStatusColor, getStatusBgColor } from '../../utils/formatters';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  status: 'healthy' | 'warning' | 'critical';
  trend?: number; // percentage change (positive or negative)
  unit?: string;
}

export const KpiCard = ({
  title,
  value,
  icon: Icon,
  status,
  trend,
  unit = ''
}: KpiCardProps) => {
  return (
    <div
      className={`p-6 rounded-lg border border-slate-800 backdrop-blur-md transition-all duration-300 hover:border-slate-700 ${getStatusBgColor(status)}`}
      style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.5) 0%, rgba(30, 41, 59, 0.3) 100%)'
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className={`text-3xl font-bold ${getStatusColor(status)}`}>
              {value}
            </h3>
            {unit && <span className="text-sm text-slate-400">{unit}</span>}
          </div>
        </div>

        {/* Icon Container */}
        <div
          className={`p-3 rounded-lg flex items-center justify-center ${status === 'healthy'
              ? 'bg-emerald-500/10 text-emerald-400'
              : status === 'warning'
                ? 'bg-yellow-500/10 text-yellow-400'
                : 'bg-red-500/10 text-red-400'
            }`}
        >
          <Icon size={24} strokeWidth={2} />
        </div>
      </div>

      {/* Trend Indicator */}
      {trend !== undefined && (
        <div className="flex items-center gap-1 text-xs">
          <span className={trend > 0 ? 'text-red-400' : 'text-emerald-400'}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
          <span className="text-slate-500">change</span>
        </div>
      )}

      {/* Status Bar */}
      <div className="mt-4 h-1 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${status === 'healthy'
              ? 'bg-emerald-500'
              : status === 'warning'
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
          style={{
            width: status === 'healthy' ? '100%' : status === 'warning' ? '60%' : '30%'
          }}
        ></div>
      </div>
    </div>
  );
};
