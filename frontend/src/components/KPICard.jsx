import { TrendingUp, TrendingDown } from 'lucide-react';

const COLOR_MAP = {
    primary: '#0F766E',
    secondary: '#0284C7',
    accent: '#10B981',
    warning: '#D97706',
    critical: '#DC2626',
    green: '#059669',
    teal: '#0D9488',
};

export default function KPICard({ title, value, unit, trend, trendLabel, icon: Icon, color = 'primary', delay = 0 }) {
    const accent = COLOR_MAP[color] || COLOR_MAP.primary;

    return (
        <div
            className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors duration-200 overflow-hidden"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        >
            {/* Thin colored accent bar */}
            <div style={{ height: 3, background: accent, opacity: 0.7 }} />

            <div style={{ padding: '20px 24px 22px' }}>
                {/* Label row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <p style={{
                        fontFamily: "'Outfit', 'Inter', sans-serif",
                        fontSize: 13,
                        fontWeight: 500,
                        color: '#6B7280',
                        margin: 0,
                    }}>
                        {title}
                    </p>
                    {trend !== undefined && trend !== null && (
                        <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 3,
                            fontSize: 12,
                            fontWeight: 600,
                            color: trend >= 0 ? '#059669' : '#DC2626',
                            background: trend >= 0 ? '#ECFDF5' : '#FEF2F2',
                            padding: '3px 8px',
                            borderRadius: 6,
                        }}>
                            {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {Math.abs(trend)}%
                        </span>
                    )}
                </div>

                {/* Value */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                    <span style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: 36,
                        fontWeight: 700,
                        color: '#111827',
                        lineHeight: 1,
                        letterSpacing: '-0.02em',
                    }}>
                        {value}
                    </span>
                    {unit && (
                        <span style={{
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: 16,
                            fontWeight: 500,
                            color: '#9CA3AF',
                        }}>
                            {unit}
                        </span>
                    )}
                </div>

                {trendLabel && <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 8 }}>{trendLabel}</p>}
            </div>
        </div>
    );
}
