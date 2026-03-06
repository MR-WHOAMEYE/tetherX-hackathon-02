import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquarePlus, Send, Clock, CheckCircle2, AlertCircle,
    ChevronRight, Sparkles, Filter, RefreshCw, Inbox, XCircle
} from 'lucide-react';
import { submitPatientQuery, getPatientQueries } from '../services/api';

const CATEGORIES = [
    { value: 'general', label: 'General Inquiry', icon: '💬' },
    { value: 'appointment', label: 'Appointment', icon: '📅' },
    { value: 'medication', label: 'Medication', icon: '💊' },
    { value: 'billing', label: 'Billing', icon: '💳' },
    { value: 'lab_results', label: 'Lab Results', icon: '🔬' },
];

const PRIORITIES = [
    { value: 'low', label: 'Low', color: '#6B7280' },
    { value: 'medium', label: 'Medium', color: '#F59E0B' },
    { value: 'high', label: 'High', color: '#EF4444' },
    { value: 'urgent', label: 'Urgent', color: '#DC2626' },
];

const STATUS_CONFIG = {
    pending: { label: 'Pending', color: '#F59E0B', bg: '#FEF3C7', icon: Clock },
    ai_drafted: { label: 'AI Drafted', color: '#8B5CF6', bg: '#EDE9FE', icon: Sparkles },
    staff_reviewing: { label: 'Under Review', color: '#3B82F6', bg: '#DBEAFE', icon: AlertCircle },
    responded: { label: 'Responded', color: '#10B981', bg: '#D1FAE5', icon: CheckCircle2 },
    closed: { label: 'Closed', color: '#6B7280', bg: '#F3F4F6', icon: XCircle },
};

function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    const Icon = cfg.icon;
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: cfg.bg, color: cfg.color }}>
            <Icon size={12} />
            {cfg.label}
        </span>
    );
}

export default function PatientQueries() {
    const user = JSON.parse(sessionStorage.getItem('zi_user') || '{}');
    const [queries, setQueries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [selectedQuery, setSelectedQuery] = useState(null);
    const [filterStatus, setFilterStatus] = useState('');

    const [form, setForm] = useState({
        subject: '',
        category: 'general',
        message: '',
        priority: 'medium',
    });

    const fetchQueries = async () => {
        setLoading(true);
        try {
            const params = { patient_email: user.email || '' };
            if (filterStatus) params.status = filterStatus;
            const data = await getPatientQueries(params);
            setQueries(data.queries || []);
        } catch (err) {
            console.error('Failed to fetch queries:', err);
        }
        setLoading(false);
    };

    useEffect(() => { fetchQueries(); }, [filterStatus]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.subject.trim() || !form.message.trim()) return;
        setSubmitting(true);
        try {
            await submitPatientQuery({
                patient_email: user.email || '',
                patient_name: user.name || 'Patient',
                ...form,
            });
            setForm({ subject: '', category: 'general', message: '', priority: 'medium' });
            setShowForm(false);
            fetchQueries();
        } catch (err) {
            console.error('Submit failed:', err);
        }
        setSubmitting(false);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                        <MessageSquarePlus className="text-primary" size={28} />
                        My Queries
                    </h1>
                    <p className="text-sm text-text-secondary mt-1">
                        Submit questions and track responses from hospital staff
                    </p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchQueries}
                        className="p-2.5 rounded-xl bg-white border border-border hover:bg-surface transition-colors">
                        <RefreshCw size={18} className="text-text-secondary" />
                    </button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm"
                        style={{ background: 'linear-gradient(135deg, #0F766E, #14B8A6)' }}>
                        <MessageSquarePlus size={18} />
                        {showForm ? 'Cancel' : 'New Query'}
                    </motion.button>
                </div>
            </div>

            {/* Submit Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handleSubmit}
                        className="bg-white rounded-2xl p-6 border border-border medical-glow space-y-4 overflow-hidden"
                    >
                        <h2 className="text-lg font-bold text-text-primary">Submit a Question</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-text-secondary mb-1.5">Subject</label>
                                <input type="text" value={form.subject}
                                    onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                    placeholder="Brief summary of your question" required />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-text-secondary mb-1.5">Category</label>
                                <select value={form.category}
                                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                                    {CATEGORIES.map(c => (
                                        <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-text-secondary mb-1.5">Message</label>
                            <textarea value={form.message}
                                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                                rows={4}
                                className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                                placeholder="Describe your question in detail..." required />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                                {PRIORITIES.map(p => (
                                    <button key={p.value} type="button"
                                        onClick={() => setForm(f => ({ ...f, priority: p.value }))}
                                        className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
                                        style={{
                                            borderColor: form.priority === p.value ? p.color : '#E5E7EB',
                                            backgroundColor: form.priority === p.value ? p.color + '15' : 'transparent',
                                            color: form.priority === p.value ? p.color : '#6B7280',
                                        }}>
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                            <motion.button type="submit" disabled={submitting}
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white text-sm disabled:opacity-50"
                                style={{ background: 'linear-gradient(135deg, #0F766E, #14B8A6)' }}>
                                <Send size={16} />
                                {submitting ? 'Submitting...' : 'Submit Query'}
                            </motion.button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* Filters */}
            <div className="flex items-center gap-2">
                <Filter size={14} className="text-text-muted" />
                {['', 'pending', 'ai_drafted', 'staff_reviewing', 'responded'].map(s => (
                    <button key={s} onClick={() => setFilterStatus(s)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        style={{
                            backgroundColor: filterStatus === s ? '#0F766E' : '#fff',
                            color: filterStatus === s ? '#fff' : '#5F7A76',
                            border: `1px solid ${filterStatus === s ? '#0F766E' : '#CCFBF1'}`,
                        }}>
                        {s === '' ? 'All' : STATUS_CONFIG[s]?.label || s}
                    </button>
                ))}
            </div>

            {/* Query List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                        <RefreshCw size={24} className="text-primary" />
                    </motion.div>
                </div>
            ) : queries.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-border">
                    <Inbox size={48} className="mx-auto text-text-muted mb-3" />
                    <p className="text-text-secondary font-medium">No queries yet</p>
                    <p className="text-sm text-text-muted mt-1">Submit your first query to get started</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {queries.map((q, idx) => (
                        <motion.div key={q.id || idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => setSelectedQuery(selectedQuery?.id === q.id ? null : q)}
                            className="bg-white rounded-2xl p-5 border border-border hover:border-primary/30 medical-glow-hover cursor-pointer transition-all"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-lg">
                                            {CATEGORIES.find(c => c.value === q.category)?.icon || '💬'}
                                        </span>
                                        <h3 className="font-bold text-text-primary truncate">{q.subject}</h3>
                                    </div>
                                    <p className="text-sm text-text-secondary line-clamp-2">{q.message}</p>
                                    <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                                        <span>{new Date(q.created_at).toLocaleDateString()}</span>
                                        <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                                            style={{
                                                backgroundColor: PRIORITIES.find(p => p.value === q.priority)?.color + '15',
                                                color: PRIORITIES.find(p => p.value === q.priority)?.color,
                                            }}>
                                            {q.priority}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <StatusBadge status={q.status} />
                                    <ChevronRight size={16} className="text-text-muted" style={{
                                        transform: selectedQuery?.id === q.id ? 'rotate(90deg)' : 'rotate(0deg)',
                                        transition: 'transform 0.2s',
                                    }} />
                                </div>
                            </div>

                            {/* Expanded: show response */}
                            <AnimatePresence>
                                {selectedQuery?.id === q.id && q.final_response && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-4 pt-4 border-t border-border overflow-hidden"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <CheckCircle2 size={16} className="text-accent" />
                                            <span className="text-sm font-bold text-accent">Staff Response</span>
                                        </div>
                                        <p className="text-sm text-text-primary whitespace-pre-wrap bg-accent/5 p-4 rounded-xl">
                                            {q.final_response}
                                        </p>
                                        {q.responded_at && (
                                            <p className="text-xs text-text-muted mt-2">
                                                Responded on {new Date(q.responded_at).toLocaleString()}
                                                {q.assigned_staff ? ` by ${q.assigned_staff}` : ''}
                                            </p>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
