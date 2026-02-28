import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, User, Shield, Bell, Palette, Check, RefreshCw, ChevronRight } from 'lucide-react';
import AccountSettings from './AccountSettings';
import SecuritySettings from './SecuritySettings';
import NotificationSettings from './NotificationSettings';
import PreferenceSettings from './PreferenceSettings';

const API = 'http://localhost:8000/api/settings';

const tabs = [
    { id: 'account', label: 'Account', desc: 'Profile & personal info', icon: User, color: '#0F766E' },
    { id: 'security', label: 'Security', desc: 'Authentication & sessions', icon: Shield, color: '#3B82F6' },
    { id: 'notifications', label: 'Notifications', desc: 'Alerts & email preferences', icon: Bell, color: '#F59E0B' },
    { id: 'preferences', label: 'Preferences', desc: 'Appearance & navigation', icon: Palette, color: '#8B5CF6' },
];

export default function SettingsLayout() {
    const [active, setActive] = useState('account');
    const [settings, setSettings] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch(API).then(r => r.json()).then(setSettings).catch(() => setSettings({
            profile: { name: 'Dr. Admin', email: 'admin@hospital.ai', role: 'Admin', session_timeout: 30, two_factor: false },
            alerts: { sound: true, visual: true, email: false, critical_only: false },
            appearance: { theme: 'light', compact_mode: false, sidebar_state: 'expanded', landing_page: '/' },
        }));
    }, []);

    const update = (section, key, value) => {
        setSettings(prev => ({ ...prev, [section]: { ...prev[section], [key]: value } }));
        setSaving(true);
        fetch(API + '/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ section, key, value }),
        }).finally(() => setTimeout(() => setSaving(false), 600));
    };

    if (!settings) return (
        <div className="flex items-center justify-center h-64">
            <RefreshCw className="animate-spin text-primary" size={20} />
        </div>
    );

    const renderTab = () => {
        const props = { settings, onUpdate: update };
        switch (active) {
            case 'account': return <AccountSettings {...props} />;
            case 'security': return <SecuritySettings {...props} />;
            case 'notifications': return <NotificationSettings {...props} />;
            case 'preferences': return <PreferenceSettings {...props} />;
            default: return null;
        }
    };

    const activeTab = tabs.find(t => t.id === active);

    return (
        <div>
            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-lg shadow-primary/20">
                        <Settings size={22} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary tracking-tight" style={{ fontFamily: 'var(--font-family-display)' }}>
                            Settings
                        </h1>
                        <p className="text-sm text-text-secondary mt-0.5">Manage your account, security, and preferences</p>
                    </div>
                </div>
            </motion.div>

            {/* Save indicator */}
            <AnimatePresence>
                {saving && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                        className="fixed top-6 right-6 z-50 px-5 py-2.5 rounded-2xl text-white text-xs font-bold shadow-xl flex items-center gap-2"
                        style={{
                            background: 'linear-gradient(135deg, #0F766E, #14B8A6)',
                            boxShadow: '0 8px 32px rgba(15, 118, 110, 0.3)',
                        }}
                    >
                        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                            <Check size={12} />
                        </div>
                        Changes saved
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Layout: Sidebar + Content */}
            <div className="flex gap-6" style={{ minHeight: 'calc(100vh - 200px)' }}>
                {/* Sidebar Navigation */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="w-64 flex-shrink-0"
                >
                    <div
                        className="rounded-2xl p-3 sticky top-6"
                        style={{
                            background: 'rgba(255, 255, 255, 0.7)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.8)',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.02)',
                        }}
                    >
                        <div className="space-y-1">
                            {tabs.map((tab, i) => {
                                const isActive = active === tab.id;
                                return (
                                    <motion.button
                                        key={tab.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.05 * i }}
                                        onClick={() => setActive(tab.id)}
                                        className="w-full text-left cursor-pointer group relative"
                                        style={{ outline: 'none' }}
                                    >
                                        <div
                                            className="flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200"
                                            style={{
                                                background: isActive
                                                    ? `linear-gradient(135deg, ${tab.color}10, ${tab.color}08)`
                                                    : 'transparent',
                                                border: isActive ? `1px solid ${tab.color}20` : '1px solid transparent',
                                            }}
                                        >
                                            {/* Active indicator bar */}
                                            {isActive && (
                                                <motion.div
                                                    layoutId="settings-sidebar-indicator"
                                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full"
                                                    style={{ backgroundColor: tab.color }}
                                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                                />
                                            )}
                                            <div
                                                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
                                                style={{
                                                    background: isActive ? `${tab.color}15` : 'rgba(0, 0, 0, 0.03)',
                                                    boxShadow: isActive ? `0 2px 8px ${tab.color}15` : 'none',
                                                }}
                                            >
                                                <tab.icon
                                                    size={16}
                                                    style={{ color: isActive ? tab.color : '#94A3B8' }}
                                                    className="transition-colors duration-200"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p
                                                    className="text-[13px] font-semibold transition-colors duration-200"
                                                    style={{ color: isActive ? tab.color : '#134E4A' }}
                                                >
                                                    {tab.label}
                                                </p>
                                                <p className="text-[10px] text-text-muted truncate leading-tight mt-0.5">
                                                    {tab.desc}
                                                </p>
                                            </div>
                                            <ChevronRight
                                                size={14}
                                                className="transition-all duration-200 flex-shrink-0"
                                                style={{
                                                    color: isActive ? tab.color : 'transparent',
                                                    transform: isActive ? 'translateX(0)' : 'translateX(-4px)',
                                                    opacity: isActive ? 1 : 0,
                                                }}
                                            />
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>

                        {/* Sidebar Footer */}
                        <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(0, 0, 0, 0.04)' }}>
                            <div className="px-3.5 py-2">
                                <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest">Zero Intercept</p>
                                <p className="text-[10px] text-text-muted mt-0.5">v2.4.0 · Enterprise</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Content Area */}
                <div className="flex-1 min-w-0">
                    {/* Content Header */}
                    <motion.div
                        key={active + '-header'}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 flex items-center gap-3"
                    >
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: `${activeTab.color}12` }}
                        >
                            <activeTab.icon size={16} style={{ color: activeTab.color }} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-text-primary" style={{ fontFamily: 'var(--font-family-display)' }}>
                                {activeTab.label}
                            </h2>
                            <p className="text-xs text-text-secondary">{activeTab.desc}</p>
                        </div>
                    </motion.div>

                    {/* Tab Content */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={active}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                        >
                            {renderTab()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
