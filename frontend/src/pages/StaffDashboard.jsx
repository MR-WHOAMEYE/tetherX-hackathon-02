import { useState, useMemo, useCallback } from 'react';
import {
    CheckCircle, XCircle, Edit3, Send, Clock, AlertTriangle,
    Eye, ChevronDown, ChevronUp, User, Brain, BookOpen,
    Mail, Globe, MessageCircle, Save, X, RotateCcw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { intentCategories, knowledgeBase } from '../data/mockData';

const channelIcons = { email: Mail, portal: Globe, chat: MessageCircle };
const priorityConfig = {
    critical: { bg: 'rgba(239,68,68,0.12)', color: '#f87171', label: 'CRITICAL' },
    high: { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24', label: 'HIGH' },
    medium: { bg: 'rgba(59,130,246,0.12)', color: '#60a5fa', label: 'MEDIUM' },
    low: { bg: 'rgba(16,185,129,0.12)', color: '#34d399', label: 'LOW' },
};

export default function StaffDashboard() {
    const { messages, getPatient, approveDraft, updateDraft, rejectDraft } = useApp();
    const [expandedMsg, setExpandedMsg] = useState(null);
    const [editingMsg, setEditingMsg] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [filterPriority, setFilterPriority] = useState('all');

    const pendingMessages = useMemo(() => {
        return messages
            .filter(m => m.status === 'pending_review' && m.aiDraft)
            .filter(m => filterPriority === 'all' || m.priority === filterPriority)
            .sort((a, b) => {
                const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                return (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3);
            });
    }, [messages, filterPriority]);

    const approvedMessages = useMemo(() => {
        return messages.filter(m => m.status === 'approved').slice(0, 5);
    }, [messages]);

    const rejectedMessages = useMemo(() => {
        return messages.filter(m => m.status === 'rejected').slice(0, 5);
    }, [messages]);

    const handleStartEdit = useCallback((msg) => {
        setEditingMsg(msg.id);
        setEditContent(msg.aiDraft.editedContent || msg.aiDraft.content);
    }, []);

    const handleSaveEdit = useCallback((msgId) => {
        updateDraft(msgId, editContent);
        setEditingMsg(null);
        setEditContent('');
    }, [editContent, updateDraft]);

    const handleCancelEdit = useCallback(() => {
        setEditingMsg(null);
        setEditContent('');
    }, []);

    const formatTime = (ts) => {
        const d = new Date(ts);
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) +
            ' — ' + d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const stats = useMemo(() => ({
        pending: messages.filter(m => m.status === 'pending_review').length,
        approved: messages.filter(m => m.status === 'approved').length,
        rejected: messages.filter(m => m.status === 'rejected').length,
        critical: messages.filter(m => m.priority === 'critical' && m.status === 'pending_review').length,
    }), [messages]);

    return (
        <div className="page-container">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="page-title">Staff Dashboard</h1>
                    <p className="page-subtitle">Review, edit, and approve AI-generated response drafts</p>
                </div>
            </div>

            {/* Stats Row */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1rem',
                marginBottom: '1.5rem',
            }}>
                {[
                    { label: 'Pending Review', value: stats.pending, color: '#f59e0b', icon: Clock },
                    { label: 'Critical', value: stats.critical, color: '#ef4444', icon: AlertTriangle },
                    { label: 'Approved', value: stats.approved, color: '#10b981', icon: CheckCircle },
                    { label: 'Rejected', value: stats.rejected, color: '#6366f1', icon: XCircle },
                ].map(stat => (
                    <div
                        key={stat.label}
                        className="card-flat"
                        style={{
                            padding: '1.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                        }}
                    >
                        <div style={{
                            width: 44,
                            height: 44,
                            borderRadius: 'var(--radius-md)',
                            background: `${stat.color}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <stat.icon size={22} color={stat.color} />
                        </div>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1 }}>{stat.value}</div>
                            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.125rem' }}>{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter Bar */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '1.25rem',
                alignItems: 'center',
            }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginRight: '0.5rem' }}>Filter:</span>
                {['all', 'critical', 'high', 'medium', 'low'].map(p => (
                    <button
                        key={p}
                        className={`btn btn-sm ${filterPriority === p ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setFilterPriority(p)}
                        style={{ textTransform: 'capitalize', fontSize: '0.75rem' }}
                    >
                        {p === 'all' ? 'All' : p}
                    </button>
                ))}
            </div>

            {/* Pending Review Queue */}
            <div style={{ marginBottom: '2rem' }}>
                <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={18} color="var(--color-warning)" />
                    Pending Review Queue ({pendingMessages.length})
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {pendingMessages.map(msg => {
                        const patient = getPatient(msg.patientId);
                        const pConfig = priorityConfig[msg.priority] || priorityConfig.medium;
                        const isExpanded = expandedMsg === msg.id;
                        const isEditing = editingMsg === msg.id;
                        const ChannelIcon = channelIcons[msg.channel] || MessageCircle;
                        const intentInfo = intentCategories.find(i => i.id === msg.aiClassification?.intent);
                        const refs = msg.aiDraft?.knowledgeRefs || [];
                        const kbRefs = knowledgeBase.filter(kb => refs.includes(kb.id));

                        return (
                            <div
                                key={msg.id}
                                id={`review-${msg.id}`}
                                className="card-flat"
                                style={{
                                    padding: 0,
                                    overflow: 'hidden',
                                    borderLeft: `4px solid ${pConfig.color}`,
                                }}
                            >
                                {/* Message Header */}
                                <div
                                    style={{
                                        padding: '1rem 1.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => setExpandedMsg(isExpanded ? null : msg.id)}
                                >
                                    <div style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: '50%',
                                        background: 'var(--gradient-primary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1rem',
                                        fontWeight: 700,
                                        color: 'white',
                                        flexShrink: 0,
                                    }}>
                                        {patient?.name?.charAt(0)}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{patient?.name}</span>
                                            <span className="badge" style={{ background: pConfig.bg, color: pConfig.color, fontSize: '0.625rem' }}>
                                                {pConfig.label}
                                            </span>
                                            {intentInfo && (
                                                <span className="badge badge-accent" style={{ fontSize: '0.625rem' }}>
                                                    {intentInfo.label}
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.125rem' }}>
                                            {msg.subject}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                                            <ChannelIcon size={14} /> {msg.channel}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                            {formatTime(msg.timestamp)}
                                        </span>
                                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </div>
                                </div>

                                {/* Expanded Content */}
                                {isExpanded && (
                                    <div className="animate-fade-in" style={{ padding: '0 1.5rem 1.5rem' }}>
                                        {/* Original Message */}
                                        <div style={{
                                            padding: '1rem',
                                            background: 'var(--color-bg-tertiary)',
                                            borderRadius: 'var(--radius-md)',
                                            marginBottom: '1rem',
                                            borderLeft: '3px solid var(--color-primary)',
                                        }}>
                                            <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                                                Original Patient Message
                                            </div>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                                                {msg.body}
                                            </div>
                                        </div>

                                        {/* AI Classification Summary */}
                                        {msg.aiClassification && (
                                            <div style={{
                                                display: 'flex',
                                                gap: '1rem',
                                                marginBottom: '1rem',
                                                flexWrap: 'wrap',
                                            }}>
                                                <div style={{
                                                    padding: '0.625rem 1rem',
                                                    background: 'rgba(6,182,212,0.06)',
                                                    borderRadius: 'var(--radius-md)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                }}>
                                                    <Brain size={14} color="var(--color-accent)" />
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                                                        Confidence: <strong style={{ color: 'var(--color-accent-light)' }}>{Math.round(msg.aiClassification.confidence * 100)}%</strong>
                                                    </span>
                                                </div>
                                                <div style={{
                                                    padding: '0.625rem 1rem',
                                                    background: 'rgba(99,102,241,0.06)',
                                                    borderRadius: 'var(--radius-md)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                }}>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                                                        Sentiment: <strong>{msg.aiClassification.sentiment}</strong>
                                                    </span>
                                                </div>
                                                {msg.aiClassification.entities?.length > 0 && (
                                                    <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                                        {msg.aiClassification.entities.slice(0, 5).map(e => (
                                                            <span key={e} className="badge badge-primary" style={{ fontSize: '0.625rem' }}>{e}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Knowledge Base References */}
                                        {kbRefs.length > 0 && (
                                            <div style={{ marginBottom: '1rem' }}>
                                                <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                                    <BookOpen size={12} /> Knowledge Base References
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                    {kbRefs.map(kb => (
                                                        <div key={kb.id} style={{
                                                            padding: '0.5rem 0.75rem',
                                                            background: 'var(--color-bg-tertiary)',
                                                            borderRadius: 'var(--radius-sm)',
                                                            border: '1px solid var(--color-border)',
                                                            fontSize: '0.75rem',
                                                        }}>
                                                            <span style={{ color: 'var(--color-primary-light)', fontWeight: 500 }}>{kb.id}</span>
                                                            <span style={{ color: 'var(--color-text-tertiary)' }}> — {kb.title}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* AI Draft Response */}
                                        <div style={{
                                            borderRadius: 'var(--radius-md)',
                                            border: '1px solid rgba(16,185,129,0.2)',
                                            overflow: 'hidden',
                                            marginBottom: '1rem',
                                        }}>
                                            <div style={{
                                                padding: '0.75rem 1rem',
                                                background: 'rgba(16,185,129,0.08)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                borderBottom: '1px solid rgba(16,185,129,0.15)',
                                            }}>
                                                <Sparkle size={14} color="var(--color-success)" />
                                                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-success-light)' }}>
                                                    AI-Generated Response Draft
                                                </span>
                                                {msg.aiDraft.status === 'edited' && (
                                                    <span className="badge badge-info" style={{ fontSize: '0.625rem', marginLeft: 'auto' }}>Edited</span>
                                                )}
                                            </div>
                                            <div style={{ padding: '1rem' }}>
                                                {isEditing ? (
                                                    <textarea
                                                        className="input"
                                                        value={editContent}
                                                        onChange={e => setEditContent(e.target.value)}
                                                        style={{
                                                            minHeight: '250px',
                                                            fontFamily: 'var(--font-sans)',
                                                            lineHeight: 1.6,
                                                            fontSize: '0.875rem',
                                                        }}
                                                    />
                                                ) : (
                                                    <div style={{
                                                        fontSize: '0.875rem',
                                                        lineHeight: 1.7,
                                                        color: 'var(--color-text-secondary)',
                                                        whiteSpace: 'pre-line',
                                                    }}>
                                                        {msg.aiDraft.editedContent || msg.aiDraft.content}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                            {isEditing ? (
                                                <>
                                                    <button className="btn btn-secondary" onClick={handleCancelEdit}>
                                                        <X size={16} /> Cancel
                                                    </button>
                                                    <button className="btn btn-primary" onClick={() => handleSaveEdit(msg.id)}>
                                                        <Save size={16} /> Save Changes
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button className="btn btn-danger btn-sm" onClick={() => rejectDraft(msg.id)}>
                                                        <XCircle size={16} /> Reject
                                                    </button>
                                                    <button className="btn btn-secondary btn-sm" onClick={() => handleStartEdit(msg)}>
                                                        <Edit3 size={16} /> Edit Draft
                                                    </button>
                                                    <button className="btn btn-success" onClick={() => approveDraft(msg.id)}>
                                                        <CheckCircle size={16} /> Approve & Send
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {pendingMessages.length === 0 && (
                        <div className="empty-state" style={{ padding: '3rem' }}>
                            <CheckCircle size={48} color="var(--color-success)" />
                            <p style={{ marginTop: '1rem', fontSize: '1rem', fontWeight: 500 }}>All caught up!</p>
                            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-tertiary)' }}>No messages pending review.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Recently Approved */}
            {approvedMessages.length > 0 && (
                <div>
                    <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle size={18} color="var(--color-success)" />
                        Recently Approved ({approvedMessages.length})
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {approvedMessages.map(msg => {
                            const patient = getPatient(msg.patientId);
                            const ChannelIcon = channelIcons[msg.channel] || MessageCircle;
                            return (
                                <div
                                    key={msg.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        padding: '0.875rem 1.25rem',
                                        background: 'var(--color-bg-card)',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--color-border-light)',
                                        opacity: 0.7,
                                    }}
                                >
                                    <CheckCircle size={18} color="var(--color-success)" />
                                    <div style={{ flex: 1 }}>
                                        <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{patient?.name}</span>
                                        <span style={{ color: 'var(--color-text-tertiary)', fontSize: '0.8125rem' }}> — {msg.subject}</span>
                                    </div>
                                    <span className="badge badge-success" style={{ fontSize: '0.625rem' }}>Sent</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

// Small helper component
function Sparkle(props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke={props.color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" />
        </svg>
    );
}
