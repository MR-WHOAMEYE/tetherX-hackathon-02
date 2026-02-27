import { useState, useEffect, memo } from 'react';
import { Target, Play, TrendingUp, Users, AlertTriangle, Activity, Shield, ChevronDown, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { simulateScenario } from '../services/api';
import PageHeader from '../components/PageHeader';

const SCENARIOS = [
    { id: 'pandemic', label: 'Pandemic Surge', desc: '2.5× case volume, 20% staff reduction', icon: '🦠', gradient: 'from-red-500 to-rose-600' },
    { id: 'surge_30', label: '30% Volume Surge', desc: '30% increase in case volume', icon: '📈', gradient: 'from-amber-500 to-orange-500' },
    { id: 'staff_shortage', label: 'Staff Shortage', desc: '35% staff reduction scenario', icon: '👥', gradient: 'from-violet-500 to-purple-600' },
];

const RISK_CONFIG = {
    Critical: { color: '#EF4444', bg: 'rgba(254,242,242,0.85)', border: '#FECACA', barGrad: 'linear-gradient(90deg,#F87171,#DC2626)', tint: 'rgba(239,68,68,0.04)' },
    Severe: { color: '#F97316', bg: 'rgba(255,247,237,0.85)', border: '#FED7AA', barGrad: 'linear-gradient(90deg,#FB923C,#EA580C)', tint: 'rgba(249,115,22,0.03)' },
    High: { color: '#F59E0B', bg: 'rgba(255,251,235,0.85)', border: '#FDE68A', barGrad: 'linear-gradient(90deg,#FBBF24,#D97706)', tint: 'rgba(245,158,11,0.03)' },
    Medium: { color: '#3B82F6', bg: 'rgba(239,246,255,0.85)', border: '#BFDBFE', barGrad: 'linear-gradient(90deg,#60A5FA,#2563EB)', tint: 'rgba(59,130,246,0.03)' },
    Low: { color: '#10B981', bg: 'rgba(236,253,245,0.85)', border: '#A7F3D0', barGrad: 'linear-gradient(90deg,#34D399,#059669)', tint: 'rgba(16,185,129,0.03)' },
};

function getRiskTier(stress) {
    if (stress > 90) return 'Critical';
    if (stress > 75) return 'Severe';
    if (stress > 60) return 'High';
    if (stress > 40) return 'Medium';
    return 'Low';
}

/* ── Animated Count-Up ── */
const CountUp = memo(function CountUp({ value, duration = 700, prefix = '', suffix = '' }) {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
        const target = typeof value === 'number' ? value : parseFloat(value) || 0;
        let raf;
        const start = performance.now();
        const step = (now) => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setDisplay(Math.round(eased * target));
            if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
    }, [value, duration]);
    return <>{prefix}{display}{suffix}</>;
});

/* ── Animated Stress Bar ── */
const StressBar = memo(function StressBar({ stress, tier }) {
    const c = RISK_CONFIG[tier] || RISK_CONFIG.Medium;
    const isCritical = stress >= 95;
    const isHigh = stress > 80;
    return (
        <div className="relative group">
            <div className="flex justify-between items-center mb-1.5">
                <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Stress Level</span>
                <motion.span
                    key={stress}
                    initial={{ scale: 1.3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-sm font-black tabular-nums"
                    style={{ color: c.color }}
                ><CountUp value={stress} suffix="%" /></motion.span>
            </div>
            {/* Bar container with optional pulse glow */}
            <div className="relative">
                {isCritical && (
                    <motion.div
                        animate={{ boxShadow: [`0 0 0px ${c.color}00`, `0 0 10px ${c.color}30`, `0 0 0px ${c.color}00`] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute -inset-1 rounded-full pointer-events-none"
                    />
                )}
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stress}%` }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full rounded-full relative"
                        style={{ background: c.barGrad }}
                    >
                        {isHigh && (
                            <motion.div
                                animate={{ opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                className="absolute inset-0 rounded-full bg-white/20"
                            />
                        )}
                    </motion.div>
                </div>
            </div>
            {/* Hover tooltip */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-gray-900 text-white text-[10px] font-bold
                opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 shadow-lg">
                {stress}% operational stress
            </div>
        </div>
    );
});

/* ── Before/After Comparison ── */
const CompareBar = memo(function CompareBar({ label, before, after, color }) {
    const maxVal = Math.max(before, after, 1);
    const increased = after > before;
    const decreased = after < before;
    const changePct = before > 0 ? Math.round(((after - before) / before) * 100) : 0;
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-text-secondary">{label}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${increased ? 'bg-red-100 text-red-600' : decreased ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                    {increased ? '↑' : decreased ? '↓' : '—'} {Math.abs(changePct)}%
                </span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold w-7 text-right text-text-muted tabular-nums">{before}</span>
                <div className="flex-1 flex flex-col gap-[3px]">
                    <div className="w-full h-[5px] bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(before / maxVal) * 100}%` }}
                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            className="h-full rounded-full bg-gray-300/80"
                        />
                    </div>
                    <div className="w-full h-[5px] bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(after / maxVal) * 100}%` }}
                            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                            className="h-full rounded-full"
                            style={{ background: color }}
                        />
                    </div>
                </div>
                <ArrowRight size={10} className="text-text-muted flex-shrink-0" />
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-[10px] font-bold w-7 tabular-nums"
                    style={{ color }}
                ><CountUp value={after} /></motion.span>
            </div>
            <div className="flex text-[8px] text-text-muted pl-9 gap-4 uppercase tracking-wider font-medium">
                <span>Before</span><span className="ml-auto mr-9">After</span>
            </div>
        </div>
    );
});

/* ── Recommendation Tags ── */
const RecommendationTag = memo(function RecommendationTag({ text, index }) {
    const isImmediate = text.toLowerCase().includes('immediately') || text.toLowerCase().includes('emergency') || text.toLowerCase().includes('activate');
    const isUrgent = text.toLowerCase().includes('add') || text.toLowerCase().includes('extend') || text.toLowerCase().includes('prioritize');
    const tag = isImmediate ? { label: 'Immediate', emoji: '⚡', cls: 'bg-red-100 text-red-700 ring-1 ring-red-200/60' }
        : isUrgent ? { label: 'Urgent', emoji: '⚠️', cls: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200/60' }
            : { label: 'Planned', emoji: '📋', cls: 'bg-blue-100 text-blue-700 ring-1 ring-blue-200/60' };
    return (
        <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-start gap-2 text-[11px] leading-relaxed"
        >
            <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold flex-shrink-0 mt-0.5 ${tag.cls}`}>
                {isImmediate && (
                    <motion.span
                        animate={{ opacity: [1, 0.4, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 mr-0.5"
                    />
                )}
                {tag.emoji} {tag.label}
            </span>
            <span className="text-text-secondary">{text}</span>
        </motion.div>
    );
});

/* ── Impact Summary Panel ── */
const ImpactSummary = memo(function ImpactSummary({ result }) {
    const depts = result.departments || [];
    const totalCaseBefore = depts.reduce((a, d) => a + d.current_cases, 0);
    const totalCaseAfter = depts.reduce((a, d) => a + d.projected_cases, 0);
    const totalStaffBefore = depts.reduce((a, d) => a + d.current_staff, 0);
    const totalStaffAfter = depts.reduce((a, d) => a + d.projected_staff, 0);
    const caseIncrease = totalCaseBefore > 0 ? Math.round(((totalCaseAfter - totalCaseBefore) / totalCaseBefore) * 100) : 0;
    const staffChange = totalStaffBefore > 0 ? Math.round(((totalStaffAfter - totalStaffBefore) / totalStaffBefore) * 100) : 0;
    const avgStress = depts.length > 0 ? Math.round(depts.reduce((a, d) => a + d.stress_level, 0) / depts.length) : 0;
    const criticalCount = depts.filter(d => d.stress_level > 80).length;
    const risk = result.overall_risk;
    const isExtreme = risk > 80;

    const kpis = [
        { label: 'Case Volume', value: caseIncrease, suffix: '%', icon: TrendingUp, color: caseIncrease > 0 ? '#EF4444' : '#10B981', size: 'normal' },
        { label: 'Staff Impact', value: staffChange, suffix: '%', icon: Users, color: staffChange < 0 ? '#EF4444' : '#10B981', size: 'normal' },
        { label: 'Avg Stress', value: avgStress, suffix: '', icon: Activity, color: avgStress > 70 ? '#EF4444' : avgStress > 50 ? '#F59E0B' : '#10B981', size: 'normal' },
        { label: 'Critical Depts', value: criticalCount, suffix: `/${depts.length}`, icon: AlertTriangle, color: criticalCount > 2 ? '#EF4444' : '#F59E0B', size: 'normal' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6 rounded-2xl relative overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, #021B1A 0%, #042F2E 30%, #0A3D3C 60%, #0D4F4D 100%)',
                boxShadow: isExtreme
                    ? '0 4px 30px rgba(0,0,0,0.25), 0 0 50px rgba(239,68,68,0.1)'
                    : '0 4px 25px rgba(0,0,0,0.2)',
            }}
        >
            {/* Top shine line */}
            <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Pulse glow */}
            {isExtreme && (
                <motion.div
                    animate={{ opacity: [0.03, 0.1, 0.03] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute inset-0 bg-red-500 pointer-events-none"
                />
            )}

            <div className="relative z-10 p-6">
                {/* Header row */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h3 className="text-white font-bold text-lg tracking-tight">{result.scenario}</h3>
                        <p className="text-white/35 text-[11px] mt-1 font-medium uppercase tracking-widest">Impact Assessment</p>
                    </div>
                    {/* Primary Risk Badge — visually dominant */}
                    <motion.div
                        animate={isExtreme ? { scale: [1, 1.02, 1] } : {}}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                        className="relative"
                    >
                        {isExtreme && (
                            <motion.div
                                animate={{ boxShadow: ['0 0 0px rgba(239,68,68,0)', '0 0 20px rgba(239,68,68,0.25)', '0 0 0px rgba(239,68,68,0)'] }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                                className="absolute inset-0 rounded-xl pointer-events-none"
                            />
                        )}
                        <div className={`px-5 py-2.5 rounded-xl font-black text-base ${isExtreme
                            ? 'bg-red-500/20 text-red-300 ring-1 ring-red-400/30'
                            : risk > 60 ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/30'
                                : 'bg-green-500/20 text-green-300 ring-1 ring-green-400/30'
                            }`}>
                            <span className="text-[10px] font-semibold uppercase tracking-wider opacity-60 mr-1">Risk</span>
                            <CountUp value={risk} suffix="%" duration={800} />
                        </div>
                    </motion.div>
                </div>

                {/* KPI Grid — 4 standard + 1 oversized */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {kpis.map((kpi, i) => (
                        <motion.div
                            key={kpi.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.08 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                            className="bg-white/[0.05] rounded-xl p-3.5 ring-1 ring-white/[0.05] group relative"
                        >
                            <div className="flex items-center gap-1.5 mb-2">
                                <kpi.icon size={11} className="text-white/30" />
                                <span className="text-[9px] font-semibold text-white/30 uppercase tracking-wider">{kpi.label}</span>
                            </div>
                            <p className="text-xl font-black tabular-nums" style={{ color: kpi.color }}>
                                <CountUp
                                    value={kpi.value}
                                    prefix={kpi.value > 0 && !kpi.label.includes('Stress') && !kpi.label.includes('Critical') ? '+' : ''}
                                    suffix={kpi.suffix}
                                    duration={750}
                                />
                            </p>
                            {/* Hover tooltip */}
                            <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-white text-gray-900 text-[9px] font-semibold
                                opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 shadow-lg">
                                {kpi.label}: {kpi.value > 0 && !kpi.label.includes('Stress') && !kpi.label.includes('Critical') ? '+' : ''}{kpi.value}{kpi.suffix}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
});

/* ── Department Card ── */
const DepartmentCard = memo(function DepartmentCard({ dept, index, rank, totalDepts }) {
    const tier = getRiskTier(dept.stress_level);
    const c = RISK_CONFIG[tier];

    // Visual intensity scaling based on rank
    const isTop = rank === 0;
    const isSecond = rank === 1;
    const intensityScale = isTop ? 1.0 : isSecond ? 0.7 : Math.max(0.3, 1 - rank * 0.15);

    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{
                opacity: 1,
                y: 0,
                scale: isTop ? 1.01 : 1,
            }}
            transition={{ delay: 0.25 + index * 0.09, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{
                y: -3,
                boxShadow: `0 12px 30px ${c.color}18`,
                transition: { duration: 0.2 }
            }}
            className="rounded-2xl p-5 border transition-all duration-300 relative overflow-hidden"
            style={{
                backgroundColor: c.bg,
                borderColor: c.border,
                boxShadow: isTop
                    ? `0 8px 24px ${c.color}15, 0 0 0 1px ${c.color}20`
                    : isSecond
                        ? `0 4px 16px ${c.color}10`
                        : '0 1px 4px rgba(0,0,0,0.06)',
            }}
        >
            {/* Top-risk glowing border pulse */}
            {isTop && (
                <motion.div
                    animate={{ boxShadow: [`inset 0 0 0px ${c.color}00`, `inset 0 0 20px ${c.color}08`, `inset 0 0 0px ${c.color}00`] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                />
            )}

            {/* Subtle tint overlay for intensity */}
            <div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{ background: c.tint, opacity: intensityScale }}
            />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        {isTop && (
                            <motion.div
                                animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: c.color }}
                            />
                        )}
                        {isSecond && (
                            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.color, opacity: 0.6 }} />
                        )}
                        <h4 className={`font-bold text-text-primary ${isTop ? 'text-sm' : 'text-[13px]'}`}>{dept.department}</h4>
                    </div>
                    <span
                        className="text-[9px] font-bold px-2.5 py-1 rounded-lg text-white uppercase tracking-wider"
                        style={{ backgroundColor: c.color, opacity: isTop ? 1 : isSecond ? 0.85 : 0.7 }}
                    >{tier}</span>
                </div>

                {/* Stress Bar */}
                <div className="mb-4">
                    <StressBar stress={dept.stress_level} tier={tier} />
                </div>

                {/* Before / After Comparisons */}
                <div className="space-y-2.5 mb-0">
                    <CompareBar label="Cases" before={dept.current_cases} after={dept.projected_cases} color={c.color} />
                    <CompareBar label="Staff" before={dept.current_staff} after={dept.projected_staff} color="#3B82F6" />
                </div>

                {/* Recommendations — with visual separator */}
                {dept.recommendations?.length > 0 && (
                    <div className="mt-4 pt-3 border-t space-y-2 relative" style={{ borderColor: `${c.color}15` }}>
                        <div className="rounded-xl px-3 py-2" style={{ background: `${c.color}06` }}>
                            <span className="text-[9px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1.5 mb-2">
                                <ChevronDown size={10} style={{ color: c.color }} />
                                Action Items
                            </span>
                            <div className="space-y-1.5">
                                {dept.recommendations.map((r, j) => (
                                    <RecommendationTag key={j} text={r} index={j} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
});

/* ── Main Component ── */
export default function StrategicPlanning({ embedded }) {
    const [scenario, setScenario] = useState('surge_30');
    const [result, setResult] = useState(null);
    const [running, setRunning] = useState(false);
    const [runKey, setRunKey] = useState(0);

    const handleRun = async () => {
        setRunning(true);
        setResult(null);
        try {
            const data = await simulateScenario({ scenario, department: 'all' });
            if (data.departments) {
                data.departments = data.departments
                    .map(d => ({ ...d, risk_level: getRiskTier(d.stress_level) }))
                    .sort((a, b) => b.stress_level - a.stress_level);
            }
            setRunKey(k => k + 1);
            setResult(data);
        } catch (e) { console.error(e); }
        finally { setRunning(false); }
    };

    return (
        <div>
            {!embedded && <PageHeader title="Strategic Planning" subtitle="Scenario-based operational stress testing" icon={Target} />}

            {/* Scenario Selector */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {SCENARIOS.map((s) => (
                    <motion.div
                        key={s.id}
                        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setScenario(s.id)}
                        className={`rounded-2xl p-5 cursor-pointer border-2 transition-all duration-200 ${scenario === s.id
                            ? 'border-primary shadow-lg shadow-primary/10 bg-white'
                            : 'border-transparent bg-surface-card shadow-sm hover:shadow-md'
                            }`}
                    >
                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center mb-3 text-lg shadow-sm`}>
                            {s.icon}
                        </div>
                        <h3 className="text-sm font-bold text-text-primary mb-1">{s.label}</h3>
                        <p className="text-xs text-text-secondary leading-relaxed">{s.desc}</p>
                    </motion.div>
                ))}
            </div>

            {/* Run Button */}
            <div className="mb-6">
                <motion.button
                    onClick={handleRun}
                    disabled={running}
                    whileHover={{ scale: 1.01, boxShadow: '0 8px 25px rgba(20,184,166,0.25)' }}
                    whileTap={{ scale: 0.97 }}
                    className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white font-semibold text-sm
                        flex items-center gap-2 shadow-lg shadow-primary/15 transition-all cursor-pointer disabled:opacity-50"
                >
                    {running ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                            <Activity size={16} />
                        </motion.div>
                    ) : <Play size={16} />}
                    {running ? 'Simulating...' : 'Run Scenario'}
                </motion.button>
            </div>

            {/* Results */}
            <AnimatePresence mode="wait">
                {result && (
                    <motion.div
                        key={runKey}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Impact Summary — appears first */}
                        <ImpactSummary result={result} />

                        {/* Department Cards — staggered cascade */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                        >
                            {result.departments?.map((dept, i) => (
                                <DepartmentCard
                                    key={dept.department}
                                    dept={dept}
                                    index={i}
                                    rank={i}
                                    totalDepts={result.departments.length}
                                />
                            ))}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
