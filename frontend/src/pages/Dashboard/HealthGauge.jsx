import { useState, useEffect, memo } from 'react';

const HealthGauge = memo(function HealthGauge({ value = 0 }) {
    const [animVal, setAnimVal] = useState(0);

    useEffect(() => {
        let frame;
        const start = performance.now();
        const animate = (now) => {
            const p = Math.min((now - start) / 900, 1);
            setAnimVal(Math.round((1 - Math.pow(1 - p, 3)) * value));
            if (p < 1) frame = requestAnimationFrame(animate);
        };
        frame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frame);
    }, [value]);

    const color = value >= 70 ? '#059669' : value >= 40 ? '#D97706' : '#DC2626';
    const label = value >= 70 ? 'Healthy' : value >= 40 ? 'Moderate' : 'Critical';
    const size = 80;
    const sw = 6;
    const r = (size - sw) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (animVal / 100) * circ;

    return (
        <div
            className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors duration-200 overflow-hidden"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        >
            {/* Accent bar matching color */}
            <div style={{ height: 3, background: color, opacity: 0.7 }} />

            <div style={{ padding: '20px 24px 22px' }}>
                <p style={{
                    fontFamily: "'Outfit', 'Inter', sans-serif",
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#6B7280',
                    marginBottom: 16,
                }}>
                    Health Index
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                    {/* Ring */}
                    <div style={{ width: size, height: size, position: 'relative', flexShrink: 0 }}>
                        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F3F4F6" strokeWidth={sw} />
                            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={sw}
                                strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
                                style={{ transition: 'stroke-dashoffset 0.08s linear' }}
                            />
                        </svg>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>{animVal}</span>
                        </div>
                    </div>
                    {/* Value + Label */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 36, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em', lineHeight: 1 }}>{animVal}</span>
                            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, color: '#9CA3AF' }}>/100</span>
                        </div>
                        <span style={{
                            display: 'inline-block', marginTop: 8,
                            fontSize: 11, fontWeight: 700,
                            padding: '3px 10px', borderRadius: 4,
                            textTransform: 'uppercase', letterSpacing: '0.06em',
                            background: `${color}14`, color,
                        }}>
                            {label}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default HealthGauge;
