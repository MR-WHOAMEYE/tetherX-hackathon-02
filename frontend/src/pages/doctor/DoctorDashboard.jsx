import { useState, useEffect } from 'react';
import {
    Users, FileText, Pill, Bell,
    ChevronDown, ChevronUp, Activity, Send, Plus, X,
    AlertCircle, CheckCircle, Brain, MessageSquare, Search, Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
    apiGetMyPatients, apiGetPrescriptions, apiAddPrescription, apiAddDiagnosis,
    apiGetPatientQueries, apiGetDrafts, apiReviewDraft, apiSendDraft,
} from '../../services/api';

// ═══ SUB-TAB: My Patients ═══════════════════════════════════════
function MyPatients({ patients }) {
    const [expandedId, setExpandedId] = useState(null);
    const [search, setSearch] = useState('');

    const filtered = patients.filter(p =>
        (p.name || '').toLowerCase().includes(search.toLowerCase()) || (p.email || '').includes(search)
    );

    return (
        <div>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', alignItems: 'center' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0.5rem 0.75rem' }}>
                    <Search size={15} color="var(--color-text-muted)" />
                    <input type="text" placeholder="Search patients by name or email..." value={search} onChange={e => setSearch(e.target.value)} style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--color-text-primary)', fontSize: '0.8125rem', width: '100%', fontFamily: 'var(--font-sans)' }} />
                </div>
                <span className="badge badge-primary">{filtered.length} patients</span>
            </div>

            {filtered.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
                    <Users size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p>No patients assigned yet</p>
                </div>
            ) : (
                filtered.map(patient => {
                    const isExpanded = expandedId === patient.id;
                    const lv = patient.latest_vitals;

                    return (
                        <div key={patient.id} className="card-flat" style={{ marginBottom: '0.75rem', padding: 0, overflow: 'hidden' }}>
                            <div onClick={() => setExpandedId(isExpanded ? null : patient.id)} style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1rem', flexShrink: 0 }}>
                                    {(patient.name || '?').charAt(0)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{patient.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                                        {patient.email} · {patient.department || 'General'}
                                    </div>
                                </div>
                                {patient.issue && (
                                    <span className="badge badge-accent" style={{ fontSize: '0.625rem' }}>{patient.issue}</span>
                                )}
                                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </div>

                            {isExpanded && (
                                <div className="animate-fade-in" style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid var(--color-border-light)' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginTop: '1rem', marginBottom: '1rem' }}>
                                        <div style={{ padding: '0.75rem', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                                            <div style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Email</div>
                                            <div style={{ fontSize: '0.8125rem', fontWeight: 500, marginTop: '0.125rem' }}>{patient.email}</div>
                                        </div>
                                        <div style={{ padding: '0.75rem', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                                            <div style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Department</div>
                                            <div style={{ fontSize: '0.8125rem', fontWeight: 500, marginTop: '0.125rem' }}>{patient.department || 'General'}</div>
                                        </div>
                                        <div style={{ padding: '0.75rem', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                                            <div style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Issue</div>
                                            <div style={{ fontSize: '0.8125rem', fontWeight: 500, marginTop: '0.125rem' }}>{patient.issue || 'N/A'}</div>
                                        </div>
                                    </div>

                                    {/* Latest Vitals */}
                                    {lv && (
                                        <div>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                                                <Activity size={12} style={{ verticalAlign: -2 }} /> Latest Vitals {lv.recorded_at && `(${new Date(lv.recorded_at).toLocaleDateString()})`}
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                                                {[
                                                    { label: 'BP', value: lv.bp_systolic && lv.bp_diastolic ? `${lv.bp_systolic}/${lv.bp_diastolic}` : null, unit: 'mmHg', warn: lv.bp_systolic > 140 },
                                                    { label: 'Heart Rate', value: lv.heart_rate, unit: 'bpm' },
                                                    { label: 'Temperature', value: lv.temperature, unit: '°F', warn: lv.temperature > 99.5 },
                                                    { label: 'Sugar Level', value: lv.sugar_level, unit: 'mg/dL', warn: lv.sugar_level > 130 },
                                                ].filter(v => v.value != null).map(v => (
                                                    <div key={v.label} style={{ padding: '0.5rem', background: v.warn ? 'rgba(245,158,11,0.06)' : 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-sm)', border: v.warn ? '1px solid rgba(245,158,11,0.2)' : '1px solid var(--color-border-light)' }}>
                                                        <div style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)' }}>{v.label}</div>
                                                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: v.warn ? '#fbbf24' : 'var(--color-text-primary)' }}>{v.value} <span style={{ fontSize: '0.625rem', fontWeight: 400, color: 'var(--color-text-muted)' }}>{v.unit}</span></div>
                                                    </div>
                                                ))}
                                            </div>
                                            {lv.notes && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: '0.5rem', fontStyle: 'italic' }}>Note: {lv.notes}</div>}
                                        </div>
                                    )}

                                    {!lv && (
                                        <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>No vitals recorded yet</div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
}

// ═══ SUB-TAB: Prescribe Medicine ═════════════════════════════════
function PrescribeMedicine({ patients, doctorName, onSuccess }) {
    const [selectedPatient, setSelectedPatient] = useState('');
    const [medication, setMedication] = useState('');
    const [dosage, setDosage] = useState('');
    const [frequency, setFrequency] = useState('');
    const [duration, setDuration] = useState('');
    const [notes, setNotes] = useState('');
    const [success, setSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedPatient || !medication) return;
        setSubmitting(true);

        const patient = patients.find(p => p.email === selectedPatient);
        try {
            await apiAddPrescription({
                patient_email: selectedPatient,
                patient_name: patient?.name || '',
                medication,
                dosage,
                frequency,
                duration,
                notes,
            });
            setSelectedPatient(''); setMedication(''); setDosage(''); setFrequency(''); setDuration(''); setNotes('');
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
            onSuccess?.();
        } catch (err) {
            console.error('Failed to add prescription:', err);
        }
        setSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit}>
            {success && (
                <div className="animate-fade-in" style={{ padding: '0.75rem 1rem', marginBottom: '1rem', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-md)', color: '#059669', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={16} /> Prescription created and sent to patient!
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>Select Patient *</label>
                    <select className="input" value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)} required>
                        <option value="">Choose patient...</option>
                        {patients.map(p => <option key={p.id} value={p.email}>{p.name} ({p.email})</option>)}
                    </select>
                </div>
                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>Medication *</label>
                    <input className="input" placeholder="e.g. Metformin 500mg" value={medication} onChange={e => setMedication(e.target.value)} required />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>Dosage</label>
                    <input className="input" placeholder="1 tablet" value={dosage} onChange={e => setDosage(e.target.value)} />
                </div>
                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>Frequency</label>
                    <input className="input" placeholder="Twice daily" value={frequency} onChange={e => setFrequency(e.target.value)} />
                </div>
                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>Duration</label>
                    <input className="input" placeholder="30 days" value={duration} onChange={e => setDuration(e.target.value)} />
                </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>Additional Notes</label>
                <textarea className="input" rows={3} placeholder="Diet instructions, follow-up schedule, warnings..." value={notes} onChange={e => setNotes(e.target.value)} style={{ minHeight: 80 }} />
            </div>

            <button type="submit" className="btn btn-primary" style={{ minWidth: 200 }} disabled={submitting}>
                {submitting ? <><Loader2 size={16} className="spin" /> Saving...</> : <><Pill size={16} /> Create Prescription</>}
            </button>
        </form>
    );
}

// ═══ SUB-TAB: Add Diagnosis ══════════════════════════════════════
function AddDiagnosis({ patients, onSuccess }) {
    const [selectedPatient, setSelectedPatient] = useState('');
    const [condition, setCondition] = useState('');
    const [severity, setSeverity] = useState('medium');
    const [dNotes, setDNotes] = useState('');
    const [success, setSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedPatient || !condition) return;
        setSubmitting(true);

        const patient = patients.find(p => p.email === selectedPatient);
        try {
            await apiAddDiagnosis({
                patient_email: selectedPatient,
                patient_name: patient?.name || '',
                condition,
                severity,
                notes: dNotes,
            });
            setSelectedPatient(''); setCondition(''); setSeverity('medium'); setDNotes('');
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
            onSuccess?.();
        } catch (err) {
            console.error('Failed to add diagnosis:', err);
        }
        setSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit}>
            {success && (
                <div className="animate-fade-in" style={{ padding: '0.75rem 1rem', marginBottom: '1rem', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-md)', color: '#059669', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={16} /> Diagnosis recorded!
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>Patient *</label>
                    <select className="input" value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)} required>
                        <option value="">Choose patient...</option>
                        {patients.map(p => <option key={p.id} value={p.email}>{p.name} ({p.email})</option>)}
                    </select>
                </div>
                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>Condition *</label>
                    <input className="input" placeholder="e.g. Type 2 Diabetes" value={condition} onChange={e => setCondition(e.target.value)} required />
                </div>
                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>Severity</label>
                    <select className="input" value={severity} onChange={e => setSeverity(e.target.value)}>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>Clinical Notes</label>
                <textarea className="input" rows={4} placeholder="Detailed findings, observations, treatment plan..." value={dNotes} onChange={e => setDNotes(e.target.value)} style={{ minHeight: 100 }} />
            </div>

            <button type="submit" className="btn btn-primary" style={{ minWidth: 200 }} disabled={submitting}>
                {submitting ? <><Loader2 size={16} className="spin" /> Saving...</> : <><FileText size={16} /> Record Diagnosis</>}
            </button>
        </form>
    );
}

// ═══ SUB-TAB: Patient Questions / Drafts ═════════════════════════
function DoctorNotifications({ drafts, queries, doctorEmail, onRefresh }) {
    const [expandedQ, setExpandedQ] = useState(null);
    const [responseText, setResponseText] = useState('');
    const [sending, setSending] = useState(false);

    const pendingDrafts = drafts.filter(d => d.status === 'ai_generated' || d.status === 'pending');
    const reviewedDrafts = drafts.filter(d => d.status === 'approved' || d.status === 'sent');

    const handleApproveAndSend = async (draftId) => {
        setSending(true);
        try {
            await apiReviewDraft(draftId, {
                action: 'approve',
                staff_email: doctorEmail,
                staff_notes: responseText || 'Approved',
            });
            await apiSendDraft(draftId, { staff_email: doctorEmail });
            setResponseText('');
            setExpandedQ(null);
            onRefresh?.();
        } catch (err) {
            console.error('Send failed:', err);
        }
        setSending(false);
    };

    const handleEditAndSend = async (draftId) => {
        if (!responseText.trim()) return;
        setSending(true);
        try {
            await apiReviewDraft(draftId, {
                action: 'edit_and_approve',
                edited_text: responseText,
                staff_email: doctorEmail,
                staff_notes: 'Edited by doctor',
            });
            await apiSendDraft(draftId, { staff_email: doctorEmail });
            setResponseText('');
            setExpandedQ(null);
            onRefresh?.();
        } catch (err) {
            console.error('Edit failed:', err);
        }
        setSending(false);
    };

    return (
        <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} color="#f59e0b" /> Pending AI Drafts to Review ({pendingDrafts.length})
            </h3>

            {pendingDrafts.map(draft => {
                const isExpanded = expandedQ === draft.id;

                return (
                    <div key={draft.id} className="card-flat" style={{ marginBottom: '0.75rem', padding: 0, overflow: 'hidden', borderLeft: '4px solid #f59e0b' }}>
                        <div onClick={() => { setExpandedQ(isExpanded ? null : draft.id); setResponseText(''); }} style={{ padding: '1rem 1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, flexShrink: 0 }}>
                                {(draft.patient_name || '?').charAt(0)}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                    {draft.patient_name} <span className="badge badge-warning" style={{ fontSize: '0.625rem', marginLeft: 6 }}>{draft.query_category || 'general'}</span>
                                </div>
                                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 500 }}>
                                    {draft.query_subject || draft.query_message?.slice(0, 80)}
                                </div>
                            </div>
                            <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', flexShrink: 0 }}>
                                {draft.created_at && new Date(draft.created_at).toLocaleString()}
                            </span>
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>

                        {isExpanded && (
                            <div className="animate-fade-in" style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid var(--color-border-light)' }}>
                                <div style={{ padding: '0.875rem', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)', marginTop: '0.75rem', marginBottom: '0.75rem' }}>
                                    <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: '0.375rem' }}>Patient's Question</div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{draft.query_message}</div>
                                </div>

                                <div style={{ padding: '0.875rem', background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)', borderRadius: 'var(--radius-md)', marginBottom: '0.75rem' }}>
                                    <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                        <Brain size={12} /> AI Generated Draft
                                        {draft.confidence_score > 0 && (
                                            <span style={{ marginLeft: 'auto', fontSize: '0.6875rem', color: draft.confidence_score >= 0.7 ? '#059669' : '#d97706' }}>
                                                {Math.round(draft.confidence_score * 100)}% confidence
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{draft.draft_text}</div>
                                </div>

                                <div style={{ marginBottom: '0.75rem' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>Edit Response (optional — leave blank to send AI draft as-is)</label>
                                    <textarea className="input" rows={4} placeholder="Write your own response or edit the AI draft..." value={responseText} onChange={e => setResponseText(e.target.value)} />
                                </div>

                                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                    <button type="button" className="btn btn-secondary" onClick={() => handleApproveAndSend(draft.id)} disabled={sending}>
                                        <Brain size={14} /> Approve & Send AI Draft
                                    </button>
                                    <button type="button" className="btn btn-primary" onClick={() => handleEditAndSend(draft.id)} disabled={!responseText.trim() || sending}>
                                        <Send size={14} /> Send Edited Response
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}

            {pendingDrafts.length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
                    <CheckCircle size={36} color="var(--color-success)" style={{ marginBottom: '0.5rem' }} />
                    <p>No pending questions to review</p>
                </div>
            )}

            {reviewedDrafts.length > 0 && (
                <>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginTop: '1.5rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle size={16} color="var(--color-success)" /> Previously Responded ({reviewedDrafts.length})
                    </h3>
                    {reviewedDrafts.map(d => (
                        <div key={d.id} style={{ padding: '0.75rem 1rem', background: 'var(--color-bg-card)', borderRadius: 'var(--radius-md)', marginBottom: '0.5rem', opacity: 0.7, border: '1px solid var(--color-border-light)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <CheckCircle size={14} color="var(--color-success)" />
                                <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{d.patient_name}</span>
                                <span style={{ color: 'var(--color-text-tertiary)', fontSize: '0.75rem' }}>— {(d.query_subject || d.query_message || '').slice(0, 60)}...</span>
                                <span className="badge badge-success" style={{ fontSize: '0.625rem', marginLeft: 'auto' }}>Sent</span>
                            </div>
                        </div>
                    ))}
                </>
            )}
        </div>
    );
}


// ═══════════════════════════════════════════════════════════════════
// ═══ MAIN DOCTOR DASHBOARD ═══════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════
export default function DoctorDashboard() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('patients');

    // Backend data state
    const [patients, setPatients] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [drafts, setDrafts] = useState([]);
    const [queries, setQueries] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        if (!user?.email) return;
        setLoading(true);
        try {
            const [pRes, rxRes, dRes, qRes] = await Promise.all([
                apiGetMyPatients(user.email).catch(() => ({ patients: [] })),
                apiGetPrescriptions(user.email).catch(() => ({ prescriptions: [] })),
                apiGetDrafts().catch(() => ({ drafts: [] })),
                apiGetPatientQueries().catch(() => ({ queries: [] })),
            ]);
            setPatients(pRes.patients || []);
            setPrescriptions(rxRes.prescriptions || []);
            setDrafts(dRes.drafts || []);
            setQueries(qRes.queries || []);
        } catch (err) {
            console.error('Failed to load doctor data:', err);
        }
        setLoading(false);
    };

    useEffect(() => { loadData(); }, [user?.email]);

    const pendingCount = drafts.filter(d => d.status === 'ai_generated' || d.status === 'pending').length;

    const tabs = [
        { id: 'patients', label: 'My Patients', icon: Users },
        { id: 'prescribe', label: 'Prescribe Medicine', icon: Pill },
        { id: 'diagnose', label: 'Add Diagnosis', icon: FileText },
        { id: 'notifications', label: 'Patient Questions', icon: Bell, badge: pendingCount },
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
                    <h1 className="page-title">Doctor Dashboard</h1>
                    <p className="page-subtitle">Welcome back, {user?.name}. {user?.specialization && `${user.specialization} · `}{patients.length} patients under care.</p>
                </div>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total Patients', value: patients.length, icon: Users, color: '#059669' },
                    { label: 'Prescriptions', value: prescriptions.length, icon: Pill, color: '#0d9488' },
                    { label: 'AI Drafts', value: drafts.length, icon: Brain, color: '#047857' },
                    { label: 'Pending Review', value: pendingCount, icon: MessageSquare, color: pendingCount > 0 ? '#f59e0b' : '#059669' },
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
            <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '0' }}>
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="btn" style={{
                            background: 'none', border: 'none', borderBottom: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
                            borderRadius: 0, color: isActive ? 'var(--color-primary-light)' : 'var(--color-text-secondary)',
                            fontWeight: isActive ? 600 : 400, padding: '0.75rem 1.25rem', fontSize: '0.875rem',
                            position: 'relative',
                        }}>
                            <Icon size={16} /> {tab.label}
                            {tab.badge > 0 && (
                                <span style={{
                                    marginLeft: '0.375rem', background: '#ef4444', color: 'white',
                                    fontSize: '0.625rem', fontWeight: 700, padding: '0.0625rem 0.375rem',
                                    borderRadius: 'var(--radius-full)', minWidth: 18, textAlign: 'center', display: 'inline-block',
                                }}>{tab.badge}</span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="animate-fade-in">
                {activeTab === 'patients' && (
                    <MyPatients patients={patients} />
                )}
                {activeTab === 'prescribe' && (
                    <PrescribeMedicine patients={patients} doctorName={user?.name} onSuccess={loadData} />
                )}
                {activeTab === 'diagnose' && (
                    <AddDiagnosis patients={patients} onSuccess={loadData} />
                )}
                {activeTab === 'notifications' && (
                    <DoctorNotifications drafts={drafts} queries={queries} doctorEmail={user?.email} onRefresh={loadData} />
                )}
            </div>
        </div>
    );
}
