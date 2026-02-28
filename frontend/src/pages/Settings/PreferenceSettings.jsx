import { motion } from 'framer-motion';
import { Sun, Moon, Monitor, Minimize2, Layout, Home, Palette } from 'lucide-react';

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

const themes = [
    {
        id: 'light', icon: Sun, label: 'Light',
        preview: { bg: '#F0FDFA', sidebar: '#042F2E', card: '#FFFFFF', accent: '#0F766E' },
        desc: 'Clean, bright interface',
    },
    {
        id: 'dark', icon: Moon, label: 'Dark',
        preview: { bg: '#0F172A', sidebar: '#020617', card: '#1E293B', accent: '#14B8A6' },
        desc: 'Easy on the eyes',
    },
    {
        id: 'auto', icon: Monitor, label: 'System',
        preview: { bg: '#F0FDFA', sidebar: '#042F2E', card: '#FFFFFF', accent: '#0F766E' },
        desc: 'Match OS preference',
    },
];

const landingPages = [
    { value: '/', label: 'Dashboard' },
    { value: '/operations', label: 'Operations' },
    { value: '/strategy', label: 'Strategy' },
];

export default function PreferenceSettings({ settings, onUpdate }) {
    const s = settings?.appearance || {};

    return (
        <div className="space-y-6">
            {/* Theme Selection */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-6"
                style={{
                    background: 'rgba(255, 255, 255, 0.75)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.8)',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.02)',
                }}
            >
                <h4 className="text-sm font-bold text-text-primary flex items-center gap-2.5 mb-5">
                    <div className="w-1.5 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #8B5CF6, #A78BFA)' }} />
                    Appearance
                </h4>

                <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-3">
                    Theme
                </p>

                {/* Theme Cards */}
                <div className="grid grid-cols-3 gap-4">
                    {themes.map((t, i) => {
                        const isActive = s.theme === t.id;
                        return (
                            <motion.button
                                key={t.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 * i }}
                                onClick={() => onUpdate('appearance', 'theme', t.id)}
                                className="text-left cursor-pointer group relative rounded-2xl overflow-hidden transition-all duration-300"
                                style={{
                                    border: isActive
                                        ? '2px solid #8B5CF6'
                                        : '2px solid rgba(0, 0, 0, 0.04)',
                                    boxShadow: isActive
                                        ? '0 4px 20px rgba(139, 92, 246, 0.15)'
                                        : '0 1px 4px rgba(0, 0, 0, 0.03)',
                                    outline: 'none',
                                }}
                            >
                                {/* Mini Preview */}
                                <div
                                    className="h-24 p-3 relative"
                                    style={{ background: t.preview.bg }}
                                >
                                    {/* Mini sidebar */}
                                    <div
                                        className="absolute left-0 top-0 bottom-0 w-6 rounded-r-lg"
                                        style={{ background: t.preview.sidebar }}
                                    >
                                        <div className="mt-5 mx-1 space-y-1.5">
                                            <div className="w-4 h-1 rounded-full" style={{ background: t.preview.accent }} />
                                            <div className="w-4 h-1 rounded-full opacity-30" style={{ background: 'rgba(255,255,255,0.4)' }} />
                                            <div className="w-4 h-1 rounded-full opacity-30" style={{ background: 'rgba(255,255,255,0.4)' }} />
                                        </div>
                                    </div>
                                    {/* Mini content */}
                                    <div className="ml-8 space-y-2">
                                        <div className="flex gap-2">
                                            <div className="w-10 h-5 rounded" style={{ background: t.preview.card, boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }} />
                                            <div className="w-14 h-5 rounded" style={{ background: t.preview.card, boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }} />
                                        </div>
                                        <div className="w-full h-8 rounded" style={{ background: t.preview.card, boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }} />
                                    </div>

                                    {/* Active check */}
                                    {isActive && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                                            style={{
                                                background: '#8B5CF6',
                                                boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)',
                                            }}
                                        >
                                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Label */}
                                <div
                                    className="p-3 flex items-center gap-2.5"
                                    style={{
                                        background: isActive ? 'rgba(139, 92, 246, 0.04)' : 'rgba(255, 255, 255, 0.8)',
                                    }}
                                >
                                    <t.icon size={14} style={{ color: isActive ? '#8B5CF6' : '#94A3B8' }} />
                                    <div>
                                        <p
                                            className="text-xs font-bold"
                                            style={{ color: isActive ? '#8B5CF6' : '#134E4A' }}
                                        >
                                            {t.label}
                                        </p>
                                        <p className="text-[9px] text-text-muted">{t.desc}</p>
                                    </div>
                                </div>
                            </motion.button>
                        );
                    })}
                </div>

                {/* Compact Mode */}
                <div className="mt-5 pt-5" style={{ borderTop: '1px solid rgba(0, 0, 0, 0.04)' }}>
                    <div
                        className="flex items-center justify-between py-4 px-4 rounded-xl transition-all duration-200"
                        style={{
                            background: s.compact_mode ? 'rgba(139, 92, 246, 0.04)' : 'rgba(0, 0, 0, 0.01)',
                            border: s.compact_mode ? '1px solid rgba(139, 92, 246, 0.08)' : '1px solid rgba(0, 0, 0, 0.03)',
                        }}
                    >
                        <div className="flex items-center gap-3.5">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{ background: s.compact_mode ? 'rgba(139, 92, 246, 0.1)' : 'rgba(0, 0, 0, 0.03)' }}
                            >
                                <Minimize2 size={16} style={{ color: s.compact_mode ? '#8B5CF6' : '#94A3B8' }} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-text-primary">Compact Mode</p>
                                <p className="text-[11px] text-text-secondary mt-0.5">Reduce spacing for denser information layouts</p>
                            </div>
                        </div>
                        <Toggle value={s.compact_mode || false} onChange={v => onUpdate('appearance', 'compact_mode', v)} color="#8B5CF6" />
                    </div>
                </div>
            </motion.div>

            {/* Navigation Defaults */}
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
                <h4 className="text-sm font-bold text-text-primary flex items-center gap-2.5 mb-5">
                    <div className="w-1.5 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #3B82F6, #60A5FA)' }} />
                    Navigation
                </h4>

                <div className="space-y-3">
                    {/* Sidebar State */}
                    <div
                        className="flex items-center justify-between py-4 px-4 rounded-xl transition-all duration-200"
                        style={{
                            background: 'rgba(59, 130, 246, 0.03)',
                            border: '1px solid rgba(59, 130, 246, 0.06)',
                        }}
                    >
                        <div className="flex items-center gap-3.5">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{ background: 'rgba(59, 130, 246, 0.08)' }}
                            >
                                <Layout size={16} className="text-blue-500" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-text-primary">Sidebar Default</p>
                                <p className="text-[11px] text-text-secondary mt-0.5">Choose default sidebar behavior on login</p>
                            </div>
                        </div>
                        <select
                            value={s.sidebar_state || 'expanded'}
                            onChange={e => onUpdate('appearance', 'sidebar_state', e.target.value)}
                            className="text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer focus:outline-none transition-all duration-200"
                            style={{
                                background: 'rgba(59, 130, 246, 0.06)',
                                color: '#3B82F6',
                                border: '1px solid rgba(59, 130, 246, 0.1)',
                            }}
                        >
                            <option value="expanded">Expanded</option>
                            <option value="collapsed">Collapsed</option>
                        </select>
                    </div>

                    {/* Default Landing Page */}
                    <div
                        className="flex items-center justify-between py-4 px-4 rounded-xl transition-all duration-200"
                        style={{
                            background: 'rgba(245, 158, 11, 0.03)',
                            border: '1px solid rgba(245, 158, 11, 0.06)',
                        }}
                    >
                        <div className="flex items-center gap-3.5">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{ background: 'rgba(245, 158, 11, 0.08)' }}
                            >
                                <Home size={16} className="text-amber-500" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-text-primary">Default Landing Page</p>
                                <p className="text-[11px] text-text-secondary mt-0.5">Page shown immediately after login</p>
                            </div>
                        </div>
                        <select
                            value={s.landing_page || '/'}
                            onChange={e => onUpdate('appearance', 'landing_page', e.target.value)}
                            className="text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer focus:outline-none transition-all duration-200"
                            style={{
                                background: 'rgba(245, 158, 11, 0.06)',
                                color: '#D97706',
                                border: '1px solid rgba(245, 158, 11, 0.1)',
                            }}
                        >
                            {landingPages.map(p => (
                                <option key={p.value} value={p.value}>{p.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
