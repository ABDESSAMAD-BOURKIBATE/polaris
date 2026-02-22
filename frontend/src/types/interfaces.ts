/**
 * POLARIS - Autonomous Cyber Intelligence Dashboard
 * Type Definitions & Interfaces
 */

export interface MetricPoint {
  time: string;
  threats: number;
  traffic: number;
  anomalyScore: number;
}

export interface AlertMessage {
  id: number;
  type: 'Critical' | 'High' | 'Suspicious' | 'Info';
  source: 'AI Engine' | 'YARA' | 'Rust Agent' | 'Deep Learning';
  desc: string;
  time: string;
  severity: number; // 0-100 score
  ipAddress?: string;
  protocol?: string;
}

export interface ThreatData {
  id: string;
  severity: 'Critical' | 'High' | 'Suspicious' | 'Info';
  count: number;
  percentage: number;
}

export interface RiskMetric {
  label: string;
  value: number;
  unit: string;
  icon: string;
  trend?: number; // percentage change
  status: 'healthy' | 'warning' | 'critical';
}

export interface SystemState {
  isConnected: boolean;
  status: 'Active Live' | 'Connecting...' | 'Disconnected' | 'Error';
  lastUpdate: Date;
}

export interface WebSocketPayload {
  type: 'METRICS_UPDATE' | 'ALERT' | 'STATUS';
  data: MetricPoint;
  alert?: AlertMessage;
}

export interface ThreatSimulationState {
  currentMetrics: MetricPoint;
  activeAlerts: AlertMessage[];
  riskDistribution: ThreatData[];
  systemHealth: number; // 0-100
  peakAnomalyScore: number; // 0-100
  ingestRate: number; // events per second
}
