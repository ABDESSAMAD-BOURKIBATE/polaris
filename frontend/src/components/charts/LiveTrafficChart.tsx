/**
 * Live Traffic Chart Component
 * Real-time Recharts visualization with dynamic X-axis
 * Blue line for normal traffic, red spikes for anomalies
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Heartbeat } from 'lucide-react';
import type { MetricPoint } from '../../types/interfaces';
import { formatNumber } from '../../utils/formatters';

interface LiveTrafficChartProps {
  data: MetricPoint[];
}

export const LiveTrafficChart = ({ data }: LiveTrafficChartProps) => {
  // Prepare display data with last 20 points
  const displayData = data.slice(-20);

  return (
    <div className="glass-panel p-6 col-span-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Heartbeat className="text-blue-400" size={20} strokeWidth={2} />
          </div>
          Real-time Threat Activity
        </h2>
        <div className="text-sm text-slate-400">
          {displayData.length > 0 && (
            <>
              Latest: <span className="text-white font-mono">{displayData[displayData.length - 1].time}</span>
            </>
          )}
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-72 w-full">
        {displayData.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={displayData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#334155"
                opacity={0.2}
                vertical={false}
              />

              <XAxis
                dataKey="time"
                stroke="#94A3B8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                stroke="#94A3B8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                label={{ value: 'Events/Threats', angle: -90, position: 'insideLeft' }}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: '#1E293B',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  padding: '8px 12px'
                }}
                itemStyle={{ color: '#E2E8F0' }}
                formatter={(value) => [formatNumber(value as number), '']}
              />

              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
              />

              {/* Normal Traffic Line */}
              <Line
                type="monotone"
                dataKey="traffic"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={false}
                name="Network Events/s"
                isAnimationActive={false}
              />

              {/* Threats Line (Red Spikes) */}
              <Line
                type="stepAfter"
                dataKey="threats"
                stroke="#EF4444"
                strokeWidth={2}
                dot={false}
                name="Detected Threats"
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-slate-500 text-sm">Waiting for data...</p>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {displayData.length > 0 && (
        <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t border-slate-800">
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Avg Traffic</p>
            <p className="text-lg font-semibold text-blue-400">
              {formatNumber(
                Math.round(
                  displayData.reduce((sum, d) => sum + d.traffic, 0) / displayData.length
                )
              )}
              <span className="text-xs text-slate-400 ml-1">EPS</span>
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Total Threats</p>
            <p className="text-lg font-semibold text-red-400">
              {displayData.reduce((sum, d) => sum + d.threats, 0)}
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Peak Anomaly</p>
            <p className="text-lg font-semibold text-yellow-400">
              {Math.round(Math.max(...displayData.map(d => d.anomalyScore)))}
              <span className="text-xs text-slate-400 ml-1">/100</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
