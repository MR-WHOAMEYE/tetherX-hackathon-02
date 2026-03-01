import { useState } from 'react';
import { FlaskConical, Play, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { runSimulation } from '../services/api';
import PageHeader from '../components/PageHeader';
import ChartCard from '../components/ChartCard';

const DEPARTMENTS = ['Emergency', 'Cardiology', 'Orthopedics', 'Pediatrics', 'Neurology'];

export default function SimulationLab({ embedded }) {
    const [params, setParams] = useState({ department: 'Emergency', add_staff: 2, extend_shift_hours: 0, reallocate_cases: 0 });
    const [result, setResult] = useState(null);
    const [running, setRunning] = useState(false);

    const handleRun = async () => {
        setRunning(true);
        try {
            const data = await runSimulation(params);
            setResult(data);
        } catch (e) { console.error(e); }
        finally { setRunning(false); }
    };

    return (
        <div>
            {!embedded && <PageHeader title="Simulation Lab" subtitle="Simulate staffing changes and predict operational outcomes" icon={FlaskConical} />}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Simulation Parameters" subtitle="Adjust variables to predict outcomes" delay={0}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-text-secondary mb-1.5">Department</label>
                            <select value={params.department} onChange={e => setParams({ ...params, department: e.target.value })}
                                className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer">
                                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-text-secondary mb-2">Add Staff Members</label>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 0,
                                borderRadius: 12, border: '1px solid #CCFBF1', overflow: 'hidden',
                                background: '#F0FDFA',
                            }}>
                                <button
                                    onClick={() => setParams({ ...params, add_staff: Math.max(0, params.add_staff - 1) })}
                                    disabled={params.add_staff <= 0}
                                    style={{
                                        width: 48, height: 44, border: 'none', cursor: params.add_staff <= 0 ? 'not-allowed' : 'pointer',
                                        background: params.add_staff <= 0 ? '#F8FAFC' : '#FFFFFF',
                                        color: params.add_staff <= 0 ? '#CBD5E1' : '#0F766E',
                                        fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        borderRight: '1px solid #CCFBF1', transition: 'all 0.15s ease',
                                    }}
                                >−</button>
                                <div style={{
                                    flex: 1, textAlign: 'center', fontSize: 15, fontWeight: 700,
                                    color: '#0F766E', padding: '10px 0',
                                }}>
                                    +{params.add_staff} <span style={{ fontSize: 12, fontWeight: 500, color: '#64748B' }}>staff</span>
                                </div>
                                <button
                                    onClick={() => setParams({ ...params, add_staff: Math.min(10, params.add_staff + 1) })}
                                    disabled={params.add_staff >= 10}
                                    style={{
                                        width: 48, height: 44, border: 'none', cursor: params.add_staff >= 10 ? 'not-allowed' : 'pointer',
                                        background: params.add_staff >= 10 ? '#F8FAFC' : '#FFFFFF',
                                        color: params.add_staff >= 10 ? '#CBD5E1' : '#0F766E',
                                        fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        borderLeft: '1px solid #CCFBF1', transition: 'all 0.15s ease',
                                    }}
                                >+</button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-text-secondary mb-2">Extend Shift Hours</label>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 0,
                                borderRadius: 12, border: '1px solid #BFDBFE', overflow: 'hidden',
                                background: '#EFF6FF',
                            }}>
                                <button
                                    onClick={() => setParams({ ...params, extend_shift_hours: Math.max(0, +(params.extend_shift_hours - 0.5).toFixed(1)) })}
                                    disabled={params.extend_shift_hours <= 0}
                                    style={{
                                        width: 48, height: 44, border: 'none', cursor: params.extend_shift_hours <= 0 ? 'not-allowed' : 'pointer',
                                        background: params.extend_shift_hours <= 0 ? '#F8FAFC' : '#FFFFFF',
                                        color: params.extend_shift_hours <= 0 ? '#CBD5E1' : '#0284C7',
                                        fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        borderRight: '1px solid #BFDBFE', transition: 'all 0.15s ease',
                                    }}
                                >−</button>
                                <div style={{
                                    flex: 1, textAlign: 'center', fontSize: 15, fontWeight: 700,
                                    color: '#0284C7', padding: '10px 0',
                                }}>
                                    +{params.extend_shift_hours}h <span style={{ fontSize: 12, fontWeight: 500, color: '#64748B' }}>per shift</span>
                                </div>
                                <button
                                    onClick={() => setParams({ ...params, extend_shift_hours: Math.min(6, +(params.extend_shift_hours + 0.5).toFixed(1)) })}
                                    disabled={params.extend_shift_hours >= 6}
                                    style={{
                                        width: 48, height: 44, border: 'none', cursor: params.extend_shift_hours >= 6 ? 'not-allowed' : 'pointer',
                                        background: params.extend_shift_hours >= 6 ? '#F8FAFC' : '#FFFFFF',
                                        color: params.extend_shift_hours >= 6 ? '#CBD5E1' : '#0284C7',
                                        fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        borderLeft: '1px solid #BFDBFE', transition: 'all 0.15s ease',
                                    }}
                                >+</button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-text-secondary mb-2">Reallocate Cases to Other Depts</label>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 0,
                                borderRadius: 12, border: '1px solid #A7F3D0', overflow: 'hidden',
                                background: '#ECFDF5',
                            }}>
                                <button
                                    onClick={() => setParams({ ...params, reallocate_cases: Math.max(0, params.reallocate_cases - 5) })}
                                    disabled={params.reallocate_cases <= 0}
                                    style={{
                                        width: 48, height: 44, border: 'none', cursor: params.reallocate_cases <= 0 ? 'not-allowed' : 'pointer',
                                        background: params.reallocate_cases <= 0 ? '#F8FAFC' : '#FFFFFF',
                                        color: params.reallocate_cases <= 0 ? '#CBD5E1' : '#10B981',
                                        fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        borderRight: '1px solid #A7F3D0', transition: 'all 0.15s ease',
                                    }}
                                >−</button>
                                <div style={{
                                    flex: 1, textAlign: 'center', fontSize: 15, fontWeight: 700,
                                    color: '#10B981', padding: '10px 0',
                                }}>
                                    {params.reallocate_cases} <span style={{ fontSize: 12, fontWeight: 500, color: '#64748B' }}>cases</span>
                                </div>
                                <button
                                    onClick={() => setParams({ ...params, reallocate_cases: Math.min(50, params.reallocate_cases + 5) })}
                                    disabled={params.reallocate_cases >= 50}
                                    style={{
                                        width: 48, height: 44, border: 'none', cursor: params.reallocate_cases >= 50 ? 'not-allowed' : 'pointer',
                                        background: params.reallocate_cases >= 50 ? '#F8FAFC' : '#FFFFFF',
                                        color: params.reallocate_cases >= 50 ? '#CBD5E1' : '#10B981',
                                        fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        borderLeft: '1px solid #A7F3D0', transition: 'all 0.15s ease',
                                    }}
                                >+</button>
                            </div>
                        </div>
                        <button onClick={handleRun} disabled={running}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white font-semibold text-sm
                         flex items-center justify-center gap-2 hover:shadow-lg transition-all cursor-pointer disabled:opacity-50">
                            <Play size={16} /> {running ? 'Running Simulation...' : 'Run Simulation'}
                        </button>
                    </div>
                </ChartCard>

                <ChartCard title="Predicted Outcomes" subtitle={result ? 'Comparison of current vs. predicted metrics' : 'Run a simulation to see predictions'} delay={1}>
                    {result ? (
                        <div className="space-y-4">
                            {[
                                { label: 'Avg Resolution Time', current: `${result.current.avg_resolution_hrs}h`, predicted: `${result.predicted.avg_resolution_hrs}h`, improvement: `${result.improvements.resolution_improvement_pct}%` },
                                { label: 'SLA Compliance', current: `${result.current.sla_compliance_pct}%`, predicted: `${result.predicted.sla_compliance_pct}%`, improvement: `+${result.improvements.sla_improvement_pct}%` },
                                { label: 'Cases per Staff', current: result.current.cases_per_staff, predicted: result.predicted.cases_per_staff, improvement: `${result.improvements.efficiency_change_pct}%` },
                                { label: 'Staff Count', current: result.current.staff_count, predicted: result.predicted.staff_count },
                                { label: 'Active Cases', current: result.current.active_cases, predicted: result.predicted.active_cases },
                            ].map((row) => (
                                <motion.div key={row.label} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center justify-between p-3 rounded-xl bg-surface">
                                    <span className="text-sm font-medium text-text-secondary w-36">{row.label}</span>
                                    <span className="text-sm font-semibold text-text-primary">{row.current}</span>
                                    <ArrowRight size={14} className="text-text-muted" />
                                    <span className="text-sm font-bold text-primary">{row.predicted}</span>
                                    {row.improvement && (
                                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">{row.improvement}</span>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-60 text-text-muted text-sm">
                            Adjust parameters and run simulation
                        </div>
                    )}
                </ChartCard>
            </div>
        </div>
    );
}
