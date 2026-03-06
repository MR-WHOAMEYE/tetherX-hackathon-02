import { useApp } from '../context/AppContext';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
};

const colors = {
    success: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', text: '#059669' },
    error: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', text: '#dc2626' },
    info: { bg: 'rgba(13,148,136,0.1)', border: 'rgba(13,148,136,0.3)', text: '#0d9488' },
    warning: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', text: '#d97706' },
};

export default function NotificationToast() {
    const { toasts } = useApp();

    if (!toasts.length) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column-reverse',
            gap: '0.5rem',
        }}>
            {toasts.map(toast => {
                const Icon = icons[toast.type] || icons.info;
                const color = colors[toast.type] || colors.info;

                return (
                    <div
                        key={toast.id}
                        className="animate-fade-in-up"
                        style={{
                            padding: '0.75rem 1rem',
                            background: color.bg,
                            border: `1px solid ${color.border}`,
                            borderRadius: 'var(--radius-md)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            minWidth: 280,
                            maxWidth: 400,
                            boxShadow: 'var(--shadow-lg)',
                            backdropFilter: 'blur(8px)',
                        }}
                    >
                        <Icon size={18} color={color.text} style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: color.text, flex: 1 }}>
                            {toast.message}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
