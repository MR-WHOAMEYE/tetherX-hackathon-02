import React, { useState, useEffect } from 'react';
import { ShieldCheck, HeartPulse, Activity, Brain, Radio } from 'lucide-react';

export default function HeroBanner({ role, title, subtitle, overline, children }) {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const defaultOverline = role === 'doctor' ? 'EXECUTIVE CLINICAL CENTER'
        : role === 'nurse' ? 'NURSING CONTROL STATION'
            : 'PATIENT HEALTH PORTAL';

    const renderIcon = () => {
        const props = { size: 36, color: '#5eead4' }; // Teal/cyan accent color
        if (role === 'doctor') return <ShieldCheck {...props} />;
        if (role === 'nurse') return <HeartPulse {...props} />;
        return <Activity {...props} />;
    };

    return (
        <div style={{
            background: 'linear-gradient(135deg, #135954 0%, #0d4440 100%)', // Deep teal gradient mimicking the reference
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            marginBottom: '2rem',
            minHeight: '280px',
            boxShadow: '0 10px 30px rgba(13, 68, 64, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            color: 'white',
            position: 'relative'
        }}>
            {/* Very faint background brain logo to keep some "AI" context but subtle */}
            <div style={{
                position: 'absolute',
                right: '25%',
                top: '50%',
                transform: 'translateY(-50%)',
                opacity: 0.03,
                pointerEvents: 'none',
                zIndex: 0
            }}>
                <Brain size={400} />
            </div>

            {/* Top Section */}
            <div style={{
                padding: '4rem 3.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '2rem',
                zIndex: 1
            }}>
                {/* Left Side Info */}
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flex: 1, minWidth: '300px' }}>
                    {/* Icon Box */}
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        padding: '1.25rem',
                        borderRadius: '1.25rem',
                        boxShadow: 'inset 0 2px 10px rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        {renderIcon()}
                    </div>

                    <div>
                        <div style={{
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            color: '#5eead4', // Light teal
                            letterSpacing: '0.15em',
                            textTransform: 'uppercase',
                            marginBottom: '0.75rem',
                            opacity: 0.9
                        }}>
                            {overline || defaultOverline}
                        </div>
                        <h1 style={{
                            fontSize: '2.5rem',
                            fontWeight: 700,
                            lineHeight: 1.15,
                            marginBottom: '0.75rem',
                            letterSpacing: '-0.01em',
                            textShadow: '0 2px 10px rgba(0,0,0,0.1)'
                        }}>
                            {title}
                        </h1>
                        <p style={{
                            fontSize: '0.9375rem',
                            fontWeight: 400,
                            color: '#5eead4',
                            opacity: 0.85,
                            margin: 0,
                            maxWidth: '700px',
                            lineHeight: 1.6
                        }}>
                            {subtitle}
                        </p>
                    </div>
                </div>

                {/* Right Side Clock/Live Indicator */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    textAlign: 'right'
                }}>
                    <div style={{ fontSize: '0.8125rem', color: '#5eead4', opacity: 0.8, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div style={{
                        fontSize: '3rem',
                        fontWeight: 700,
                        letterSpacing: '-0.01em',
                        lineHeight: 1,
                        marginBottom: '1.25rem',
                        fontVariantNumeric: 'tabular-nums'
                    }}>
                        {currentTime.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'rgba(94, 234, 212, 0.08)',
                        border: '1px solid rgba(94, 234, 212, 0.2)',
                        padding: '0.25rem 0.875rem',
                        borderRadius: 'var(--radius-full)',
                        color: '#5eead4',
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        letterSpacing: '0.1em'
                    }}>
                        <Radio size={14} />
                        SYSTEM LIVE
                    </div>
                </div>
            </div>

            {/* Bottom Section containing children if provided */}
            {children && (
                <div style={{
                    background: 'rgba(0, 0, 0, 0.15)',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    padding: '1rem 3rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2.5rem',
                    zIndex: 1
                }}>
                    {children}
                </div>
            )}
        </div>
    );
}
