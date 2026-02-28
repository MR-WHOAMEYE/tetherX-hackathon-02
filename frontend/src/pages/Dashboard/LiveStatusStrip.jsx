import { memo } from 'react';
import { motion } from 'framer-motion';
import { Wifi, Database, AlertTriangle, Cpu } from 'lucide-react';

const LiveStatusStrip = memo(function LiveStatusStrip({ alertCount = 0 }) {
    const items = [
        { icon: Wifi, label: 'WebSocket', value: 'Connected', color: '#10B981' },
        { icon: Database, label: 'Database', value: 'Connected', color: '#10B981' },
        { icon: AlertTriangle, label: 'Active Alerts', value: String(alertCount), color: alertCount > 5 ? '#EF4444' : '#F59E0B' },
        { icon: Cpu, label: 'System Load', value: 'Normal', color: '#10B981' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex items-center gap-4 px-4 py-2 rounded-lg mb-4"
            style={{
                background: 'rgba(255, 255, 255, 0.5)',
                border: '1px solid rgba(0, 0, 0, 0.04)',
            }}
        >
            {items.map((item, i) => (
                <div key={item.label} className="flex items-center gap-1.5">
                    {i > 0 && <div className="w-px h-3.5 mr-2.5" style={{ background: 'rgba(0, 0, 0, 0.06)' }} />}
                    <item.icon size={11} style={{ color: item.color }} />
                    <span className="text-[10px] text-text-muted font-medium">{item.label}:</span>
                    <span className="text-[10px] font-semibold" style={{ color: item.color }}>{item.value}</span>
                </div>
            ))}
        </motion.div>
    );
});

export default LiveStatusStrip;
