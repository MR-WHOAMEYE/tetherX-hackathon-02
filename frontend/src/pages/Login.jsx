import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Zap, Shield, Activity, Users } from 'lucide-react';
import DNAHelix from '../components/DNAHelix';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!email || !password) { setError('Please fill in all fields'); return; }

        setLoading(true);
        const result = await login(email, password);
        setLoading(false);

        if (result.success) {
            if (result.user.role === 'admin') navigate('/admin');
            else if (result.user.role === 'doctor') navigate('/doctor');
            else if (result.user.role === 'nurse') navigate('/nurse');
            else navigate('/patient');
        } else {
            if (result.needsVerification) navigate(`/verify/${result.userId}`);
            else setError(result.error);
        }
    };

    const fillDemo = (role) => {
        const creds = {
            admin:   { email: 'admin@hospital.ai',        password: 'admin123' },
            doctor:  { email: 'srinivasan-1@hospital.ai', password: 'password123' },
            nurse:   { email: 'rekha-5@hospital.ai',      password: 'password123' },
            patient: { email: 'ravi.kumar@patient.ai',    password: 'patient123' },
        };
        setEmail(creds[role].email);
        setPassword(creds[role].password);
        setError('');
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>

            {/* ─── LEFT PANEL — Dark branding ─────────────────────────── */}
            <div style={{
                width: '50%',
                background: 'linear-gradient(160deg, #0a2e2e 0%, #0f3d3d 40%, #0a2e2e 100%)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '2.5rem',
                overflow: 'hidden',
                color: 'white',
            }}>
                {/* 3D DNA Helix */}
                <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'auto' }}>
                    <DNAHelix />
                </div>

                {/* Logo */}
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: 42, height: 42, borderRadius: 'var(--radius-md)',
                            background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Zap size={22} color="#10b981" />
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '1.125rem', letterSpacing: '-0.01em' }}>TetherX Health</div>
                            <div style={{ fontSize: '0.6875rem', color: '#10b981', fontWeight: 400, letterSpacing: '0.02em' }}>Healthcare Intelligence Platform</div>
                        </div>
                    </div>
                </div>

                {/* Tagline */}
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <h1 style={{
                        fontSize: '3rem', fontWeight: 700, lineHeight: 1.15,
                        letterSpacing: '-0.02em',
                    }}>
                        Operational<br />
                        Intelligence,<br />
                        <span style={{ color: '#10b981' }}>Reimagined.</span>
                    </h1>
                    <p style={{
                        marginTop: '1.25rem', fontSize: '1rem', color: 'rgba(255,255,255,0.6)',
                        lineHeight: 1.7, maxWidth: 380,
                    }}>
                        Real-time analytics, predictive insights, and AI-powered
                        decision support for modern healthcare administration.
                    </p>
                </div>

                {/* Stats */}
                <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: '2.5rem' }}>
                    {[
                        { value: '847+', label: 'Active Cases' },
                        { value: '218', label: 'Staff Monitored' },
                        { value: '94%', label: 'SLA Compliance' },
                    ].map(stat => (
                        <div key={stat.label}>
                            <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{stat.value}</div>
                            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', marginTop: '0.125rem' }}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ─── RIGHT PANEL — Login form ──────────────────────────── */}
            <div style={{
                width: '50%',
                background: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '3rem 4rem',
            }}>
                <div className="animate-fade-in" style={{ maxWidth: 420, width: '100%', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#111827', marginBottom: '0.375rem' }}>
                        Welcome back
                    </h2>
                    <p style={{ fontSize: '0.9375rem', color: '#6b7280', marginBottom: '2rem' }}>
                        Sign in to access the command center
                    </p>

                    {/* Error */}
                    {error && (
                        <div style={{
                            padding: '0.75rem 1rem', marginBottom: '1.25rem',
                            background: '#fef2f2', border: '1px solid #fecaca',
                            borderRadius: 'var(--radius-md)', color: '#dc2626',
                            fontSize: '0.8125rem', fontWeight: 500,
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Email */}
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{
                                display: 'block', marginBottom: '0.5rem',
                                fontSize: '0.75rem', fontWeight: 600,
                                color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em',
                            }}>
                                Email
                            </label>
                            <input
                                id="login-email"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="you@hospital.ai"
                                style={{
                                    width: '100%', padding: '0.75rem 1rem',
                                    border: '1px solid #d1d5db', borderRadius: 'var(--radius-md)',
                                    fontSize: '0.9375rem', color: '#111827',
                                    background: '#ffffff', outline: 'none',
                                    transition: 'border-color 0.2s, box-shadow 0.2s',
                                    fontFamily: 'var(--font-sans)',
                                }}
                                onFocus={e => { e.target.style.borderColor = '#059669'; e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.1)'; }}
                                onBlur={e => { e.target.style.borderColor = '#d1d5db'; e.target.style.boxShadow = 'none'; }}
                            />
                        </div>

                        {/* Password */}
                        <div style={{ marginBottom: '1.75rem' }}>
                            <label style={{
                                display: 'block', marginBottom: '0.5rem',
                                fontSize: '0.75rem', fontWeight: 600,
                                color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em',
                            }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    style={{
                                        width: '100%', padding: '0.75rem 1rem',
                                        paddingRight: '2.75rem',
                                        border: '1px solid #d1d5db', borderRadius: 'var(--radius-md)',
                                        fontSize: '0.9375rem', color: '#111827',
                                        background: '#ffffff', outline: 'none',
                                        transition: 'border-color 0.2s, box-shadow 0.2s',
                                        fontFamily: 'var(--font-sans)',
                                    }}
                                    onFocus={e => { e.target.style.borderColor = '#059669'; e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.1)'; }}
                                    onBlur={e => { e.target.style.borderColor = '#d1d5db'; e.target.style.boxShadow = 'none'; }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute', right: 10, top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: '#9ca3af', padding: 4,
                                    }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%', padding: '0.8125rem',
                                background: '#059669', color: 'white',
                                border: 'none', borderRadius: 'var(--radius-full)',
                                fontSize: '0.9375rem', fontWeight: 600,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.7 : 1,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                fontFamily: 'var(--font-sans)',
                                transition: 'background 0.2s, box-shadow 0.2s',
                                boxShadow: '0 2px 8px rgba(5,150,105,0.25)',
                            }}
                            onMouseEnter={e => { if (!loading) { e.target.style.background = '#047857'; e.target.style.boxShadow = '0 4px 16px rgba(5,150,105,0.35)'; } }}
                            onMouseLeave={e => { e.target.style.background = '#059669'; e.target.style.boxShadow = '0 2px 8px rgba(5,150,105,0.25)'; }}
                        >
                            {loading ? 'Signing in...' : <>Sign In <ArrowRight size={18} /></>}
                        </button>
                    </form>

                    {/* Demo Credentials */}
                    <div style={{
                        marginTop: '2rem', padding: '1.125rem 1.25rem',
                        background: '#ecfdf5', borderRadius: 'var(--radius-lg)',
                        border: '1px solid #a7f3d0',
                    }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            marginBottom: '0.75rem',
                        }}>
                            <Shield size={16} color="#059669" />
                            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#065f46' }}>
                                Demo Credentials
                            </span>
                        </div>

                        {[
                            { role: 'Admin', email: 'admin@hospital.ai', pw: 'admin123', dot: '#6366f1' },
                            { role: 'Doctor', email: 'srinivasan-1@hospital.ai', pw: 'password123', dot: '#059669' },
                            { role: 'Nurse', email: 'rekha-5@hospital.ai', pw: 'password123', dot: '#0d9488' },
                            { role: 'Patient', email: 'ravi.kumar@patient.ai', pw: 'patient123', dot: '#f59e0b' },
                        ].map(item => (
                            <button
                                key={item.role}
                                type="button"
                                onClick={() => fillDemo(item.role.toLowerCase())}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    width: '100%', textAlign: 'left',
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    padding: '0.3125rem 0', fontFamily: 'var(--font-mono)',
                                    fontSize: '0.75rem', color: '#065f46',
                                    transition: 'opacity 0.15s',
                                }}
                                onMouseEnter={e => e.target.style.opacity = '0.7'}
                                onMouseLeave={e => e.target.style.opacity = '1'}
                            >
                                <span style={{
                                    width: 8, height: 8, borderRadius: '50%',
                                    background: item.dot, flexShrink: 0,
                                }} />
                                <span style={{ fontWeight: 600, minWidth: 52 }}>{item.role}:</span>
                                <span>{item.email}</span>
                                <span style={{ color: '#6b7280' }}>/</span>
                                <span>{item.pw}</span>
                            </button>
                        ))}
                    </div>

                    {/* Footer */}
                    <div style={{
                        textAlign: 'center', marginTop: '2rem',
                        fontSize: '0.75rem', color: '#9ca3af',
                    }}>
                        © 2026 TetherX Health — Healthcare Intelligence Platform
                    </div>
                </div>
            </div>
        </div>
    );
}
