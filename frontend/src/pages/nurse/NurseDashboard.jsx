import { useState, useEffect } from 'react';
import {
    Users, UserPlus, Activity, Bell, Search, CheckCircle,
    ChevronDown, ChevronUp, Mail, AlertCircle,
    Thermometer, Heart, Droplets, Wind, Brain, Send, MessageSquare, Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
    apiRegister, apiListUsers, apiRecordVitals, apiGetVitals,
    apiGetDrafts, apiReviewDraft, apiSendDraft, apiListDoctors,
} from '../../services/api';

// ═══ SUB-TAB: Patient List ══════════════════════════════════════
function PatientList({ patients }) {
    const [search, setSearch] = useState('');
    const [expandedId, setExpandedId] = useState(null);

    const filtered = patients.filter(p =>
        (p.name || '').toLowerCase().includes(search.toLowerCase()) || (p.email || '').includes(search)
    );

    return (
        <div>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', alignItems: 'center' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0.5rem 0.75rem' }}>
                    <Search size={15} color="var(--color-text-muted)" />
                    <input type="text" placeholder="Search patients..." value={search} onChange={e => setSearch(e.target.value)} style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--color-text-primary)', fontSize: '0.8125rem', width: '100%', fontFamily: 'var(--font-sans)' }} />
                </div>
            </div>

            {filtered.map(patient => {
                const isExpanded = expandedId === patient.id;

                return (
                    <div key={patient.id} className="card-flat" style={{ marginBottom: '0.75rem', padding: 0, overflow: 'hidden' }}>
                        <div onClick={() => setExpandedId(isExpanded ? null : patient.id)} style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                            <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg, #0d9488, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, flexShrink: 0 }}>
                                {(patient.name || '?').charAt(0)}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{patient.name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                                    {patient.email} · {patient.department || 'General'}
                                </div>
                            </div>
                            {patient.issue && (
                                <span className="badge badge-primary" style={{ fontSize: '0.625rem' }}>{patient.issue}</span>
                            )}
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>

                        {isExpanded && (
                            <div className="animate-fade-in" style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid var(--color-border-light)' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginTop: '1rem' }}>
                                    <div style={{ padding: '0.75rem', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                                        <div style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Mail size={10} /> Email</div>
                                        <div style={{ fontSize: '0.8125rem', fontWeight: 500, marginTop: '0.125rem' }}>{patient.email}</div>
                                    </div>
                                    <div style={{ padding: '0.75rem', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                                        <div style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Department</div>
                                        <div style={{ fontSize: '0.8125rem', fontWeight: 500, marginTop: '0.125rem' }}>{patient.department || 'General'}</div>
                                    </div>
                                    <div style={{ padding: '0.75rem', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                                        <div style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Created</div>
                                        <div style={{ fontSize: '0.8125rem', fontWeight: 500, marginTop: '0.125rem' }}>{patient.created_at ? new Date(patient.created_at).toLocaleDateString() : 'N/A'}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}

            {filtered.length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>No patients found</div>
            )}
        </div>
    );
}

// ═══ SUB-TAB: Register New Patient ══════════════════════════════
function RegisterPatient({ nurseEmail, doctors, onSuccess }) {
    const [form, setForm] = useState({
        name: '', email: '', department: '', issue: '', assignedDoctor: '',
    });
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email) return;
        setSubmitting(true);
        setError('');

        const selectedDoc = doctors.find(d => d.email === form.assignedDoctor);

        try {
            await apiRegister({
                name: form.name,
                email: form.email,
                role: 'patient',
                department: form.department || 'General',
                assigned_doctor: form.assignedDoctor || undefined,
                assigned_doctor_name: selectedDoc?.name || undefined,
                issue: form.issue || undefined,
            });
            setForm({ name: '', email: '', department: '', issue: '', assignedDoctor: '' });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 4000);
            onSuccess?.();
        } catch (err) {
            setError(err?.message || 'Failed to register patient');
        }
        setSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit}>
            {success && (
                <div className="animate-fade-in" style={{ padding: '0.75rem 1rem', marginBottom: '1rem', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-md)', color: '#059669', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={16} /> Patient registered successfully! Default password: patient123
                </div>
            )}
            {error && (
                <div style={{ padding: '0.75rem 1rem', marginBottom: '1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-md)', color: '#ef4444', fontSize: '0.8125rem' }}>
                    {error}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>Full Name *</label>
                    <input className="input" placeholder="Patient full name" value={form.name} onChange={e => handleChange('name', e.target.value)} required />
                </div>
                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>Email Address *</label>
                    <input className="input" type="email" placeholder="patient@email.com" value={form.email} onChange={e => handleChange('email', e.target.value)} required />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>Department</label>
                    <input className="input" placeholder="e.g. Cardiology" value={form.department} onChange={e => handleChange('department', e.target.value)} />
                </div>
                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>Issue / Condition</label>
                    <input className="input" placeholder="e.g. Chest pain, Diabetes" value={form.issue} onChange={e => handleChange('issue', e.target.value)} />
                </div>
                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>Assign Doctor</label>
                    <select className="input" value={form.assignedDoctor} onChange={e => handleChange('assignedDoctor', e.target.value)}>
                        <option value="">Unassigned</option>
                        {doctors.map(d => <option key={d.email} value={d.email}>{d.name} ({d.department || 'General'})</option>)}
                    </select>
                </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ minWidth: 220 }} disabled={submitting}>
                {submitting ? <><Loader2 size={16} className="spin" /> Registering...</> : <><UserPlus size={16} /> Register Patient</>}
            </button>
        </form>
    );
}

// ═══ SUB-TAB: Record Vitals ═════════════════════════════════════
function RecordVitals({ patients, onSuccess }) {
    const [selectedPatient, setSelectedPatient] = useState('');
    const [form, setForm] = useState({
        bp_systolic: '', bp_diastolic: '', sugar_level: '',
        temperature: '', heart_rate: '', notes: '',
    });
    const [success, setSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedPatient) return;
        setSubmitting(true);

        const patient = patients.find(p => p.email === selectedPatient);
        try {
            await apiRecordVitals({
                patient_email: selectedPatient,
                patient_name: patient?.name || '',
                bp_systolic: form.bp_systolic ? Number(form.bp_systolic) : null,
                bp_diastolic: form.bp_diastolic ? Number(form.bp_diastolic) : null,
                sugar_level: form.sugar_level ? Number(form.sugar_level) : null,
                temperature: form.temperature ? Number(form.temperature) : null,
                heart_rate: form.heart_rate ? Number(form.heart_rate) : null,
                notes: form.notes,
            });
            setSelectedPatient('');
            setForm({ bp_systolic: '', bp_diastolic: '', sugar_level: '', temperature: '', heart_rate: '', notes: '' });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
            onSuccess?.();
        } catch (err) {
            console.error('Failed to record vitals:', err);
        }
        setSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit}>
            {success && (
                <div className="animate-fade-in" style={{ padding: '0.75rem 1rem', marginBottom: '1rem', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-md)', color: '#059669', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={16} /> Vitals recorded successfully!
                </div>
            )}

            <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>Select Patient *</label>
                <select className="input" value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)} required style={{ maxWidth: 400 }}>
                    <option value="">Choose patient...</option>
                    {patients.map(p => <option key={p.id || p.email} value={p.email}>{p.name} ({p.email})</option>)}
                </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                {[
                    { field: 'temperature', label: 'Temperature (°F)', icon: Thermometer, placeholder: '98.6' },
                    { field: 'heart_rate', label: 'Heart Rate (bpm)', icon: Heart, placeholder: '72' },
                    { field: 'bp_systolic', label: 'BP Systolic (mmHg)', icon: Droplets, placeholder: '120' },
                    { field: 'bp_diastolic', label: 'BP Diastolic (mmHg)', icon: Wind, placeholder: '80' },
                ].map(item => (
                    <div key={item.field}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>{item.label}</label>
                        <input className="input" type="number" step="0.1" placeholder={item.placeholder} value={form[item.field]} onChange={e => handleChange(item.field, e.target.value)} />
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>Blood Sugar (mg/dL)</label>
                    <input className="input" type="number" placeholder="100" value={form.sugar_level} onChange={e => handleChange('sugar_level', e.target.value)} />
                </div>
                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>Notes / Observations</label>
                    <input className="input" placeholder="Additional observations..." value={form.notes} onChange={e => handleChange('notes', e.target.value)} />
                </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ minWidth: 200 }} disabled={submitting}>
                {submitting ? <><Loader2 size={16} className="spin" /> Saving...</> : <><Activity size={16} /> Save Vitals</>}
            </button>
        </form>
    );
}


// ═══ SUB-TAB: Nurse Notifications ═══════════════════════════════
function NurseNotifications({ drafts, nurseEmail, onRefresh }) {
    const [expandedQ, setExpandedQ] = useState(null);
    const [responseText, setResponseText] = useState('');
    const [sending, setSending] = useState(false);

    const pendingDrafts = drafts.filter(d => d.status === 'ai_generated' || d.status === 'pending');

    const handleApproveAndSend = async (draftId) => {
        setSending(true);
        try {
            await apiReviewDraft(draftId, { action: 'approve', staff_email: nurseEmail, staff_notes: 'Approved by nurse' });
            await apiSendDraft(draftId, { staff_email: nurseEmail });
            setExpandedQ(null);
            setResponseText('');
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
            await apiReviewDraft(draftId, { action: 'edit_and_approve', edited_text: responseText, staff_email: nurseEmail, staff_notes: 'Edited by nurse' });
            await apiSendDraft(draftId, { staff_email: nurseEmail });
            setExpandedQ(null);
            setResponseText('');
            onRefresh?.();
        } catch (err) {
            console.error('Edit failed:', err);
        }
        setSending(false);
    };

    return (
        <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} color="#f59e0b" /> Pending Patient Questions ({pendingDrafts.length})
            </h3>

            {pendingDrafts.map(draft => {
                const isExpanded = expandedQ === draft.id;

                return (
                    <div key={draft.id} className="card-flat" style={{ marginBottom: '0.75rem', padding: 0, overflow: 'hidden', borderLeft: '4px solid #f59e0b' }}>
                        <div onClick={() => { setExpandedQ(isExpanded ? null : draft.id); setResponseText(''); }} style={{ padding: '1rem 1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #0d9488, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, flexShrink: 0 }}>
                                {(draft.patient_name || '?').charAt(0)}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{draft.patient_name}</div>
                                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 400 }}>
                                    {draft.query_subject || draft.query_message?.slice(0, 80)}
                                </div>
                            </div>
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>

                        {isExpanded && (
                            <div className="animate-fade-in" style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid var(--color-border-light)' }}>
                                <div style={{ padding: '0.75rem', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)', margin: '0.75rem 0' }}>
                                    <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Question</div>
                                    <div style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>{draft.query_message}</div>
                                </div>

                                <div style={{ padding: '0.75rem', background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)', borderRadius: 'var(--radius-md)', marginBottom: '0.75rem' }}>
                                    <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <Brain size={12} /> AI Generated Draft
                                    </div>
                                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{draft.draft_text}</div>
                                </div>

                                <textarea className="input" rows={3} placeholder="Edit response or leave blank to send AI draft..." value={responseText} onChange={e => setResponseText(e.target.value)} style={{ marginBottom: '0.75rem' }} />

                                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                    <button className="btn btn-secondary" onClick={() => handleApproveAndSend(draft.id)} disabled={sending}>
                                        <Brain size={14} /> Approve & Send AI Draft
                                    </button>
                                    <button className="btn btn-primary" onClick={() => handleEditAndSend(draft.id)} disabled={!responseText.trim() || sending}>
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
                    <p>No pending questions</p>
                </div>
            )}
        </div>
    );
}


// ═══ MAIN NURSE DASHBOARD ═══════════════════════════════════════
export default function NurseDashboard() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('patients');

    // Backend data
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [drafts, setDrafts] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        if (!user?.email) return;
        setLoading(true);
        try {
            const [uRes, dRes, drRes] = await Promise.all([
                apiListUsers().catch(() => []),
                apiListDoctors().catch(() => ({ doctors: [] })),
                apiGetDrafts().catch(() => ({ drafts: [] })),
            ]);
            const allUsers = Array.isArray(uRes) ? uRes : [];
            setPatients(allUsers.filter(u => u.role === 'patient'));
            setDoctors(dRes.doctors || []);
            setDrafts(drRes.drafts || []);
        } catch (err) {
            console.error('Failed to load nurse data:', err);
        }
        setLoading(false);
    };

    useEffect(() => { loadData(); }, [user?.email]);

    const pendingCount = drafts.filter(d => d.status === 'ai_generated' || d.status === 'pending').length;

    const tabs = [
        { id: 'patients', label: 'Patient List', icon: Users },
        { id: 'register', label: 'Register Patient', icon: UserPlus },
        { id: 'vitals', label: 'Record Vitals', icon: Activity },
        { id: 'notifications', label: 'Questions', icon: Bell, badge: pendingCount },
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
            <div className="page-header">
                <h1 className="page-title">Nurse Dashboard</h1>
                <p className="page-subtitle">Welcome, {user?.name}. {user?.department || 'General'} Department · {patients.length} patients</p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total Patients', value: patients.length, icon: Users, color: '#0d9488' },
                    { label: 'Doctors', value: doctors.length, icon: CheckCircle, color: '#10b981' },
                    { label: 'AI Drafts', value: drafts.length, icon: Brain, color: '#047857' },
                    { label: 'Pending Review', value: pendingCount, icon: MessageSquare, color: pendingCount > 0 ? '#f59e0b' : '#10b981' },
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
            <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border-light)' }}>
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="btn" style={{
                            background: 'none', border: 'none', borderBottom: isActive ? '2px solid #059669' : '2px solid transparent',
                            borderRadius: 0, color: isActive ? '#059669' : 'var(--color-text-secondary)',
                            fontWeight: isActive ? 600 : 400, padding: '0.75rem 1.25rem', fontSize: '0.875rem',
                        }}>
                            <Icon size={16} /> {tab.label}
                            {tab.badge > 0 && <span style={{ marginLeft: 6, background: '#ef4444', color: 'white', fontSize: '0.625rem', fontWeight: 700, padding: '0.0625rem 0.375rem', borderRadius: 'var(--radius-full)', minWidth: 18, textAlign: 'center', display: 'inline-block' }}>{tab.badge}</span>}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="animate-fade-in">
                {activeTab === 'patients' && <PatientList patients={patients} />}
                {activeTab === 'register' && <RegisterPatient nurseEmail={user?.email} doctors={doctors} onSuccess={loadData} />}
                {activeTab === 'vitals' && <RecordVitals patients={patients} onSuccess={loadData} />}
                {activeTab === 'notifications' && <NurseNotifications drafts={drafts} nurseEmail={user?.email} onRefresh={loadData} />}
            </div>
        </div>
    );
}
