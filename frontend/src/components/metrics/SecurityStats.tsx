import React from 'react';
import { motion } from 'framer-motion';
import {
    IconShieldCheck,
    IconClock,
    IconPercentage,
    IconBinary,
    IconFingerprint
} from '@tabler/icons-react';

interface StatRowProps {
    label: string;
    value: string;
    icon: React.ElementType;
    color: string;
    delay: number;
}

const StatRow: React.FC<StatRowProps> = ({ label, value, icon: Icon, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        className="flex items-center justify-between p-3 rounded-lg bg-cyber-900/40 border border-slate-800/50"
    >
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-md ${color} bg-opacity-10`}>
                <Icon size={18} stroke={1.5} className={color} />
            </div>
            <span className="text-sm font-medium text-slate-400">{label}</span>
        </div>
        <span className="text-sm font-mono font-bold text-white tracking-wider">{value}</span>
    </motion.div>
);

export const SecurityStats: React.FC = () => {
    return (
        <div className="glass-panel p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <IconShieldCheck className="text-emerald-500" size={24} stroke={1.5} />
                    Infrastructure Health
                </h2>
                <div className="flex gap-1">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                    ))}
                </div>
            </div>

            <div className="space-y-4 flex-1">
                <StatRow
                    label="System Uptime"
                    value="99.998%"
                    icon={IconClock}
                    color="text-emerald-400"
                    delay={0.1}
                />
                <StatRow
                    label="Mitigation Rate"
                    value="94.2%"
                    icon={IconPercentage}
                    color="text-blue-400"
                    delay={0.2}
                />
                <StatRow
                    label="Protocol Integrity"
                    value="Verified"
                    icon={IconBinary}
                    color="text-purple-400"
                    delay={0.3}
                />
                <StatRow
                    label="Auth Sessions"
                    value="12 Active"
                    icon={IconFingerprint}
                    color="text-cyan-400"
                    delay={0.4}
                />
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">
                    <span>Security Layer v4.2</span>
                    <span className="text-emerald-500/80">Optimal</span>
                </div>
                <div className="mt-3 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '92%' }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-emerald-600 to-cyan-500 rounded-full"
                    />
                </div>
            </div>
        </div>
    );
};
