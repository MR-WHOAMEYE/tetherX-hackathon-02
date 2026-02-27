import { motion } from 'framer-motion';
import { Mail, Bell, Volume2, AlertTriangle } from 'lucide-react';

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

const items = [
    { key: 'email', label: 'Email Alerts', desc: 'Receive important alerts via email', icon: Mail, color: '#8B5CF6', section: 'alerts', field: 'email' },
    { key: 'critical', label: 'Critical Alerts Only', desc: 'Only notify for critical-level events', icon: AlertTriangle, color: '#EF4444', section: 'alerts', field: 'critical_only' },
    { key: 'visual', label: 'Real-Time Popup Notifications', desc: 'Show on-screen notification banners', icon: Bell, color: '#0EA5E9', section: 'alerts', field: 'visual' },
    { key: 'sound', label: 'Alert Sound', desc: 'Play an audio cue when alerts arrive', icon: Volume2, color: '#14B8A6', section: 'alerts', field: 'sound' },
];

export default function NotificationSettings({ settings, onUpdate }) {
    const s = settings?.alerts || {};

    return (
        <div className="max-w-2xl">
            <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-black/[0.04]">
                <h4 className="text-sm font-bold text-text-primary flex items-center gap-2 mb-5">
                    <div className="w-1 h-4 rounded-full bg-primary" /> Notification Preferences
                </h4>
                <div className="space-y-1">
                    {items.map((item, i) => (
                        <div key={item.key} className={`flex items-center justify-between py-3.5 ${i < items.length - 1 ? 'border-b border-black/[0.04]' : ''}`}>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: item.color + '12' }}>
                                    <item.icon size={15} style={{ color: item.color }} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-text-primary">{item.label}</p>
                                    <p className="text-[11px] text-text-secondary">{item.desc}</p>
                                </div>
                            </div>
                            <Toggle value={s[item.field] || false} onChange={v => onUpdate(item.section, item.field, v)} color={item.color} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
