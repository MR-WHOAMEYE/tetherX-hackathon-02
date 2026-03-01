import { useState, useEffect } from 'react';
import { BarChart3, Crown, Medal, Award, Clock, TrendingUp, AlertTriangle, User, Stethoscope } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { getDeptWorkload, getStaffWorkload, getHourlyHeatmap, getWeeklyTrend } from '../services/api';
import PageHeader from '../components/PageHeader';
import ChartCard from '../components/ChartCard';
import LoadingSpinner from '../components/LoadingSpinner';

const COLORS = ['#0F766E', '#0284C7', '#10B981', '#D97706', '#DC2626', '#7C3AED'];

const DEPT_STYLES = {
    Cardiology: { bg: '#F0FDFA', text: '#134E4A', border: '#99F6E4', dot: '#0F766E' },
    Emergency: { bg: '#EFF6FF', text: '#1E3A8A', border: '#BFDBFE', dot: '#0284C7' },
    ICU: { bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0', dot: '#10B981' },
    Neurology: { bg: '#FFFBEB', text: '#92400E', border: '#FDE68A', dot: '#D97706' },
    Orthopedics: { bg: '#FEF2F2', text: '#991B1B', border: '#FECACA', dot: '#DC2626' },
    Pediatrics: { bg: '#F5F3FF', text: '#5B21B6', border: '#DDD6FE', dot: '#7C3AED' },
    General: { bg: '#F8FAFC', text: '#334155', border: '#E2E8F0', dot: '#64748B' },
};

const RANK_STYLES = [
    { bg: 'linear-gradient(135deg, #FEF3C7, #FDE68A)', border: '#F59E0B', icon: Crown, color: '#B45309', shadow: '0 2px 8px rgba(245,158,11,0.25)' },
    { bg: 'linear-gradient(135deg, #F1F5F9, #E2E8F0)', border: '#94A3B8', icon: Medal, color: '#475569', shadow: '0 2px 8px rgba(148,163,184,0.25)' },
    { bg: 'linear-gradient(135deg, #FEF3E2, #FDDCB5)', border: '#D97706', icon: Award, color: '#92400E', shadow: '0 2px 8px rgba(217,119,6,0.2)' },
];

const getOvertimeStyle = (hours) => {
    if (hours >= 5) return { bg: '#FEF2F2', text: '#DC2626', label: 'High' };
    if (hours >= 2) return { bg: '#FFFBEB', text: '#D97706', label: 'Moderate' };
    return { bg: '#F0FDF4', text: '#16A34A', label: 'Low' };
};

const getResolutionStyle = (time) => {
    if (time <= 2) return { bg: '#ECFDF5', text: '#059669', label: 'Fast' };
    if (time <= 5) return { bg: '#EFF6FF', text: '#2563EB', label: 'Normal' };
    return { bg: '#FEF2F2', text: '#DC2626', label: 'Slow' };
};

const getInitials = (name) => {
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function WorkloadAnalytics({ embedded }) {
    const [deptData, setDeptData] = useState([]);
    const [staffData, setStaffData] = useState([]);
    const [heatmap, setHeatmap] = useState(null);
    const [weekly, setWeekly] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getDeptWorkload(), getStaffWorkload(), getHourlyHeatmap(), getWeeklyTrend()])
            .then(([d, s, h, w]) => { setDeptData(d); setStaffData(s); setHeatmap(h); setWeekly(w); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <LoadingSpinner />;

    const getHeatColor = (val, max) => {
        const ratio = val / (max || 1);
        if (ratio > 0.8) return '#991B1B';
        if (ratio > 0.6) return '#DC2626';
        if (ratio > 0.4) return '#F59E0B';
        if (ratio > 0.2) return '#22D3EE';
        return '#E5E7EB';
    };

    const maxHeat = heatmap ? Math.max(...heatmap.data.flat()) : 1;
    const maxCases = staffData.length > 0 ? Math.max(...staffData.slice(0, 10).map(s => s.cases_handled)) : 1;

    return (
        <div>
            {!embedded && <PageHeader title="Workload Analytics" subtitle="Department and staff workload analysis" icon={BarChart3} />}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <ChartCard title="Department Workload" subtitle="Total cases per department" delay={0}>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={deptData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis type="number" tick={{ fontSize: 11, fill: '#6B7280' }} />
                            <YAxis dataKey="department" type="category" tick={{ fontSize: 11, fill: '#6B7280' }} width={85} />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB' }} />
                            <Bar dataKey="total_cases" fill="#0F766E" radius={[0, 6, 6, 0]} name="Total" />
                            <Bar dataKey="active_cases" fill="#0284C7" radius={[0, 6, 6, 0]} name="Active" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <div
                    className="bg-white rounded-xl border border-gray-100"
                    style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)', padding: 0, overflow: 'hidden' }}
                >
                    {/* Header */}
                    <div style={{ padding: '20px 24px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: 0, fontFamily: 'var(--font-family-display)' }}>
                                    Case Distribution
                                </h3>
                                <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 3, margin: '3px 0 0' }}>Pie breakdown by department</p>
                            </div>
                            <div style={{
                                padding: '4px 10px', borderRadius: 6,
                                background: '#F0FDFA', border: '1px solid #CCFBF1',
                                fontSize: 11, fontWeight: 600, color: '#0F766E',
                            }}>
                                {deptData.length} Depts
                            </div>
                        </div>
                    </div>

                    {/* Chart + Legend Side by Side */}
                    <div style={{ display: 'flex', alignItems: 'center', padding: '16px 24px 24px', gap: 16 }}>
                        {/* Donut Chart with Center Stat */}
                        <div style={{ position: 'relative', flexShrink: 0, width: 200, height: 200 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={deptData}
                                        dataKey="total_cases"
                                        nameKey="department"
                                        cx="50%" cy="50%"
                                        outerRadius={90}
                                        innerRadius={58}
                                        paddingAngle={2}
                                        stroke="rgba(255,255,255,0.8)"
                                        strokeWidth={2}
                                    >
                                        {deptData.map((_, i) => (
                                            <Cell
                                                key={i}
                                                fill={COLORS[i % COLORS.length]}
                                                style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: 10, border: '1px solid #E2E8F0',
                                            fontSize: 11, boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                                            padding: '8px 12px',
                                        }}
                                        formatter={(value, name) => [`${value} cases`, name]}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center KPI */}
                            <div style={{
                                position: 'absolute', top: '50%', left: '50%',
                                transform: 'translate(-50%, -50%)',
                                textAlign: 'center', pointerEvents: 'none',
                            }}>
                                <div style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', lineHeight: 1.1, fontFamily: 'var(--font-family-display)' }}>
                                    {deptData.reduce((sum, d) => sum + d.total_cases, 0).toLocaleString()}
                                </div>
                                <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 500, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Total
                                </div>
                            </div>
                        </div>

                        {/* Legend with Stats */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {(() => {
                                const total = deptData.reduce((sum, d) => sum + d.total_cases, 0);
                                const maxDept = Math.max(...deptData.map(d => d.total_cases));
                                return deptData.map((d, i) => {
                                    const pct = total > 0 ? ((d.total_cases / total) * 100).toFixed(1) : 0;
                                    const barWidth = maxDept > 0 ? ((d.total_cases / maxDept) * 100).toFixed(0) : 0;
                                    return (
                                        <div
                                            key={d.department}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 10,
                                                padding: '6px 10px', borderRadius: 8,
                                                transition: 'background 0.15s ease',
                                                cursor: 'default',
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = '#F8FAFC'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                        >
                                            <div style={{
                                                width: 10, height: 10, borderRadius: 3,
                                                background: COLORS[i % COLORS.length],
                                                flexShrink: 0,
                                                boxShadow: `0 1px 3px ${COLORS[i % COLORS.length]}40`,
                                            }} />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                                                    <span style={{ fontSize: 12, fontWeight: 500, color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {d.department}
                                                    </span>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                                                        <span style={{ fontSize: 12, fontWeight: 700, color: '#0F172A' }}>{d.total_cases}</span>
                                                        <span style={{ fontSize: 10, color: '#94A3B8', fontWeight: 500 }}>{pct}%</span>
                                                    </div>
                                                </div>
                                                <div style={{ width: '100%', height: 3, borderRadius: 2, background: '#F1F5F9', overflow: 'hidden' }}>
                                                    <div style={{
                                                        width: `${barWidth}%`, height: '100%', borderRadius: 2,
                                                        background: COLORS[i % COLORS.length],
                                                        transition: 'width 0.6s ease',
                                                        opacity: 0.7,
                                                    }} />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <ChartCard title="Weekly Trend" subtitle="Case volume across weeks" delay={2}>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={weekly}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#6B7280' }} />
                            <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB' }} />
                            <Line type="monotone" dataKey="cases" stroke="#0F766E" strokeWidth={2} dot={{ fill: '#0F766E', r: 3 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Hourly Heatmap" subtitle="Case creation patterns by day × hour" delay={3}>
                    {heatmap && (
                        <div className="overflow-x-auto">
                            <div className="inline-block min-w-full">
                                <div className="flex gap-0.5">
                                    <div className="w-16" />
                                    {heatmap.hours.filter((_, i) => i % 3 === 0).map(h => (
                                        <div key={h} className="text-[9px] text-text-muted text-center" style={{ width: `${100 / 8}%` }}>{h}:00</div>
                                    ))}
                                </div>
                                {heatmap.days.map((day, di) => (
                                    <div key={day} className="flex items-center gap-0.5 mb-0.5">
                                        <div className="w-16 text-[10px] text-text-secondary font-medium truncate pr-1">{day.slice(0, 3)}</div>
                                        <div className="flex-1 flex gap-0.5">
                                            {heatmap.data[di].map((val, hi) => (
                                                <div
                                                    key={hi}
                                                    className="flex-1 h-5 rounded-sm transition-colors"
                                                    style={{ backgroundColor: getHeatColor(val, maxHeat) }}
                                                    title={`${day} ${hi}:00 — ${val} cases`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </ChartCard>
            </div>

            {/* ═══════════════ PREMIUM STAFF TABLE ═══════════════ */}
            <ChartCard title="Top Staff by Caseload" subtitle="Staff members handling most cases" delay={4}>
                <div className="overflow-x-auto" style={{ margin: '0 -4px' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 4px', fontSize: 13 }}>
                        <thead>
                            <tr>
                                <th style={{
                                    textAlign: 'left', padding: '10px 16px', fontSize: 10, fontWeight: 700,
                                    textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748B',
                                    borderBottom: '2px solid #E2E8F0', background: 'transparent', width: 56
                                }}>S.No</th>
                                <th style={{
                                    textAlign: 'left', padding: '10px 16px', fontSize: 10, fontWeight: 700,
                                    textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748B',
                                    borderBottom: '2px solid #E2E8F0', background: 'transparent'
                                }}>Staff Member</th>
                                <th style={{
                                    textAlign: 'left', padding: '10px 16px', fontSize: 10, fontWeight: 700,
                                    textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748B',
                                    borderBottom: '2px solid #E2E8F0', background: 'transparent'
                                }}>Department</th>
                                <th style={{
                                    textAlign: 'center', padding: '10px 16px', fontSize: 10, fontWeight: 700,
                                    textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748B',
                                    borderBottom: '2px solid #E2E8F0', background: 'transparent'
                                }}>Cases Handled</th>
                                <th style={{
                                    textAlign: 'center', padding: '10px 16px', fontSize: 10, fontWeight: 700,
                                    textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748B',
                                    borderBottom: '2px solid #E2E8F0', background: 'transparent'
                                }}>Shift (h)</th>
                                <th style={{
                                    textAlign: 'center', padding: '10px 16px', fontSize: 10, fontWeight: 700,
                                    textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748B',
                                    borderBottom: '2px solid #E2E8F0', background: 'transparent'
                                }}>Overtime</th>
                                <th style={{
                                    textAlign: 'center', padding: '10px 16px', fontSize: 10, fontWeight: 700,
                                    textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748B',
                                    borderBottom: '2px solid #E2E8F0', background: 'transparent'
                                }}>Avg Resolution</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staffData.slice(0, 10).map((s, index) => {
                                const rank = index;
                                const rankStyle = RANK_STYLES[rank];
                                const deptStyle = DEPT_STYLES[s.department] || DEPT_STYLES.General;
                                const overtimeStyle = getOvertimeStyle(s.overtime_hours);
                                const resStyle = getResolutionStyle(s.avg_resolution_time);
                                const casePercent = ((s.cases_handled / maxCases) * 100).toFixed(0);
                                const isDoctor = s.name.startsWith('Dr.');
                                const RoleIcon = isDoctor ? Stethoscope : User;

                                return (
                                    <tr
                                        key={s.staff_id}
                                        style={{
                                            background: rank < 3 ? 'transparent' : (index % 2 === 0 ? '#FAFBFC' : '#FFFFFF'),
                                            transition: 'all 0.2s ease',
                                            cursor: 'default',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = '#F0FDFA';
                                            e.currentTarget.style.transform = 'scale(1.002)';
                                            e.currentTarget.style.boxShadow = '0 2px 12px rgba(15,118,110,0.08)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = rank < 3 ? 'transparent' : (index % 2 === 0 ? '#FAFBFC' : '#FFFFFF');
                                            e.currentTarget.style.transform = 'scale(1)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        {/* S.No */}
                                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #F1F5F9' }}>
                                            <div style={{
                                                fontSize: 13, fontWeight: 600, color: '#475569',
                                                textAlign: 'center',
                                            }}>
                                                {index + 1}
                                            </div>
                                        </td>

                                        {/* Staff Member */}
                                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #F1F5F9' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{
                                                    width: 38, height: 38, borderRadius: 10,
                                                    background: isDoctor
                                                        ? 'linear-gradient(135deg, #0F766E, #14B8A6)'
                                                        : 'linear-gradient(135deg, #0284C7, #38BDF8)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: '#FFFFFF', fontSize: 12, fontWeight: 700, letterSpacing: '0.02em',
                                                    boxShadow: isDoctor
                                                        ? '0 2px 8px rgba(15,118,110,0.25)'
                                                        : '0 2px 8px rgba(2,132,199,0.25)',
                                                    flexShrink: 0,
                                                }}>
                                                    {getInitials(s.name)}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, color: '#0F172A', fontSize: 13, lineHeight: 1.3 }}>
                                                        {s.name}
                                                    </div>
                                                    <div style={{
                                                        display: 'flex', alignItems: 'center', gap: 4,
                                                        fontSize: 11, color: '#94A3B8', marginTop: 2,
                                                    }}>
                                                        <RoleIcon size={10} />
                                                        <span>{isDoctor ? 'Physician' : 'Nurse'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Department Badge */}
                                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #F1F5F9' }}>
                                            <div style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                                padding: '5px 12px', borderRadius: 20,
                                                background: deptStyle.bg, border: `1px solid ${deptStyle.border}`,
                                                fontSize: 11, fontWeight: 600, color: deptStyle.text,
                                            }}>
                                                <div style={{
                                                    width: 6, height: 6, borderRadius: '50%',
                                                    background: deptStyle.dot,
                                                }} />
                                                {s.department}
                                            </div>
                                        </td>

                                        {/* Cases Handled */}
                                        <td style={{ padding: '12px 16px', textAlign: 'center', borderBottom: '1px solid #F1F5F9' }}>
                                            <span style={{ fontWeight: 700, fontSize: 14, color: '#0F172A' }}>
                                                {s.cases_handled}
                                            </span>
                                        </td>

                                        {/* Shift Hours */}
                                        <td style={{ padding: '12px 16px', textAlign: 'center', borderBottom: '1px solid #F1F5F9' }}>
                                            <div style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                                fontSize: 13, fontWeight: 500, color: '#334155',
                                            }}>
                                                <Clock size={12} color="#94A3B8" />
                                                {s.shift_hours}h
                                            </div>
                                        </td>

                                        {/* Overtime */}
                                        <td style={{ padding: '12px 16px', textAlign: 'center', borderBottom: '1px solid #F1F5F9' }}>
                                            <div style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 5,
                                                padding: '4px 10px', borderRadius: 6,
                                                background: overtimeStyle.bg,
                                                fontSize: 12, fontWeight: 600, color: overtimeStyle.text,
                                            }}>
                                                {s.overtime_hours >= 5 && <AlertTriangle size={11} />}
                                                {s.overtime_hours}h
                                            </div>
                                        </td>

                                        {/* Avg Resolution */}
                                        <td style={{ padding: '12px 16px', textAlign: 'center', borderBottom: '1px solid #F1F5F9' }}>
                                            <div style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 5,
                                                padding: '4px 10px', borderRadius: 6,
                                                background: resStyle.bg,
                                                fontSize: 12, fontWeight: 600, color: resStyle.text,
                                            }}>
                                                <TrendingUp size={11} />
                                                {s.avg_resolution_time}h
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Table Footer Summary */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginTop: 16, padding: '12px 16px',
                    background: 'linear-gradient(135deg, #F0FDFA, #ECFDF5)',
                    borderRadius: 10, border: '1px solid #CCFBF1',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ fontSize: 11, color: '#64748B' }}>
                            Showing <span style={{ fontWeight: 700, color: '#0F766E' }}>{Math.min(10, staffData.length)}</span> of{' '}
                            <span style={{ fontWeight: 700, color: '#0F766E' }}>{staffData.length}</span> staff members
                        </div>
                    </div>

                </div>
            </ChartCard>
        </div>
    );
}
