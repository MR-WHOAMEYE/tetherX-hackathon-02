import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MessageSquare, Brain, CheckCircle, Clock, AlertTriangle,
    TrendingUp, Users, Star, Activity, ArrowUpRight,
    Mail, Globe, MessageCircle, Zap, Shield
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { dashboardStats, messageVolumeData, intentDistributionData } from '../data/mockData';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area, CartesianGrid
} from 'recharts';

const StatCard = ({ icon: Icon, label, value, sublabel, color, trend, onClick }) => (
    <div
        className="card"
        onClick={onClick}
        style={{
            cursor: onClick ? 'pointer' : 'default',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
        }}
    >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div
                style={{
                    width: 44,
                    height: 44,
                    borderRadius: 'var(--radius-md)',
                    background: `${color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Icon size={22} color={color} />
            </div>
            {trend && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: trend > 0 ? 'var(--color-success)' : 'var(--color-danger)',
                }}>
                    <TrendingUp size={14} style={{ transform: trend < 0 ? 'rotate(180deg)' : 'none' }} />
                    {Math.abs(trend)}%
                </div>
            )}
        </div>
        <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1.1 }}>{value}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.125rem' }}>{label}</div>
        </div>
        {sublabel && (
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>{sublabel}</div>
        )}
    </div>
);

const ChannelIcon = ({ channel }) => {
    const icons = { email: Mail, portal: Globe, chat: MessageCircle };
    const Icon = icons[channel] || MessageCircle;
    return <Icon size={14} />;
};

const priorityColors = {
    critical: '#ef4444',
    high: '#f59e0b',
    medium: '#3b82f6',
    low: '#10b981',
};

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem',
            fontSize: '0.75rem',
        }}>
            <div style={{ fontWeight: 600, marginBottom: '0.375rem' }}>{label}</div>
            {payload.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
                    <span style={{ color: 'var(--color-text-secondary)' }}>{p.name}: </span>
                    <span style={{ fontWeight: 600 }}>{p.value}</span>
                </div>
            ))}
        </div>
    );
};

export default function Dashboard() {
    const { messages, activityLog, getPatient } = useApp();
    const navigate = useNavigate();

    const pendingMessages = useMemo(() =>
        messages.filter(m => m.status === 'pending_review').sort((a, b) =>
            new Date(b.timestamp) - new Date(a.timestamp)
        ).slice(0, 5),
        [messages]
    );

    const recentActivity = useMemo(() => activityLog.slice(0, 8), [activityLog]);

    const formatTime = (ts) => {
        const d = new Date(ts);
        const now = new Date();
        const diff = (now - d) / 1000 / 60;
        if (diff < 1) return 'Just now';
        if (diff < 60) return `${Math.floor(diff)}m ago`;
        if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
        return d.toLocaleDateString();
    };

    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-subtitle">Real-time overview of your AI-powered communication platform</p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/messages')}>
                    <MessageSquare size={16} /> View Messages
                </button>
            </div>

            {/* Stat Cards */}
            <div
                className="stagger-children"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1rem',
                    marginBottom: '1.5rem',
                }}
            >
                <StatCard
                    icon={MessageSquare}
                    label="Total Messages"
                    value={dashboardStats.totalMessages}
                    sublabel={`${dashboardStats.processedToday} processed today`}
                    color="#6366f1"
                    trend={12}
                />
                <StatCard
                    icon={Brain}
                    label="AI Accuracy"
                    value={`${dashboardStats.aiAccuracy}%`}
                    sublabel="Last 30 days"
                    color="#06b6d4"
                    trend={2.3}
                />
                <StatCard
                    icon={Clock}
                    label="Avg Response Time"
                    value={dashboardStats.avgResponseTime}
                    sublabel="AI draft generation"
                    color="#8b5cf6"
                    trend={-15}
                />
                <StatCard
                    icon={CheckCircle}
                    label="Approved Today"
                    value={dashboardStats.approvedToday}
                    sublabel={`${dashboardStats.pendingReview} pending review`}
                    color="#10b981"
                    trend={8}
                    onClick={() => navigate('/staff-dashboard')}
                />
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* Message Volume Chart */}
                <div className="card-flat" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div>
                            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Message Volume</h3>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)', marginTop: '0.125rem' }}>
                                Incoming messages by channel this week
                            </p>
                        </div>
                        <div className="badge badge-accent">
                            <Activity size={12} /> This Week
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={messageVolumeData} barGap={4}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.06)" />
                            <XAxis dataKey="day" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="email" name="Email" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="portal" name="Portal" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="chat" name="Chat" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Intent Distribution */}
                <div className="card-flat" style={{ padding: '1.5rem' }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Intent Distribution</h3>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)', marginTop: '0.125rem' }}>
                            AI-classified categories
                        </p>
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                            <Pie
                                data={intentDistributionData}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={75}
                                paddingAngle={3}
                                dataKey="value"
                            >
                                {intentDistributionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                        {intentDistributionData.slice(0, 4).map(item => (
                            <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem' }}>
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, display: 'inline-block' }} />
                                <span style={{ color: 'var(--color-text-secondary)' }}>{item.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Row: Pending Messages + Activity Log */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '1.5rem' }}>
                {/* Pending Messages */}
                <div className="card-flat" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>
                            <AlertTriangle size={16} color="var(--color-warning)" style={{ verticalAlign: -2, marginRight: 6 }} />
                            Pending Review
                        </h3>
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/staff-dashboard')}>
                            View All <ArrowUpRight size={14} />
                        </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {pendingMessages.map(msg => {
                            const patient = getPatient(msg.patientId);
                            return (
                                <div
                                    key={msg.id}
                                    onClick={() => navigate('/staff-dashboard')}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.875rem',
                                        padding: '0.75rem',
                                        background: 'var(--color-bg-tertiary)',
                                        borderRadius: 'var(--radius-md)',
                                        cursor: 'pointer',
                                        transition: 'all var(--transition-fast)',
                                        borderLeft: `3px solid ${priorityColors[msg.priority] || '#6366f1'}`,
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-card-hover)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'var(--color-bg-tertiary)'}
                                >
                                    <div
                                        style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: '50%',
                                            background: `${priorityColors[msg.priority]}15`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: priorityColors[msg.priority],
                                            flexShrink: 0,
                                        }}
                                    >
                                        <ChannelIcon channel={msg.channel} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {patient?.name || 'Unknown'}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {msg.subject}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                        <span className={`badge badge-${msg.priority === 'critical' ? 'danger' : msg.priority === 'high' ? 'warning' : 'info'}`}>
                                            {msg.priority}
                                        </span>
                                        <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                                            {formatTime(msg.timestamp)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Activity Log */}
                <div className="card-flat" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
                        <Zap size={16} color="var(--color-accent)" style={{ verticalAlign: -2, marginRight: 6 }} />
                        Recent Activity
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                        {recentActivity.map((item, idx) => (
                            <div
                                key={item.id}
                                style={{
                                    display: 'flex',
                                    gap: '0.75rem',
                                    padding: '0.625rem 0',
                                    borderBottom: idx < recentActivity.length - 1 ? '1px solid var(--color-border-light)' : 'none',
                                    alignItems: 'flex-start',
                                }}
                            >
                                <div
                                    style={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: '50%',
                                        background: item.type === 'approved' ? 'rgba(16,185,129,0.12)' :
                                            item.type === 'ai_processed' ? 'rgba(6,182,212,0.12)' :
                                                'rgba(99,102,241,0.12)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        marginTop: '0.125rem',
                                    }}
                                >
                                    {item.type === 'approved' ? <CheckCircle size={13} color="#10b981" /> :
                                        item.type === 'ai_processed' ? <Brain size={13} color="#06b6d4" /> :
                                            <Mail size={13} color="#6366f1" />}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        fontSize: '0.8125rem',
                                        color: 'var(--color-text-secondary)',
                                        lineHeight: 1.4,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                    }}>
                                        {item.description}
                                    </div>
                                    <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '0.125rem' }}>
                                        {formatTime(item.timestamp)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
