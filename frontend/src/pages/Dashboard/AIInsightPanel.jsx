import { memo } from 'react';
import { Activity, AlertTriangle, TrendingUp } from 'lucide-react';

const AIInsightPanel = memo(function AIInsightPanel({ summary }) {
    if (!summary) return null;

    const insights = [];

    if (summary.burnout_risk_pct > 30) {
        insights.push({ icon: AlertTriangle, text: `Burnout risk at ${summary.burnout_risk_pct}% — consider workload redistribution.`, type: 'warn' });
    } else {
        insights.push({ icon: Activity, text: `Burnout risk stable at ${summary.burnout_risk_pct}% — within acceptable limits.`, type: 'ok' });
    }

    if (summary.sla_compliance_pct < 90) {
        insights.push({ icon: AlertTriangle, text: `SLA compliance at ${summary.sla_compliance_pct}% — ${Math.round(100 - summary.sla_compliance_pct)}% of cases at breach risk.`, type: 'critical' });
    } else {
        insights.push({ icon: TrendingUp, text: `SLA compliance strong at ${summary.sla_compliance_pct}% — all departments meeting targets.`, type: 'ok' });
    }

    if (summary.active_cases > 50) {
        insights.push({ icon: Activity, text: `${summary.active_cases} active cases — elevated workload, monitor resource allocation.`, type: 'info' });
    }

    const colors = { ok: '#059669', warn: '#D97706', critical: '#DC2626', info: '#0284C7' };

    return (
        <div
            className="bg-white rounded-xl p-5 border border-gray-100 h-full"
            style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
        >
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 14 }}>AI Operational Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {insights.map((item, i) => {
                    const c = colors[item.type];
                    return (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                            <div style={{
                                width: 22, height: 22, borderRadius: 5, flexShrink: 0, marginTop: 1,
                                background: `${c}0D`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <item.icon size={11} color={c} />
                            </div>
                            <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.55 }}>{item.text}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});

export default AIInsightPanel;
