import { useState, useEffect, useCallback } from 'react';
import { Target, Play, Activity, CheckCircle2, ArrowRight, Settings2, BarChart3, Lightbulb, RefreshCw } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { simulateScenario } from '../services/api';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';

/* ─── Formatters ─── */
const fmtINR = (n) => {
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
    return `₹${n}`;
};

/* ─── Section Card ─── */
const Card = ({ title, subtitle, icon: Icon, children, className = '', accentColor, step }) => (
    <div className={`bg-white rounded-xl border border-gray-100 ${className}`}
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
        {accentColor && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: accentColor }} />}
        {title && (
            <div style={{ padding: '18px 24px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
                {step && (
                    <div style={{
                        width: 28, height: 28, borderRadius: '50%', background: accentColor || '#0F766E',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 800, color: '#fff', flexShrink: 0,
                    }}>{step}</div>
                )}
                {Icon && !step && (
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F0FDFA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={16} color="#0F766E" />
                    </div>
                )}
                <div style={{ flex: 1 }}>
                    <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>{title}</h3>
                    {subtitle && <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>{subtitle}</p>}
                </div>
            </div>
        )}
        <div style={{ padding: '14px 24px 22px' }}>{children}</div>
    </div>
);

/* ═══════════════════ MAIN ═══════════════════ */
export default function StrategicPlanning({ embedded }) {
    const [config, setConfig] = useState({
        case_volume_pct: 130,
        staff_availability_pct: 100,
        emergency_weight_pct: 20,
        shift_duration_hrs: 8,
        redistribute: false,
    });
    const [result, setResult] = useState(null);
    const [prevResult, setPrevResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [running, setRunning] = useState(false);
    const [compareMode, setCompareMode] = useState(false);
    const [activePreset, setActivePreset] = useState('surge_30');

    const presets = [
        { id: 'surge_30', label: '30% Volume Surge', desc: 'Simulate 30% increase in case volume', cfg: { case_volume_pct: 130, staff_availability_pct: 100, emergency_weight_pct: 20, shift_duration_hrs: 8 } },
        { id: 'pandemic', label: 'Pandemic Surge', desc: 'Extreme 2.5x case volume with 20% staff reduction', cfg: { case_volume_pct: 250, staff_availability_pct: 80, emergency_weight_pct: 40, shift_duration_hrs: 12 } },
        { id: 'staff_shortage', label: 'Staff Shortage', desc: '35% staffing reduction scenario', cfg: { case_volume_pct: 100, staff_availability_pct: 65, emergency_weight_pct: 20, shift_duration_hrs: 10 } },
        { id: 'custom', label: 'Custom Scenario', desc: 'Configure your own parameters', cfg: null },
    ];

    const runSimulation = useCallback(async (cfg) => {
        setRunning(true);
        try {
            const data = await simulateScenario({ scenario: 'custom', department: 'all', ...cfg });
            if (data.departments) data.departments.sort((a, b) => b.stress_level - a.stress_level);
            if (result && compareMode) setPrevResult(result);
            setResult(data);
        } catch (e) { console.error(e); }
        finally { setRunning(false); setLoading(false); }
    }, [result, compareMode]);

    // Auto-load on mount with default scenario
    useEffect(() => {
        runSimulation(config);
    }, []); // eslint-disable-line

    const selectPreset = (preset) => {
        setActivePreset(preset.id);
        if (preset.cfg) {
            const newCfg = { ...config, ...preset.cfg };
            setConfig(newCfg);
            runSimulation(newCfg);
        }
    };

    const set = (k, v) => setConfig(p => ({ ...p, [k]: v }));

    const Slider = ({ label, value, onChange, min, max, step = 5, unit = '%' }) => (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: '#374151' }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#0F766E', fontVariantNumeric: 'tabular-nums' }}>{value}{unit}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={value}
                onChange={e => onChange(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#0F766E', cursor: 'pointer' }} />
        </div>
    );

    if (loading && !result) return <LoadingSpinner />;

    return (
        <div>
            {!embedded && <PageHeader title="Strategic Planning" subtitle="Operational decision intelligence & scenario analysis" icon={Target} />}

            {/* ═══ STEP 1: Scenario Selection ═══ */}
            <Card title="Select Scenario" subtitle="Choose a scenario to analyze operational impact" step="1" accentColor="#0F766E" className="mb-4">
                {/* Preset cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 14 }}>
                    {presets.map(p => (
                        <button key={p.id} onClick={() => selectPreset(p)}
                            style={{
                                padding: '14px 14px', borderRadius: 10, textAlign: 'left',
                                border: activePreset === p.id ? '2px solid #0F766E' : '1px solid #E5E7EB',
                                background: activePreset === p.id ? '#F0FDFA' : '#FAFAFA',
                                cursor: 'pointer', transition: 'all 0.15s',
                            }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: activePreset === p.id ? '#0F766E' : '#374151', marginBottom: 4 }}>{p.label}</div>
                            <div style={{ fontSize: 10, color: '#9CA3AF', lineHeight: 1.3 }}>{p.desc}</div>
                        </button>
                    ))}
                </div>

                {/* Advanced config (always visible for custom, collapsible for presets) */}
                {activePreset === 'custom' && (
                    <div style={{ padding: '14px 16px', borderRadius: 10, background: '#F9FAFB', border: '1px solid #F3F4F6' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 28px', marginBottom: 14 }}>
                            <Slider label="Case Volume" value={config.case_volume_pct} onChange={v => set('case_volume_pct', v)} min={50} max={300} />
                            <Slider label="Staff Availability" value={config.staff_availability_pct} onChange={v => set('staff_availability_pct', v)} min={30} max={100} />
                            <Slider label="Emergency Weight" value={config.emergency_weight_pct} onChange={v => set('emergency_weight_pct', v)} min={5} max={60} />
                            <Slider label="Shift Duration" value={config.shift_duration_hrs} onChange={v => set('shift_duration_hrs', v)} min={4} max={16} step={1} unit="h" />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', gap: 16 }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, color: '#374151', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={config.redistribute} onChange={e => set('redistribute', e.target.checked)} style={{ accentColor: '#0F766E' }} />
                                    Resource Redistribution
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, color: '#6B7280', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={compareMode} onChange={e => setCompareMode(e.target.checked)} style={{ accentColor: '#0F766E' }} />
                                    Compare Mode
                                </label>
                            </div>
                            <button onClick={() => runSimulation(config)} disabled={running}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 20px', borderRadius: 8,
                                    background: '#0F766E', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none',
                                    cursor: running ? 'wait' : 'pointer', opacity: running ? 0.7 : 1,
                                }}>
                                {running ? <Activity size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                                {running ? 'Running...' : 'Run Custom Scenario'}
                            </button>
                        </div>
                    </div>
                )}
            </Card>

            {/* ═══ STEP 2: Analysis Results ═══ */}
            {result && (
                <>
                    <Card title="Operational Impact Analysis" subtitle={`Scenario: ${result.scenario || 'Custom'}`} step="2" accentColor="#2563EB" className="mb-4">
                        {/* Executive KPIs */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, marginBottom: 20 }}>
                            {[
                                { label: 'Risk Level', value: result.risk_level, color: result.risk_level === 'High' ? '#DC2626' : result.risk_level === 'Medium' ? '#D97706' : '#059669', bg: result.risk_level === 'High' ? '#FEF2F2' : result.risk_level === 'Medium' ? '#FFFBEB' : '#ECFDF5' },
                                { label: 'SLA Breach Probability', value: `${result.sla_breach_probability}%`, color: result.sla_breach_probability > 60 ? '#DC2626' : '#111827', bg: result.sla_breach_probability > 60 ? '#FEF2F2' : '#F9FAFB' },
                                { label: 'Stability Score', value: `${result.stability_score}/100`, color: result.stability_score < 40 ? '#DC2626' : '#059669', bg: result.stability_score < 40 ? '#FEF2F2' : '#ECFDF5' },
                                { label: 'Critical Departments', value: `${result.critical_departments}/${result.departments?.length}`, color: result.critical_departments > 2 ? '#DC2626' : '#111827', bg: '#F9FAFB' },
                                { label: 'Action Window', value: `${result.action_window_hrs}h`, color: '#2563EB', bg: '#EFF6FF' },
                                { label: 'Forecast Horizon', value: `${result.forecast_horizon_days}d`, color: '#6B7280', bg: '#F9FAFB' },
                            ].map(m => (
                                <div key={m.label} style={{ padding: '12px 14px', borderRadius: 10, background: m.bg, textAlign: 'center' }}>
                                    <p style={{ fontSize: 9, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{m.label}</p>
                                    <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 800, color: m.color, lineHeight: 1 }}>{m.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Impact Forecast Chart + Comparison side by side */}
                        <div style={{ display: 'grid', gridTemplateColumns: compareMode && prevResult ? '1fr 1fr' : '1fr', gap: 16 }}>
                            <div>
                                <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Case Volume: Current vs Projected</p>
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={result.departments} barGap={3}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                                        <XAxis dataKey="department" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }} />
                                        <Legend wrapperStyle={{ fontSize: 11 }} />
                                        <Bar dataKey="current_cases" fill="#D1D5DB" radius={[3, 3, 0, 0]} name="Current" />
                                        <Bar dataKey="projected_cases" fill="#0F766E" radius={[3, 3, 0, 0]} name="Projected" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {compareMode && prevResult && (
                                <div>
                                    <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Scenario Comparison</p>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                                                {['Metric', 'Previous', 'Current', 'Δ'].map(h => (
                                                    <th key={h} style={{ textAlign: h === 'Metric' ? 'left' : 'right', padding: '6px 8px', fontWeight: 600, color: '#6B7280', fontSize: 11 }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                { l: 'Risk', p: prevResult.overall_risk, c: result.overall_risk, u: '%', inv: false },
                                                { l: 'SLA Breach', p: prevResult.sla_breach_probability, c: result.sla_breach_probability, u: '%', inv: false },
                                                { l: 'Stability', p: prevResult.stability_score, c: result.stability_score, u: '', inv: true },
                                                { l: 'Critical', p: prevResult.critical_departments, c: result.critical_departments, u: '', inv: false },
                                            ].map(r => {
                                                const d = r.c - r.p;
                                                const good = r.inv ? d > 0 : d < 0;
                                                return (
                                                    <tr key={r.l} style={{ borderBottom: '1px solid #F3F4F6' }}>
                                                        <td style={{ padding: '8px', fontWeight: 500 }}>{r.l}</td>
                                                        <td style={{ padding: '8px', textAlign: 'right', color: '#6B7280' }}>{r.p}{r.u}</td>
                                                        <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600 }}>{r.c}{r.u}</td>
                                                        <td style={{ padding: '8px', textAlign: 'right', fontWeight: 700, color: d === 0 ? '#9CA3AF' : good ? '#059669' : '#DC2626' }}>
                                                            {d > 0 ? '+' : ''}{d}{r.u}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Department Intelligence Table */}
                    <Card title="Department Intelligence" subtitle="Per-department stress, staffing needs, and impact scores" icon={BarChart3} className="mb-4">
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                                        {['Department', 'Stress Level', 'Cases (Before → After)', 'Staff (Before → After)', 'Add\'l Staff', 'Impact'].map(h => (
                                            <th key={h} style={{ textAlign: h === 'Department' ? 'left' : 'right', padding: '10px 14px', fontWeight: 600, color: '#6B7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.departments?.map((d, i) => {
                                        const sc = d.stress_level > 80 ? '#DC2626' : d.stress_level > 60 ? '#D97706' : d.stress_level > 40 ? '#3B82F6' : '#059669';
                                        const tag = d.stress_level > 80 ? 'Critical' : d.stress_level > 60 ? 'High' : d.stress_level > 40 ? 'Medium' : 'Low';
                                        return (
                                            <tr key={d.department} style={{ borderBottom: '1px solid #F3F4F6', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                                                <td style={{ padding: '12px 14px', fontWeight: 600 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: sc, flexShrink: 0 }} />
                                                        {d.department}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                                        <div style={{ width: 48, height: 4, borderRadius: 2, background: '#F3F4F6', overflow: 'hidden' }}>
                                                            <div style={{ height: '100%', width: `${d.stress_level}%`, borderRadius: 2, background: sc }} />
                                                        </div>
                                                        <span style={{ fontSize: 11, fontWeight: 700, color: sc, minWidth: 26, textAlign: 'right' }}>{d.stress_level}%</span>
                                                        <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3, background: `${sc}14`, color: sc }}>{tag}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '12px 14px', textAlign: 'right', color: '#374151' }}>
                                                    {d.current_cases} → <span style={{ fontWeight: 600 }}>{d.projected_cases}</span>
                                                </td>
                                                <td style={{ padding: '12px 14px', textAlign: 'right', color: '#374151' }}>
                                                    {d.current_staff} → <span style={{ fontWeight: 600 }}>{d.projected_staff}</span>
                                                </td>
                                                <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 600, color: d.required_additional_staff > 0 ? '#DC2626' : '#059669' }}>
                                                    {d.required_additional_staff > 0 ? `+${d.required_additional_staff}` : '—'}
                                                </td>
                                                <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                                                        <div style={{ width: 36, height: 4, borderRadius: 2, background: '#F3F4F6', overflow: 'hidden' }}>
                                                            <div style={{ height: '100%', width: `${d.impact_score}%`, borderRadius: 2, background: d.impact_score > 70 ? '#DC2626' : d.impact_score > 40 ? '#D97706' : '#059669' }} />
                                                        </div>
                                                        <span style={{
                                                            padding: '2px 6px', borderRadius: 4, fontSize: 11, fontWeight: 700,
                                                            background: d.impact_score > 70 ? '#FEF2F2' : d.impact_score > 40 ? '#FFFBEB' : '#ECFDF5',
                                                            color: d.impact_score > 70 ? '#DC2626' : d.impact_score > 40 ? '#D97706' : '#059669',
                                                        }}>{d.impact_score}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* ═══ STEP 3: Recommended Actions ═══ */}
                    {result.ai_recommendations?.length > 0 && (
                        <Card title="Recommended Actions" subtitle="AI-generated strategic recommendations ranked by impact" step="3" accentColor="#059669" className="mb-4">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {result.ai_recommendations.map((rec, i) => (
                                    <div key={i} style={{
                                        display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px',
                                        borderRadius: 10, background: '#F9FAFB', border: '1px solid #F3F4F6',
                                        transition: 'border-color 0.15s',
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.borderColor = '#D1D5DB'}
                                        onMouseLeave={e => e.currentTarget.style.borderColor = '#F3F4F6'}>
                                        <div style={{
                                            width: 32, height: 32, borderRadius: 8,
                                            background: i === 0 ? '#ECFDF5' : '#F3F4F6',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0, fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 800,
                                            color: i === 0 ? '#059669' : '#9CA3AF',
                                        }}>{i + 1}</div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0 }}>{rec.title}</p>
                                            <div style={{ display: 'flex', gap: 20, marginTop: 5 }}>
                                                <span style={{ fontSize: 11, fontWeight: 700, color: '#059669' }}>SLA +{rec.sla_improvement}%</span>
                                                <span style={{ fontSize: 11, color: '#6B7280' }}>Cost: <strong>{fmtINR(rec.financial_impact)}</strong></span>
                                                <span style={{ fontSize: 11, color: '#6B7280' }}>Confidence: <strong>{rec.confidence}%</strong></span>
                                                <span style={{ fontSize: 11, color: '#6B7280' }}>Timeline: <strong>{rec.time_to_impact}</strong></span>
                                            </div>
                                        </div>
                                        <div style={{
                                            padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                                            background: rec.confidence >= 85 ? '#ECFDF5' : rec.confidence >= 70 ? '#FFFBEB' : '#F9FAFB',
                                            color: rec.confidence >= 85 ? '#059669' : rec.confidence >= 70 ? '#D97706' : '#6B7280',
                                        }}>{rec.confidence >= 85 ? 'High' : rec.confidence >= 70 ? 'Medium' : 'Low'}</div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Metadata */}
                    <div style={{ display: 'flex', gap: 16, padding: '6px 4px', fontSize: 11, color: '#9CA3AF' }}>
                        <span>Model v2.1</span>
                        <span>·</span>
                        <span>Refreshed: {new Date().toLocaleTimeString()}</span>
                        <span>·</span>
                        <span>Horizon: {result.forecast_horizon_days}d</span>
                        <span>·</span>
                        <span>Scenario: {result.scenario}</span>
                    </div>
                </>
            )}
        </div>
    );
}
