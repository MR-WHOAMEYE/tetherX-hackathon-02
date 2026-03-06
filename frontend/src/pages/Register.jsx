import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Phone, Zap, Eye, EyeOff, Stethoscope, HeartPulse, UserCircle, Building, BadgeCheck } from 'lucide-react';

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [role, setRole] = useState(searchParams.get('role') || 'patient');
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', confirmPassword: '', phone: '',
        specialization: '', department: '', licenseNo: '', nursingId: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.name || !formData.email || !formData.password) {
            setError('Please fill in all required fields');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        const result = await register({ ...formData, role });
        setLoading(false);

        if (result.success) {
            navigate(`/verify/${result.user.id}`, {
                state: { verificationCode: result.verificationCode, email: formData.email }
            });
        } else {
            setError(result.error);
        }
    };

    const roleConfig = {
        doctor: { label: 'Doctor', icon: Stethoscope, color: '#059669' },
        nurse: { label: 'Nurse', icon: HeartPulse, color: '#0d9488' },
        patient: { label: 'Patient', icon: UserCircle, color: '#047857' },
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--color-bg-primary)', padding: '2rem',
        }}>
            <div className="animate-fade-in-up" style={{ width: '100%', maxWidth: '520px' }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 'var(--radius-lg)',
                        background: 'var(--gradient-primary)',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '0.75rem',
                    }}>
                        <Zap size={24} color="white" />
                    </div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Create Account</h1>
                    <p style={{ color: 'var(--color-text-tertiary)', fontSize: '0.875rem' }}>
                        Join TetherX Healthcare Platform
                    </p>
                </div>

                {/* Role Selector */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    {Object.entries(roleConfig).map(([r, config]) => {
                        const Icon = config.icon;
                        const isActive = role === r;
                        return (
                            <button key={r} type="button" onClick={() => setRole(r)} style={{
                                padding: '0.75rem', borderRadius: 'var(--radius-md)',
                                border: `2px solid ${isActive ? config.color : 'var(--color-border)'}`,
                                background: isActive ? `${config.color}12` : 'var(--color-bg-secondary)',
                                cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
                                transition: 'all var(--transition-fast)',
                                color: isActive ? config.color : 'var(--color-text-secondary)',
                            }}>
                                <Icon size={20} />
                                <span style={{ fontSize: '0.75rem', fontWeight: isActive ? 600 : 400 }}>{config.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Registration Form */}
                <form onSubmit={handleSubmit} style={{
                    background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-xl)', padding: '1.75rem',
                }}>
                    {error && (
                        <div style={{ padding: '0.75rem 1rem', marginBottom: '1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', color: '#dc2626', fontSize: '0.8125rem' }}>
                            {error}
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Full Name *</label>
                            <div style={{ position: 'relative' }}>
                                <User size={15} color="var(--color-text-muted)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
                                <input className="input" placeholder="Your name" value={formData.name} onChange={e => handleChange('name', e.target.value)} style={{ paddingLeft: '2.25rem', fontSize: '0.8125rem' }} />
                            </div>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Phone</label>
                            <div style={{ position: 'relative' }}>
                                <Phone size={15} color="var(--color-text-muted)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
                                <input className="input" placeholder="+91-XXXXX-XXXXX" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} style={{ paddingLeft: '2.25rem', fontSize: '0.8125rem' }} />
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Email Address *</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={15} color="var(--color-text-muted)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
                            <input className="input" type="email" placeholder="you@example.com" value={formData.email} onChange={e => handleChange('email', e.target.value)} style={{ paddingLeft: '2.25rem', fontSize: '0.8125rem' }} />
                        </div>
                    </div>

                    {/* Role-specific fields */}
                    {role === 'doctor' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Specialization</label>
                                <input className="input" placeholder="e.g. Cardiology" value={formData.specialization} onChange={e => handleChange('specialization', e.target.value)} style={{ fontSize: '0.8125rem' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>License No.</label>
                                <input className="input" placeholder="MCI-XXXX-XXXX" value={formData.licenseNo} onChange={e => handleChange('licenseNo', e.target.value)} style={{ fontSize: '0.8125rem' }} />
                            </div>
                        </div>
                    )}

                    {role === 'nurse' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Department</label>
                                <input className="input" placeholder="e.g. General Ward" value={formData.department} onChange={e => handleChange('department', e.target.value)} style={{ fontSize: '0.8125rem' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Nursing ID</label>
                                <input className="input" placeholder="NRS-XXXX-XXXX" value={formData.nursingId} onChange={e => handleChange('nursingId', e.target.value)} style={{ fontSize: '0.8125rem' }} />
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Password *</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={15} color="var(--color-text-muted)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
                                <input className="input" type={showPassword ? 'text' : 'password'} placeholder="Min 6 characters" value={formData.password} onChange={e => handleChange('password', e.target.value)} style={{ paddingLeft: '2.25rem', fontSize: '0.8125rem' }} />
                            </div>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Confirm Password *</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={15} color="var(--color-text-muted)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
                                <input className="input" type={showPassword ? 'text' : 'password'} placeholder="Repeat password" value={formData.confirmPassword} onChange={e => handleChange('confirmPassword', e.target.value)} style={{ paddingLeft: '2.25rem', fontSize: '0.8125rem' }} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 4 }}>
                                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '0.75rem', fontSize: '0.9375rem', fontWeight: 600 }}>
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)' }}>
                            Already have an account?{' '}
                            <Link to="/login" style={{ color: 'var(--color-primary-light)', textDecoration: 'none', fontWeight: 600 }}>Sign In</Link>
                        </span>
                    </div>
                </form>
            </div>
        </div>
    );
}
