import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, User, Shield, Bell, Palette, Check, RefreshCw } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import AccountSettings from './AccountSettings';
import SecuritySettings from './SecuritySettings';
import NotificationSettings from './NotificationSettings';
import PreferenceSettings from './PreferenceSettings';

const API = 'http://localhost:8000/api/settings';

const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Palette },
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

    return (
        <div>
            <PageHeader title="Settings" subtitle="Manage your account and preferences" icon={Settings} />

            {/* Save indicator */}
            <AnimatePresence>
                {saving && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="fixed top-4 right-4 z-50 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold shadow-lg shadow-primary/20 flex items-center gap-2"
                    >
                        <Check size={14} /> Saved
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Tab bar */}
            <div className="flex gap-1 p-1 mb-6 rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.04]">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActive(tab.id)}
                        className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors
                            ${active === tab.id ? 'text-white' : 'text-text-secondary hover:bg-surface'}`}
                    >
                        {active === tab.id && (
                            <motion.div layoutId="settings-tab-bg" className="absolute inset-0 rounded-xl bg-primary shadow-md shadow-primary/15" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                        )}
                        <tab.icon size={14} className="relative z-10" />
                        <span className="relative z-10">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={active}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                >
                    {renderTab()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
