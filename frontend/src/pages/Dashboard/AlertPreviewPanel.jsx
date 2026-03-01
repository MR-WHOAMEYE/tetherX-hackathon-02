import { memo } from 'react';
import { AlertTriangle, ChevronRight, Siren, Clock, TrendingUp, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SEVERITY_CONFIG = {
    critical: {
        bg: 'linear-gradient(135deg, #FEF2F2, #FFF1F2)',
        border: '#FECACA',
        iconBg: '#FEE2E2',
        color: '#DC2626',
        badgeBg: '#DC2626',
        badgeText: '#FFFFFF',
        glow: '0 2px 8px rgba(220,38,38,0.12)',
    },
    warning: {
        bg: 'linear-gradient(135deg, #FFFBEB, #FEF9C3)',
        border: '#FDE68A',
        iconBg: '#FEF3C7',
        color: '#D97706',
        badgeBg: '#D97706',
        badgeText: '#FFFFFF',
        glow: '0 2px 8px rgba(217,119,6,0.12)',
    },
    info: {
        bg: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
        border: '#BFDBFE',
        iconBg: '#DBEAFE',
        color: '#2563EB',
        badgeBg: '#2563EB',
        badgeText: '#FFFFFF',
        glow: '0 2px 8px rgba(37,99,235,0.12)',
    },
};

const AlertPreviewPanel = memo(function AlertPreviewPanel({ summary, deptWork }) {
    const navigate = useNavigate();
    const alerts = [];

    if (summary) {
        if (summary.sla_compliance_pct < 90) {
            alerts.push({ severity: 'critical', title: 'SLA Compliance Below Target', desc: `Current at ${summary.sla_compliance_pct}% — breach risk elevated`, icon: Siren });
        }
        if (summary.burnout_risk_pct > 25) {
            alerts.push({ severity: 'warning', title: 'Burnout Risk Increasing', desc: `Staff risk at ${summary.burnout_risk_pct}% — monitor loads`, icon: TrendingUp });
        }
        if (summary.avg_resolution_time_hrs > 20) {
            alerts.push({ severity: 'warning', title: 'Resolution Time Elevated', desc: `Average at ${summary.avg_resolution_time_hrs}hrs — above target`, icon: Clock });
        }
    }

    if (deptWork?.length > 0) {
        const top = [...deptWork].sort((a, b) => b.active_cases - a.active_cases)[0];
        if (top?.active_cases > 10) {
            alerts.push({ severity: 'info', title: `${top.department} Under High Load`, desc: `${top.active_cases} active cases — highest across departments`, icon: AlertTriangle });
        }
    }

    const displayAlerts = alerts.slice(0, 3);
    if (!displayAlerts.length) return null;

    return (
        <div
            className="bg-white rounded-xl border border-gray-100 h-full"
            style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)', overflow: 'hidden' }}
        >
            {/* Header */}
            <div style={{ padding: '20px 24px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: 8,
                            background: 'linear-gradient(135deg, #0F766E, #14B8A6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(15,118,110,0.2)',
                        }}>
                            <Shield size={15} color="#FFFFFF" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: 0, fontFamily: 'var(--font-family-display)' }}>
                                Critical Alerts
                            </h3>
                            <p style={{ fontSize: 11, color: '#94A3B8', margin: '1px 0 0', fontWeight: 500 }}>
                                {alerts.length} active alert{alerts.length !== 1 ? 's' : ''} requiring attention
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/intelligence')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            fontSize: 12, fontWeight: 600, color: '#0F766E',
                            cursor: 'pointer', background: 'none', border: 'none', outline: 'none',
                            padding: '6px 12px', borderRadius: 6,
                            transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#F0FDFA'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                    >
                        View All <ChevronRight size={13} />
                    </button>
                </div>
            </div>

            {/* Alert Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '16px 24px 24px' }}>
                {displayAlerts.map((alert, i) => {
                    const config = SEVERITY_CONFIG[alert.severity];
                    return (
                        <div
                            key={i}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: '14px 16px', borderRadius: 12,
                                background: config.bg,
                                border: `1px solid ${config.border}`,
                                boxShadow: config.glow,
                                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                                cursor: 'default',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = config.glow.replace('0.12', '0.2');
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = config.glow;
                            }}
                        >
                            <div style={{
                                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                                background: config.iconBg,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: `1px solid ${config.border}`,
                            }}>
                                <alert.icon size={16} color={config.color} strokeWidth={2.2} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', margin: 0, lineHeight: 1.3 }}>
                                    {alert.title}
                                </p>
                                <p style={{ fontSize: 11, color: '#64748B', margin: '3px 0 0', lineHeight: 1.4 }}>
                                    {alert.desc}
                                </p>
                            </div>
                            <span style={{
                                fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 5,
                                textTransform: 'uppercase', letterSpacing: '0.06em',
                                background: config.badgeBg, color: config.badgeText,
                                flexShrink: 0,
                                boxShadow: `0 1px 3px ${config.color}30`,
                            }}>
                                {alert.severity}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});

export default AlertPreviewPanel;
