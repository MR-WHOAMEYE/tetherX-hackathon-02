import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Activity, ClipboardList, Brain, Microscope,
    Target, FileText, Settings
} from 'lucide-react';

const navItems = [
    { path: '/', icon: Activity, label: 'Dashboard', color: '#14B8A6' },
    { path: '/operations', icon: ClipboardList, label: 'Operations', color: '#0EA5E9' },
    { path: '/intelligence', icon: Brain, label: 'Intelligence', color: '#A78BFA' },
    { path: '/simulation', icon: Microscope, label: 'Simulation', color: '#F59E0B' },
    { path: '/strategy', icon: Target, label: 'Strategy', color: '#EC4899' },
    { path: '/reports', icon: FileText, label: 'Reports', color: '#10B981' },
    { path: '/settings', icon: Settings, label: 'Settings', color: '#6B7280' },
];

export default function Sidebar() {
    const location = useLocation();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-[100] px-4 pb-4 pointer-events-none">
            <motion.div
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="pointer-events-auto mx-auto max-w-3xl rounded-3xl px-2 py-2
                    flex items-center justify-between relative overflow-hidden"
                style={{
                    background: 'linear-gradient(135deg, rgba(4,47,46,0.92) 0%, rgba(10,61,60,0.95) 50%, rgba(13,79,77,0.92) 100%)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.06)',
                }}
            >
                {/* Subtle top shine */}
                <div className="absolute top-0 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />

                {navItems.map((item) => {
                    const isActive = item.path === '/'
                        ? location.pathname === '/'
                        : location.pathname.startsWith(item.path);

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/'}
                            className="relative flex flex-col items-center justify-center flex-1 py-2 cursor-pointer group"
                        >
                            {/* Active background glow */}
                            {isActive && (
                                <motion.div
                                    layoutId="nav-pill"
                                    className="absolute inset-0.5 rounded-2xl"
                                    style={{
                                        background: `radial-gradient(ellipse at center, ${item.color}15 0%, transparent 70%)`,
                                        boxShadow: `inset 0 0 20px ${item.color}08`,
                                    }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                                />
                            )}

                            {/* Active top dot */}
                            {isActive && (
                                <motion.div
                                    layoutId="nav-dot"
                                    className="absolute -top-0.5 w-6 h-[3px] rounded-full"
                                    style={{
                                        background: `linear-gradient(90deg, transparent, ${item.color}, transparent)`,
                                        boxShadow: `0 0 8px ${item.color}60`,
                                    }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                                />
                            )}

                            {/* Icon */}
                            <motion.div
                                animate={isActive ? { y: -2, scale: 1.15 } : { y: 0, scale: 1 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                            >
                                <item.icon
                                    size={21}
                                    className="relative z-10 transition-colors duration-300"
                                    style={{ color: isActive ? item.color : 'rgba(255,255,255,0.3)' }}
                                />
                            </motion.div>

                            {/* Label */}
                            <motion.span
                                animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.35, y: 0 }}
                                transition={{ duration: 0.25 }}
                                className="relative z-10 text-[9px] mt-1 font-semibold tracking-tight"
                                style={{ color: isActive ? item.color : 'rgba(255,255,255,0.25)' }}
                            >
                                {item.label}
                            </motion.span>

                            {/* Hover glow (non-active only) */}
                            {!isActive && (
                                <div className="absolute inset-1 rounded-2xl bg-white/0 group-hover:bg-white/5 transition-colors duration-200" />
                            )}
                        </NavLink>
                    );
                })}
            </motion.div>
        </nav>
    );
}
