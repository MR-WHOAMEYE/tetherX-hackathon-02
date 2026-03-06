import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, CheckCircle, RefreshCw, Zap, ShieldCheck } from 'lucide-react';

export default function VerifyEmail() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { verifyEmail, resendVerification } = useAuth();

    const initialCode = location.state?.verificationCode || '';
    const email = location.state?.email || '';

    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [displayCode, setDisplayCode] = useState(initialCode);
    const [resending, setResending] = useState(false);

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        const result = await verifyEmail(userId, code);
        if (result.success) {
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2000);
        } else {
            setError(result.error);
        }
    };

    const handleResend = async () => {
        setResending(true);
        const result = await resendVerification(userId);
        setResending(false);
        if (result.success) {
            setDisplayCode(result.verificationCode);
            setError('');
        } else {
            setError(result.error);
        }
    };

    if (success) {
        return (
            <div style={{
                minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--color-bg-primary)', padding: '2rem',
            }}>
                <div className="animate-scale-in" style={{ textAlign: 'center' }}>
                    <div style={{
                        width: 80, height: 80, borderRadius: '50%',
                        background: 'rgba(16,185,129,0.15)', display: 'inline-flex',
                        alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem',
                    }}>
                        <CheckCircle size={40} color="#10b981" />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Email Verified!</h2>
                    <p style={{ color: 'var(--color-text-secondary)' }}>Redirecting to login page...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--color-bg-primary)', padding: '2rem',
        }}>
            <div className="animate-fade-in-up" style={{ width: '100%', maxWidth: '440px' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: 'var(--radius-lg)',
                        background: 'var(--gradient-primary)',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '1rem',
                    }}>
                        <ShieldCheck size={28} color="white" />
                    </div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Verify Your Email</h1>
                    <p style={{ color: 'var(--color-text-tertiary)', fontSize: '0.875rem', marginTop: '0.375rem' }}>
                        {email ? `A verification code was sent to ${email}` : 'Enter the verification code to continue'}
                    </p>
                </div>

                {/* Show verification code (simulated — in real app this would be emailed) */}
                {displayCode && (
                    <div style={{
                        padding: '1rem', marginBottom: '1.5rem',
                        background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)',
                        borderRadius: 'var(--radius-md)', textAlign: 'center',
                    }}>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                            Simulated Email — Your Verification Code
                        </div>
                        <div style={{
                            fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-mono)',
                            letterSpacing: '0.3em', color: 'var(--color-accent-light)',
                        }}>
                            {displayCode}
                        </div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '0.375rem' }}>
                            (In production, this would arrive in your email inbox)
                        </div>
                    </div>
                )}

                <form onSubmit={handleVerify} style={{
                    background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-xl)', padding: '1.75rem',
                }}>
                    {error && (
                        <div style={{ padding: '0.75rem 1rem', marginBottom: '1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', color: '#dc2626', fontSize: '0.8125rem' }}>
                            {error}
                        </div>
                    )}

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.375rem' }}>
                            Enter 6-digit Code
                        </label>
                        <input
                            className="input"
                            type="text"
                            placeholder="000000"
                            maxLength={6}
                            value={code}
                            onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                            style={{
                                textAlign: 'center', fontSize: '1.5rem', fontFamily: 'var(--font-mono)',
                                letterSpacing: '0.25em', fontWeight: 700,
                            }}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={code.length !== 6} style={{ width: '100%', padding: '0.75rem', fontSize: '0.9375rem', fontWeight: 600 }}>
                        <CheckCircle size={18} /> Verify Email
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <button type="button" onClick={handleResend} disabled={resending} className="btn btn-ghost" style={{ fontSize: '0.8125rem' }}>
                            <RefreshCw size={14} /> {resending ? 'Resending...' : 'Resend Code'}
                        </button>
                    </div>
                </form>

                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <button onClick={() => navigate('/login')} className="btn btn-ghost" style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)' }}>
                        ← Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
}
