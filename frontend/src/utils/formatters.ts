/**
 * Utility functions for formatting and data transformation
 */

export const formatTimeStamp = (): string => {
  const now = new Date();
  return now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

export const formatNumber = (value: number): string => {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M';
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'K';
  }
  return value.toString();
};

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return (value * 100).toFixed(decimals) + '%';
};

export const generateRandomIP = (): string => {
  return Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join('.');
};

export const getSeverityColor = (type: 'Critical' | 'High' | 'Suspicious' | 'Info'): string => {
  switch (type) {
    case 'Critical':
      return 'bg-red-500/20 text-red-400 border-red-500/50';
    case 'High':
      return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
    case 'Suspicious':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
    case 'Info':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
  }
};

export const getSeverityGlowColor = (type: 'Critical' | 'High' | 'Suspicious' | 'Info'): string => {
  switch (type) {
    case 'Critical':
      return 'shadow-[0_0_15px_rgba(239,68,68,0.5)]';
    case 'High':
      return 'shadow-[0_0_12px_rgba(249,115,22,0.4)]';
    case 'Suspicious':
      return 'shadow-[0_0_10px_rgba(234,179,8,0.3)]';
    case 'Info':
      return 'shadow-[0_0_10px_rgba(59,130,246,0.3)]';
  }
};

export const getStatusColor = (status: 'healthy' | 'warning' | 'critical'): string => {
  switch (status) {
    case 'healthy':
      return 'text-emerald-400';
    case 'warning':
      return 'text-yellow-400';
    case 'critical':
      return 'text-red-400';
  }
};

export const getStatusBgColor = (status: 'healthy' | 'warning' | 'critical'): string => {
  switch (status) {
    case 'healthy':
      return 'bg-emerald-500/10';
    case 'warning':
      return 'bg-yellow-500/10';
    case 'critical':
      return 'bg-red-500/10';
  }
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};
