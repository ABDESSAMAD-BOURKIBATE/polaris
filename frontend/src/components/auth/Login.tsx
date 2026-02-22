import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconUser, IconKey } from '@tabler/icons-react';
import { toast } from 'react-hot-toast';

interface LoginProps {
    onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isHovering, setIsHovering] = useState(false);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [loadingText, setLoadingText] = useState('Initializing Sequence...');

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            init();
        };

        window.addEventListener('resize', resize);

        class Particle {
            x: number;
            y: number;
            vx: number;
            vy: number;
            radius: number;
            color: string;

            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.4; // Slower, smoother movement
                this.vy = (Math.random() - 0.5) * 0.4;
                this.radius = Math.random() * 1.5 + 0.5; // Smaller, more elegant nodes
                const colors = ['#0ea5e9', '#38bdf8', '#818cf8', '#1e3a8a', '#1e293b']; // Added darker nodes for depth
                this.color = colors[Math.floor(Math.random() * colors.length)];
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;
            }

            draw() {
                if (!ctx) return;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.color;

                ctx.shadowBlur = 10;
                ctx.shadowColor = this.color;

                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }

        let particles: Particle[] = [];
        const init = () => {
            particles = [];
            const numberOfParticles = Math.floor((width * height) / 10000); // Slightly less dense for a cleaner look
            for (let i = 0; i < numberOfParticles; i++) {
                particles.push(new Particle());
            }
        };

        const mouse = { x: null as number | null, y: null as number | null };
        const handleMouseMove = (event: MouseEvent) => {
            mouse.x = event.clientX;
            mouse.y = event.clientY;
        };
        const handleMouseOut = () => {
            mouse.x = null;
            mouse.y = null;
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseout', handleMouseOut);

        const connect = () => {
            if (!ctx) return;
            for (let a = 0; a < particles.length; a++) {
                for (let b = a; b < particles.length; b++) {
                    const dx = particles[a].x - particles[b].x;
                    const dy = particles[a].y - particles[b].y;
                    const distance = (dx * dx) + (dy * dy);

                    if (distance < 12000) {
                        const opacityValue = 1 - (distance / 12000);
                        ctx.strokeStyle = `rgba(56, 189, 248, ${opacityValue * 0.3})`; // More subtle lines
                        ctx.lineWidth = 0.8;
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }
            }
        };

        let animationFrameId: number;

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            if (!ctx) return;

            // Clear with slight trailing effect for smooth dynamic feel
            ctx.fillStyle = 'rgba(2, 6, 23, 1)'; // Deepest slate/navy
            ctx.fillRect(0, 0, width, height);

            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();

                if (mouse.x !== null && mouse.y !== null) {
                    const dx = mouse.x - particles[i].x;
                    const dy = mouse.y - particles[i].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 150) {
                        ctx.strokeStyle = `rgba(129, 140, 248, ${1 - distance / 150})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.stroke();
                    }
                }
            }
            connect();
        };

        init();
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseout', handleMouseOut);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('polaris_token');
        if (token) {
            onLogin();
        }
    }, [onLogin]);

    useEffect(() => {
        if (!isAuthenticating || loadingProgress >= 100) return;

        const messages = [
            'Accessing Core Systems...',
            'Bypassing Neural Firewall...',
            'Decrypting Clearance Keys...',
            'Validating Biometric Data...',
            'Synchronizing with Polaris...',
            'Establishing Secure Uplink...',
            'Finalizing Authentication...'
        ];

        let currentStep = 0;
        const interval = setInterval(() => {
            setLoadingProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    onLogin();
                    return 100;
                }

                const step = Math.floor((prev / 100) * messages.length);
                if (step > currentStep && step < messages.length) {
                    currentStep = step;
                    setLoadingText(messages[currentStep]);
                }

                return prev + 1;
            });
        }, 80); // Slightly faster for responsiveness

        return () => clearInterval(interval);
    }, [isAuthenticating, onLogin, loadingProgress]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (username && password) {
            try {
                const response = await fetch('http://127.0.0.1:8000/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem('polaris_token', data.access_token);
                    localStorage.setItem('polaris_user', username);
                    toast.success('Access Granted. Initializing...', {
                        style: {
                            background: '#020617',
                            color: '#38bdf8',
                            border: '1px solid #0f172a',
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            fontFamily: 'monospace'
                        },
                        iconTheme: {
                            primary: '#38bdf8',
                            secondary: '#020617',
                        },
                    });
                    setIsAuthenticating(true);
                } else {
                    const errorData = await response.json();
                    toast.error(errorData.detail || 'Authentication failed', {
                        style: {
                            background: '#020617',
                            color: '#ef4444',
                            border: '1px solid #0f172a',
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            fontFamily: 'monospace'
                        },
                    });
                }
            } catch (error) {
                console.error('Login error:', error);
                toast.error('Connection to core systems failed.', {
                    style: {
                        background: '#020617',
                        color: '#ef4444',
                        border: '1px solid #0f172a',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        fontFamily: 'monospace'
                    },
                });
            }
        }
    };

    return (
        <div className="relative w-full h-screen overflow-hidden bg-slate-950 text-slate-200 font-sans" dir="rtl">
            {/* Cyber Canvas Background */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 z-0"
            />

            {/* Elegant Radial Gradient Overlay to focus center */}
            <div
                className="absolute inset-0 pointer-events-none z-10"
                style={{
                    background: 'radial-gradient(circle at center, transparent 0%, rgba(3, 11, 23, 0.98) 100%)'
                }}
            />

            {/* Loading Overlay */}
            <AnimatePresence>
                {isAuthenticating && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#020610]/98 backdrop-blur-3xl"
                    >
                        <div className="w-full max-w-md px-10 text-center">
                            <motion.div
                                animate={{
                                    scale: [1, 1.02, 1],
                                    opacity: [0.8, 1, 0.8]
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="mb-12 relative flex justify-center"
                            >
                                <div className="absolute inset-0 bg-[#38bdf8]/10 blur-3xl rounded-full scale-150" />
                                <div className="relative">
                                    <svg width="60" height="68" viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#38bdf8] drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]">
                                        <path d="M11.9998 1.95L21 6V13.82C21 19.33 17.15 24.51 11.9998 26C6.84984 24.51 2.99984 19.33 2.99984 13.82V6L11.9998 1.95ZM11.9998 0L1.49984 4.66V13.82C1.49984 20.26 5.96984 26.24 11.9998 28C18.0298 26.24 22.4998 20.26 22.4998 13.82V4.66L11.9998 0Z" fill="currentColor" opacity="0.8" />
                                        <path d="M12 9C10.9 9 10 9.9 10 11.02C10 11.83 10.49 12.52 11.22 12.86V16H12.78V12.86C13.51 12.52 14 11.02 14 11.02C14 9.9 13.1 9 12 9Z" fill="currentColor" />
                                    </svg>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                        className="absolute -inset-4 border-t border-r border-[#38bdf8]/30 rounded-full"
                                    />
                                </div>
                            </motion.div>

                            <h2 className="text-white text-xl font-bold tracking-[0.3em] uppercase mb-2">System Access</h2>
                            <p className="text-[#38bdf8] font-mono text-[0.65rem] tracking-[0.2em] mb-10 h-4">{loadingText}</p>

                            {/* Progress Bar Container */}
                            <div className="relative w-full h-[6px] bg-[#0f1f33] rounded-full overflow-hidden mb-4 shadow-inner">
                                <motion.div
                                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#0ea5e9] via-[#38bdf8] to-white shadow-[0_0_15px_rgba(56,189,248,0.8)]"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${loadingProgress}%` }}
                                    transition={{ duration: 0.1 }}
                                />
                                {/* Scanning light on progress bar */}
                                <motion.div
                                    className="absolute inset-y-0 w-20 bg-white/20 blur-md"
                                    animate={{ left: ['-20%', '120%'] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                />
                            </div>

                            <div className="flex justify-between items-center text-[0.6rem] font-mono text-[#4a6b8c] tracking-widest">
                                <span className="flex items-center gap-1">
                                    <span className="w-1 h-1 rounded-full bg-cyan-500 animate-pulse" />
                                    ENCRYPTED UPLINK
                                </span>
                                <span>{loadingProgress}%</span>
                            </div>

                            {/* Terminal output simulation */}
                            <div className="mt-12 text-left opacity-30 select-none pointer-events-none">
                                <div className="text-[0.5rem] font-mono text-slate-500 space-y-1">
                                    <div>&gt; SECURE_BOOT_SEQUENCE_ALPHA_4</div>
                                    <div>&gt; KERNEL_INTEGRITY_CHECK: PASSED</div>
                                    <div>&gt; RSA_4096_HANDSHAKE: [OK]</div>
                                    <div>&gt; BYPASSING_SUB_LAYER_2...</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Login Container */}
            <div className="relative z-30 flex items-center justify-center w-full h-full">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative w-full h-full md:h-auto md:max-w-[850px] flex flex-col justify-center px-4"
                >
                    {/* Premium Glassmorphism Card - Landscape Layout */}
                    <div
                        className="relative bg-[#020610]/95 backdrop-blur-2xl border-x md:border border-[#0c1a2e] shadow-[0_0_80px_0_rgba(0,15,35,0.9)] md:rounded-2xl h-full md:h-auto w-full flex flex-col md:flex-row overflow-hidden shadow-2xl"
                        onMouseEnter={() => setIsHovering(true)}
                        onMouseLeave={() => setIsHovering(false)}
                    >
                        {/* Top scanning line effect */}
                        <motion.div
                            className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent z-20"
                            animate={{
                                x: isHovering ? ['-100%', '100%'] : '0%',
                                opacity: isHovering ? [0, 1, 0] : 0
                            }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />

                        {/* Left Section: Branding */}
                        <div className="md:w-[45%] p-8 md:p-12 flex flex-col items-center justify-center relative border-b md:border-b-0 md:border-r border-[#0c1a2e] bg-[#030914]/40">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="mb-6 relative"
                            >
                                <div className="absolute inset-0 bg-[#38bdf8]/10 blur-2xl rounded-full" />
                                <svg width="60" height="68" viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#38bdf8] drop-shadow-[0_0_12px_rgba(56,189,248,0.4)] relative z-10">
                                    <path d="M11.9998 1.95L21 6V13.82C21 19.33 17.15 24.51 11.9998 26C6.84984 24.51 2.99984 19.33 2.99984 13.82V6L11.9998 1.95ZM11.9998 0L1.49984 4.66V13.82C1.49984 20.26 5.96984 26.24 11.9998 28C18.0298 26.24 22.4998 20.26 22.4998 13.82V4.66L11.9998 0Z" fill="currentColor" opacity="0.8" />
                                    <path d="M12 9C10.9 9 10 9.9 10 11.02C10 11.83 10.49 12.52 11.22 12.86V16H12.78V12.86C13.51 12.52 14 11.02 14 11.02C14 9.9 13.1 9 12 9Z" fill="currentColor" />
                                </svg>
                            </motion.div>
                            <h1 className="text-[2.2rem] font-bold text-white tracking-[0.2em] mb-3 drop-shadow-lg">
                                POLARIS
                            </h1>
                            <div className="h-[1px] w-16 bg-[#1a4a6b] mb-4"></div>
                            <p className="text-[#6c859c] text-[0.65rem] tracking-[0.3em] uppercase font-mono text-center">
                                Autonomous <br className="hidden md:block" /> Intelligence
                            </p>
                        </div>

                        {/* Right Section: Form */}
                        <div className="md:w-[55%] p-8 md:p-12 flex flex-col justify-center bg-transparent">
                            <form onSubmit={handleSubmit} className="space-y-6 relative z-10 w-full" dir="ltr">
                                <div className="space-y-2 text-left w-full">
                                    <label className="text-[0.6rem] font-bold text-[#00a3cc] tracking-[0.15em] uppercase ml-1 block">SYSTEM ADMINISTRATOR</label>
                                    <div className="relative group w-full">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <IconUser className="w-[18px] h-[18px] text-[#4a6b8c] group-focus-within:text-[#38bdf8] transition-colors" stroke={1.5} />
                                        </div>
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="w-full bg-[#030914]/50 border border-[#0f1f33] rounded-[10px] py-[15px] pl-12 pr-4 text-[#8baccf] placeholder-[#2a4059] text-sm focus:outline-none focus:border-[#38bdf8]/50 focus:bg-[#030914] transition-all font-mono shadow-inner"
                                            placeholder="admin_sys"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 text-left w-full">
                                    <label className="text-[0.6rem] font-bold text-[#00a3cc] tracking-[0.15em] uppercase ml-1 block">CYBER CLEARANCE CODE</label>
                                    <div className="relative group w-full">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <IconKey className="w-[18px] h-[18px] text-[#4a6b8c] group-focus-within:text-[#38bdf8] transition-colors" stroke={1.5} />
                                        </div>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-[#030914]/50 border border-[#0f1f33] rounded-[10px] py-[15px] pl-12 pr-4 text-[#8baccf] placeholder-[#2a4059] text-sm focus:outline-none focus:border-[#38bdf8]/50 focus:bg-[#030914] transition-all font-mono tracking-[0.3em] shadow-inner"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 w-full">
                                    <motion.button
                                        whileHover={{ scale: 1.01, boxShadow: '0 0 20px rgba(56, 189, 248, 0.15)' }}
                                        whileTap={{ scale: 0.99 }}
                                        type="submit"
                                        className="w-full relative overflow-hidden bg-transparent border border-[#0d3f66] hover:bg-[#002f54]/40 hover:border-[#38bdf8]/50 text-white rounded-[10px] py-[15px] text-[0.75rem] font-bold tracking-widest uppercase transition-all flex items-center justify-center backdrop-blur-sm shadow-[0_4px_20px_rgba(0,47,84,0.3)]"
                                    >
                                        <span className="drop-shadow-md">AUTHENTICATE & INITIALIZE</span>
                                    </motion.button>
                                </div>
                            </form>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
