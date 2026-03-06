import { useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, LineChart, Line,
    Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import {
    TrendingUp, TrendingDown, Activity, Brain, Clock,
    Star, Target, MessageSquare, Users, CheckCircle
} from 'lucide-react';
import {
    messageVolumeData, intentDistributionData,
    aiPerformanceData, dashboardStats
} from '../data/mockData';
import { useApp } from '../context/AppContext';

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
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color || p.stroke, display: 'inline-block' }} />
                    <span style={{ color: 'var(--color-text-secondary)' }}>{p.name}: </span>
                    <span style={{ fontWeight: 600 }}>{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</span>
                </div>
            ))}
        </div>
    );
};

// Channel performance data
const channelPerformanceData = [
    { channel: 'Email', avgResponse: 3.2, satisfaction: 4.6, volume: 135 },
    { channel: 'Portal', avgResponse: 1.8, satisfaction: 4.8, volume: 164 },
    { channel: 'Chat', avgResponse: 0.8, satisfaction: 4.9, volume: 97 },
];

// Hourly message distribution
const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    messages: Math.round(
        i < 6 ? Math.random() * 3 :
            i < 9 ? Math.random() * 15 + 5 :
                i < 12 ? Math.random() * 25 + 15 :
                    i < 14 ? Math.random() * 20 + 10 :
                        i < 17 ? Math.random() * 25 + 12 :
                            i < 20 ? Math.random() * 15 + 5 :
                                Math.random() * 5 + 1
    ),
}));

// Radar data for AI capabilities
const radarData = [
    { category: 'NLP Accuracy', value: 96.2 },
    { category: 'Intent Classify', value: 94.7 },
    { category: 'Context Retrieval', value: 92.1 },
    { category: 'Response Quality', value: 91.5 },
    { category: 'Entity Recognition', value: 95.3 },
    { category: 'Sentiment Analysis', value: 89.8 },
];

export default function Analytics() {
    const { messages } = useApp();

    const messageStats = useMemo(() => {
        const total = messages.length;
        const approved = messages.filter(m => m.status === 'approved').length;
        const avgConfidence = messages
            .filter(m => m.aiClassification)
            .reduce((sum, m) => sum + m.aiClassification.confidence, 0) /
            (messages.filter(m => m.aiClassification).length || 1);
        return { total, approved, avgConfidence };
    }, [messages]);

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Analytics & Insights</h1>
                <p className="page-subtitle">
                    Comprehensive performance metrics for the AI communication platform
                </p>
            </div>

            {/* Top KPI Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem',
            }}>
                {[
                    { label: 'AI Accuracy', value: '94.7%', icon: Brain, color: '#06b6d4', trend: '+2.3%', trendUp: true },
                    { label: 'Avg Response', value: '2.4 min', icon: Clock, color: '#8b5cf6', trend: '-15%', trendUp: false },
                    { label: 'Patient Satisfaction', value: '4.8/5', icon: Star, color: '#f59e0b', trend: '+0.3', trendUp: true },
                    { label: 'Auto-approval Rate', value: '77%', icon: CheckCircle, color: '#10b981', trend: '+5%', trendUp: true },
                    { label: 'Edit Rate', value: '23%', icon: Target, color: '#6366f1', trend: '-3%', trendUp: false },
                ].map(kpi => (
                    <div key={kpi.label} className="card-flat" style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                            <div style={{
                                width: 40,
                                height: 40,
                                borderRadius: 'var(--radius-md)',
                                background: `${kpi.color}15`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <kpi.icon size={20} color={kpi.color} />
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: kpi.trendUp ? 'var(--color-success)' : 'var(--color-danger)',
                            }}>
                                {kpi.trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                {kpi.trend}
                            </div>
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{kpi.value}</div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.125rem' }}>{kpi.label}</div>
                    </div>
                ))}
            </div>

            {/* Charts Row 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* AI Performance Trend */}
                <div className="card-flat" style={{ padding: '1.5rem' }}>
                    <div style={{ marginBottom: '1.25rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>AI Performance Trend</h3>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)' }}>
                            Accuracy, response time, and satisfaction over 6 months
                        </p>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={aiPerformanceData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.06)" />
                            <XAxis dataKey="month" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.75rem', paddingTop: '0.5rem' }} />
                            <Line type="monotone" dataKey="accuracy" name="Accuracy %" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4', r: 4 }} activeDot={{ r: 6 }} />
                            <Line type="monotone" dataKey="satisfaction" name="Satisfaction" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* AI Capabilities Radar */}
                <div className="card-flat" style={{ padding: '1.5rem' }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>AI Capabilities</h3>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)' }}>
                            Performance across AI modules
                        </p>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <RadarChart data={radarData}>
                            <PolarGrid stroke="rgba(99,102,241,0.12)" />
                            <PolarAngleAxis dataKey="category" tick={{ fill: 'var(--color-text-secondary)', fontSize: 10 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} />
                            <Radar name="Score" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* Hourly Distribution */}
                <div className="card-flat" style={{ padding: '1.5rem' }}>
                    <div style={{ marginBottom: '1.25rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Message Volume by Hour</h3>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)' }}>
                            Peak hours analysis
                        </p>
                    </div>
                    <ResponsiveContainer width="100%" height={240}>
                        <AreaChart data={hourlyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.06)" />
                            <XAxis dataKey="hour" stroke="var(--color-text-muted)" fontSize={10} tickLine={false} axisLine={false} interval={3} />
                            <YAxis stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <defs>
                                <linearGradient id="msgGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
                                </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="messages" name="Messages" stroke="#6366f1" fill="url(#msgGradient)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Intent Distribution Full */}
                <div className="card-flat" style={{ padding: '1.5rem' }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Intent Classification Breakdown</h3>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)' }}>
                            AI-detected message categories
                        </p>
                    </div>
                    <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                            <Pie
                                data={intentDistributionData}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={85}
                                paddingAngle={3}
                                dataKey="value"
                                label={({ name, value }) => `${name} (${value}%)`}
                                labelLine={{ stroke: 'var(--color-text-muted)', strokeWidth: 1 }}
                            >
                                {intentDistributionData.map((entry, idx) => (
                                    <Cell key={idx} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Channel Performance Table */}
            <div className="card-flat" style={{ padding: '1.5rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Channel Performance</h3>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)' }}>
                        Metrics by communication channel
                    </p>
                </div>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Channel</th>
                                <th>Message Volume</th>
                                <th>Avg Response Time</th>
                                <th>Patient Satisfaction</th>
                                <th>AI Accuracy</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {channelPerformanceData.map(ch => (
                                <tr key={ch.channel}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                                            {ch.channel === 'Email' ? <MessageSquare size={16} color="#6366f1" /> :
                                                ch.channel === 'Portal' ? <Users size={16} color="#06b6d4" /> :
                                                    <MessageSquare size={16} color="#8b5cf6" />}
                                            {ch.channel}
                                        </div>
                                    </td>
                                    <td>
                                        <strong>{ch.volume}</strong> messages
                                    </td>
                                    <td>
                                        <span style={{ color: ch.avgResponse < 2 ? 'var(--color-success)' : 'var(--color-warning)' }}>
                                            {ch.avgResponse} min
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <Star size={14} color="var(--color-warning)" fill="var(--color-warning)" />
                                            {ch.satisfaction}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div className="progress-bar" style={{ width: 80 }}>
                                                <div className="progress-bar-fill" style={{ width: `${90 + Math.random() * 8}%` }} />
                                            </div>
                                            <span style={{ fontWeight: 500, fontSize: '0.8125rem' }}>{(90 + Math.random() * 8).toFixed(1)}%</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="badge badge-success">Active</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
