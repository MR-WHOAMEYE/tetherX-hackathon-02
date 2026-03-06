import { useState, useMemo } from 'react';
import {
    Mail, Globe, MessageCircle, Search, Filter, Send,
    Clock, AlertTriangle, CheckCircle, ChevronDown, User,
    Activity, ArrowRight, Brain, Eye
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { patients, channels, intentCategories } from '../data/mockData';

const channelIcons = { email: Mail, portal: Globe, chat: MessageCircle };
const priorityColors = {
    critical: { bg: 'rgba(239,68,68,0.12)', color: '#f87171', border: 'rgba(239,68,68,0.3)' },
    high: { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
    medium: { bg: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: 'rgba(59,130,246,0.3)' },
    low: { bg: 'rgba(16,185,129,0.12)', color: '#34d399', border: 'rgba(16,185,129,0.3)' },
};
const statusLabels = {
    pending_review: 'Pending Review',
    ai_processing: 'AI Processing',
    approved: 'Approved',
    rejected: 'Rejected',
    error: 'Error',
};

export default function Messages() {
    const { messages, getPatient, setSelectedMessageId } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [channelFilter, setChannelFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedMsg, setSelectedMsg] = useState(null);

    const filteredMessages = useMemo(() => {
        return messages.filter(msg => {
            const patient = getPatient(msg.patientId);
            const matchesSearch = searchTerm === '' ||
                patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                msg.body.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesChannel = channelFilter === 'all' || msg.channel === channelFilter;
            const matchesPriority = priorityFilter === 'all' || msg.priority === priorityFilter;
            const matchesStatus = statusFilter === 'all' || msg.status === statusFilter;
            return matchesSearch && matchesChannel && matchesPriority && matchesStatus;
        }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }, [messages, searchTerm, channelFilter, priorityFilter, statusFilter, getPatient]);

    const formatTime = (ts) => {
        const d = new Date(ts);
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) +
            ' · ' + d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const selected = selectedMsg || filteredMessages[0];
    const selectedPatient = selected ? getPatient(selected.patientId) : null;

    return (
        <div className="page-container" style={{ padding: '0', height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
            {/* Header Bar */}
            <div style={{
                padding: '1.25rem 2rem',
                borderBottom: '1px solid var(--color-border-light)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: '1.375rem' }}>Messages</h1>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)', marginTop: '0.125rem' }}>
                        {filteredMessages.length} messages · {messages.filter(m => m.status === 'pending_review').length} pending review
                    </p>
                </div>
            </div>

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Message List Sidebar */}
                <div style={{
                    width: '420px',
                    minWidth: '420px',
                    borderRight: '1px solid var(--color-border-light)',
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'var(--color-bg-secondary)',
                }}>
                    {/* Filters */}
                    <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border-light)' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: 'var(--color-bg-tertiary)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            padding: '0.5rem 0.75rem',
                            marginBottom: '0.75rem',
                        }}>
                            <Search size={14} color="var(--color-text-tertiary)" />
                            <input
                                id="message-search"
                                type="text"
                                placeholder="Search messages..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    color: 'var(--color-text-primary)',
                                    fontSize: '0.8125rem',
                                    width: '100%',
                                    fontFamily: 'var(--font-sans)',
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <select
                                className="input"
                                style={{ padding: '0.375rem 0.5rem', fontSize: '0.75rem', flex: 1 }}
                                value={channelFilter}
                                onChange={e => setChannelFilter(e.target.value)}
                            >
                                <option value="all">All Channels</option>
                                {channels.map(ch => (
                                    <option key={ch.id} value={ch.id}>{ch.label}</option>
                                ))}
                            </select>
                            <select
                                className="input"
                                style={{ padding: '0.375rem 0.5rem', fontSize: '0.75rem', flex: 1 }}
                                value={priorityFilter}
                                onChange={e => setPriorityFilter(e.target.value)}
                            >
                                <option value="all">All Priority</option>
                                <option value="critical">Critical</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                            <select
                                className="input"
                                style={{ padding: '0.375rem 0.5rem', fontSize: '0.75rem', flex: 1 }}
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="pending_review">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>

                    {/* Message List */}
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {filteredMessages.map(msg => {
                            const patient = getPatient(msg.patientId);
                            const ChannelIcon = channelIcons[msg.channel] || MessageCircle;
                            const isSelected = selected?.id === msg.id;
                            const pColor = priorityColors[msg.priority] || priorityColors.medium;

                            return (
                                <div
                                    key={msg.id}
                                    id={`message-${msg.id}`}
                                    onClick={() => setSelectedMsg(msg)}
                                    style={{
                                        padding: '1rem 1.25rem',
                                        borderBottom: '1px solid var(--color-border-light)',
                                        cursor: 'pointer',
                                        background: isSelected ? 'rgba(99,102,241,0.08)' : 'transparent',
                                        borderLeft: isSelected ? '3px solid var(--color-primary)' : '3px solid transparent',
                                        transition: 'all var(--transition-fast)',
                                    }}
                                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(99,102,241,0.04)'; }}
                                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                        <div style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: '50%',
                                            background: 'var(--gradient-primary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                            fontSize: '0.875rem',
                                            fontWeight: 700,
                                            color: 'white',
                                        }}>
                                            {patient?.name?.charAt(0) || '?'}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{patient?.name}</span>
                                                <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                                                    {formatTime(msg.timestamp)}
                                                </span>
                                            </div>
                                            <div style={{
                                                fontSize: '0.8125rem',
                                                fontWeight: 500,
                                                marginTop: '0.125rem',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}>
                                                {msg.subject}
                                            </div>
                                            <div style={{
                                                fontSize: '0.75rem',
                                                color: 'var(--color-text-tertiary)',
                                                marginTop: '0.25rem',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}>
                                                {msg.body.slice(0, 80)}...
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.5rem', alignItems: 'center' }}>
                                                <span
                                                    className="badge"
                                                    style={{
                                                        background: pColor.bg,
                                                        color: pColor.color,
                                                        fontSize: '0.625rem',
                                                        padding: '0.125rem 0.5rem',
                                                    }}
                                                >
                                                    {msg.priority}
                                                </span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.6875rem', color: 'var(--color-text-tertiary)' }}>
                                                    <ChannelIcon size={11} /> {msg.channel}
                                                </span>
                                                {msg.aiClassification && (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.6875rem', color: 'var(--color-accent)' }}>
                                                        <Brain size={11} /> {Math.round(msg.aiClassification.confidence * 100)}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {filteredMessages.length === 0 && (
                            <div className="empty-state" style={{ padding: '3rem' }}>
                                <Mail size={40} color="var(--color-text-muted)" />
                                <p style={{ marginTop: '0.75rem', fontSize: '0.875rem' }}>No messages match your filters</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Message Detail Panel */}
                {selected ? (
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem' }} className="animate-fade-in">
                        {/* Patient Header */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            marginBottom: '1.5rem',
                            padding: '1.25rem',
                            background: 'var(--color-bg-card)',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--color-border)',
                        }}>
                            <div style={{
                                width: 52,
                                height: 52,
                                borderRadius: '50%',
                                background: 'var(--gradient-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.25rem',
                                fontWeight: 700,
                                color: 'white',
                            }}>
                                {selectedPatient?.name?.charAt(0)}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: '1.0625rem' }}>{selectedPatient?.name}</div>
                                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.125rem' }}>
                                    {selectedPatient?.email} · Age: {selectedPatient?.age} · {selectedPatient?.gender}
                                </div>
                                <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.375rem', flexWrap: 'wrap' }}>
                                    {selectedPatient?.conditions?.map(c => (
                                        <span key={c} className="badge badge-primary" style={{ fontSize: '0.6875rem' }}>{c}</span>
                                    ))}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{
                                    padding: '0.375rem 0.75rem',
                                    borderRadius: 'var(--radius-full)',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    background: priorityColors[selected.priority]?.bg,
                                    color: priorityColors[selected.priority]?.color,
                                    border: `1px solid ${priorityColors[selected.priority]?.border}`,
                                }}>
                                    {selected.priority?.toUpperCase()} PRIORITY
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: '0.375rem' }}>
                                    Provider: {selectedPatient?.provider}
                                </div>
                            </div>
                        </div>

                        {/* Original Message */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                <Mail size={16} color="var(--color-primary)" />
                                <h3 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>Patient Message</h3>
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginLeft: 'auto' }}>
                                    {formatTime(selected.timestamp)}
                                </span>
                            </div>
                            <div style={{
                                padding: '1.25rem',
                                background: 'var(--color-bg-tertiary)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--color-border)',
                                fontSize: '0.875rem',
                                lineHeight: 1.7,
                                color: 'var(--color-text-secondary)',
                            }}>
                                <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
                                    {selected.subject}
                                </div>
                                {selected.body}
                            </div>
                        </div>

                        {/* AI Classification */}
                        {selected.aiClassification && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                    <Brain size={16} color="var(--color-accent)" />
                                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>AI Analysis</h3>
                                </div>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                                    gap: '0.75rem',
                                }}>
                                    <div style={{
                                        padding: '0.875rem',
                                        background: 'var(--color-bg-card)',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--color-border)',
                                    }}>
                                        <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Intent</div>
                                        <div style={{ fontWeight: 600, fontSize: '0.875rem', textTransform: 'capitalize' }}>
                                            {intentCategories.find(i => i.id === selected.aiClassification.intent)?.label || selected.aiClassification.intent}
                                        </div>
                                    </div>
                                    <div style={{
                                        padding: '0.875rem',
                                        background: 'var(--color-bg-card)',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--color-border)',
                                    }}>
                                        <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Confidence</div>
                                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                            {Math.round(selected.aiClassification.confidence * 100)}%
                                        </div>
                                        <div className="progress-bar" style={{ marginTop: '0.375rem' }}>
                                            <div className="progress-bar-fill" style={{ width: `${selected.aiClassification.confidence * 100}%` }} />
                                        </div>
                                    </div>
                                    <div style={{
                                        padding: '0.875rem',
                                        background: 'var(--color-bg-card)',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--color-border)',
                                    }}>
                                        <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Sentiment</div>
                                        <div style={{ fontWeight: 600, fontSize: '0.875rem', textTransform: 'capitalize' }}>
                                            {selected.aiClassification.sentiment}
                                        </div>
                                    </div>
                                    <div style={{
                                        padding: '0.875rem',
                                        background: 'var(--color-bg-card)',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--color-border)',
                                    }}>
                                        <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Urgency</div>
                                        <div style={{
                                            fontWeight: 600,
                                            fontSize: '0.875rem',
                                            textTransform: 'capitalize',
                                            color: priorityColors[selected.aiClassification.urgency]?.color,
                                        }}>
                                            {selected.aiClassification.urgency}
                                        </div>
                                    </div>
                                </div>

                                {/* Extracted Entities */}
                                {selected.aiClassification.entities?.length > 0 && (
                                    <div style={{ marginTop: '0.75rem' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginBottom: '0.375rem' }}>
                                            Extracted Entities:
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                                            {selected.aiClassification.entities.map(entity => (
                                                <span key={entity} className="badge badge-accent" style={{ fontSize: '0.6875rem' }}>
                                                    {entity}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Context Summary */}
                                {selected.aiClassification.contextSummary && (
                                    <div style={{
                                        marginTop: '0.75rem',
                                        padding: '0.875rem',
                                        background: 'rgba(6,182,212,0.06)',
                                        border: '1px solid rgba(6,182,212,0.15)',
                                        borderRadius: 'var(--radius-md)',
                                        fontSize: '0.8125rem',
                                        color: 'var(--color-text-secondary)',
                                        lineHeight: 1.6,
                                    }}>
                                        <strong style={{ color: 'var(--color-accent)' }}>AI Context Summary: </strong>
                                        {selected.aiClassification.contextSummary}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* AI Draft */}
                        {selected.aiDraft && (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                    <Send size={16} color="var(--color-success)" />
                                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>AI-Generated Response Draft</h3>
                                    <span className={`badge badge-${selected.aiDraft.status === 'approved' ? 'success' : selected.aiDraft.status === 'rejected' ? 'danger' : 'warning'}`}>
                                        {selected.aiDraft.status}
                                    </span>
                                </div>
                                <div style={{
                                    padding: '1.25rem',
                                    background: 'rgba(16,185,129,0.04)',
                                    border: '1px solid rgba(16,185,129,0.15)',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: '0.875rem',
                                    lineHeight: 1.7,
                                    color: 'var(--color-text-secondary)',
                                    whiteSpace: 'pre-line',
                                }}>
                                    {selected.aiDraft.editedContent || selected.aiDraft.content}
                                </div>
                                {selected.aiDraft.knowledgeRefs?.length > 0 && (
                                    <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                        Knowledge references: {selected.aiDraft.knowledgeRefs.join(', ')}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="empty-state" style={{ flex: 1 }}>
                        <Mail size={48} />
                        <p style={{ marginTop: '1rem' }}>Select a message to view details</p>
                    </div>
                )}
            </div>
        </div>
    );
}
