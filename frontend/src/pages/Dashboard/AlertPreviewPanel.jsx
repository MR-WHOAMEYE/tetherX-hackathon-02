import { memo } from 'react';
import { AlertTriangle, ChevronRight, Siren, Clock, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AlertPreviewPanel = memo(function AlertPreviewPanel({ summary, deptWork }) {
    const navigate = useNavigate();
    const alerts = [];

    if (summary) {
        if (summary.sla_compliance_pct < 90) {
            alerts.push({ severity: 'critical', title: 'SLA Compliance Below Target', desc: `Current at ${summary.sla_compliance_pct}% — breach risk elevated`, icon: Siren, color: '#DC2626' });
        }
        if (summary.burnout_risk_pct > 25) {
            alerts.push({ severity: 'warning', title: 'Burnout Risk Increasing', desc: `Staff risk at ${summary.burnout_risk_pct}% — monitor loads`, icon: TrendingUp, color: '#D97706' });
        }
        if (summary.avg_resolution_time_hrs > 20) {
            alerts.push({ severity: 'warning', title: 'Resolution Time Elevated', desc: `Average at ${summary.avg_resolution_time_hrs}hrs — above target`, icon: Clock, color: '#D97706' });
        }
    }

    if (deptWork?.length > 0) {
        const top = [...deptWork].sort((a, b) => b.active_cases - a.active_cases)[0];
        if (top?.active_cases > 10) {
            alerts.push({ severity: 'info', title: `${top.department} Under High Load`, desc: `${top.active_cases} active cases — highest across departments`, icon: AlertTriangle, color: '#0284C7' });
        }
    }

    const displayAlerts = alerts.slice(0, 3);
    if (!displayAlerts.length) return null;

    const severityColors = { critical: '#DC2626', warning: '#D97706', info: '#0284C7' };

    return (
        <div
            className="bg-white rounded-xl p-5 border border-gray-100 h-full"
            style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>Critical Alerts</h3>
                    <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500 }}>({alerts.length})</span>
                </div>
                <button
                    onClick={() => navigate('/intelligence')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        fontSize: 12, fontWeight: 600, color: '#0F766E',
                        cursor: 'pointer', background: 'none', border: 'none', outline: 'none',
                    }}
                >
                    View All <ChevronRight size={12} />
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {displayAlerts.map((alert, i) => (
                    <div
                        key={i}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '10px 12px', borderRadius: 8,
                            background: `${alert.color}06`, border: `1px solid ${alert.color}0A`,
                        }}
                    >
                        <div style={{
                            width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                            background: `${alert.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <alert.icon size={13} color={alert.color} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', margin: 0 }}>{alert.title}</p>
                            <p style={{ fontSize: 11, color: '#6B7280', margin: '2px 0 0' }}>{alert.desc}</p>
                        </div>
                        <span style={{
                            fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                            textTransform: 'uppercase', letterSpacing: '0.05em',
                            background: `${alert.color}10`, color: alert.color,
                        }}>
                            {alert.severity}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
});

export default AlertPreviewPanel;
