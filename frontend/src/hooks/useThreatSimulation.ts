/**
 * useThreatSimulation Hook
 * Generates simulated real-time threat data and metrics
 */

import { useState, useEffect, useCallback } from 'react';
import type { ThreatSimulationState, MetricPoint, AlertMessage, ThreatData } from '../types/interfaces';

const INITIAL_METRICS: MetricPoint = {
    time: new Date().toLocaleTimeString(),
    threats: 0,
    traffic: 1200,
    anomalyScore: 15
};

const INITIAL_STATE: ThreatSimulationState = {
    currentMetrics: INITIAL_METRICS,
    activeAlerts: [],
    riskDistribution: [
        { id: '1', severity: 'Critical', count: 0, percentage: 0 },
        { id: '2', severity: 'High', count: 0, percentage: 0 },
        { id: '3', severity: 'Suspicious', count: 0, percentage: 0 },
        { id: '4', severity: 'Info', count: 0, percentage: 0 }
    ],
    systemHealth: 98,
    peakAnomalyScore: 15,
    ingestRate: 1200
};

export const useThreatSimulation = () => {
    const [state, setState] = useState<ThreatSimulationState>(INITIAL_STATE);

    const generateData = useCallback(() => {
        setState(prev => {
            const time = new Date().toLocaleTimeString();
            const traffic = 1000 + Math.floor(Math.random() * 2000);
            const isAnomaly = Math.random() > 0.95;
            const threats = isAnomaly ? 5 + Math.floor(Math.random() * 15) : 0;
            const anomalyScore = isAnomaly ? 70 + Math.random() * 30 : 5 + Math.random() * 15;

            const newMetrics: MetricPoint = { time, threats, traffic, anomalyScore };

            let newAlerts = [...prev.activeAlerts];
            if (isAnomaly) {
                const newAlert: AlertMessage = {
                    id: Date.now(),
                    type: threats > 15 ? 'Critical' : 'High',
                    source: 'AI Engine',
                    desc: threats > 15 ? 'Massive DDoS Attack Detected' : 'Unauthorized Access Attempt',
                    time,
                    severity: anomalyScore
                };
                newAlerts = [newAlert, ...newAlerts].slice(0, 10);
            }

            // Update distribution
            const distribution: ThreatData[] = [
                { id: '1', severity: 'Critical', count: newAlerts.filter(a => a.type === 'Critical').length, percentage: 0 },
                { id: '2', severity: 'High', count: newAlerts.filter(a => a.type === 'High').length, percentage: 0 },
                { id: '3', severity: 'Suspicious', count: newAlerts.filter(a => a.type === 'Suspicious').length, percentage: 0 },
                { id: '4', severity: 'Info', count: newAlerts.filter(a => a.type === 'Info').length, percentage: 0 }
            ];

            const total = distribution.reduce((sum, item) => sum + item.count, 0) || 1;
            distribution.forEach(item => {
                item.percentage = (item.count / total) * 100;
            });

            return {
                ...prev,
                currentMetrics: newMetrics,
                activeAlerts: newAlerts,
                riskDistribution: distribution,
                systemHealth: Math.max(0, 100 - (newAlerts.length * 5)),
                peakAnomalyScore: Math.max(prev.peakAnomalyScore, anomalyScore),
                ingestRate: traffic
            };
        });
    }, []);

    useEffect(() => {
        const interval = setInterval(generateData, 3000);
        return () => clearInterval(interval);
    }, [generateData]);

    return state;
};
