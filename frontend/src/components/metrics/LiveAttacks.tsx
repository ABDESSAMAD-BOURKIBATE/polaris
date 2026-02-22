import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconCrosshair, IconTarget, IconFlame } from '@tabler/icons-react';

interface Attack {
    id: string;
    source: string;
    target: string;
    type: string;
    intensity: 'High' | 'Medium' | 'Low';
    timestamp: string;
}

const ATTACK_TYPES = ['SQL Injection', 'DDoS Sync', 'Brute Force', 'XSS Attempt', 'MITM Probe'];
const INTENSITIES: ('High' | 'Medium' | 'Low')[] = ['High', 'Medium', 'Low'];

export const LiveAttacks: React.FC = () => {
    const [attacks, setAttacks] = useState<Attack[]>([]);

    useEffect(() => {
        const generateAttack = () => {
            const newAttack: Attack = {
                id: Math.random().toString(36).substr(2, 9),
                source: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
                target: `Port ${[80, 443, 22, 3306, 5432][Math.floor(Math.random() * 5)]}`,
                type: ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)],
                intensity: INTENSITIES[Math.floor(Math.random() * INTENSITIES.length)],
                timestamp: new Date().toLocaleTimeString(),
            };

            setAttacks(prev => [newAttack, ...prev].slice(0, 6));
        };

        const interval = setInterval(generateAttack, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="glass-panel p-6 overflow-hidden relative">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <IconFlame className="text-orange-500 animate-pulse" size={24} stroke={1.5} />
                    Live Attack Interception
                </h2>
                <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest bg-cyan-500/10 px-2 py-1 rounded">Scanning Network...</span>
            </div>

            <div className="space-y-3 relative z-10">
                <AnimatePresence mode="popLayout">
                    {attacks.map((attack) => (
                        <motion.div
                            key={attack.id}
                            initial={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
                            transition={{ duration: 0.4 }}
                            className="group relative flex items-center justify-between p-3 rounded-lg bg-slate-900/40 border border-slate-700/30 hover:border-orange-500/50 transition-all cursor-default overflow-hidden"
                        >
                            {/* Scanline effect for each row */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-md ${attack.intensity === 'High' ? 'bg-red-500/20 text-red-500' :
                                        attack.intensity === 'Medium' ? 'bg-orange-500/20 text-orange-500' :
                                            'bg-yellow-500/20 text-yellow-500'
                                    }`}>
                                    <IconCrosshair size={16} />
                                </div>
                                <div>
                                    <div className="text-xs font-mono text-slate-400">{attack.source}</div>
                                    <div className="text-sm font-bold text-white">{attack.type}</div>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="text-[10px] font-mono text-cyan-400 group-hover:text-cyan-300 transition-colors uppercase flex items-center justify-end gap-1">
                                    <IconTarget size={10} />
                                    {attack.target}
                                </div>
                                <div className="text-[10px] text-slate-500 font-medium">{attack.timestamp}</div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {attacks.length === 0 && (
                <div className="h-64 flex flex-col items-center justify-center text-slate-500 italic text-sm">
                    <div className="w-12 h-12 border-2 border-slate-700 border-t-cyan-500 rounded-full animate-spin mb-4" />
                    Synchronizing with live feed...
                </div>
            )}
        </div>
    );
};
