import { useState, useCallback, useRef, useEffect } from 'react';
import {
    Inbox, Brain, Target, Database, Sparkles, CheckCircle, Send,
    ChevronRight, Play, RotateCcw, User, MessageCircle,
    ArrowDown, Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { patients } from '../data/mockData';
import { pipelineStages } from '../data/mockData';

const stageIcons = {
    ingestion: Inbox,
    nlp: Brain,
    intent: Target,
    context: Database,
    generation: Sparkles,
    review: CheckCircle,
    delivery: Send,
};

const stageColors = {
    ingestion: '#6366f1',
    nlp: '#06b6d4',
    intent: '#8b5cf6',
    context: '#3b82f6',
    generation: '#10b981',
    review: '#f59e0b',
    delivery: '#ec4899',
};

export default function AIPipeline() {
    const { sendPatientMessage, processingStages } = useApp();
    const [activeDemo, setActiveDemo] = useState(false);
    const [demoStages, setDemoStages] = useState({});
    const [demoResult, setDemoResult] = useState(null);
    const [demoPatient, setDemoPatient] = useState(patients[0].id);
    const [demoMessage, setDemoMessage] = useState('');
    const [demoChannel, setDemoChannel] = useState('chat');
    const resultRef = useRef(null);

    const presetMessages = [
        { label: 'Symptom Report', text: "My blood sugar has been consistently above 250 mg/dL for the past week. I'm feeling very thirsty and tired. Should I be worried?" },
        { label: 'Med Inquiry', text: "I started taking the new cholesterol medication and I'm experiencing muscle pain. Is this a normal side effect?" },
        { label: 'Appointment', text: "I'd like to reschedule my appointment for next Friday to Monday instead. Is there availability?" },
        { label: 'Prescription', text: "I'm running low on my inhaler, can I get a refill please?" },
        { label: 'Billing', text: "I received a bill for ₹5,000 but my insurance should cover this. Can someone help?" },
    ];

    const runDemoProcessing = useCallback(async () => {
        if (!demoMessage.trim() || activeDemo) return;

        setActiveDemo(true);
        setDemoResult(null);
        setDemoStages({});

        const stageOrder = ['ingestion', 'nlp', 'intent', 'context', 'generation'];
        for (const stage of stageOrder) {
            setDemoStages(prev => ({ ...prev, [stage]: 'processing' }));
            await new Promise(r => setTimeout(r, 800 + Math.random() * 400));
            setDemoStages(prev => ({ ...prev, [stage]: 'complete' }));
        }

        // Use the actual AI service
        const msgId = await sendPatientMessage(demoPatient, demoMessage, demoChannel);
        setDemoResult(msgId);
        setActiveDemo(false);

        setTimeout(() => {
            resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
    }, [demoMessage, demoPatient, demoChannel, activeDemo, sendPatientMessage]);

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">AI Processing Pipeline</h1>
                <p className="page-subtitle">
                    Visualize the end-to-end AI pipeline from patient message ingestion to response delivery
                </p>
            </div>

            {/* Pipeline Visualization */}
            <div style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <Zap size={18} color="var(--color-accent)" />
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Pipeline Architecture</h2>
                </div>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0',
                    position: 'relative',
                }}>
                    {pipelineStages.map((stage, idx) => {
                        const Icon = stageIcons[stage.id] || Brain;
                        const color = stageColors[stage.id] || '#6366f1';
                        const demoStatus = demoStages[stage.id];
                        const isProcessing = demoStatus === 'processing';
                        const isComplete = demoStatus === 'complete';

                        return (
                            <div key={stage.id}>
                                <div
                                    className="animate-fade-in"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '1.25rem',
                                        padding: '1.25rem 1.5rem',
                                        background: isProcessing ? `${color}10` : isComplete ? `${color}08` : 'var(--color-bg-card)',
                                        border: `1px solid ${isProcessing ? `${color}40` : isComplete ? `${color}25` : 'var(--color-border)'}`,
                                        borderRadius: 'var(--radius-lg)',
                                        transition: 'all var(--transition-base)',
                                        animationDelay: `${idx * 0.08}s`,
                                        position: 'relative',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {/* Processing shimmer */}
                                    {isProcessing && (
                                        <div style={{
                                            position: 'absolute',
                                            inset: 0,
                                            background: `linear-gradient(90deg, transparent, ${color}10, transparent)`,
                                            backgroundSize: '200% 100%',
                                            animation: 'shimmer 1.5s ease-in-out infinite',
                                        }} />
                                    )}

                                    {/* Stage Number + Icon */}
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        position: 'relative',
                                        zIndex: 1,
                                    }}>
                                        <div style={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 'var(--radius-md)',
                                            background: isComplete ? color : `${color}20`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all var(--transition-base)',
                                            boxShadow: isProcessing ? `0 0 20px ${color}40` : 'none',
                                        }}>
                                            {isComplete ? (
                                                <CheckCircle size={22} color="white" />
                                            ) : isProcessing ? (
                                                <div className="typing-indicator">
                                                    <span style={{ background: color }} />
                                                    <span style={{ background: color }} />
                                                    <span style={{ background: color }} />
                                                </div>
                                            ) : (
                                                <Icon size={22} color={color} />
                                            )}
                                        </div>
                                        <span style={{
                                            fontSize: '0.625rem',
                                            fontWeight: 700,
                                            color: 'var(--color-text-muted)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                        }}>
                                            Step {idx + 1}
                                        </span>
                                    </div>

                                    {/* Stage Content */}
                                    <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                                        <div style={{
                                            fontSize: '1rem',
                                            fontWeight: 600,
                                            color: isComplete ? color : 'var(--color-text-primary)',
                                            marginBottom: '0.25rem',
                                        }}>
                                            {stage.label}
                                        </div>
                                        <div style={{
                                            fontSize: '0.8125rem',
                                            color: 'var(--color-text-secondary)',
                                            lineHeight: 1.5,
                                            maxWidth: '600px',
                                        }}>
                                            {stage.description}
                                        </div>
                                    </div>

                                    {/* Metrics */}
                                    <div style={{
                                        display: 'flex',
                                        gap: '1.5rem',
                                        flexShrink: 0,
                                        position: 'relative',
                                        zIndex: 1,
                                    }}>
                                        {Object.entries(stage.metrics).map(([key, val]) => (
                                            <div key={key} style={{ textAlign: 'right' }}>
                                                <div style={{
                                                    fontSize: '0.6875rem',
                                                    color: 'var(--color-text-tertiary)',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05em',
                                                    marginBottom: '0.125rem',
                                                }}>
                                                    {key}
                                                </div>
                                                <div style={{
                                                    fontSize: '0.9375rem',
                                                    fontWeight: 700,
                                                    color: color,
                                                }}>
                                                    {val}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Status indicator */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '0.5rem',
                                        right: '0.5rem',
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        background: isComplete ? '#10b981' : isProcessing ? color : '#22c55e',
                                        boxShadow: isProcessing ? `0 0 8px ${color}` : '0 0 4px #22c55e80',
                                    }} />
                                </div>

                                {/* Connector Arrow */}
                                {idx < pipelineStages.length - 1 && (
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        padding: '0.25rem 0',
                                    }}>
                                        <ArrowDown size={18} color={demoStages[stage.id] === 'complete' ? stageColors[stage.id] : 'var(--color-text-muted)'} style={{ opacity: 0.5 }} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Demo Panel */}
            <div
                className="card-flat"
                style={{ padding: '2rem' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <Play size={18} color="var(--color-primary)" />
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Live Demo — Test the Pipeline</h2>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
                    Select a patient, compose a message, and watch the AI pipeline process it in real-time.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.375rem' }}>
                            Patient
                        </label>
                        <select
                            className="input"
                            id="demo-patient-select"
                            value={demoPatient}
                            onChange={e => setDemoPatient(e.target.value)}
                            disabled={activeDemo}
                        >
                            {patients.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.name} — {p.conditions.join(', ')}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.375rem' }}>
                            Channel
                        </label>
                        <select
                            className="input"
                            id="demo-channel-select"
                            value={demoChannel}
                            onChange={e => setDemoChannel(e.target.value)}
                            disabled={activeDemo}
                        >
                            <option value="email">Email</option>
                            <option value="portal">Patient Portal</option>
                            <option value="chat">Live Chat</option>
                        </select>
                    </div>
                </div>

                {/* Preset Messages */}
                <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.375rem' }}>
                        Quick Presets
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {presetMessages.map(pm => (
                            <button
                                key={pm.label}
                                className="btn btn-secondary btn-sm"
                                onClick={() => setDemoMessage(pm.text)}
                                disabled={activeDemo}
                                style={{ fontSize: '0.75rem' }}
                            >
                                {pm.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.375rem' }}>
                        Patient Message
                    </label>
                    <textarea
                        className="input"
                        id="demo-message-input"
                        rows={4}
                        placeholder="Type a patient message here or select a preset above..."
                        value={demoMessage}
                        onChange={e => setDemoMessage(e.target.value)}
                        disabled={activeDemo}
                        style={{ minHeight: '120px' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                    <button
                        className="btn btn-primary btn-lg"
                        id="run-pipeline-btn"
                        onClick={runDemoProcessing}
                        disabled={!demoMessage.trim() || activeDemo}
                    >
                        {activeDemo ? (
                            <>
                                <div className="typing-indicator">
                                    <span /><span /><span />
                                </div>
                                Processing...
                            </>
                        ) : (
                            <>
                                <Play size={18} /> Run AI Pipeline
                            </>
                        )}
                    </button>
                    <button
                        className="btn btn-secondary btn-lg"
                        onClick={() => {
                            setDemoMessage('');
                            setDemoResult(null);
                            setDemoStages({});
                        }}
                        disabled={activeDemo}
                    >
                        <RotateCcw size={16} /> Reset
                    </button>
                </div>

                {/* Result */}
                {demoResult && (
                    <div
                        ref={resultRef}
                        className="animate-fade-in-up"
                        style={{
                            marginTop: '1.5rem',
                            padding: '1.25rem',
                            background: 'rgba(16,185,129,0.06)',
                            border: '1px solid rgba(16,185,129,0.2)',
                            borderRadius: 'var(--radius-md)',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <CheckCircle size={18} color="var(--color-success)" />
                            <span style={{ fontWeight: 600, color: 'var(--color-success-light)' }}>Pipeline Complete!</span>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                            Message has been processed and an AI draft has been generated. You can view it in the{' '}
                            <a href="/messages" style={{ color: 'var(--color-primary-light)', textDecoration: 'none', fontWeight: 500 }}>Messages</a>{' '}
                            or{' '}
                            <a href="/staff-dashboard" style={{ color: 'var(--color-primary-light)', textDecoration: 'none', fontWeight: 500 }}>Staff Dashboard</a>.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
