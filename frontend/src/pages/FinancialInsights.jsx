import { useState, useEffect } from 'react';
import { IndianRupee, TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Calculator, ShieldAlert, Lightbulb } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart as RPieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, Legend } from 'recharts';
import { getFinancialImpact, simulateROI } from '../services/api';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';

/* ─── Formatters ─── */
const fmt = (n) => {
    if (!n && n !== 0) return '—';
    const abs = Math.abs(n);
    if (abs >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
    if (abs >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (abs >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
    return `₹${n}`;
};
const pct = (n) => `${n}%`;

/* ─── Shared Components ─── */
const Card = ({ title, subtitle, icon: Icon, children, className = '', accentColor }) => (
    <div className={`bg-white rounded-xl border border-gray-100 ${className}`}
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
        {accentColor && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: accentColor }} />}
        {title && (
            <div style={{ padding: '18px 24px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
                {Icon && (
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F0FDFA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={16} color="#0F766E" />
                    </div>
                )}
                <div>
                    <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>{title}</h3>
                    {subtitle && <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>{subtitle}</p>}
                </div>
            </div>
        )}
        <div style={{ padding: '14px 24px 22px' }}>{children}</div>
    </div>
);

const COLORS = ['#0F766E', '#D97706', '#6366F1', '#DC2626', '#2563EB'];

/* ═══════════════════ MAIN ═══════════════════ */
export default function FinancialInsights({ embedded }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [roiParams, setRoiParams] = useState({
        additional_budget: 500000,
        overtime_reduction_pct: 20,
        caseload_adjustment_pct: 0,
    });
    const [roiResult, setRoiResult] = useState(null);
    const [roiLoading, setRoiLoading] = useState(false);

    useEffect(() => {
        getFinancialImpact()
            .then(d => { setData(d); setError(null); })
            .catch(e => { console.error(e); setError('Failed to load financial data'); })
            .finally(() => setLoading(false));
    }, []);

    const handleROI = async () => {
        setRoiLoading(true);
        try { setRoiResult(await simulateROI(roiParams)); }
        catch (e) { console.error(e); }
        finally { setRoiLoading(false); }
    };

    if (loading) return <LoadingSpinner />;
    if (error) return (
        <div style={{ padding: 40, textAlign: 'center' }}>
            <ShieldAlert size={32} color="#DC2626" style={{ marginBottom: 12 }} />
            <p style={{ fontSize: 14, color: '#6B7280' }}>{error}</p>
            <button onClick={() => { setLoading(true); setError(null); getFinancialImpact().then(setData).catch(() => setError('Failed')).finally(() => setLoading(false)); }}
                style={{ marginTop: 12, padding: '8px 20px', borderRadius: 8, background: '#0F766E', color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Retry
            </button>
        </div>
    );
    if (!data) return null;

    const s = data.summary || {};
    const drivers = data.cost_drivers || [];
    const depts = data.department_breakdown || [];
    const fc = data.budget_forecast || {};
    const recs = data.optimization_recommendations || [];
    const noShow = data.no_show_impact || {};
    const delay = data.delay_impact || {};
    const overtime = data.overtime_impact || {};

    // Pie chart data for cost drivers
    const pieData = drivers.map((d, i) => ({ name: d.name, value: d.value, fill: COLORS[i % COLORS.length] }));

    // Sensitivity curve
    const sensitivity = [60, 80, 100, 120, 140, 160, 180, 200].map(v => ({
        volume: `${v}%`,
        loss: Math.round((s.risk_exposure || 0) * (v / 100) * (v / 100)),
    }));
    const threshold = sensitivity.findIndex(d => d.loss > (fc.total_monthly || 0) * 0.1);

    // Quick impact metrics 
    const totalLoss = (delay.delay_cost || 0) + (overtime.overtime_cost || 0) + (noShow.revenue_loss || 0);

    return (
        <div>
            {!embedded && <PageHeader title="Financial Insights" subtitle="Financial intelligence & optimization engine" icon={IndianRupee} />}

            {/* ══════ ROW 1: Financial Executive Summary (5-col metrics) ══════ */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
                {[
                    { label: 'Monthly Risk Exposure', value: fmt(s.risk_exposure), color: '#DC2626', bg: '#FEF2F2', icon: '⚠️' },
                    { label: 'Optimization Potential', value: fmt(s.optimization_potential), color: '#059669', bg: '#ECFDF5', icon: '💡' },
                    { label: 'Budget Utilization', value: pct(s.budget_utilization_pct), color: '#2563EB', bg: '#EFF6FF', icon: '📊' },
                    { label: 'Revenue Leakage', value: pct(s.revenue_leakage_pct), color: '#D97706', bg: '#FFFBEB', icon: '📉' },
                    { label: 'Net Strategic Impact', value: fmt(Math.abs(s.net_impact || 0)), color: '#DC2626', bg: '#F9FAFB', icon: '🎯' },
                ].map(m => (
                    <div key={m.label} style={{
                        padding: '16px 18px', borderRadius: 12, background: m.bg,
                        border: '1px solid #F3F4F6', position: 'relative',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <p style={{ fontSize: 10, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{m.label}</p>
                            <span style={{ fontSize: 14 }}>{m.icon}</span>
                        </div>
                        <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 800, color: m.color, lineHeight: 1 }}>{m.value}</p>
                    </div>
                ))}
            </div>

            {/* ══════ ROW 2: Impact Summary Cards (3-col) ══════ */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 18 }}>
                <Card title="Delay Impact" icon={TrendingDown} accentColor="#DC2626">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 2 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 12, color: '#6B7280' }}>Delayed Cases</span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{delay.delayed_cases}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 12, color: '#6B7280' }}>Total Delay Hours</span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{delay.total_delay_hours}h</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: '1px solid #F3F4F6', marginTop: 2 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>Total Cost</span>
                            <span style={{ fontSize: 14, fontWeight: 800, color: '#DC2626' }}>{fmt(delay.delay_cost)}</span>
                        </div>
                    </div>
                </Card>

                <Card title="Overtime Impact" icon={BarChart3} accentColor="#D97706">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 2 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 12, color: '#6B7280' }}>Total Overtime Hours</span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{overtime.total_overtime_hours}h</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 12, color: '#6B7280' }}>Rate per Hour</span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>₹950</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: '1px solid #F3F4F6', marginTop: 2 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>Total Cost</span>
                            <span style={{ fontSize: 14, fontWeight: 800, color: '#D97706' }}>{fmt(overtime.overtime_cost)}</span>
                        </div>
                    </div>
                </Card>

                <Card title="No-Show Impact" icon={PieChart} accentColor="#6366F1">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 2 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 12, color: '#6B7280' }}>No-Show Rate</span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{noShow.no_show_rate_pct}%</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 12, color: '#6B7280' }}>Total No-Shows</span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{noShow.no_shows}/{noShow.total_appointments}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: '1px solid #F3F4F6', marginTop: 2 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>Revenue Loss</span>
                            <span style={{ fontSize: 14, fontWeight: 800, color: '#6366F1' }}>{fmt(noShow.revenue_loss)}</span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* ══════ ROW 3: Cost Drivers (Pie + Bars) + Budget Forecast ══════ */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
                <Card title="Cost Drivers Breakdown" subtitle="Contribution to total financial loss" icon={DollarSign}>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 16, alignItems: 'center', marginTop: 4 }}>
                        <ResponsiveContainer width={120} height={120}>
                            <RPieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={30} outerRadius={55} dataKey="value" stroke="none">
                                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                            </RPieChart>
                        </ResponsiveContainer>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {drivers.map((d, i) => (
                                <div key={d.name}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                                        <span style={{ fontSize: 11, fontWeight: 500, color: '#374151', display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span style={{ width: 8, height: 8, borderRadius: 2, background: COLORS[i % COLORS.length], display: 'inline-block' }} />
                                            {d.name}
                                        </span>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: '#111827' }}>{fmt(d.value)} <span style={{ color: '#9CA3AF', fontWeight: 400 }}>({d.pct}%)</span></span>
                                    </div>
                                    <div style={{ height: 4, borderRadius: 2, background: '#F3F4F6', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${d.pct}%`, borderRadius: 2, background: COLORS[i % COLORS.length], transition: 'width 0.6s ease' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>

                <Card title="Budget Forecast" subtitle="Monthly, quarterly & risk-adjusted" icon={Calculator}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                        {[
                            { l: 'Monthly Staff Cost', v: fc.monthly_staff_cost, icon: '👥' },
                            { l: 'Monthly Operational', v: fc.monthly_operational, icon: '⚙️' },
                            { l: 'Monthly Equipment', v: fc.monthly_equipment, icon: '🏥' },
                        ].map(i => (
                            <div key={i.l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: 8, background: '#F9FAFB' }}>
                                <span style={{ fontSize: 12, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ fontSize: 13 }}>{i.icon}</span> {i.l}</span>
                                <span style={{ fontSize: 13, fontWeight: 600, color: '#111827', fontVariantNumeric: 'tabular-nums' }}>{fmt(i.v)}</span>
                            </div>
                        ))}
                        <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 8, marginTop: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 12px' }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Total Monthly</span>
                                <span style={{ fontSize: 14, fontWeight: 800, color: '#111827' }}>{fmt(fc.total_monthly)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 12px' }}>
                                <span style={{ fontSize: 12, color: '#6B7280' }}>Quarterly Forecast</span>
                                <span style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>{fmt(fc.quarterly_forecast)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px', borderRadius: 6, background: '#FFFBEB' }}>
                                <span style={{ fontSize: 12, fontWeight: 500, color: '#92400E' }}>Risk-Adjusted Quarterly</span>
                                <span style={{ fontSize: 13, fontWeight: 800, color: '#D97706' }}>{fmt(fc.risk_adjusted_quarterly)}</span>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* ══════ ROW 4: Charts — Sensitivity + Department Costs (2-col) ══════ */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
                <Card title="Sensitivity Analysis" subtitle="Case volume % vs financial loss (₹)" icon={TrendingUp}>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={sensitivity}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                            <XAxis dataKey="volume" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} tickFormatter={v => fmt(v)} />
                            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 11 }} formatter={v => fmt(v)} />
                            <Line type="monotone" dataKey="loss" stroke="#0F766E" strokeWidth={2} dot={{ r: 3, fill: '#0F766E' }} name="Financial Loss" />
                            {threshold >= 0 && <ReferenceLine x={sensitivity[threshold].volume} stroke="#DC2626" strokeDasharray="5 3" label={{ value: 'Break-even', fontSize: 9, fill: '#DC2626' }} />}
                        </LineChart>
                    </ResponsiveContainer>
                </Card>

                <Card title="Department Cost Distribution" subtitle="Staff + overtime + no-show per department" icon={BarChart3}>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={depts} barGap={2}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                            <XAxis dataKey="department" tick={{ fontSize: 9, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} tickFormatter={v => fmt(v)} />
                            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 11 }} formatter={v => fmt(v)} />
                            <Bar dataKey="staff_cost" fill="#0F766E" radius={[3, 3, 0, 0]} name="Staff" stackId="a" />
                            <Bar dataKey="overtime_cost" fill="#D97706" name="Overtime" stackId="a" />
                            <Bar dataKey="no_show_loss" fill="#94A3B8" radius={[3, 3, 0, 0]} name="No-Show" stackId="a" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            {/* ══════ ROW 5: ROI Simulator (full width) ══════ */}
            <Card title="ROI Impact Simulator" subtitle="Estimate returns from budget & operational changes" icon={Calculator} accentColor="#0F766E" className="mb-4">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                    {/* Input sliders */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {[
                            { label: 'Additional Staffing Budget', key: 'additional_budget', min: 0, max: 3000000, step: 100000, format: v => fmt(v) },
                            { label: 'Overtime Reduction Target', key: 'overtime_reduction_pct', min: 0, max: 80, step: 5, format: v => `${v}%` },
                            { label: 'Caseload Adjustment', key: 'caseload_adjustment_pct', min: -30, max: 30, step: 5, format: v => `${v}%` },
                        ].map(sl => (
                            <div key={sl.key}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                                    <span style={{ fontSize: 12, fontWeight: 500, color: '#374151' }}>{sl.label}</span>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: '#0F766E', fontVariantNumeric: 'tabular-nums' }}>{sl.format(roiParams[sl.key])}</span>
                                </div>
                                <input type="range" min={sl.min} max={sl.max} step={sl.step} value={roiParams[sl.key]}
                                    onChange={e => setRoiParams(p => ({ ...p, [sl.key]: Number(e.target.value) }))}
                                    style={{ width: '100%', accentColor: '#0F766E', cursor: 'pointer' }} />
                            </div>
                        ))}
                        <button onClick={handleROI} disabled={roiLoading}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                padding: '10px 24px', borderRadius: 8, background: '#0F766E', color: '#fff',
                                fontSize: 13, fontWeight: 600, border: 'none', cursor: roiLoading ? 'wait' : 'pointer',
                                opacity: roiLoading ? 0.7 : 1, alignSelf: 'flex-start', marginTop: 4,
                            }}>
                            <Calculator size={14} />
                            {roiLoading ? 'Calculating...' : 'Calculate ROI'}
                        </button>
                    </div>

                    {/* Output results */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
                        {roiResult ? (
                            [
                                { l: 'SLA Improvement', v: `+${roiResult.sla_change_pct}%`, c: '#059669', bg: '#ECFDF5' },
                                { l: 'Annual Cost Reduction', v: fmt(roiResult.cost_reduction), c: '#059669', bg: '#ECFDF5' },
                                { l: 'Net Savings', v: fmt(roiResult.net_savings), c: roiResult.net_savings >= 0 ? '#059669' : '#DC2626', bg: roiResult.net_savings >= 0 ? '#ECFDF5' : '#FEF2F2' },
                                { l: 'Break-even Period', v: `${roiResult.breakeven_months} months`, c: '#2563EB', bg: '#EFF6FF' },
                                { l: 'New Hires Possible', v: `${roiResult.new_staff_possible} staff`, c: '#0F766E', bg: '#F0FDFA' },
                            ].map(m => (
                                <div key={m.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', borderRadius: 8, background: m.bg }}>
                                    <span style={{ fontSize: 12, fontWeight: 500, color: '#374151' }}>{m.l}</span>
                                    <span style={{ fontSize: 14, fontWeight: 800, color: m.c }}>{m.v}</span>
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: 32, borderRadius: 12, background: '#F9FAFB', border: '1px dashed #E5E7EB' }}>
                                <Calculator size={24} color="#D1D5DB" style={{ marginBottom: 8 }} />
                                <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0 }}>Adjust parameters and click "Calculate ROI"</p>
                                <p style={{ fontSize: 11, color: '#D1D5DB', marginTop: 4 }}>Results will appear here</p>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            {/* ══════ ROW 6: Department Efficiency Table (full width) ══════ */}
            <Card title="Department Financial Efficiency" subtitle="Cost, revenue, and performance metrics per department" icon={BarChart3} className="mb-4">
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                                {['Department', 'Total Cost', 'Cost/Case', 'Revenue/Case', 'Overtime Ratio', 'Efficiency'].map(h => (
                                    <th key={h} style={{ textAlign: h === 'Department' ? 'left' : 'right', padding: '10px 14px', fontWeight: 600, color: '#6B7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {depts.map((d, i) => (
                                <tr key={d.department} style={{ borderBottom: '1px solid #F3F4F6', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                                    <td style={{ padding: '12px 14px', fontWeight: 600 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: d.efficiency_score >= 80 ? '#059669' : d.efficiency_score >= 60 ? '#D97706' : '#DC2626' }} />
                                            {d.department}
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 600 }}>{fmt(d.total_cost)}</td>
                                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>{fmt(d.cost_per_case)}</td>
                                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>{fmt(d.revenue_per_case)}</td>
                                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                                        <span style={{ color: d.overtime_ratio > 15 ? '#DC2626' : '#374151', fontWeight: d.overtime_ratio > 15 ? 700 : 400 }}>
                                            {d.overtime_ratio}%
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                            <div style={{ width: 40, height: 4, borderRadius: 2, background: '#F3F4F6', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${d.efficiency_score}%`, borderRadius: 2, background: d.efficiency_score >= 80 ? '#059669' : d.efficiency_score >= 60 ? '#D97706' : '#DC2626' }} />
                                            </div>
                                            <span style={{
                                                padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700,
                                                background: d.efficiency_score >= 80 ? '#ECFDF5' : d.efficiency_score >= 60 ? '#FFFBEB' : '#FEF2F2',
                                                color: d.efficiency_score >= 80 ? '#059669' : d.efficiency_score >= 60 ? '#D97706' : '#DC2626',
                                            }}>{d.efficiency_score}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* ══════ ROW 7: Optimization Recommendations (full width) ══════ */}
            {recs.length > 0 && (
                <Card title="Financial Optimization Recommendations" subtitle="Ranked by estimated savings potential" icon={Lightbulb} accentColor="#059669" className="mb-4">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {recs.map((rec, i) => (
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
                                    <div style={{ display: 'flex', gap: 20, marginTop: 4 }}>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: '#059669' }}>Saves {fmt(rec.savings)}</span>
                                        <span style={{ fontSize: 11, color: '#6B7280' }}>Complexity: <strong style={{ color: rec.complexity === 'Low' ? '#059669' : rec.complexity === 'High' ? '#DC2626' : '#D97706' }}>{rec.complexity}</strong></span>
                                        <span style={{ fontSize: 11, color: '#6B7280' }}>Confidence: <strong>{rec.confidence}%</strong></span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Metadata */}
            <div style={{ display: 'flex', gap: 16, padding: '8px 4px', fontSize: 11, color: '#9CA3AF' }}>
                <span>Model v2.1</span>
                <span>·</span>
                <span>Currency: {data.currency}</span>
                <span>·</span>
                <span>Data refreshed: {new Date().toLocaleTimeString()}</span>
                <span>·</span>
                <span>Forecast horizon: 30 days</span>
            </div>
        </div>
    );
}
