/**
 * Risk Distribution Component
 * Recharts Donut chart showing threat severity breakdown
 * Displays Critical, High, Suspicious, and Info categories
 */

import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';
import type { ThreatData } from '../../types/interfaces';
import { formatPercentage } from '../../utils/formatters';

interface RiskDistributionProps {
  data: ThreatData[];
}

const COLORS = {
  Critical: '#EF4444',  // Red
  High: '#F97316',      // Orange
  Suspicious: '#EAB308', // Yellow
  Info: '#3B82F6'       // Blue
};

export const RiskDistribution = ({ data }: RiskDistributionProps) => {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  // Transform data for recharts
  const chartData = data.map(item => ({
    name: item.severity,
    value: item.count || 0,
    percentage: item.percentage
  }));

  return (
    <div className="glass-panel p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10">
            <PieChartIcon className="text-purple-400" size={20} strokeWidth={2} />
          </div>
          Threat Risk Distribution
        </h2>
      </div>

      {/* Chart */}
      <div className="flex flex-col items-center">
        <div className="h-56 w-full">
          {total > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[entry.name as keyof typeof COLORS]}
                      opacity={0.8}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    border: '1px solid #334155',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => [value, 'Count']}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-slate-500 text-sm">No threats detected</p>
            </div>
          )}
        </div>

        {/* Legend with detailed breakdown */}
        <div className="mt-6 grid grid-cols-2 gap-4 w-full">
          {chartData.map((item) => (
            <div
              key={item.name}
              className="p-3 rounded-lg border border-slate-800 bg-slate-900/30 hover:bg-slate-900/50 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[item.name as keyof typeof COLORS] }}
                ></div>
                <span className="text-sm font-medium">{item.name}</span>
              </div>
              <div className="text-xs text-slate-400">
                <span className="text-white font-mono">{item.value}</span>
                {' '}
                <span>({formatPercentage(item.percentage)})</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Total Summary */}
      {total > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-800 text-center">
          <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Total Threats</p>
          <p className="text-2xl font-bold text-white">{total}</p>
        </div>
      )}
    </div>
  );
};
