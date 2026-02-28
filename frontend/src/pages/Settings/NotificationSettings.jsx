import { motion } from 'framer-motion';
import { Mail, Bell, Volume2, AlertTriangle, MessageSquare, Zap } from 'lucide-react';

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

const alertGroups = [
    {
        title: 'Communication',
        icon: MessageSquare,
        color: '#8B5CF6',
        items: [
            { key: 'email', label: 'Email Notifications', desc: 'Receive important alerts and reports via email', icon: Mail, color: '#8B5CF6', section: 'alerts', field: 'email' },
            { key: 'visual', label: 'Push Notifications', desc: 'Real-time on-screen notification banners', icon: Bell, color: '#0EA5E9', section: 'alerts', field: 'visual' },
        ],
    },
    {
        title: 'Alert Behavior',
        icon: Zap,
        color: '#EF4444',
        items: [
            { key: 'critical', label: 'Critical Alerts Only', desc: 'Filter to show only level-critical events', icon: AlertTriangle, color: '#EF4444', section: 'alerts', field: 'critical_only' },
            { key: 'sound', label: 'Alert Sound', desc: 'Play an audio cue when new alerts arrive', icon: Volume2, color: '#14B8A6', section: 'alerts', field: 'sound' },
        ],
    },
];

export default function NotificationSettings({ settings, onUpdate }) {
    const s = settings?.alerts || {};

    const enabledCount = ['email', 'visual', 'critical_only', 'sound'].filter(k => s[k]).length;

    return (
        <div className="space-y-6">
            {/* Summary Card */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-5"
                style={{
                    background: 'linear-gradient(135deg, rgba(15, 118, 110, 0.04), rgba(14, 165, 233, 0.04))',
                    border: '1px solid rgba(15, 118, 110, 0.08)',
                }}
            >
                <div className="flex items-center gap-4">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: 'rgba(15, 118, 110, 0.08)' }}
                    >
                        <Bell size={18} className="text-primary" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-text-primary">
                            {enabledCount} of 4 notification channels active
                        </p>
                        <p className="text-[11px] text-text-secondary mt-0.5">
                            Configure how and when you receive alerts
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Grouped Settings */}
            {alertGroups.map((group, gi) => (
                <motion.div
                    key={group.title}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 * (gi + 1) }}
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
                        <div
                            className="w-1.5 h-5 rounded-full"
                            style={{ background: `linear-gradient(180deg, ${group.color}, ${group.color}80)` }}
                        />
                        {group.title}
                    </h4>

                    <div className="space-y-2">
                        {group.items.map((item, i) => (
                            <div
                                key={item.key}
                                className="flex items-center justify-between py-4 px-4 rounded-xl transition-all duration-200"
                                style={{
                                    background: s[item.field] ? `${item.color}04` : 'rgba(0, 0, 0, 0.01)',
                                    border: s[item.field]
                                        ? `1px solid ${item.color}10`
                                        : '1px solid rgba(0, 0, 0, 0.03)',
                                }}
                            >
                                <div className="flex items-center gap-3.5">
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
                                        style={{
                                            background: s[item.field] ? `${item.color}12` : 'rgba(0, 0, 0, 0.03)',
                                        }}
                                    >
                                        <item.icon
                                            size={16}
                                            style={{ color: s[item.field] ? item.color : '#94A3B8' }}
                                            className="transition-colors duration-200"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-text-primary">{item.label}</p>
                                        <p className="text-[11px] text-text-secondary mt-0.5">{item.desc}</p>
                                    </div>
                                </div>
                                <Toggle
                                    value={s[item.field] || false}
                                    onChange={v => onUpdate(item.section, item.field, v)}
                                    color={item.color}
                                />
                            </div>
                        ))}
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
