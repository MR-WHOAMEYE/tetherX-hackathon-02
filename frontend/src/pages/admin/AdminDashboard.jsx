import { useState, useEffect } from 'react';
import {
    Users, UserPlus, Shield, Stethoscope, HeartPulse,
    CheckCircle, AlertCircle, Loader2, Search, ChevronDown, ChevronUp, Trash2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiRegister, apiListUsers } from '../../services/api';

const DEPARTMENTS = [
    'Emergency', 'Cardiology', 'Orthopedics', 'Pediatrics',
    'Neurology', 'ICU', 'General Medicine', 'Surgery',
    'Dermatology', 'Oncology', 'Radiology', 'Psychiatry',
];

const SPECIALIZATIONS = {
    doctor: [
        'General Physician', 'Cardiologist', 'Neurologist', 'Orthopedic Surgeon',
        'Pediatrician', 'Dermatologist', 'Oncologist', 'Radiologist',
        'Psychiatrist', 'Anesthesiologist', 'Pulmonologist', 'Nephrologist',
        'Gastroenterologist', 'Endocrinologist', 'Emergency Medicine',
    ],
    nurse: [
        'Registered Nurse (RN)', 'ICU Nurse', 'ER Nurse', 'Pediatric Nurse',
        'Surgical Nurse', 'Psychiatric Nurse', 'Oncology Nurse',
        'Cardiac Nurse', 'Neonatal Nurse', 'Nurse Practitioner (NP)',
    ],
};

// ═══ CREATE ACCOUNT FORM ════════════════════════════════════════
function CreateAccountForm({ onSuccess }) {
    const [role, setRole] = useState('doctor');
    const [form, setForm] = useState({
        name: '', email: '', password: '', department: '', specialization: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState('');

    const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

    const handleRoleSwitch = (newRole) => {
        setRole(newRole);
        setForm(prev => ({ ...prev, specialization: '' }));
        setError('');
        setSuccess(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.password) {
            setError('Name, email and password are required');
            return;
        }
        setSubmitting(true);
        setError('');
        setSuccess(null);

        try {
            const res = await apiRegister({
                name: form.name,
                email: form.email,
                password: form.password,
                role,
                department: form.department || undefined,
                specialization: form.specialization || undefined,
            });

            const u = res.user;
            const idLabel = role === 'doctor'
                ? `License No: LIC-${u.license_no}`
                : `Nursing ID: NRS-${u.nursing_id}`;

            setSuccess({ name: u.name, idLabel });
            setForm({ name: '', email: '', password: '', department: '', specialization: '' });
            onSuccess?.();
        } catch (err) {
            setError(err?.message || 'Registration failed');
        }
        setSubmitting(false);
    };

    return (
        <div>
            {/* Role Toggle */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {[
                    { key: 'doctor', label: 'Doctor', icon: Stethoscope, color: '#059669' },
                    { key: 'nurse', label: 'Nurse', icon: HeartPulse, color: '#0d9488' },
                ].map(r => (
                    <button key={r.key} type="button" onClick={() => handleRoleSwitch(r.key)} className="btn" style={{
                        background: role === r.key ? `${r.color}15` : 'var(--color-bg-tertiary)',
                        border: role === r.key ? `2px solid ${r.color}` : '2px solid var(--color-border)',
                        color: role === r.key ? r.color : 'var(--color-text-secondary)',
                        fontWeight: role === r.key ? 700 : 400,
                        padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)',
                        display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
                        transition: 'all 0.2s',
                    }}>
                        <r.icon size={18} /> {r.label}
                    </button>
                ))}
            </div>

            {/* Success Banner */}
            {success && (
                <div className="animate-fade-in" style={{
                    padding: '1rem 1.25rem', marginBottom: '1.25rem',
                    background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
                    borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.75rem',
                }}>
                    <CheckCircle size={20} color="#059669" />
                    <div>
                        <div style={{ fontWeight: 600, color: '#059669', fontSize: '0.875rem' }}>
                            Account Created — {success.name}
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: '#047857', marginTop: '0.125rem' }}>
                            {success.idLabel} (auto-assigned)
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div style={{
                    padding: '0.75rem 1rem', marginBottom: '1rem',
                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: 'var(--radius-md)', color: '#ef4444', fontSize: '0.8125rem',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                }}>
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                        <label style={labelStyle}>Full Name *</label>
                        <input className="input" placeholder={role === 'doctor' ? 'Dr. John Smith' : 'Jane Doe'} value={form.name} onChange={e => handleChange('name', e.target.value)} required />
                    </div>
                    <div>
                        <label style={labelStyle}>Email *</label>
                        <input className="input" type="email" placeholder="name@hospital.ai" value={form.email} onChange={e => handleChange('email', e.target.value)} required />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                        <label style={labelStyle}>Password *</label>
                        <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={e => handleChange('password', e.target.value)} required />
                    </div>
                    <div>
                        <label style={labelStyle}>Department</label>
                        <select className="input" value={form.department} onChange={e => handleChange('department', e.target.value)}>
                            <option value="">Select department...</option>
                            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>Specialization</label>
                        <select className="input" value={form.specialization} onChange={e => handleChange('specialization', e.target.value)}>
                            <option value="">Select specialization...</option>
                            {(SPECIALIZATIONS[role] || []).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>

                {/* Auto-increment info */}
                <div style={{
                    padding: '0.75rem 1rem', marginBottom: '1.25rem',
                    background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)',
                    fontSize: '0.8125rem', color: 'var(--color-text-tertiary)',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                }}>
                    <Shield size={14} />
                    {role === 'doctor'
                        ? 'License No. will be auto-assigned (e.g. LIC-1001, LIC-1002, ...)'
                        : 'Nursing ID will be auto-assigned (e.g. NRS-5001, NRS-5002, ...)'
                    }
                </div>

                <button type="submit" className="btn btn-primary" style={{ minWidth: 240 }} disabled={submitting}>
                    {submitting
                        ? <><Loader2 size={16} className="spin" /> Creating...</>
                        : <><UserPlus size={16} /> Create {role === 'doctor' ? 'Doctor' : 'Nurse'} Account</>
                    }
                </button>
            </form>
        </div>
    );
}

const labelStyle = {
    fontSize: '0.75rem', fontWeight: 600,
    color: 'var(--color-text-tertiary)',
    display: 'block', marginBottom: '0.25rem',
    textTransform: 'uppercase', letterSpacing: '0.025em',
};

// ═══ STAFF LIST ═════════════════════════════════════════════════
function StaffList({ users, onRefresh }) {
    const [search, setSearch] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [expandedId, setExpandedId] = useState(null);

    const staff = users.filter(u => u.role === 'doctor' || u.role === 'nurse');
    const filtered = staff.filter(u => {
        const matchSearch = (u.name || '').toLowerCase().includes(search.toLowerCase()) || (u.email || '').includes(search.toLowerCase());
        const matchRole = filterRole === 'all' || u.role === filterRole;
        return matchSearch && matchRole;
    });

    const doctors = staff.filter(u => u.role === 'doctor');
    const nurses = staff.filter(u => u.role === 'nurse');

    return (
        <div>
            {/* Stats */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
                {[
                    { label: 'Total Staff', count: staff.length, color: '#059669' },
                    { label: 'Doctors', count: doctors.length, color: '#0d9488' },
                    { label: 'Nurses', count: nurses.length, color: '#14b8a6' },
                ].map(s => (
                    <div key={s.label} style={{
                        padding: '0.75rem 1.25rem', background: `${s.color}10`,
                        border: `1px solid ${s.color}25`, borderRadius: 'var(--radius-md)',
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                    }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: s.color }}>{s.count}</div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', alignItems: 'center' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0.5rem 0.75rem' }}>
                    <Search size={15} color="var(--color-text-muted)" />
                    <input type="text" placeholder="Search staff..." value={search} onChange={e => setSearch(e.target.value)} style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--color-text-primary)', fontSize: '0.8125rem', width: '100%', fontFamily: 'var(--font-sans)' }} />
                </div>
                {['all', 'doctor', 'nurse'].map(r => (
                    <button key={r} className="btn" onClick={() => setFilterRole(r)} style={{
                        background: filterRole === r ? '#059669' : 'var(--color-bg-tertiary)',
                        color: filterRole === r ? 'white' : 'var(--color-text-secondary)',
                        border: '1px solid ' + (filterRole === r ? '#059669' : 'var(--color-border)'),
                        padding: '0.375rem 0.75rem', fontSize: '0.75rem', borderRadius: 'var(--radius-md)',
                        cursor: 'pointer', fontWeight: filterRole === r ? 600 : 400,
                    }}>
                        {r === 'all' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1) + 's'}
                    </button>
                ))}
            </div>

            {/* Staff Cards */}
            {filtered.map(u => {
                const isExpanded = expandedId === (u.id || u.email);
                const roleColor = u.role === 'doctor' ? '#059669' : '#0d9488';
                const idLabel = u.role === 'doctor'
                    ? (u.license_no ? `LIC-${u.license_no}` : '—')
                    : (u.nursing_id ? `NRS-${u.nursing_id}` : '—');

                return (
                    <div key={u.id || u.email} className="card-flat" style={{ marginBottom: '0.625rem', padding: 0, overflow: 'hidden' }}>
                        <div onClick={() => setExpandedId(isExpanded ? null : (u.id || u.email))} style={{ padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: '50%',
                                background: `linear-gradient(135deg, ${roleColor}, ${roleColor}aa)`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', fontWeight: 700, flexShrink: 0, fontSize: '0.875rem',
                            }}>
                                {(u.name || '?').charAt(0)}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{u.name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                                    {u.email} · {u.department || 'General'}
                                </div>
                            </div>
                            <span style={{
                                fontSize: '0.6875rem', fontWeight: 600, padding: '0.125rem 0.5rem',
                                borderRadius: 'var(--radius-full)', textTransform: 'uppercase',
                                background: `${roleColor}15`, color: roleColor, letterSpacing: '0.03em',
                            }}>
                                {u.role}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                                {idLabel}
                            </span>
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>

                        {isExpanded && (
                            <div className="animate-fade-in" style={{ padding: '0 1.25rem 1rem', borderTop: '1px solid var(--color-border-light)' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginTop: '0.75rem' }}>
                                    {[
                                        { label: u.role === 'doctor' ? 'License No.' : 'Nursing ID', value: idLabel },
                                        { label: 'Department', value: u.department || 'General' },
                                        { label: 'Specialization', value: u.specialization || '—' },
                                        { label: 'Created', value: u.created_at ? new Date(u.created_at).toLocaleDateString() : '—' },
                                    ].map(item => (
                                        <div key={item.label} style={{ padding: '0.625rem', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                                            <div style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>{item.label}</div>
                                            <div style={{ fontSize: '0.8125rem', fontWeight: 500, marginTop: '0.125rem' }}>{item.value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}

            {filtered.length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
                    No staff found
                </div>
            )}
        </div>
    );
}

// ═══ MAIN ADMIN DASHBOARD ═══════════════════════════════════════
export default function AdminDashboard() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('create');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await apiListUsers();
            setUsers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to load users:', err);
        }
        setLoading(false);
    };

    useEffect(() => { loadUsers(); }, []);

    const tabs = [
        { id: 'create', label: 'Create Account', icon: UserPlus },
        { id: 'staff', label: 'Staff Directory', icon: Users },
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
                <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Shield size={24} color="#059669" /> Admin Dashboard
                </h1>
                <p className="page-subtitle">
                    Manage doctor and nurse accounts · {users.filter(u => u.role === 'doctor').length} doctors · {users.filter(u => u.role === 'nurse').length} nurses
                </p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border-light)' }}>
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="btn" style={{
                            background: 'none', border: 'none',
                            borderBottom: isActive ? '2px solid #059669' : '2px solid transparent',
                            borderRadius: 0,
                            color: isActive ? '#059669' : 'var(--color-text-secondary)',
                            fontWeight: isActive ? 600 : 400,
                            padding: '0.75rem 1.25rem', fontSize: '0.875rem',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                        }}>
                            <Icon size={16} /> {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="animate-fade-in">
                {activeTab === 'create' && <CreateAccountForm onSuccess={loadUsers} />}
                {activeTab === 'staff' && <StaffList users={users} onRefresh={loadUsers} />}
            </div>
        </div>
    );
}
