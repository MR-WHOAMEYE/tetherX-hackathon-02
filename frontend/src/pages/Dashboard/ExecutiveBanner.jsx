import { useState, useEffect, memo } from 'react';
import { HeartPulse, Radio } from 'lucide-react';

const ExecutiveBanner = memo(function ExecutiveBanner({ summary }) {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    const formatDate = (d) =>
        d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    const formatTime = (d) =>
        d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const healthIndex = summary?.health_index || 0;
    const healthLabel = healthIndex >= 70 ? 'Healthy' : healthIndex >= 40 ? 'Moderate' : 'Critical';

    return (
        <div
            className="rounded-2xl overflow-hidden mb-7"
            style={{
                background: 'linear-gradient(145deg, #042F2E 0%, #0A4A44 40%, #0F766E 100%)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}
        >
            {/* Hero */}
            <div style={{ padding: '60px 56px 52px 56px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    {/* Left */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24 }}>
                        <div
                            style={{
                                width: 74,
                                height: 74,
                                borderRadius: 20,
                                background: 'rgba(255,255,255,0.07)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                marginTop: 6,
                            }}
                        >
                            <HeartPulse size={36} color="#99F6E4" />
                        </div>

                        <div>
                            <p style={{
                                fontFamily: "'Outfit', sans-serif",
                                fontSize: 13,
                                fontWeight: 600,
                                letterSpacing: '0.18em',
                                textTransform: 'uppercase',
                                color: 'rgba(153,246,228,0.35)',
                                marginBottom: 14,
                            }}>
                                Executive Control Center
                            </p>
                            <h1 style={{
                                fontFamily: "'Outfit', sans-serif",
                                fontSize: 44,
                                fontWeight: 800,
                                color: '#FFFFFF',
                                letterSpacing: '-0.03em',
                                lineHeight: 1.12,
                                margin: 0,
                            }}>
                                Hospital Operational
                                <br />
                                Intelligence Platform
                            </h1>
                            <p style={{
                                fontFamily: "'Inter', sans-serif",
                                fontSize: 16,
                                fontWeight: 400,
                                color: 'rgba(153,246,228,0.38)',
                                marginTop: 18,
                                lineHeight: 1.6,
                                maxWidth: 480,
                            }}>
                                Real-time predictive analytics and strategic
                                decision support for healthcare operations.
                            </p>
                        </div>
                    </div>

                    {/* Right */}
                    <div style={{ textAlign: 'right', flexShrink: 0, paddingTop: 8 }}>
                        <p style={{
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: 14,
                            fontWeight: 500,
                            color: 'rgba(153,246,228,0.3)',
                            marginBottom: 8,
                        }}>
                            {formatDate(time)}
                        </p>
                        <p style={{
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: 52,
                            fontWeight: 700,
                            color: '#FFFFFF',
                            fontVariantNumeric: 'tabular-nums',
                            letterSpacing: '-0.01em',
                            lineHeight: 1,
                        }}>
                            {formatTime(time)}
                        </p>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            marginTop: 18,
                            padding: '7px 18px',
                            borderRadius: 10,
                            background: 'rgba(16,185,129,0.1)',
                            border: '1px solid rgba(16,185,129,0.12)',
                        }}>
                            <Radio size={14} color="#34D399" />
                            <span style={{
                                fontFamily: "'Outfit', sans-serif",
                                fontSize: 12,
                                fontWeight: 700,
                                color: '#6EE7B7',
                                textTransform: 'uppercase',
                                letterSpacing: '0.12em',
                            }}>
                                System Live
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Metrics Bar */}
            {summary && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '18px 56px',
                    background: 'rgba(0,0,0,0.18)',
                    borderTop: '1px solid rgba(255,255,255,0.04)',
                }}>
                    {[
                        { label: 'Total Cases', value: summary.total_cases?.toLocaleString() },
                        { label: 'Active', value: summary.active_cases?.toLocaleString() },
                        { label: 'SLA Compliance', value: `${summary.sla_compliance_pct}%` },
                        { label: 'Burnout Risk', value: `${summary.burnout_risk_pct}%` },
                        { label: 'Avg Resolution', value: `${summary.avg_resolution_time_hrs}h` },
                        { label: 'Health', value: healthLabel },
                    ].map((m, i, arr) => (
                        <div
                            key={m.label}
                            style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                ...(i < arr.length - 1 ? {
                                    borderRight: '1px solid rgba(255,255,255,0.06)',
                                    paddingRight: 24,
                                    marginRight: 24,
                                } : {}),
                            }}
                        >
                            <span style={{
                                fontFamily: "'Inter', sans-serif",
                                fontSize: 13,
                                fontWeight: 500,
                                color: 'rgba(153,246,228,0.35)',
                            }}>
                                {m.label}
                            </span>
                            <span style={{
                                fontFamily: "'Outfit', sans-serif",
                                fontSize: 16,
                                fontWeight: 700,
                                color: '#FFFFFF',
                            }}>
                                {m.value}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
});

export default ExecutiveBanner;
