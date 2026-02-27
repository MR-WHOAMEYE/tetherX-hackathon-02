import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings, User, Radio, Bell, Brain, Database, Palette,
    Shield, Cpu, Lock, Mail, Eye, Volume2, Clock, Gauge,
    Zap, Upload, Download, RotateCcw, Key, Server, Wifi,
    HardDrive, Activity, RefreshCw, ChevronRight, Check,
    AlertTriangle, FileText, History, Sun, Moon, Monitor
} from 'lucide-react';
import PageHeader from '../components/PageHeader';

const API = 'http://localhost:8000/api/settings';

const tabs = [
    { id: 'profile', label: 'Profile & Access', icon: User },
    { id: 'realtime', label: 'Real-Time Config', icon: Radio },
    { id: 'alerts', label: 'Alert Config', icon: Bell },
    { id: 'ai', label: 'AI & Models', icon: Brain },
    { id: 'data', label: 'Data Management', icon: Database },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'security', label: 'Security & Logs', icon: Shield },
    { id: 'diagnostics', label: 'System Diagnostics', icon: Cpu },
];

/* ── Reusable Controls ── */
function Toggle({ label, desc, icon: Icon, value, onChange, color = '#14B8A6' }) {
    return (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface hover:bg-surface/80 transition-colors group">
            <div className="flex items-center gap-3">
                {Icon && <Icon size={18} style={{ color }} className="flex-shrink-0" />}
                <div>
                    <p className="text-sm font-medium text-text-primary">{label}</p>
                    {desc && <p className="text-[11px] text-text-secondary mt-0.5">{desc}</p>}
                </div>
            </div>
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
        </div>
    );
}

function Slider({ label, desc, icon: Icon, value, onChange, min = 0, max = 100, unit = '', color = '#14B8A6' }) {
    return (
        <div className="p-3.5 rounded-xl bg-surface">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    {Icon && <Icon size={18} style={{ color }} className="flex-shrink-0" />}
                    <div>
                        <p className="text-sm font-medium text-text-primary">{label}</p>
                        {desc && <p className="text-[11px] text-text-secondary mt-0.5">{desc}</p>}
                    </div>
                </div>
                <span className="text-sm font-bold min-w-[48px] text-right" style={{ color }}>{value}{unit}</span>
            </div>
            <input
                type="range" min={min} max={max} value={value}
                onChange={e => onChange(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{
                    background: `linear-gradient(to right, ${color} 0%, ${color} ${((value - min) / (max - min)) * 100}%, #e5e7eb ${((value - min) / (max - min)) * 100}%, #e5e7eb 100%)`,
                }}
            />
        </div>
    );
}

function Dropdown({ label, desc, icon: Icon, value, onChange, options, color = '#14B8A6' }) {
    return (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface">
            <div className="flex items-center gap-3">
                {Icon && <Icon size={18} style={{ color }} className="flex-shrink-0" />}
                <div>
                    <p className="text-sm font-medium text-text-primary">{label}</p>
                    {desc && <p className="text-[11px] text-text-secondary mt-0.5">{desc}</p>}
                </div>
            </div>
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-text-primary cursor-pointer focus:outline-none"
                style={{ borderColor: color + '40' }}
            >
                {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
        </div>
    );
}

function ActionButton({ label, desc, icon: Icon, onClick, variant = 'default', color = '#14B8A6' }) {
    const [done, setDone] = useState(false);
    const handleClick = () => {
        onClick?.();
        setDone(true);
        setTimeout(() => setDone(false), 2000);
    };
    const danger = variant === 'danger';
    return (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface">
            <div className="flex items-center gap-3">
                {Icon && <Icon size={18} style={{ color: danger ? '#EF4444' : color }} className="flex-shrink-0" />}
                <div>
                    <p className="text-sm font-medium text-text-primary">{label}</p>
                    {desc && <p className="text-[11px] text-text-secondary mt-0.5">{desc}</p>}
                </div>
            </div>
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleClick}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${danger
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'text-white hover:opacity-90'
                    }`}
                style={!danger ? { backgroundColor: color } : {}}
            >
                {done ? <Check size={14} /> : label.split(' ').pop()}
            </motion.button>
        </div>
    );
}

function StatusCard({ label, value, status, icon: Icon, color }) {
    const isGood = ['Online', 'Connected', 'Active'].includes(status);
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-surface flex flex-col gap-2"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Icon size={16} style={{ color }} />
                    <span className="text-xs font-medium text-text-secondary">{label}</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isGood ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {status}
                </span>
            </div>
            <p className="text-lg font-bold text-text-primary">{value}</p>
        </motion.div>
    );
}

function SectionCard({ title, children }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-black/[0.04]"
        >
            <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
                <div className="w-1 h-4 rounded-full bg-primary" />
                {title}
            </h3>
            <div className="space-y-2">{children}</div>
        </motion.div>
    );
}

/* ── Main Settings Page ── */
export default function SettingsPage() {
    const [active, setActive] = useState('profile');
    const [settings, setSettings] = useState(null);
    const [diagnostics, setDiagnostics] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch(API).then(r => r.json()).then(setSettings).catch(() => setSettings({
            profile: { name: 'Dr. Admin', email: 'admin@hospital.ai', role: 'Admin', session_timeout: 30, two_factor: false },
            realtime: { enabled: true, refresh_interval: 10, sla_threshold: 80, burnout_threshold: 60, surge_sensitivity: 70, simulation_enabled: true, ai_enabled: true },
            alerts: { sound: true, visual: true, email: false, severity_filter: 'all', critical_only: false },
            ai_model: { forecast_model: 'ARIMA', confidence_threshold: 85, optimization_mode: 'Balanced', explainable_ai: true },
            appearance: { theme: 'light', compact_mode: false, animation_speed: 100, accent_color: '#14B8A6' },
            security: { ip_restriction: false, api_key: 'hip-2026-xxxx-xxxx-abcd' },
        }));
    }, []);

    useEffect(() => {
        if (active === 'diagnostics') {
            const load = () => fetch(API + '/diagnostics').then(r => r.json()).then(setDiagnostics).catch(() => { });
            load();
            const i = setInterval(load, 5000);
            return () => clearInterval(i);
        }
    }, [active]);

    const update = (section, key, value) => {
        setSettings(prev => ({ ...prev, [section]: { ...prev[section], [key]: value } }));
        setSaving(true);
        fetch(API + '/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ section, key, value }),
        }).finally(() => setTimeout(() => setSaving(false), 600));
    };

    if (!settings) return <div className="flex items-center justify-center h-64"><RefreshCw className="animate-spin text-primary" /></div>;

    const s = settings;

    const renderContent = () => {
        switch (active) {
            case 'profile': return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <SectionCard title="User Profile">
                        <div className="p-3.5 rounded-xl bg-surface">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-primary/20">
                                    {s.profile.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-text-primary">{s.profile.name}</p>
                                    <p className="text-xs text-text-secondary">{s.profile.email}</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {[{ l: 'Name', v: s.profile.name }, { l: 'Email', v: s.profile.email }].map(f => (
                                    <div key={f.l}>
                                        <label className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">{f.l}</label>
                                        <input value={f.v} readOnly className="w-full mt-1 px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm text-text-primary" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </SectionCard>
                    <SectionCard title="Access Control">
                        <Dropdown label="Role" desc="Current access level" icon={Shield} value={s.profile.role} onChange={v => update('profile', 'role', v)} options={['Admin', 'Manager', 'Analyst']} color="#8B5CF6" />
                        <Dropdown label="Session Timeout" desc="Auto-logout after inactivity" icon={Clock} value={`${s.profile.session_timeout}`} onChange={v => update('profile', 'session_timeout', Number(v))} options={['15', '30', '60', '120']} color="#F59E0B" />
                        <Toggle label="Two-Factor Authentication" desc="Extra layer of security" icon={Lock} value={s.profile.two_factor} onChange={v => update('profile', 'two_factor', v)} color="#EC4899" />
                        <ActionButton label="Change Password" desc="Update your account password" icon={Key} color="#6366F1" />
                    </SectionCard>
                </div>
            );

            case 'realtime': return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <SectionCard title="Real-Time Engine">
                        <Toggle label="Real-Time Mode" desc="Enable live data streaming" icon={Zap} value={s.realtime.enabled} onChange={v => update('realtime', 'enabled', v)} color="#14B8A6" />
                        <Toggle label="Simulation Engine" desc="Digital twin & scenario engine" icon={Cpu} value={s.realtime.simulation_enabled} onChange={v => update('realtime', 'simulation_enabled', v)} color="#8B5CF6" />
                        <Toggle label="AI Assistant" desc="MedBot conversational interface" icon={Brain} value={s.realtime.ai_enabled} onChange={v => update('realtime', 'ai_enabled', v)} color="#EC4899" />
                        <Dropdown label="Refresh Interval" desc="Dashboard data refresh rate" icon={RefreshCw} value={`${s.realtime.refresh_interval}`} onChange={v => update('realtime', 'refresh_interval', Number(v))} options={['5', '10', '30']} color="#0EA5E9" />
                    </SectionCard>
                    <SectionCard title="Thresholds & Sensitivity">
                        <Slider label="SLA Threshold" desc="Minimum compliance target" icon={Gauge} value={s.realtime.sla_threshold} onChange={v => update('realtime', 'sla_threshold', v)} unit="%" color="#14B8A6" />
                        <Slider label="Burnout Risk Threshold" desc="Staff burnout detection sensitivity" icon={AlertTriangle} value={s.realtime.burnout_threshold} onChange={v => update('realtime', 'burnout_threshold', v)} unit="%" color="#F59E0B" />
                        <Slider label="Surge Detection Sensitivity" desc="Emergency surge trigger level" icon={Activity} value={s.realtime.surge_sensitivity} onChange={v => update('realtime', 'surge_sensitivity', v)} unit="%" color="#EF4444" />
                    </SectionCard>
                </div>
            );

            case 'alerts': return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <SectionCard title="Notification Channels">
                        <Toggle label="Sound Alerts" desc="Audio notification on new alerts" icon={Volume2} value={s.alerts.sound} onChange={v => update('alerts', 'sound', v)} color="#14B8A6" />
                        <Toggle label="Visual Alerts" desc="On-screen pop-up notifications" icon={Eye} value={s.alerts.visual} onChange={v => update('alerts', 'visual', v)} color="#0EA5E9" />
                        <Toggle label="Email Notifications" desc="Send alerts to registered email" icon={Mail} value={s.alerts.email} onChange={v => update('alerts', 'email', v)} color="#8B5CF6" />
                    </SectionCard>
                    <SectionCard title="Alert Filters">
                        <Dropdown label="Severity Filter" desc="Show alerts by severity level" icon={AlertTriangle} value={s.alerts.severity_filter} onChange={v => update('alerts', 'severity_filter', v)} options={['all', 'critical', 'warning', 'info']} color="#F59E0B" />
                        <Toggle label="Critical-Only Mode" desc="Suppress non-critical alerts" icon={AlertTriangle} value={s.alerts.critical_only} onChange={v => update('alerts', 'critical_only', v)} color="#EF4444" />
                    </SectionCard>
                </div>
            );

            case 'ai': return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <SectionCard title="Forecast Configuration">
                        <Dropdown label="Forecast Model" desc="Time-series prediction algorithm" icon={Brain} value={s.ai_model.forecast_model} onChange={v => update('ai_model', 'forecast_model', v)} options={['ARIMA', 'Prophet']} color="#8B5CF6" />
                        <Slider label="Confidence Threshold" desc="Minimum prediction confidence" icon={Gauge} value={s.ai_model.confidence_threshold} onChange={v => update('ai_model', 'confidence_threshold', v)} min={50} unit="%" color="#8B5CF6" />
                    </SectionCard>
                    <SectionCard title="Optimization">
                        <Dropdown label="Optimization Mode" desc="Resource allocation strategy" icon={Zap} value={s.ai_model.optimization_mode} onChange={v => update('ai_model', 'optimization_mode', v)} options={['Balanced', 'Cost Minimization', 'SLA Priority']} color="#14B8A6" />
                        <Toggle label="Explainable AI" desc="Show reasoning behind predictions" icon={Eye} value={s.ai_model.explainable_ai} onChange={v => update('ai_model', 'explainable_ai', v)} color="#0EA5E9" />
                    </SectionCard>
                </div>
            );

            case 'data': return (
                <SectionCard title="Data Operations">
                    <ActionButton label="Export Data" desc="Download all data as CSV" icon={Download} onClick={() => fetch(API.replace('settings', 'reports/export'))} color="#14B8A6" />
                    <ActionButton label="Upload CSV" desc="Import data from CSV file" icon={Upload} color="#0EA5E9" />
                    <ActionButton label="Backup Database" desc="Create a database snapshot" icon={HardDrive} onClick={() => fetch(API + '/backup', { method: 'POST' })} color="#8B5CF6" />
                    <ActionButton label="Restore Backup" desc="Restore from previous backup" icon={RotateCcw} color="#F59E0B" />
                    <ActionButton label="Reset Simulation" desc="Clear all simulation data" icon={RotateCcw} onClick={() => fetch(API + '/reset-simulation', { method: 'POST' })} variant="danger" />
                </SectionCard>
            );

            case 'appearance': return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <SectionCard title="Theme">
                        <div className="p-3.5 rounded-xl bg-surface">
                            <p className="text-sm font-medium text-text-primary mb-3">Color Theme</p>
                            <div className="flex gap-2">
                                {[{ id: 'light', icon: Sun, label: 'Light' }, { id: 'dark', icon: Moon, label: 'Dark' }, { id: 'auto', icon: Monitor, label: 'Auto' }].map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => update('appearance', 'theme', t.id)}
                                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all
                                            ${s.appearance.theme === t.id
                                                ? 'bg-primary text-white shadow-md shadow-primary/20'
                                                : 'bg-white text-text-secondary hover:bg-gray-50 ring-1 ring-gray-200'}`}
                                    >
                                        <t.icon size={14} /> {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="p-3.5 rounded-xl bg-surface">
                            <p className="text-sm font-medium text-text-primary mb-3">Accent Color</p>
                            <div className="flex gap-2">
                                {['#14B8A6', '#0EA5E9', '#8B5CF6', '#EC4899', '#F59E0B', '#EF4444'].map(c => (
                                    <button
                                        key={c}
                                        onClick={() => update('appearance', 'accent_color', c)}
                                        className="w-8 h-8 rounded-full cursor-pointer transition-transform hover:scale-110 ring-2 ring-offset-2"
                                        style={{
                                            backgroundColor: c,
                                            ringColor: s.appearance.accent_color === c ? c : 'transparent'
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </SectionCard>
                    <SectionCard title="Layout">
                        <Toggle label="Compact Mode" desc="Reduce spacing and padding" icon={Settings} value={s.appearance.compact_mode} onChange={v => update('appearance', 'compact_mode', v)} color="#14B8A6" />
                        <Slider label="Animation Speed" desc="UI transition speed" icon={Zap} value={s.appearance.animation_speed} onChange={v => update('appearance', 'animation_speed', v)} min={0} max={200} unit="%" color="#8B5CF6" />
                    </SectionCard>
                </div>
            );

            case 'security': return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <SectionCard title="API & Access">
                        <div className="p-3.5 rounded-xl bg-surface">
                            <div className="flex items-center gap-3 mb-2">
                                <Key size={18} className="text-primary flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-text-primary">API Key</p>
                                    <p className="text-[11px] text-text-secondary mt-0.5">Used for external integrations</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 px-3 py-2 rounded-lg bg-white text-xs font-mono text-text-secondary border border-gray-200 truncate">{s.security.api_key}</code>
                                <motion.button whileTap={{ scale: 0.95 }}
                                    onClick={() => fetch(API + '/regenerate-api-key', { method: 'POST' }).then(r => r.json()).then(d => update('security', 'api_key', d.api_key))}
                                    className="px-3 py-2 rounded-lg bg-primary text-white text-xs font-semibold cursor-pointer hover:opacity-90 whitespace-nowrap"
                                >Regenerate</motion.button>
                            </div>
                        </div>
                        <Toggle label="IP Restriction" desc="Limit access by IP address" icon={Shield} value={s.security.ip_restriction} onChange={v => update('security', 'ip_restriction', v)} color="#EF4444" />
                    </SectionCard>
                    <SectionCard title="Logs & Audit">
                        <ActionButton label="View Logs" desc="System event timeline" icon={FileText} color="#14B8A6" />
                        <ActionButton label="Alert History" desc="Past alert records" icon={History} color="#F59E0B" />
                        <ActionButton label="Audit Trail" desc="Configuration change log" icon={Eye} color="#8B5CF6" />
                    </SectionCard>
                </div>
            );

            case 'diagnostics': return (
                <div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                        <StatusCard label="Backend" value={diagnostics?.backend_status || '...'} status={diagnostics?.backend_status || 'Checking'} icon={Server} color="#14B8A6" />
                        <StatusCard label="WebSocket" value={diagnostics?.websocket_status || '...'} status={diagnostics?.websocket_status || 'Checking'} icon={Wifi} color="#0EA5E9" />
                        <StatusCard label="Database" value={diagnostics?.database_status || '...'} status={diagnostics?.database_status || 'Checking'} icon={Database} color="#8B5CF6" />
                        <StatusCard label="DB Size" value={`${diagnostics?.db_size_mb || 0} MB`} status="Active" icon={HardDrive} color="#F59E0B" />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <SectionCard title="Resource Usage">
                            <div className="p-3.5 rounded-xl bg-surface">
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-2"><Cpu size={14} className="text-primary" /><span className="text-xs font-medium">CPU Usage</span></div>
                                    <span className="text-sm font-bold text-primary">{diagnostics?.cpu_usage ?? 0}%</span>
                                </div>
                                <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${diagnostics?.cpu_usage ?? 0}%` }} transition={{ duration: 0.8 }} className="h-full rounded-full bg-gradient-to-r from-primary to-accent" />
                                </div>
                            </div>
                            <div className="p-3.5 rounded-xl bg-surface">
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-2"><Activity size={14} className="text-secondary" /><span className="text-xs font-medium">Memory Usage</span></div>
                                    <span className="text-sm font-bold text-secondary">{diagnostics?.memory_usage ?? 0}%</span>
                                </div>
                                <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${diagnostics?.memory_usage ?? 0}%` }} transition={{ duration: 0.8 }} className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600" />
                                </div>
                            </div>
                        </SectionCard>
                        <SectionCard title="Connection Info">
                            <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface">
                                <div className="flex items-center gap-3"><Clock size={16} className="text-primary" /><span className="text-sm font-medium">Last Sync</span></div>
                                <span className="text-xs font-mono text-text-secondary">{diagnostics?.last_sync || '—'}</span>
                            </div>
                            <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface">
                                <div className="flex items-center gap-3"><Wifi size={16} className="text-secondary" /><span className="text-sm font-medium">Active Connections</span></div>
                                <span className="text-sm font-bold text-primary">{diagnostics?.active_connections ?? 0}</span>
                            </div>
                            <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface">
                                <div className="flex items-center gap-3"><Server size={16} className="text-accent" /><span className="text-sm font-medium">Uptime</span></div>
                                <span className="text-sm font-bold text-primary">{diagnostics?.uptime_hours ?? 0}h</span>
                            </div>
                        </SectionCard>
                    </div>
                </div>
            );

            default: return null;
        }
    };

    return (
        <div>
            <PageHeader title="Settings" subtitle="Platform configuration and preferences" icon={Settings} />

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
            <div className="flex gap-1 p-1 mb-6 rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.04] overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActive(tab.id)}
                        className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all
                            ${active === tab.id ? 'text-white' : 'text-text-secondary hover:bg-surface'}`}
                    >
                        {active === tab.id && (
                            <motion.div layoutId="settings-tab" className="absolute inset-0 rounded-xl bg-primary shadow-md shadow-primary/20" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
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
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                >
                    {renderContent()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
