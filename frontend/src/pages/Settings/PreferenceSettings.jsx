import { motion } from 'framer-motion';
import { Sun, Moon, Monitor, Minimize2, Layout, Home } from 'lucide-react';

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

const themes = [
    { id: 'light', icon: Sun, label: 'Light' },
    { id: 'dark', icon: Moon, label: 'Dark' },
    { id: 'auto', icon: Monitor, label: 'Auto' },
];

const landingPages = [
    { value: '/', label: 'Dashboard' },
    { value: '/operations', label: 'Operations' },
    { value: '/strategy', label: 'Strategy' },
];

export default function PreferenceSettings({ settings, onUpdate }) {
    const s = settings?.appearance || {};

    return (
        <div className="max-w-2xl space-y-6">
            {/* Theme */}
            <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-black/[0.04]">
                <h4 className="text-sm font-bold text-text-primary flex items-center gap-2 mb-5">
                    <div className="w-1 h-4 rounded-full bg-primary" /> Appearance
                </h4>
                <div className="mb-5">
                    <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-3">Theme</p>
                    <div className="flex gap-2">
                        {themes.map(t => (
                            <button
                                key={t.id}
                                onClick={() => onUpdate('appearance', 'theme', t.id)}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200
                                    ${s.theme === t.id
                                        ? 'bg-primary text-white shadow-md shadow-primary/15'
                                        : 'bg-surface text-text-secondary hover:bg-gray-100 ring-1 ring-black/[0.04]'}`}
                            >
                                <t.icon size={14} /> {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Compact Mode */}
                <div className="flex items-center justify-between py-3.5 border-t border-black/[0.04]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                            <Minimize2 size={14} className="text-violet-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-text-primary">Compact Mode</p>
                            <p className="text-[11px] text-text-secondary">Reduce spacing for denser layouts</p>
                        </div>
                    </div>
                    <Toggle value={s.compact_mode || false} onChange={v => onUpdate('appearance', 'compact_mode', v)} color="#8B5CF6" />
                </div>
            </div>

            {/* Navigation Defaults */}
            <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-black/[0.04]">
                <h4 className="text-sm font-bold text-text-primary flex items-center gap-2 mb-5">
                    <div className="w-1 h-4 rounded-full bg-blue-500" /> Navigation
                </h4>

                {/* Sidebar State */}
                <div className="flex items-center justify-between py-3.5 border-b border-black/[0.04]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                            <Layout size={14} className="text-blue-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-text-primary">Sidebar Default</p>
                            <p className="text-[11px] text-text-secondary">Choose default sidebar behavior</p>
                        </div>
                    </div>
                    <select
                        value={s.sidebar_state || 'expanded'}
                        onChange={e => onUpdate('appearance', 'sidebar_state', e.target.value)}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg bg-surface ring-1 ring-black/[0.04] text-text-primary cursor-pointer focus:outline-none"
                    >
                        <option value="expanded">Expanded</option>
                        <option value="collapsed">Collapsed</option>
                    </select>
                </div>

                {/* Default Landing Page */}
                <div className="flex items-center justify-between py-3.5">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                            <Home size={14} className="text-amber-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-text-primary">Default Landing Page</p>
                            <p className="text-[11px] text-text-secondary">Page shown after login</p>
                        </div>
                    </div>
                    <select
                        value={s.landing_page || '/'}
                        onChange={e => onUpdate('appearance', 'landing_page', e.target.value)}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg bg-surface ring-1 ring-black/[0.04] text-text-primary cursor-pointer focus:outline-none"
                    >
                        {landingPages.map(p => (
                            <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}
