import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Smartphone, Monitor, Globe, LogOut, Clock, ChevronRight } from 'lucide-react';

function Toggle({ value, onChange, color = '#14B8A6' }) {
    return (
        <button
            onClick={() => onChange(!value)}
            className={`relative w-10 h-[22px] rounded-full transition-colors duration-300 cursor-pointer ${value ? '' : 'bg-gray-200'}`}
            style={value ? { backgroundColor: color } : {}}
        >
            <motion.div
                animate={{ x: value ? 19 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm"
            />
        </button>
    );
}

const SESSIONS = [
    { device: 'Chrome on Windows', icon: Monitor, location: 'Mumbai, IN', time: 'Active now', current: true },
    { device: 'Safari on iPhone', icon: Smartphone, location: 'Mumbai, IN', time: '2 hours ago', current: false },
    { device: 'Firefox on macOS', icon: Globe, location: 'Bangalore, IN', time: '3 days ago', current: false },
];

export default function SecuritySettings({ settings, onUpdate }) {
    const s = settings?.profile || {};
    const [showActivity, setShowActivity] = useState(false);

    return (
        <div className="max-w-2xl space-y-6">
            {/* 2FA */}
            <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-black/[0.04]">
                <h4 className="text-sm font-bold text-text-primary flex items-center gap-2 mb-4">
                    <div className="w-1 h-4 rounded-full bg-primary" /> Authentication
                </h4>
                <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                        <Shield size={16} className="text-primary" />
                        <div>
                            <p className="text-sm font-medium text-text-primary">Two-Factor Authentication</p>
                            <p className="text-[11px] text-text-secondary">Add an extra layer of security to your account</p>
                        </div>
                    </div>
                    <Toggle value={s.two_factor || false} onChange={v => onUpdate('profile', 'two_factor', v)} />
                </div>
            </div>

            {/* Active Sessions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-black/[0.04]">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
                        <div className="w-1 h-4 rounded-full bg-blue-500" /> Active Sessions
                    </h4>
                    <button className="text-[11px] font-semibold text-red-500 hover:text-red-600 cursor-pointer flex items-center gap-1 transition-colors">
                        <LogOut size={12} /> Logout All
                    </button>
                </div>
                <div className="space-y-1">
                    {SESSIONS.map((sess, i) => (
                        <div key={i} className={`flex items-center justify-between py-3 ${i < SESSIONS.length - 1 ? 'border-b border-black/[0.04]' : ''}`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${sess.current ? 'bg-primary/10' : 'bg-surface'}`}>
                                    <sess.icon size={14} className={sess.current ? 'text-primary' : 'text-text-muted'} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-text-primary flex items-center gap-2">
                                        {sess.device}
                                        {sess.current && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-green-100 text-green-700">This device</span>}
                                    </p>
                                    <p className="text-[11px] text-text-secondary">{sess.location} · {sess.time}</p>
                                </div>
                            </div>
                            {!sess.current && (
                                <button className="text-[11px] font-semibold text-text-secondary hover:text-red-500 cursor-pointer transition-colors">
                                    Revoke
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Login Activity */}
            <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-black/[0.04]">
                <h4 className="text-sm font-bold text-text-primary flex items-center gap-2 mb-4">
                    <div className="w-1 h-4 rounded-full bg-amber-500" /> Security Log
                </h4>
                <button
                    onClick={() => setShowActivity(!showActivity)}
                    className="w-full flex items-center justify-between py-3 cursor-pointer group"
                >
                    <div className="flex items-center gap-3">
                        <Clock size={16} className="text-amber-500" />
                        <div className="text-left">
                            <p className="text-sm font-medium text-text-primary">Login Activity</p>
                            <p className="text-[11px] text-text-secondary">View recent sign-in history</p>
                        </div>
                    </div>
                    <motion.div animate={{ rotate: showActivity ? 90 : 0 }}>
                        <ChevronRight size={14} className="text-text-muted" />
                    </motion.div>
                </button>
                <AnimatePresence>
                    {showActivity && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                        >
                            <div className="pt-2 space-y-2">
                                {['Logged in from Chrome, Mumbai — 5 min ago',
                                    'Logged in from Safari, Mumbai — 2 hours ago',
                                    'Password changed — 3 days ago',
                                    'Logged in from Firefox, Bangalore — 3 days ago',
                                ].map((log, i) => (
                                    <div key={i} className="text-[11px] text-text-secondary py-1.5 px-3 rounded-lg bg-surface">
                                        {log}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
