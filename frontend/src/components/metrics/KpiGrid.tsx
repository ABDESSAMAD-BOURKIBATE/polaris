/**
 * KPI Grid Component
 * 4-card grid showing key system metrics:
 * - System Health
 * - Active Critical Threats
 * - Peak AI Anomaly Score
 * - Pipeline Ingestion Rate
 */

import {
  Activity,
  AlertTriangle,
  TrendingUp,
  Zap
} from 'lucide-react';
import { KpiCard } from './KpiCard';
import type { ThreatSimulationState } from '../../types/interfaces';
import { formatNumber } from '../../utils/formatters';

interface KpiGridProps {
  state: ThreatSimulationState;
}

export const KpiGrid = ({ state }: KpiGridProps) => {
  const criticalThreats = state.activeAlerts.filter(a => a.type === 'Critical').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* System Health */}
      <KpiCard
        title="System Health"
        value={Math.round(state.systemHealth)}
        unit="%"
        icon={Activity}
        status={
          state.systemHealth >= 80
            ? 'healthy'
            : state.systemHealth >= 50
              ? 'warning'
              : 'critical'
        }
      />

      {/* Active Critical Threats */}
      <KpiCard
        title="Critical Threats"
        value={criticalThreats}
        icon={AlertTriangle}
        status={
          criticalThreats === 0
            ? 'healthy'
            : criticalThreats <= 2
              ? 'warning'
              : 'critical'
        }
      />

      {/* Peak AI Anomaly Score */}
      <KpiCard
        title="Peak Anomaly Score"
        value={Math.round(state.peakAnomalyScore)}
        unit="/100"
        icon={TrendingUp}
        status={
          state.peakAnomalyScore <= 30
            ? 'healthy'
            : state.peakAnomalyScore <= 70
              ? 'warning'
              : 'critical'
        }
      />

      {/* Pipeline Ingestion Rate */}
      <KpiCard
        title="Ingestion Rate"
        value={formatNumber(state.ingestRate)}
        unit="EPS"
        icon={Zap}
        status={
          state.ingestRate < 2000
            ? 'healthy'
            : state.ingestRate < 4000
              ? 'warning'
              : 'critical'
        }
      />
    </div>
  );
};
