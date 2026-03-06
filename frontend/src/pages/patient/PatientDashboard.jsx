import { useState, useEffect, useCallback } from 'react';
import {
    FileText, MessageSquare, Brain, Bell,
    CheckCircle, Clock, Pill,
    Activity, AlertCircle, Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
    apiGetMyVitals, apiGetMyPrescriptions, apiGetMyDiagnoses,
    apiSubmitPatientQuery, apiGenerateDraft, apiGetPatientQueries,
} from '../../services/api';

// ═══ SUB-TAB: Ask AI Question ═══════════════════════════════════
function AskQuestion({ userEmail, userName }) {
    const [question, setQuestion] = useState('');
    const [category, setCategory] = useState('general');
    const [aiDraft, setAiDraft] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmitAndGenerate = async () => {
        if (!question.trim()) return;
        setIsGenerating(true);
        setAiDraft(null);

        try {
            // Submit query to backend
            const result = await apiSubmitPatientQuery({
                patient_email: userEmail,
                patient_name: userName,
                subject: question.slice(0, 80),
                category,
                message: question,
                priority: 'medium',
            });

            // Auto-generate AI draft via backend pipeline
            if (result.id) {
                try {
                    const draft = await apiGenerateDraft(result.id);
                    setAiDraft({
                        text: draft.draft_text,
                        intent: draft.intent,
                        confidence: draft.confidence_score,
                        sources: draft.sources || [],
                    });
                } catch {
                    setAiDraft({ text: 'AI analysis is being processed. Your doctor will review shortly.', intent: category, confidence: 0 });
                }
            }

            setSubmitted(true);
            setTimeout(() => setSubmitted(false), 5000);
        } catch (err) {
            console.error('Submit failed:', err);
        }
        setIsGenerating(false);
    };

    const handleReset = () => {
        setQuestion('');
        setAiDraft(null);
        setCategory('general');
    };

    return (
        <div>
            {submitted && (
                <div className="animate-fade-in" style={{ padding: '1rem', marginBottom: '1.25rem', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <CheckCircle size={20} color="#10b981" />
                    <div>
                        <div style={{ fontWeight: 600, color: '#059669', fontSize: '0.875rem' }}>Question Submitted Successfully!</div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.125rem' }}>
                            Your doctor and nurse have been notified. You'll receive a response soon.
                        </div>
                    </div>
                </div>
            )}

            <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.375rem' }}>
                    Category
                </label>
                <select className="input" value={category} onChange={e => setCategory(e.target.value)} style={{ maxWidth: 260 }}>
                    <option value="general">General</option>
                    <option value="medication">Medication</option>
                    <option value="billing">Billing</option>
                    <option value="appointment">Appointment</option>
                    <option value="lab_results">Lab Results</option>
                </select>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.375rem' }}>
                    What would you like to ask your medical team?
                </label>
                <textarea
                    className="input"
                    rows={5}
                    placeholder="Type your health question here... e.g., 'My blood sugar readings have been above 200 for the past week even though I am taking Metformin. Should I increase the dose?'"
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    style={{ fontSize: '0.9375rem', lineHeight: 1.6 }}
                />
            </div>

            <button
                className="btn btn-accent"
                onClick={handleSubmitAndGenerate}
                disabled={!question.trim() || isGenerating}
                style={{ marginBottom: '1.5rem' }}
            >
                {isGenerating ? (
                    <><Loader2 size={16} className="spin" /> Submitting & Analyzing...</>
                ) : (
                    <><Brain size={16} /> Submit & Get AI Analysis</>
                )}
            </button>

            {/* AI Draft Display */}
            {aiDraft && (
                <div className="animate-fade-in" style={{ marginBottom: '1.25rem' }}>
                    <div style={{
                        padding: '1.25rem', background: 'rgba(6,182,212,0.06)',
                        border: '1px solid rgba(6,182,212,0.2)', borderRadius: 'var(--radius-lg)',
                    }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            marginBottom: '0.75rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-accent-light)',
                        }}>
                            <Brain size={18} color="var(--color-accent)" />
                            AI Health Analysis
                            {aiDraft.confidence > 0 && (
                                <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: aiDraft.confidence >= 0.7 ? '#059669' : '#d97706',
                                    background: aiDraft.confidence >= 0.7 ? '#d1fae5' : '#fef3c7', padding: '0.125rem 0.5rem', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
                                    {Math.round(aiDraft.confidence * 100)}% confidence
                                </span>
                            )}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                            {aiDraft.text}
                        </div>
                        {aiDraft.sources?.length > 0 && (
                            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                                {aiDraft.sources.map((s, i) => (
                                    <span key={i} style={{ fontSize: '0.6875rem', padding: '0.125rem 0.5rem', background: '#eff6ff', color: '#3b82f6', borderRadius: 'var(--radius-full)' }}>📚 {s}</span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {aiDraft && (
                <div style={{
                    padding: '1rem', background: 'rgba(245,158,11,0.06)',
                    border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius-md)',
                    marginBottom: '1.25rem',
                }}>
                    <p style={{ fontSize: '0.8125rem', color: '#d97706' }}>
                        <AlertCircle size={14} style={{ verticalAlign: -2, marginRight: 4 }} />
                        Your question and AI analysis have been sent to your doctor and nurse for review. They will provide a professional response.
                    </p>
                </div>
            )}

            {aiDraft && (
                <button className="btn btn-secondary" onClick={handleReset} style={{ minWidth: 200 }}>
                    Ask another question
                </button>
            )}
            {/* Quick Question Presets */}
            <div style={{ marginTop: '2rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    Common Questions
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {[
                        'My blood sugar is too high, what should I do?',
                        'I feel pain after taking my medication',
                        'When is my next appointment?',
                        'Can I take ibuprofen with my current medications?',
                        'I have a headache and mild fever',
                    ].map((q) => (
                        <button
                            key={q}
                            className="btn btn-sm btn-secondary"
                            onClick={() => setQuestion(q)}
                            style={{ fontSize: '0.75rem' }}
                        >
                            {q.slice(0, 40)}...
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}


// ═══ SUB-TAB: Patient Notifications ═════════════════════════════
function PatientNotifications({ queries }) {
    // Show answered queries as notification-like items
    const answered = queries.filter(q => q.status === 'responded' || q.status === 'staff_reviewing');
    const pending = queries.filter(q => q.status !== 'responded');

    return (
        <div>
            {queries.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
                    <Bell size={36} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                    <p>No notifications yet</p>
                    <p style={{ fontSize: '0.8125rem', marginTop: '0.25rem' }}>Submit a question to your care team to get started</p>
                </div>
            ) : (
                <>
                    {answered.length > 0 && (
                        <div style={{ marginBottom: '1rem' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#059669', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Responses Received</div>
                            {answered.map(q => (
                                <div key={q.id} className="card-flat" style={{
                                    marginBottom: '0.5rem', padding: '1rem 1.25rem',
                                    borderLeft: '4px solid #059669',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(5,150,105,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <CheckCircle size={18} color="#059669" />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{q.subject}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: '0.125rem' }}>
                                                {q.category} · {new Date(q.created_at).toLocaleDateString()}
                                            </div>
                                            {q.final_response && (
                                                <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 'var(--radius-md)' }}>
                                                    <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#10b981', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                                                        Response from Medical Staff
                                                    </div>
                                                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                                                        {q.final_response}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {pending.length > 0 && (
                        <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Pending</div>
                            {pending.map(q => (
                                <div key={q.id} className="card-flat" style={{
                                    marginBottom: '0.5rem', padding: '1rem 1.25rem',
                                    borderLeft: '4px solid #d97706', opacity: 0.8,
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(217,119,6,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <Clock size={18} color="#d97706" />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{q.subject}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: '0.125rem' }}>
                                                {q.category} · Submitted {new Date(q.created_at).toLocaleDateString()} · Awaiting review
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}


// ═══════════════════════════════════════════════════════════════════
// ═══ MAIN PATIENT DASHBOARD ═════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════
export default function PatientDashboard() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('prescriptions');

    // Backend data state
    const [vitals, setVitals] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [diagnoses, setDiagnoses] = useState([]);
    const [queries, setQueries] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch all patient data on mount
    useEffect(() => {
        if (!user?.email) return;
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            try {
                const [vRes, pRes, dRes, qRes] = await Promise.all([
                    apiGetMyVitals(user.email).catch(() => ({ vitals: [] })),
                    apiGetMyPrescriptions(user.email).catch(() => ({ prescriptions: [] })),
                    apiGetMyDiagnoses(user.email).catch(() => ({ diagnoses: [] })),
                    apiGetPatientQueries({ patient_email: user.email }).catch(() => ({ queries: [] })),
                ]);
                if (cancelled) return;
                setVitals(vRes.vitals || []);
                setPrescriptions(pRes.prescriptions || []);
                setDiagnoses(dRes.diagnoses || []);
                setQueries(qRes.queries || []);
            } catch (err) {
                console.error('Failed to load patient data:', err);
            }
            setLoading(false);
        };
        load();
        return () => { cancelled = true; };
    }, [user?.email]);

    const respondedCount = queries.filter(q => q.status === 'responded').length;

    const tabs = [
        { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
        { id: 'vitals', label: 'My Vitals', icon: Activity },
        { id: 'diagnoses', label: 'Diagnoses', icon: FileText },
        { id: 'ask', label: 'Ask AI Question', icon: Brain },
        { id: 'notifications', label: 'Responses', icon: Bell, badge: respondedCount },
    ];

    if (loading) {
        return (
            <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Loader2 size={32} className="spin" color="#059669" />
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="page-title">Welcome, {user?.name || 'Patient'}</h1>
                    <p className="page-subtitle">{user?.email} · {user?.department || 'General'}</p>
                </div>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Prescriptions', value: prescriptions.length, icon: Pill, color: '#0d9488' },
                    { label: 'Vitals Records', value: vitals.length, icon: Activity, color: '#047857' },
                    { label: 'Diagnoses', value: diagnoses.length, icon: FileText, color: '#10b981' },
                    { label: 'Queries', value: queries.length, icon: MessageSquare, color: '#3b82f6' },
                ].map(s => (
                    <div key={s.label} className="card-flat" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <s.icon size={22} color={s.color} />
                        </div>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1 }}>{s.value}</div>
                            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border-light)', overflowX: 'auto' }}>
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="btn" style={{
                            background: 'none', border: 'none', borderBottom: isActive ? '2px solid #059669' : '2px solid transparent',
                            borderRadius: 0, color: isActive ? '#059669' : 'var(--color-text-secondary)',
                            fontWeight: isActive ? 600 : 400, padding: '0.75rem 1rem', fontSize: '0.8125rem', whiteSpace: 'nowrap',
                        }}>
                            <Icon size={15} /> {tab.label}
                            {tab.badge > 0 && <span style={{ marginLeft: 6, background: '#ef4444', color: 'white', fontSize: '0.625rem', fontWeight: 700, padding: '0.0625rem 0.375rem', borderRadius: 'var(--radius-full)', minWidth: 18, textAlign: 'center', display: 'inline-block' }}>{tab.badge}</span>}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="animate-fade-in">
                {activeTab === 'prescriptions' && (
                    <div>
                        {prescriptions.length === 0 ? (
                            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
                                <Pill size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                <p>No prescriptions yet</p>
                            </div>
                        ) : (
                            prescriptions.map((rx, idx) => (
                                <div key={rx.id || idx} className="card-flat" style={{ marginBottom: '0.75rem', padding: '1.25rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{rx.medication}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: '0.125rem' }}>
                                                Dr. {rx.doctor_name || 'N/A'} · {new Date(rx.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <span className="badge badge-success">{rx.status || 'active'}</span>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                                        {[
                                            { l: 'Dosage', v: rx.dosage },
                                            { l: 'Frequency', v: rx.frequency },
                                            { l: 'Duration', v: rx.duration },
                                            { l: 'Doctor', v: rx.doctor_name },
                                        ].map(item => (
                                            <div key={item.l} style={{ padding: '0.5rem', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                                                <div style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)' }}>{item.l}</div>
                                                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{item.v || '—'}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {rx.notes && (
                                        <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: 'rgba(245,158,11,0.06)', borderRadius: 'var(--radius-sm)', fontSize: '0.8125rem', color: '#d97706' }}>
                                            <strong>Note:</strong> {rx.notes}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'vitals' && (
                    <div>
                        {vitals.length === 0 ? (
                            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
                                <Activity size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                <p>No vitals recorded yet</p>
                            </div>
                        ) : (
                            vitals.map((v, idx) => (
                                <div key={v.id || idx} className="card-flat" style={{ marginBottom: '0.75rem', padding: '1.25rem' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', marginBottom: '0.75rem' }}>
                                        Recorded on {new Date(v.recorded_at).toLocaleString()}
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                                        {[
                                            { l: 'Blood Pressure', v: v.blood_pressure || '—' },
                                            { l: 'Heart Rate', v: v.heart_rate ? `${v.heart_rate} bpm` : '—' },
                                            { l: 'Temperature', v: v.temperature ? `${v.temperature}°F` : '—', w: v.temperature > 99.5 },
                                            { l: 'SpO2', v: v.oxygen_saturation ? `${v.oxygen_saturation}%` : '—', w: v.oxygen_saturation < 95 },
                                            { l: 'Weight', v: v.weight ? `${v.weight} kg` : '—' },
                                        ].filter(item => item.v !== '—').map(item => (
                                            <div key={item.l} style={{ padding: '0.5rem', background: item.w ? 'rgba(245,158,11,0.06)' : 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-sm)', border: item.w ? '1px solid rgba(245,158,11,0.2)' : 'none' }}>
                                                <div style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)' }}>{item.l}</div>
                                                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: item.w ? '#fbbf24' : 'var(--color-text-primary)' }}>{item.v}</div>
                                            </div>
                                        ))}
                                    </div>
                                    {v.notes && <div style={{ marginTop: '0.5rem', fontSize: '0.8125rem', color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>Note: {v.notes}</div>}
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'diagnoses' && (
                    <div>
                        {diagnoses.length === 0 ? (
                            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
                                <FileText size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                <p>No diagnoses recorded yet</p>
                            </div>
                        ) : (
                            diagnoses.map((d, idx) => (
                                <div key={d.id || idx} className="card-flat" style={{ marginBottom: '0.75rem', padding: '1.25rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{d.condition}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: '0.125rem' }}>
                                                Dr. {d.doctor_name || 'N/A'} · {new Date(d.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <span className={`badge ${d.severity === 'high' ? 'badge-error' : d.severity === 'medium' ? 'badge-warning' : 'badge-success'}`}>
                                            {d.severity || 'normal'}
                                        </span>
                                    </div>
                                    {d.notes && <div style={{ marginTop: '0.5rem', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{d.notes}</div>}
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'ask' && (
                    <AskQuestion userEmail={user?.email} userName={user?.name} />
                )}

                {activeTab === 'notifications' && (
                    <PatientNotifications queries={queries} />
                )}
            </div>
        </div>
    );
}
