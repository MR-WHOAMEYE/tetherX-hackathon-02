import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Users, UserPlus, Activity, Bell, Search, CheckCircle,
    ChevronDown, ChevronUp, Mail, Phone, ShieldCheck, AlertCircle,
    Thermometer, Heart, Droplets, Wind, Scale, Brain, Send, MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import HeroBanner from '../../components/HeroBanner';

// ═══ SUB-TAB: Patient List ══════════════════════════════════════
function PatientList({ patients, getPatientVitals }) {
    const [search, setSearch] = useState('');
    const [expandedId, setExpandedId] = useState(null);

    const filtered = patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.id.includes(search));

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
                const patientVitals = getPatientVitals(patient.id);
                const latestVitals = patientVitals[0];

                return (
                    <div key={patient.id} className="card-flat" style={{ marginBottom: '0.75rem', padding: 0, overflow: 'hidden' }}>
                        <div onClick={() => setExpandedId(isExpanded ? null : patient.id)} style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                            <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg, #0d9488, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, flexShrink: 0 }}>
                                {patient.name.charAt(0)}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>
                                    {patient.name}
                                    {patient.verified ? <ShieldCheck size={14} color="#10b981" style={{ marginLeft: 6, verticalAlign: -2 }} /> : <span className="badge badge-warning" style={{ marginLeft: 8, fontSize: '0.5625rem' }}>Unverified</span>}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                                    {patient.id} · {patient.age}y · {patient.gender} · {patient.bloodGroup}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
                                {patient.conditions.slice(0, 2).map(c => (
                                    <span key={c} className="badge badge-primary" style={{ fontSize: '0.625rem' }}>{c}</span>
                                ))}
                            </div>
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
                                        <div style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Phone size={10} /> Phone</div>
                                        <div style={{ fontSize: '0.8125rem', fontWeight: 500, marginTop: '0.125rem' }}>{patient.phone}</div>
                                    </div>
                                    <div style={{ padding: '0.75rem', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                                        <div style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Address</div>
                                        <div style={{ fontSize: '0.8125rem', fontWeight: 500, marginTop: '0.125rem' }}>{patient.address}</div>
                                    </div>
                                </div>

                                {patient.allergies.length > 0 && (
                                    <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 'var(--radius-sm)' }}>
                                        <span style={{ fontSize: '0.6875rem', color: '#f87171', fontWeight: 600 }}>⚠ Allergies: </span>
                                        <span style={{ fontSize: '0.8125rem', color: '#fca5a5' }}>{patient.allergies.join(', ')}</span>
                                    </div>
                                )}

                                {latestVitals && (
                                    <div style={{ marginTop: '0.75rem' }}>
                                        <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: '0.375rem' }}>
                                            Latest Vitals — {new Date(latestVitals.recordedAt).toLocaleDateString()}
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.375rem' }}>
                                            {[
                                                { l: 'Temp', v: `${latestVitals.temperature}°F` },
                                                { l: 'BP', v: `${latestVitals.bloodPressureSystolic}/${latestVitals.bloodPressureDiastolic}` },
                                                { l: 'HR', v: `${latestVitals.heartRate} bpm` },
                                                { l: 'SpO2', v: `${latestVitals.oxygenSaturation}%` },
                                            ].map(item => (
                                                <div key={item.l} style={{ padding: '0.375rem', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                                                    <div style={{ fontSize: '0.5625rem', color: 'var(--color-text-muted)' }}>{item.l}</div>
                                                    <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>{item.v}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
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
function RegisterPatient({ registerPatient, nurseId, verifyPatient }) {
    const [form, setForm] = useState({
        name: '', email: '', phone: '', age: '', gender: 'Male', dateOfBirth: '',
        bloodGroup: 'O+', address: '', emergencyContact: '', conditions: '', allergies: '',
    });
    const [step, setStep] = useState('form'); // form, verify, done
    const [registeredPatient, setRegisteredPatient] = useState(null);
    const [verifyCode] = useState(() => Math.floor(100000 + Math.random() * 900000).toString());
    const [enteredCode, setEnteredCode] = useState('');
    const [verifyError, setVerifyError] = useState('');

    const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.phone || !form.age) return;
        const patient = registerPatient(form, nurseId);
        setRegisteredPatient(patient);
        setStep('verify');
    };

    const handleVerify = () => {
        if (enteredCode === verifyCode) {
            verifyPatient(registeredPatient.id);
            setStep('done');
        } else {
            setVerifyError('Invalid verification code. Please try again.');
        }
    };

    if (step === 'done') {
        return (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                    <CheckCircle size={36} color="#10b981" />
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Patient Registered & Verified</h2>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>{registeredPatient.name} — {registeredPatient.id}</p>
                <p style={{ color: 'var(--color-text-tertiary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Confirmation sent to {registeredPatient.email}</p>
                <button className="btn btn-primary" onClick={() => { setStep('form'); setForm({ name: '', email: '', phone: '', age: '', gender: 'Male', dateOfBirth: '', bloodGroup: 'O+', address: '', emergencyContact: '', conditions: '', allergies: '' }); setRegisteredPatient(null); setEnteredCode(''); }}>
                    <UserPlus size={16} /> Register Another Patient
                </button>
            </div>
        );
    }

    if (step === 'verify') {
        return (
            <div style={{ maxWidth: 480, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <ShieldCheck size={40} color="var(--color-accent)" style={{ marginBottom: '0.75rem' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Verify Patient's Email</h3>
                    <p style={{ color: 'var(--color-text-tertiary)', fontSize: '0.875rem' }}>
                        Verification code sent to <strong>{registeredPatient.email}</strong>
                    </p>
                </div>

                <div style={{ padding: '1rem', marginBottom: '1.5rem', background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.375rem' }}>Simulated Email — Verification Code</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', letterSpacing: '0.3em', color: 'var(--color-accent-light)' }}>
                        {verifyCode}
                    </div>
                    <div style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>(In production, this would arrive in the patient's email)</div>
                </div>

                {verifyError && (
                    <div style={{ padding: '0.75rem', marginBottom: '1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-md)', color: '#f87171', fontSize: '0.8125rem' }}>{verifyError}</div>
                )}

                <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>Enter 6-digit Code</label>
                    <input className="input" type="text" maxLength={6} placeholder="000000" value={enteredCode} onChange={e => setEnteredCode(e.target.value.replace(/\D/g, ''))} style={{ textAlign: 'center', fontSize: '1.5rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.25em', fontWeight: 700 }} />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-secondary" onClick={() => setStep('form')} style={{ flex: 1 }}>← Back</button>
                    <button className="btn btn-primary" onClick={handleVerify} disabled={enteredCode.length !== 6} style={{ flex: 2 }}>
                        <ShieldCheck size={16} /> Verify & Complete
                    </button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>Full Name *</label>
                    <input className="input" placeholder="Patient full name" value={form.name} onChange={e => handleChange('name', e.target.value)} required />
                </div>
                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>Email Address *</label>
                    <input className="input" type="email" placeholder="patient@email.com" value={form.email} onChange={e => handleChange('email', e.target.value)} required />
                </div>
                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>Phone Number *</label>
                    <input className="input" placeholder="+91-XXXXX-XXXXX" value={form.phone} onChange={e => handleChange('phone', e.target.value)} required />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>Age *</label>
                    <input className="input" type="number" min="0" max="150" placeholder="Age" value={form.age} onChange={e => handleChange('age', e.target.value)} required />
                </div>
                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>Gender</label>
                    <select className="input" value={form.gender} onChange={e => handleChange('gender', e.target.value)}>
                        <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                </div>
                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>Date of Birth</label>
                    <input className="input" type="date" value={form.dateOfBirth} onChange={e => handleChange('dateOfBirth', e.target.value)} />
                </div>
                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>Blood Group</label>
                    <select className="input" value={form.bloodGroup} onChange={e => handleChange('bloodGroup', e.target.value)}>
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>Address</label>
                <input className="input" placeholder="Full address..." value={form.address} onChange={e => handleChange('address', e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>Emergency Contact</label>
                    <input className="input" placeholder="+91-XXXXX-XXXXX" value={form.emergencyContact} onChange={e => handleChange('emergencyContact', e.target.value)} />
                </div>
                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>Allergies (comma-separated)</label>
                    <input className="input" placeholder="e.g. Penicillin, Aspirin" value={form.allergies} onChange={e => handleChange('allergies', e.target.value)} />
                </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>Known Conditions (comma-separated)</label>
                <input className="input" placeholder="e.g. Diabetes, Hypertension" value={form.conditions} onChange={e => handleChange('conditions', e.target.value)} />
            </div>

            <button type="submit" className="btn btn-primary" style={{ minWidth: 220 }}>
                <UserPlus size={16} /> Register Patient & Verify Email
            </button>
        </form>
    );
}

// ═══ SUB-TAB: Record Vitals ═════════════════════════════════════
function RecordVitals({ patients, recordVitals, nurseId }) {
    const [selectedPatient, setSelectedPatient] = useState('');
    const [form, setForm] = useState({
        temperature: '', bloodPressureSystolic: '', bloodPressureDiastolic: '',
        heartRate: '', respiratoryRate: '', oxygenSaturation: '', weight: '', height: '',
        bloodSugarFasting: '', bloodSugarPP: '', notes: '',
    });
    const [success, setSuccess] = useState(false);

    const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedPatient) return;
        recordVitals({ ...form, patientId: selectedPatient }, nurseId);
        setSelectedPatient('');
        setForm({ temperature: '', bloodPressureSystolic: '', bloodPressureDiastolic: '', heartRate: '', respiratoryRate: '', oxygenSaturation: '', weight: '', height: '', bloodSugarFasting: '', bloodSugarPP: '', notes: '' });
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
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
                    {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
                </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                {[
                    { field: 'temperature', label: 'Temperature (°F)', icon: Thermometer, placeholder: '98.6' },
                    { field: 'heartRate', label: 'Heart Rate (bpm)', icon: Heart, placeholder: '72' },
                    { field: 'oxygenSaturation', label: 'SpO2 (%)', icon: Droplets, placeholder: '98' },
                    { field: 'respiratoryRate', label: 'Resp. Rate (/min)', icon: Wind, placeholder: '16' },
                ].map(item => (
                    <div key={item.field}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>{item.label}</label>
                        <input className="input" type="number" step="0.1" placeholder={item.placeholder} value={form[item.field]} onChange={e => handleChange(item.field, e.target.value)} />
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>BP Systolic (mmHg)</label>
                    <input className="input" type="number" placeholder="120" value={form.bloodPressureSystolic} onChange={e => handleChange('bloodPressureSystolic', e.target.value)} />
                </div>
                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>BP Diastolic (mmHg)</label>
                    <input className="input" type="number" placeholder="80" value={form.bloodPressureDiastolic} onChange={e => handleChange('bloodPressureDiastolic', e.target.value)} />
                </div>
                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>Weight (kg)</label>
                    <input className="input" type="number" step="0.1" placeholder="70" value={form.weight} onChange={e => handleChange('weight', e.target.value)} />
                </div>
                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>Height (cm)</label>
                    <input className="input" type="number" placeholder="170" value={form.height} onChange={e => handleChange('height', e.target.value)} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>Blood Sugar — Fasting (mg/dL)</label>
                    <input className="input" type="number" placeholder="100" value={form.bloodSugarFasting} onChange={e => handleChange('bloodSugarFasting', e.target.value)} />
                </div>
                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>Blood Sugar — Post Prandial (mg/dL)</label>
                    <input className="input" type="number" placeholder="140" value={form.bloodSugarPP} onChange={e => handleChange('bloodSugarPP', e.target.value)} />
                </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>Notes / Observations</label>
                <textarea className="input" rows={3} placeholder="Additional observations..." value={form.notes} onChange={e => handleChange('notes', e.target.value)} />
            </div>

            <button type="submit" className="btn btn-primary" style={{ minWidth: 200 }}>
                <Activity size={16} /> Save Vitals
            </button>
        </form>
    );
}


// ═══ MAIN NURSE DASHBOARD ═══════════════════════════════════════
export default function NurseDashboard() {
    const { user } = useAuth();
    const { patients, questions, registerPatient, verifyPatient, recordVitals, getPatientVitals, getUserNotifications, answerQuestion, sendAISuggestion, getPatient } = useApp();
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'patients');

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab) {
            setActiveTab(tab);
        } else {
            setActiveTab('patients');
        }
    }, [searchParams]);

    const pendingCount = questions.filter(q => q.status === 'pending').length;

    const tabs = [
        { id: 'patients', label: 'Patient List', icon: Users },
        { id: 'register', label: 'Register Patient', icon: UserPlus },
        { id: 'vitals', label: 'Record Vitals', icon: Activity },
        { id: 'notifications', label: 'Questions', icon: Bell, badge: pendingCount },
    ];

    return (
        <div className="page-container">
            <HeroBanner
                role="nurse"
                title="Nurse Dashboard"
                subtitle={`Welcome, ${user?.name}. You are assigned to the ${user?.department || 'General'} Department with ${patients.length} active patients.`}
            />

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total Patients', value: patients.length, icon: Users, color: '#0d9488' },
                    { label: 'Verified', value: patients.filter(p => p.verified).length, icon: ShieldCheck, color: '#10b981' },
                    { label: 'Vitals Today', value: 3, icon: Activity, color: '#047857' },
                    { label: 'Pending Questions', value: pendingCount, icon: MessageSquare, color: pendingCount > 0 ? '#f59e0b' : '#10b981' },
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
                {activeTab === 'patients' && <PatientList patients={patients} getPatientVitals={getPatientVitals} />}
                {activeTab === 'register' && <RegisterPatient registerPatient={registerPatient} nurseId={user.id} verifyPatient={verifyPatient} />}
                {activeTab === 'vitals' && <RecordVitals patients={patients} recordVitals={recordVitals} nurseId={user.id} />}
                {activeTab === 'notifications' && (
                    <NurseNotifications questions={questions} getPatient={getPatient} answerQuestion={answerQuestion} sendAISuggestion={sendAISuggestion} nurseId={user.id} />
                )}
            </div>
        </div>
    );
}

// ═══ SUB-TAB: Nurse Notifications ═══════════════════════════════
function NurseNotifications({ questions, getPatient, answerQuestion, sendAISuggestion, nurseId }) {
    const [expandedQ, setExpandedQ] = useState(null);
    const [responseText, setResponseText] = useState('');

    const pendingQuestions = questions.filter(q => q.status === 'pending');

    return (
        <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} color="#f59e0b" /> Pending Patient Questions ({pendingQuestions.length})
            </h3>

            {pendingQuestions.map(q => {
                const patient = getPatient(q.patientId);
                const isExpanded = expandedQ === q.id;

                return (
                    <div key={q.id} className="card-flat" style={{ marginBottom: '0.75rem', padding: 0, overflow: 'hidden', borderLeft: '4px solid #f59e0b' }}>
                        <div onClick={() => { setExpandedQ(isExpanded ? null : q.id); setResponseText(''); }} style={{ padding: '1rem 1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #0d9488, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, flexShrink: 0 }}>
                                {patient?.name?.charAt(0)}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{patient?.name}</div>
                                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 400 }}>{q.question}</div>
                            </div>
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>

                        {isExpanded && (
                            <div className="animate-fade-in" style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid var(--color-border-light)' }}>
                                <div style={{ padding: '0.75rem', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)', margin: '0.75rem 0' }}>
                                    <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Question</div>
                                    <div style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>{q.question}</div>
                                </div>

                                <div style={{ padding: '0.75rem', background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)', borderRadius: 'var(--radius-md)', marginBottom: '0.75rem' }}>
                                    <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <Brain size={12} /> AI Suggestion
                                    </div>
                                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{q.aiSuggestion}</div>
                                </div>

                                <textarea className="input" rows={3} placeholder="Your response..." value={responseText} onChange={e => setResponseText(e.target.value)} style={{ marginBottom: '0.75rem' }} />

                                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                    <button className="btn btn-secondary" onClick={() => { sendAISuggestion(q.id, nurseId); setExpandedQ(null); }}>
                                        <Brain size={14} /> Send AI Suggestion
                                    </button>
                                    <button className="btn btn-primary" onClick={() => { if (responseText.trim()) { answerQuestion(q.id, responseText, nurseId); setExpandedQ(null); setResponseText(''); } }} disabled={!responseText.trim()}>
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
        </div>
    );
}
