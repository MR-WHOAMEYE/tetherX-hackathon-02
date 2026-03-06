import { useState, useMemo } from 'react';
import {
    Users, FileText, Pill, Bell, ClipboardList, Plus,
    ChevronDown, ChevronUp, Activity, Send, X, Save,
    AlertCircle, CheckCircle, Brain, MessageSquare, Download, Search
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { generateReportPDF } from '../../services/pdfService';

// ═══ SUB-TAB: My Patients ═══════════════════════════════════════
function MyPatients({ patients, getPatientVitals, getPatientPrescriptions }) {
    const [expandedId, setExpandedId] = useState(null);
    const [search, setSearch] = useState('');

    const filtered = patients.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) || p.id.includes(search)
    );

    return (
        <div>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', alignItems: 'center' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0.5rem 0.75rem' }}>
                    <Search size={15} color="var(--color-text-muted)" />
                    <input type="text" placeholder="Search patients by name or ID..." value={search} onChange={e => setSearch(e.target.value)} style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--color-text-primary)', fontSize: '0.8125rem', width: '100%', fontFamily: 'var(--font-sans)' }} />
                </div>
                <span className="badge badge-primary">{filtered.length} patients</span>
            </div>

            {filtered.map(patient => {
                const isExpanded = expandedId === patient.id;
                const patientVitals = getPatientVitals(patient.id);
                const patientRx = getPatientPrescriptions(patient.id);
                const latestVitals = patientVitals[0];

                return (
                    <div key={patient.id} className="card-flat" style={{ marginBottom: '0.75rem', padding: 0, overflow: 'hidden' }}>
                        <div onClick={() => setExpandedId(isExpanded ? null : patient.id)} style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1rem', flexShrink: 0 }}>
                                {patient.name.charAt(0)}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{patient.name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                                    {patient.id} · {patient.age}y · {patient.gender} · {patient.bloodGroup}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', flexShrink: 0, maxWidth: 250 }}>
                                {patient.conditions.map(c => (
                                    <span key={c} className="badge badge-accent" style={{ fontSize: '0.625rem' }}>{c}</span>
                                ))}
                            </div>
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
                                        <div style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Phone</div>
                                        <div style={{ fontSize: '0.8125rem', fontWeight: 500, marginTop: '0.125rem' }}>{patient.phone}</div>
                                    </div>
                                    <div style={{ padding: '0.75rem', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                                        <div style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Allergies</div>
                                        <div style={{ fontSize: '0.8125rem', fontWeight: 500, marginTop: '0.125rem', color: patient.allergies.length ? '#f87171' : 'var(--color-text-secondary)' }}>
                                            {patient.allergies.length ? patient.allergies.join(', ') : 'None known'}
                                        </div>
                                    </div>
                                </div>

                                {/* Latest Vitals */}
                                {latestVitals && (
                                    <div style={{ marginBottom: '1rem' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                                            <Activity size={12} style={{ verticalAlign: -2 }} /> Latest Vitals ({new Date(latestVitals.recordedAt).toLocaleDateString()})
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                                            {[
                                                { label: 'BP', value: `${latestVitals.bloodPressureSystolic}/${latestVitals.bloodPressureDiastolic}`, unit: 'mmHg', warn: latestVitals.bloodPressureSystolic > 140 },
                                                { label: 'Heart Rate', value: latestVitals.heartRate, unit: 'bpm' },
                                                { label: 'SpO2', value: latestVitals.oxygenSaturation, unit: '%', warn: latestVitals.oxygenSaturation < 95 },
                                                { label: 'Temp', value: latestVitals.temperature, unit: '°F', warn: latestVitals.temperature > 99.5 },
                                                { label: 'Blood Sugar (F)', value: latestVitals.bloodSugarFasting, unit: 'mg/dL', warn: latestVitals.bloodSugarFasting > 130 },
                                                { label: 'Blood Sugar (PP)', value: latestVitals.bloodSugarPP, unit: 'mg/dL', warn: latestVitals.bloodSugarPP > 180 },
                                                { label: 'Weight', value: latestVitals.weight, unit: 'kg' },
                                                { label: 'Resp Rate', value: latestVitals.respiratoryRate, unit: '/min' },
                                            ].map(v => (
                                                <div key={v.label} style={{ padding: '0.5rem', background: v.warn ? 'rgba(245,158,11,0.06)' : 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-sm)', border: v.warn ? '1px solid rgba(245,158,11,0.2)' : '1px solid var(--color-border-light)' }}>
                                                    <div style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)' }}>{v.label}</div>
                                                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: v.warn ? '#fbbf24' : 'var(--color-text-primary)' }}>{v.value} <span style={{ fontSize: '0.625rem', fontWeight: 400, color: 'var(--color-text-muted)' }}>{v.unit}</span></div>
                                                </div>
                                            ))}
                                        </div>
                                        {latestVitals.notes && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: '0.5rem', fontStyle: 'italic' }}>Note: {latestVitals.notes}</div>}
                                    </div>
                                )}

                                {/* Active Prescriptions */}
                                {patientRx.length > 0 && (
                                    <div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: '0.375rem' }}>
                                            <Pill size={12} style={{ verticalAlign: -2 }} /> Active Prescriptions ({patientRx.length})
                                        </div>
                                        {patientRx.map(rx => (
                                            <div key={rx.id} style={{ padding: '0.5rem', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-sm)', marginBottom: '0.375rem', fontSize: '0.8125rem' }}>
                                                <strong>{rx.diagnosis}</strong> — {rx.medicines.map(m => m.name).join(', ')}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ═══ SUB-TAB: Prescribe Medicine ═════════════════════════════════
function PrescribeMedicine({ patients, addPrescription, doctorId }) {
    const [selectedPatient, setSelectedPatient] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [notes, setNotes] = useState('');
    const [medicines, setMedicines] = useState([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
    const [success, setSuccess] = useState(false);

    const addMedicineRow = () => {
        setMedicines(prev => [...prev, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
    };

    const updateMedicine = (index, field, value) => {
        setMedicines(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m));
    };

    const removeMedicine = (index) => {
        if (medicines.length > 1) {
            setMedicines(prev => prev.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedPatient || !diagnosis || medicines.some(m => !m.name)) return;

        addPrescription({ patientId: selectedPatient, diagnosis, medicines, notes }, doctorId);
        setSelectedPatient('');
        setDiagnosis('');
        setNotes('');
        setMedicines([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
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
                        {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
                    </select>
                </div>
                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>Diagnosis *</label>
                    <input className="input" placeholder="Primary diagnosis..." value={diagnosis} onChange={e => setDiagnosis(e.target.value)} required />
                </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>
                        <Pill size={12} style={{ verticalAlign: -2 }} /> Medicines
                    </label>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={addMedicineRow}>
                        <Plus size={14} /> Add Medicine
                    </button>
                </div>

                {medicines.map((med, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 2fr auto', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'end' }}>
                        <div>
                            {idx === 0 && <label style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.125rem' }}>Medicine Name *</label>}
                            <input className="input" placeholder="e.g. Metformin 500mg" value={med.name} onChange={e => updateMedicine(idx, 'name', e.target.value)} style={{ fontSize: '0.8125rem' }} required />
                        </div>
                        <div>
                            {idx === 0 && <label style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.125rem' }}>Dosage</label>}
                            <input className="input" placeholder="1 tablet" value={med.dosage} onChange={e => updateMedicine(idx, 'dosage', e.target.value)} style={{ fontSize: '0.8125rem' }} />
                        </div>
                        <div>
                            {idx === 0 && <label style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.125rem' }}>Frequency</label>}
                            <input className="input" placeholder="Twice daily" value={med.frequency} onChange={e => updateMedicine(idx, 'frequency', e.target.value)} style={{ fontSize: '0.8125rem' }} />
                        </div>
                        <div>
                            {idx === 0 && <label style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.125rem' }}>Duration</label>}
                            <input className="input" placeholder="30 days" value={med.duration} onChange={e => updateMedicine(idx, 'duration', e.target.value)} style={{ fontSize: '0.8125rem' }} />
                        </div>
                        <div>
                            {idx === 0 && <label style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.125rem' }}>Instructions</label>}
                            <input className="input" placeholder="After meals" value={med.instructions} onChange={e => updateMedicine(idx, 'instructions', e.target.value)} style={{ fontSize: '0.8125rem' }} />
                        </div>
                        <button type="button" onClick={() => removeMedicine(idx)} className="btn btn-ghost btn-icon" style={{ color: '#ef4444', width: 32, height: 32 }}>
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>Additional Notes</label>
                <textarea className="input" rows={3} placeholder="Diet instructions, follow-up schedule, warnings..." value={notes} onChange={e => setNotes(e.target.value)} style={{ minHeight: 80 }} />
            </div>

            <button type="submit" className="btn btn-primary" style={{ minWidth: 200 }}>
                <Pill size={16} /> Create Prescription
            </button>
        </form>
    );
}

// ═══ SUB-TAB: Generate Report ════════════════════════════════════
function GenerateReport({ patients, prescriptions, getPatientVitals, generateReport: genReport, doctorId, getUser }) {
    const [selectedPatient, setSelectedPatient] = useState('');
    const [title, setTitle] = useState('');
    const [type, setType] = useState('Clinical Assessment');
    const [diagnosis, setDiagnosis] = useState('');
    const [findings, setFindings] = useState('');
    const [recommendations, setRecommendations] = useState('');
    const [selectedRx, setSelectedRx] = useState('');
    const [success, setSuccess] = useState(false);

    const patientRx = prescriptions.filter(p => p.patientId === selectedPatient);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedPatient || !title || !diagnosis) return;
        genReport({ patientId: selectedPatient, title, type, diagnosis, findings, recommendations, prescriptionId: selectedRx || null }, doctorId);
        setSelectedPatient(''); setTitle(''); setDiagnosis(''); setFindings(''); setRecommendations(''); setSelectedRx('');
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
    };

    return (
        <form onSubmit={handleSubmit}>
            {success && (
                <div className="animate-fade-in" style={{ padding: '0.75rem 1rem', marginBottom: '1rem', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-md)', color: '#059669', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={16} /> Report generated and patient notified!
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>Patient *</label>
                    <select className="input" value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)} required>
                        <option value="">Choose patient...</option>
                        {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
                    </select>
                </div>
                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>Report Title *</label>
                    <input className="input" placeholder="e.g. Quarterly Health Review" value={title} onChange={e => setTitle(e.target.value)} required />
                </div>
                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>Report Type</label>
                    <select className="input" value={type} onChange={e => setType(e.target.value)}>
                        <option>Clinical Assessment</option>
                        <option>Follow-up Report</option>
                        <option>Specialist Report</option>
                        <option>Discharge Summary</option>
                        <option>Lab Report</option>
                    </select>
                </div>
            </div>

            {selectedPatient && patientRx.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>Link Prescription (optional)</label>
                    <select className="input" value={selectedRx} onChange={e => setSelectedRx(e.target.value)}>
                        <option value="">No linked prescription</option>
                        {patientRx.map(rx => <option key={rx.id} value={rx.id}>{rx.id} — {rx.diagnosis}</option>)}
                    </select>
                </div>
            )}

            <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>Diagnosis *</label>
                <input className="input" placeholder="Primary diagnosis..." value={diagnosis} onChange={e => setDiagnosis(e.target.value)} required />
            </div>

            <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>Clinical Findings</label>
                <textarea className="input" rows={4} placeholder="Detailed clinical findings, test results, observations..." value={findings} onChange={e => setFindings(e.target.value)} />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>Recommendations</label>
                <textarea className="input" rows={4} placeholder="Treatment plan, follow-up instructions, lifestyle changes..." value={recommendations} onChange={e => setRecommendations(e.target.value)} />
            </div>

            <button type="submit" className="btn btn-primary" style={{ minWidth: 200 }}>
                <FileText size={16} /> Generate Report
            </button>
        </form>
    );
}

// ═══ SUB-TAB: Patient Questions (Notifications) ═════════════════
function DoctorNotifications({ questions, getPatient, answerQuestion, sendAISuggestion, doctorId, getUserNotifications, markNotificationRead, userId }) {
    const [expandedQ, setExpandedQ] = useState(null);
    const [responseText, setResponseText] = useState('');

    const pendingQuestions = questions.filter(q => q.status === 'pending');
    const answeredQuestions = questions.filter(q => q.status === 'answered');
    const notifs = getUserNotifications(userId);
    const unreadCount = notifs.filter(n => !n.read).length;

    const handleSendResponse = (questionId) => {
        if (!responseText.trim()) return;
        answerQuestion(questionId, responseText, doctorId);
        setResponseText('');
        setExpandedQ(null);
    };

    return (
        <div>
            {unreadCount > 0 && (
                <div style={{ padding: '0.75rem 1rem', marginBottom: '1rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Bell size={16} color="#fbbf24" />
                    <span style={{ fontSize: '0.875rem', color: '#d97706' }}>You have {unreadCount} unread notifications</span>
                </div>
            )}

            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} color="#f59e0b" /> Pending Questions ({pendingQuestions.length})
            </h3>

            {pendingQuestions.map(q => {
                const patient = getPatient(q.patientId);
                const isExpanded = expandedQ === q.id;

                return (
                    <div key={q.id} className="card-flat" style={{ marginBottom: '0.75rem', padding: 0, overflow: 'hidden', borderLeft: '4px solid #f59e0b' }}>
                        <div onClick={() => { setExpandedQ(isExpanded ? null : q.id); setResponseText(''); }} style={{ padding: '1rem 1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, flexShrink: 0 }}>
                                {patient?.name?.charAt(0)}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{patient?.name} <span className="badge badge-warning" style={{ fontSize: '0.625rem', marginLeft: 6 }}>Pending</span></div>
                                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 500 }}>{q.question}</div>
                            </div>
                            <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', flexShrink: 0 }}>
                                {new Date(q.createdAt).toLocaleString()}
                            </span>
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>

                        {isExpanded && (
                            <div className="animate-fade-in" style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid var(--color-border-light)' }}>
                                <div style={{ padding: '0.875rem', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)', marginTop: '0.75rem', marginBottom: '0.75rem' }}>
                                    <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: '0.375rem' }}>Patient's Question</div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{q.question}</div>
                                </div>

                                <div style={{ padding: '0.875rem', background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)', borderRadius: 'var(--radius-md)', marginBottom: '0.75rem' }}>
                                    <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                        <Brain size={12} /> AI Suggestion
                                    </div>
                                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{q.aiSuggestion}</div>
                                </div>

                                <div style={{ marginBottom: '0.75rem' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>Your Response</label>
                                    <textarea className="input" rows={4} placeholder="Write your response to the patient..." value={responseText} onChange={e => setResponseText(e.target.value)} />
                                </div>

                                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                    <button type="button" className="btn btn-secondary" onClick={() => { sendAISuggestion(q.id, doctorId); setExpandedQ(null); }}>
                                        <Brain size={14} /> Send AI Suggestion
                                    </button>
                                    <button type="button" className="btn btn-primary" onClick={() => handleSendResponse(q.id)} disabled={!responseText.trim()}>
                                        <Send size={14} /> Send Response
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}

            {pendingQuestions.length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
                    <CheckCircle size={36} color="var(--color-success)" style={{ marginBottom: '0.5rem' }} />
                    <p>No pending questions</p>
                </div>
            )}

            {answeredQuestions.length > 0 && (
                <>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginTop: '1.5rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle size={16} color="var(--color-success)" /> Previously Answered ({answeredQuestions.length})
                    </h3>
                    {answeredQuestions.map(q => {
                        const patient = getPatient(q.patientId);
                        return (
                            <div key={q.id} style={{ padding: '0.75rem 1rem', background: 'var(--color-bg-card)', borderRadius: 'var(--radius-md)', marginBottom: '0.5rem', opacity: 0.7, border: '1px solid var(--color-border-light)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <CheckCircle size={14} color="var(--color-success)" />
                                    <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{patient?.name}</span>
                                    <span style={{ color: 'var(--color-text-tertiary)', fontSize: '0.75rem' }}>— {q.question.slice(0, 60)}...</span>
                                    <span className="badge badge-success" style={{ fontSize: '0.625rem', marginLeft: 'auto' }}>Answered</span>
                                </div>
                            </div>
                        );
                    })}
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
    const { patients, prescriptions, reports, questions, addPrescription, generateReport: genReport, getPatientVitals, getPatientPrescriptions, getPatientReports, getPatient, getUser, answerQuestion, sendAISuggestion, getUserNotifications, markNotificationRead } = useApp();
    const [activeTab, setActiveTab] = useState('patients');

    const tabs = [
        { id: 'patients', label: 'My Patients', icon: Users },
        { id: 'prescribe', label: 'Prescribe Medicine', icon: Pill },
        { id: 'reports', label: 'Generate Report', icon: FileText },
        { id: 'notifications', label: 'Patient Questions', icon: Bell, badge: questions.filter(q => q.status === 'pending').length },
    ];

    const pendingCount = questions.filter(q => q.status === 'pending').length;

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
                    { label: 'Active Prescriptions', value: prescriptions.filter(p => p.status === 'active').length, icon: Pill, color: '#0d9488' },
                    { label: 'Reports Generated', value: reports.length, icon: FileText, color: '#047857' },
                    { label: 'Pending Questions', value: pendingCount, icon: MessageSquare, color: pendingCount > 0 ? '#f59e0b' : '#059669' },
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
                    <MyPatients patients={patients} getPatientVitals={getPatientVitals} getPatientPrescriptions={getPatientPrescriptions} />
                )}
                {activeTab === 'prescribe' && (
                    <PrescribeMedicine patients={patients} addPrescription={addPrescription} doctorId={user.id} />
                )}
                {activeTab === 'reports' && (
                    <GenerateReport patients={patients} prescriptions={prescriptions} getPatientVitals={getPatientVitals} generateReport={genReport} doctorId={user.id} getUser={getUser} />
                )}
                {activeTab === 'notifications' && (
                    <DoctorNotifications questions={questions} getPatient={getPatient} answerQuestion={answerQuestion} sendAISuggestion={sendAISuggestion} doctorId={user.id} getUserNotifications={getUserNotifications} markNotificationRead={markNotificationRead} userId={user.id} />
                )}
            </div>
        </div>
    );
}
