import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Smartphone, Monitor, Globe, LogOut, Clock, ChevronRight, ShieldCheck, ShieldAlert, AlertCircle } from 'lucide-react';

function Toggle({ value, onChange, color = '#14B8A6' }) {
    return (
        <button
            onClick={() => onChange(!value)}
            className="relative w-11 h-[24px] rounded-full transition-colors duration-300 cursor-pointer"
            style={{ backgroundColor: value ? color : '#E2E8F0' }}
        >
            <motion.div
                animate={{ x: value ? 21 : 3 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white"
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}
            />
        </button>
    );
}

const SESSIONS = [
    { device: 'Chrome on Windows', icon: Monitor, location: 'Mumbai, IN', time: 'Active now', current: true },
    { device: 'Safari on iPhone', icon: Smartphone, location: 'Mumbai, IN', time: '2 hours ago', current: false },
    { device: 'Firefox on macOS', icon: Globe, location: 'Bangalore, IN', time: '3 days ago', current: false },
];

const ACTIVITY_LOG = [
    { text: 'Logged in from Chrome, Mumbai', time: '5 min ago', type: 'login' },
    { text: 'Logged in from Safari, Mumbai', time: '2 hours ago', type: 'login' },
    { text: 'Password changed', time: '3 days ago', type: 'security' },
    { text: 'Logged in from Firefox, Bangalore', time: '3 days ago', type: 'login' },
];

export default function SecuritySettings({ settings, onUpdate }) {
    const s = settings?.profile || {};
    const [showActivity, setShowActivity] = useState(false);

    return (
        <div className="space-y-6">
            {/* 2FA Card */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl overflow-hidden"
                style={{
                    background: 'rgba(255, 255, 255, 0.75)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.8)',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.02)',
                }}
            >
                <div className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div
                                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                                style={{
                                    background: s.two_factor
                                        ? 'linear-gradient(135deg, #0F766E10, #14B8A615)'
                                        : 'linear-gradient(135deg, #F59E0B08, #F59E0B12)',
                                    border: s.two_factor
                                        ? '1px solid rgba(15, 118, 110, 0.12)'
                                        : '1px solid rgba(245, 158, 11, 0.12)',
                                }}
                            >
                                {s.two_factor
                                    ? <ShieldCheck size={22} style={{ color: '#0F766E' }} />
                                    : <ShieldAlert size={22} style={{ color: '#F59E0B' }} />
                                }
                            </div>
                            <div>
                                <div className="flex items-center gap-2.5">
                                    <p className="text-sm font-bold text-text-primary">Two-Factor Authentication</p>
                                    <span
                                        className="text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider"
                                        style={{
                                            background: s.two_factor ? '#0F766E12' : '#F59E0B12',
                                            color: s.two_factor ? '#0F766E' : '#D97706',
                                        }}
                                    >
                                        {s.two_factor ? 'Enabled' : 'Disabled'}
                                    </span>
                                </div>
                                <p className="text-[11px] text-text-secondary mt-0.5">
                                    {s.two_factor
                                        ? 'Your account is protected with an extra layer of security'
                                        : 'Add an extra layer of security to protect your account'
                                    }
                                </p>
                            </div>
                        </div>
                        <Toggle
                            value={s.two_factor || false}
                            onChange={v => onUpdate('profile', 'two_factor', v)}
                            color="#0F766E"
                        />
                    </div>
                </div>
            </motion.div>

            {/* Active Sessions */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl p-6"
                style={{
                    background: 'rgba(255, 255, 255, 0.75)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.8)',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.02)',
                }}
            >
                <div className="flex items-center justify-between mb-5">
                    <h4 className="text-sm font-bold text-text-primary flex items-center gap-2.5">
                        <div className="w-1.5 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #3B82F6, #60A5FA)' }} />
                        Active Sessions
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-600">
                            {SESSIONS.length}
                        </span>
                    </h4>
                    <button
                        className="text-[11px] font-bold cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200"
                        style={{
                            background: 'rgba(239, 68, 68, 0.06)',
                            color: '#DC2626',
                            border: '1px solid rgba(239, 68, 68, 0.1)',
                        }}
                    >
                        <LogOut size={12} /> Revoke All
                    </button>
                </div>

                <div className="space-y-3">
                    {SESSIONS.map((sess, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 * i }}
                            className="flex items-center justify-between p-3.5 rounded-xl transition-all duration-200"
                            style={{
                                background: sess.current ? 'rgba(15, 118, 110, 0.04)' : 'rgba(0, 0, 0, 0.01)',
                                border: sess.current
                                    ? '1px solid rgba(15, 118, 110, 0.08)'
                                    : '1px solid rgba(0, 0, 0, 0.03)',
                            }}
                        >
                            <div className="flex items-center gap-3.5">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{
                                        background: sess.current
                                            ? 'linear-gradient(135deg, #0F766E10, #14B8A615)'
                                            : 'rgba(0, 0, 0, 0.03)',
                                    }}
                                >
                                    <sess.icon size={16} style={{ color: sess.current ? '#0F766E' : '#94A3B8' }} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-text-primary flex items-center gap-2">
                                        {sess.device}
                                        {sess.current && (
                                            <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-md bg-green-50 text-green-600"
                                                style={{ border: '1px solid rgba(34, 197, 94, 0.1)' }}
                                            >
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                                Current
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-[11px] text-text-secondary mt-0.5">{sess.location} · {sess.time}</p>
                                </div>
                            </div>
                            {!sess.current && (
                                <button
                                    className="text-[11px] font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-all duration-200"
                                    style={{
                                        background: 'rgba(239, 68, 68, 0.04)',
                                        color: '#94A3B8',
                                        border: '1px solid rgba(0, 0, 0, 0.04)',
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.color = '#DC2626';
                                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.06)';
                                        e.currentTarget.style.border = '1px solid rgba(239, 68, 68, 0.1)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.color = '#94A3B8';
                                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.04)';
                                        e.currentTarget.style.border = '1px solid rgba(0, 0, 0, 0.04)';
                                    }}
                                >
                                    Revoke
                                </button>
                            )}
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Security Log */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl p-6"
                style={{
                    background: 'rgba(255, 255, 255, 0.75)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.8)',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.02)',
                }}
            >
                <h4 className="text-sm font-bold text-text-primary flex items-center gap-2.5 mb-4">
                    <div className="w-1.5 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #F59E0B, #FBBF24)' }} />
                    Security Log
                </h4>

                <button
                    onClick={() => setShowActivity(!showActivity)}
                    className="w-full flex items-center justify-between py-3.5 px-4 rounded-xl cursor-pointer group transition-all duration-200"
                    style={{
                        background: showActivity ? 'rgba(245, 158, 11, 0.04)' : 'rgba(0, 0, 0, 0.01)',
                        border: showActivity ? '1px solid rgba(245, 158, 11, 0.08)' : '1px solid rgba(0, 0, 0, 0.03)',
                    }}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: 'rgba(245, 158, 11, 0.08)' }}
                        >
                            <Clock size={16} className="text-amber-500" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-semibold text-text-primary">Recent Activity</p>
                            <p className="text-[11px] text-text-secondary mt-0.5">View sign-in history and security events</p>
                        </div>
                    </div>
                    <motion.div animate={{ rotate: showActivity ? 90 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronRight size={16} className="text-text-muted" />
                    </motion.div>
                </button>

                <AnimatePresence>
                    {showActivity && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <div className="pt-4 pl-2">
                                {/* Timeline */}
                                <div className="relative">
                                    {/* Timeline line */}
                                    <div
                                        className="absolute left-[18px] top-2 bottom-2 w-[2px]"
                                        style={{ background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.2), transparent)' }}
                                    />
                                    <div className="space-y-4">
                                        {ACTIVITY_LOG.map((log, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -6 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.06 }}
                                                className="flex items-start gap-4 relative"
                                            >
                                                <div
                                                    className="w-[38px] h-[38px] rounded-lg flex items-center justify-center flex-shrink-0 relative z-10"
                                                    style={{
                                                        background: log.type === 'security'
                                                            ? 'rgba(239, 68, 68, 0.08)'
                                                            : 'rgba(15, 118, 110, 0.06)',
                                                        border: log.type === 'security'
                                                            ? '1px solid rgba(239, 68, 68, 0.1)'
                                                            : '1px solid rgba(15, 118, 110, 0.08)',
                                                    }}
                                                >
                                                    {log.type === 'security'
                                                        ? <AlertCircle size={14} style={{ color: '#DC2626' }} />
                                                        : <Monitor size={14} style={{ color: '#0F766E' }} />
                                                    }
                                                </div>
                                                <div className="pt-1.5 min-w-0">
                                                    <p className="text-[12px] font-medium text-text-primary">{log.text}</p>
                                                    <p className="text-[10px] text-text-muted mt-0.5">{log.time}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
