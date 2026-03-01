import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Stethoscope, CalendarDays, AlertTriangle, ClipboardList,
    Users, Pill, Clock, Activity, Bell, UserPlus, Check, X,
    Heart, Droplets, Thermometer, FileText
} from 'lucide-react';
import axios from 'axios';
import { getNotifications, markNotificationRead } from '../services/api';

const SEVERITY_STYLE = {
    Low: 'bg-green-100 text-green-700', Medium: 'bg-yellow-100 text-yellow-700',
    High: 'bg-orange-100 text-orange-700', Critical: 'bg-red-100 text-red-700',
};

export default function DoctorDashboard() {
    const user = JSON.parse(sessionStorage.getItem('zi_user') || '{}');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [showNotifPanel, setShowNotifPanel] = useState(false);
    const [myPatients, setMyPatients] = useState([]);
    const [loadingPatients, setLoadingPatients] = useState(true);

    const unreadCount = notifications.filter(n => !n.read).length;

    const fetchNotifications = useCallback(async () => {
        if (!user.email) return;
        try {
            const res = await getNotifications(user.email);
            setNotifications(res.notifications || []);
        } catch { /* silent */ }
    }, [user.email]);

    const fetchMyPatients = useCallback(async () => {
        if (!user.email) return;
        try {
            const res = await axios.get(`/api/doctor/my-patients?doctor_email=${encodeURIComponent(user.email)}`);
            setMyPatients(res.data.patients || []);
        } catch { /* silent */ }
        finally { setLoadingPatients(false); }
    }, [user.email]);

    useEffect(() => {
        (async () => {
            try {
                const dept = user.department ? `?department=${encodeURIComponent(user.department)}` : '';
                const res = await axios.get(`/api/doctor/dashboard${dept}`);
                setData(res.data);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        })();
        fetchNotifications();
        fetchMyPatients();
        const interval = setInterval(() => {
            fetchNotifications();
            fetchMyPatients();
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleMarkRead = async (id) => {
        try {
            await markNotificationRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch { /* silent */ }
    };

    const handleMarkAllRead = async () => {
        const unread = notifications.filter(n => !n.read);
        for (const n of unread) {
            try { await markNotificationRead(n.id); } catch { /* silent */ }
        }
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const timeAgo = (dateStr) => {
        if (!dateStr) return '';
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        return `${days}d ago`;
    };

    const getBPStatus = (sys, dia) => {
        if (!sys) return null;
        if (sys >= 140 || dia >= 90) return { text: 'High', cls: 'text-red-600 bg-red-50' };
        if (sys < 90 || dia < 60) return { text: 'Low', cls: 'text-amber-600 bg-amber-50' };
        return { text: 'Normal', cls: 'text-emerald-600 bg-emerald-50' };
    };

    if (loading) return <div className="text-center py-20 text-text-muted">Loading dashboard...</div>;
    if (!data) return <div className="text-center py-20 text-text-muted">Failed to load.</div>;

    const stats = [
        { icon: CalendarDays, label: "Today's Appointments", value: data.today_appointments, color: '#3B82F6', bg: 'from-blue-500/10 to-blue-500/5' },
        { icon: ClipboardList, label: 'Pending Cases', value: data.open_cases, color: '#F59E0B', bg: 'from-amber-500/10 to-amber-500/5' },
        { icon: AlertTriangle, label: 'Critical Alerts', value: data.critical_alerts, color: '#EF4444', bg: 'from-red-500/10 to-red-500/5' },
        { icon: Users, label: 'Pending Bookings', value: data.pending_bookings, color: '#8B5CF6', bg: 'from-purple-500/10 to-purple-500/5' },
        { icon: Pill, label: 'Prescriptions', value: data.total_prescriptions, color: '#10B981', bg: 'from-emerald-500/10 to-emerald-500/5' },
        { icon: Activity, label: 'Total Cases', value: data.total_cases, color: '#06B6D4', bg: 'from-cyan-500/10 to-cyan-500/5' },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-200/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/15 flex items-center justify-center">
                            <Stethoscope size={24} className="text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-text-primary">
                                Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user.name || 'Doctor'}
                            </h1>
                            <p className="text-sm text-text-secondary">{user.department || 'General'} Department · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>

                    {/* Notification Bell */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifPanel(!showNotifPanel)}
                            className="relative w-11 h-11 rounded-xl bg-white/80 border border-border
                                flex items-center justify-center cursor-pointer
                                hover:bg-white hover:shadow-md transition-all duration-200"
                        >
                            <Bell size={20} className="text-text-secondary" />
                            {unreadCount > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white
                                        text-[10px] font-bold rounded-full flex items-center justify-center
                                        shadow-lg shadow-red-500/30 ring-2 ring-white"
                                >
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </motion.span>
                            )}
                        </button>

                        {/* Notification Panel */}
                        <AnimatePresence>
                            {showNotifPanel && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute right-0 top-14 w-96 max-h-[480px] bg-surface-card
                                        border border-border rounded-2xl shadow-2xl shadow-black/10 z-50
                                        overflow-hidden flex flex-col"
                                >
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface">
                                        <div className="flex items-center gap-2">
                                            <Bell size={16} className="text-primary" />
                                            <h3 className="text-sm font-bold text-text-primary">Notifications</h3>
                                            {unreadCount > 0 && (
                                                <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-md">
                                                    {unreadCount} new
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            {unreadCount > 0 && (
                                                <button onClick={handleMarkAllRead}
                                                    className="text-[11px] text-primary hover:text-primary-dark font-medium cursor-pointer
                                                        px-2 py-1 rounded-lg hover:bg-primary/5 transition-colors">
                                                    Mark all read
                                                </button>
                                            )}
                                            <button onClick={() => setShowNotifPanel(false)}
                                                className="w-7 h-7 rounded-lg flex items-center justify-center
                                                    hover:bg-surface-card cursor-pointer transition-colors">
                                                <X size={14} className="text-text-muted" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="overflow-y-auto flex-1">
                                        {notifications.length === 0 ? (
                                            <div className="py-12 text-center">
                                                <Bell size={28} className="text-text-muted/30 mx-auto mb-2" />
                                                <p className="text-xs text-text-muted">No notifications yet</p>
                                            </div>
                                        ) : (
                                            notifications.map((n, i) => (
                                                <motion.div key={n.id}
                                                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.03 }}
                                                    className={`px-4 py-3 border-b border-border/50 hover:bg-surface/50
                                                        transition-colors cursor-default ${!n.read ? 'bg-primary/[0.03]' : ''}`}
                                                >
                                                    <div className="flex gap-3">
                                                        <div className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center
                                                            ${n.type === 'new_patient' ? 'bg-emerald-500/10' : 'bg-blue-500/10'}`}>
                                                            <UserPlus size={16} className={n.type === 'new_patient' ? 'text-emerald-600' : 'text-blue-600'} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between gap-2">
                                                                <p className="text-xs font-bold text-text-primary leading-snug">
                                                                    {n.title}
                                                                    {!n.read && <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full ml-1.5 align-middle" />}
                                                                </p>
                                                                <span className="text-[10px] text-text-muted whitespace-nowrap flex-shrink-0">{timeAgo(n.created_at)}</span>
                                                            </div>
                                                            <p className="text-[11px] text-text-secondary mt-0.5 leading-relaxed">{n.message}</p>
                                                            {!n.read && (
                                                                <button onClick={() => handleMarkRead(n.id)}
                                                                    className="mt-1.5 text-[10px] text-primary font-medium flex items-center gap-1
                                                                        hover:text-primary-dark cursor-pointer transition-colors">
                                                                    <Check size={10} /> Mark as read
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {stats.map((s, i) => (
                    <motion.div
                        key={s.label}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`p-4 rounded-2xl bg-gradient-to-br ${s.bg} border border-border`}
                    >
                        <s.icon size={18} style={{ color: s.color }} className="mb-2" />
                        <p className="text-2xl font-bold text-text-primary">{s.value}</p>
                        <p className="text-[10px] text-text-muted font-medium mt-0.5">{s.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* ═══ My Patients & Vitals ═══ */}
            <div className="bg-surface-card rounded-2xl border border-border p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                        <UserPlus size={16} className="text-emerald-500" />
                        My Assigned Patients
                        {myPatients.length > 0 && (
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-md">
                                {myPatients.length}
                            </span>
                        )}
                    </h3>
                </div>

                {loadingPatients ? (
                    <div className="text-center py-8 text-text-muted text-xs">Loading patients...</div>
                ) : myPatients.length === 0 ? (
                    <div className="text-center py-10">
                        <Users size={32} className="text-text-muted/20 mx-auto mb-2" />
                        <p className="text-xs text-text-muted">No patients assigned to you yet</p>
                        <p className="text-[10px] text-text-muted/70 mt-1">Patients registered by nurses will appear here</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {myPatients.map((p, i) => {
                            const v = p.latest_vitals;
                            const bp = v ? getBPStatus(v.bp_systolic, v.bp_diastolic) : null;
                            return (
                                <motion.div key={p.id}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.04 }}
                                    className="p-4 rounded-xl border border-border bg-surface hover:shadow-sm transition-shadow"
                                >
                                    {/* Patient header row */}
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/15 to-teal-500/10
                                                flex items-center justify-center text-emerald-600 font-bold text-sm flex-shrink-0">
                                                {p.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-text-primary">{p.name}</h4>
                                                <p className="text-[11px] text-text-muted">{p.email} · {p.department}</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-text-muted whitespace-nowrap">
                                            {p.created_at ? timeAgo(p.created_at) : ''}
                                        </span>
                                    </div>

                                    {/* Issue badge */}
                                    {p.issue && (
                                        <div className="mb-3 flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-50/80 border border-amber-200/40">
                                            <FileText size={13} className="text-amber-500 mt-0.5 flex-shrink-0" />
                                            <p className="text-[11px] text-amber-800 leading-relaxed">
                                                <span className="font-semibold">Issue:</span> {p.issue}
                                            </p>
                                        </div>
                                    )}

                                    {/* Vitals display */}
                                    {v ? (
                                        <div className="p-3 rounded-lg bg-surface-card border border-border/60">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide">Latest Vitals</p>
                                                <p className="text-[10px] text-text-muted">
                                                    {v.recorded_at ? new Date(v.recorded_at).toLocaleString() : ''}
                                                </p>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                {/* BP */}
                                                {v.bp_systolic && (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                                                            <Heart size={13} className="text-red-500" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-text-primary">{v.bp_systolic}/{v.bp_diastolic}</p>
                                                            {bp && (
                                                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${bp.cls}`}>
                                                                    {bp.text}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                                {/* Sugar */}
                                                {v.sugar_level && (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                                            <Droplets size={13} className="text-blue-500" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-text-primary">{v.sugar_level}</p>
                                                            <p className="text-[9px] text-text-muted">mg/dL</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {/* Temp */}
                                                {v.temperature && (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                                                            <Thermometer size={13} className="text-orange-500" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-text-primary">{v.temperature}°F</p>
                                                            <p className="text-[9px] text-text-muted">Temp</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {/* Heart Rate */}
                                                {v.heart_rate && (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                                                            <Activity size={13} className="text-emerald-500" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-text-primary">{v.heart_rate}</p>
                                                            <p className="text-[9px] text-text-muted">bpm</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            {v.notes && (
                                                <p className="text-[11px] text-text-secondary mt-2 pt-2 border-t border-border/40">
                                                    📝 {v.notes}
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-100 text-center">
                                            <p className="text-[11px] text-text-muted">No vitals recorded yet — waiting for nurse to record</p>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pending Cases */}
                <div className="bg-surface-card rounded-2xl border border-border p-5">
                    <h3 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
                        <ClipboardList size={16} className="text-amber-500" /> Pending Cases
                    </h3>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {data.cases.map((c, i) => (
                            <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                                className="flex items-center justify-between p-3 rounded-xl bg-surface hover:bg-surface/80 border border-border/50">
                                <div>
                                    <p className="text-xs font-bold text-text-primary">Case #{c.id}</p>
                                    <p className="text-[10px] text-text-muted">{c.department} · Staff #{c.staff_id}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${SEVERITY_STYLE[c.severity] || ''}`}>
                                        {c.severity}
                                    </span>
                                    <span className="text-[10px] text-text-muted flex items-center gap-1">
                                        <Clock size={10} /> {c.sla_deadline ? new Date(c.sla_deadline).toLocaleDateString() : '—'}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                        {data.cases.length === 0 && <p className="text-xs text-text-muted text-center py-6">No pending cases</p>}
                    </div>
                </div>

                {/* Emergency Alerts */}
                <div className="bg-surface-card rounded-2xl border border-border p-5">
                    <h3 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
                        <AlertTriangle size={16} className="text-red-500" /> Emergency Alerts
                    </h3>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {data.emergency_alerts.map((c, i) => (
                            <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                                className="p-3 rounded-xl bg-red-50 border border-red-200/50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-red-700">🚨 Case #{c.id} — {c.department}</p>
                                        <p className="text-[10px] text-red-600">Status: {c.status} · Staff #{c.staff_id}</p>
                                    </div>
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-100 text-red-700">
                                        CRITICAL
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                        {data.emergency_alerts.length === 0 && (
                            <div className="text-center py-6">
                                <p className="text-xs text-emerald-600 font-medium">✅ No critical alerts</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
