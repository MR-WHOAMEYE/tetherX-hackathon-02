import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, CheckCircle, Stethoscope, Building2, User, Mail, ChevronDown, Sparkles, FileText } from 'lucide-react';
import { registerUser, getDoctors } from '../services/api';

const DEPARTMENTS = ['Emergency', 'Cardiology', 'Orthopedics', 'Pediatrics', 'Neurology'];

export default function RegisterPatient() {
    const [form, setForm] = useState({
        name: '', email: '', department: '',
        assigned_doctor: '', assigned_doctor_name: '', issue: ''
    });
    const [doctors, setDoctors] = useState([]);
    const [loadingDoctors, setLoadingDoctors] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const token = sessionStorage.getItem('zi_token');

    // Fetch doctors when department changes
    useEffect(() => {
        if (!form.department) {
            setDoctors([]);
            setForm(f => ({ ...f, assigned_doctor: '', assigned_doctor_name: '' }));
            return;
        }
        setLoadingDoctors(true);
        getDoctors(form.department)
            .then(res => {
                setDoctors(res.doctors || []);
                setForm(f => ({ ...f, assigned_doctor: '', assigned_doctor_name: '' }));
            })
            .catch(() => setDoctors([]))
            .finally(() => setLoadingDoctors(false));
    }, [form.department]);

    const handleDoctorChange = (e) => {
        const email = e.target.value;
        const doc = doctors.find(d => d.email === email);
        setForm(f => ({
            ...f,
            assigned_doctor: email,
            assigned_doctor_name: doc ? doc.name : ''
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess(''); setLoading(true);
        try {
            await registerUser({ ...form, role: 'patient' }, token);
            setSuccess(`Patient "${form.name}" registered successfully — assigned to ${form.assigned_doctor_name || 'department'}`);
            setForm({ name: '', email: '', department: '', assigned_doctor: '', assigned_doctor_name: '', issue: '' });
        } catch (err) {
            setError(err?.response?.data?.detail || 'Failed to create patient');
        } finally { setLoading(false); }
    };

    /* ---- shared input class ---- */
    const inputCls = `w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border bg-surface text-sm
        focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all duration-200
        placeholder:text-text-secondary/40`;

    const selectCls = `w-full pl-10 pr-8 py-2.5 rounded-xl border border-border bg-surface text-sm
        focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all duration-200
        cursor-pointer appearance-none`;

    const labelCls = 'block text-xs font-semibold text-text-secondary mb-1.5 tracking-wide uppercase';

    const iconWrap = 'absolute left-3 top-1/2 -translate-y-1/2 text-primary/50 pointer-events-none';

    return (
        <div className="max-w-lg mx-auto space-y-6 mt-8 pb-8">
            {/* ── Header ── */}
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-center"
            >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5
                    flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary/10 relative overflow-hidden">
                    <UserPlus size={28} className="text-primary relative z-10" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/20" />
                </div>
                <h1 className="text-2xl font-bold text-text-primary">Register Patient</h1>
                <p className="text-sm text-text-secondary mt-1">Admit a new patient and assign a doctor</p>
            </motion.div>

            {/* ── Form Card ── */}
            <motion.form
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.1 }}
                onSubmit={handleSubmit}
                className="p-6 rounded-2xl bg-surface-card border border-border space-y-5
                    shadow-xl shadow-black/[0.03]"
            >
                {/* ── Patient Name ── */}
                <div>
                    <label className={labelCls}>Patient Name</label>
                    <div className="relative">
                        <span className={iconWrap}><User size={16} /></span>
                        <input value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            placeholder="Full name" required className={inputCls} />
                    </div>
                </div>

                {/* ── Email ── */}
                <div>
                    <label className={labelCls}>Email</label>
                    <div className="relative">
                        <span className={iconWrap}><Mail size={16} /></span>
                        <input type="email" value={form.email}
                            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                            placeholder="patient@hospital.ai" required className={inputCls} />
                    </div>
                </div>

                {/* ── Department ── */}
                <div>
                    <label className={labelCls}>Department</label>
                    <div className="relative">
                        <span className={iconWrap}><Building2 size={16} /></span>
                        <select value={form.department}
                            onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                            className={selectCls} required>
                            <option value="">Select department…</option>
                            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary/50 pointer-events-none" />
                    </div>
                </div>

                {/* ── Assign Doctor (shows after dept selected) ── */}
                <AnimatePresence>
                    {form.department && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <label className={labelCls}>
                                <span className="flex items-center gap-1.5">
                                    Assign Doctor
                                    {loadingDoctors && (
                                        <span className="inline-block w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                    )}
                                </span>
                            </label>
                            <div className="relative">
                                <span className={iconWrap}><Stethoscope size={16} /></span>
                                <select value={form.assigned_doctor}
                                    onChange={handleDoctorChange}
                                    className={selectCls} required disabled={loadingDoctors}>
                                    <option value="">
                                        {loadingDoctors ? 'Loading doctors…'
                                            : doctors.length === 0 ? 'No doctors in this department'
                                                : 'Choose a doctor…'}
                                    </option>
                                    {doctors.map(d => (
                                        <option key={d.email} value={d.email}>{d.name}</option>
                                    ))}
                                </select>
                                <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary/50 pointer-events-none" />
                            </div>
                            {doctors.length > 0 && (
                                <p className="text-[11px] text-text-secondary/60 mt-1.5 pl-1 flex items-center gap-1">
                                    <Sparkles size={10} />
                                    {doctors.length} doctor{doctors.length !== 1 ? 's' : ''} available
                                    in {form.department}
                                </p>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Issue / Reason ── */}
                <div>
                    <label className={labelCls}>Issue / Reason for Visit</label>
                    <div className="relative">
                        <span className="absolute left-3 top-3 text-primary/50 pointer-events-none">
                            <FileText size={16} />
                        </span>
                        <textarea value={form.issue}
                            onChange={e => setForm(f => ({ ...f, issue: e.target.value }))}
                            placeholder="Describe the patient's symptoms, complaint, or reason for admission…"
                            rows={3} required
                            className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border bg-surface text-sm
                                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all duration-200
                                placeholder:text-text-secondary/40 resize-none`} />
                    </div>
                </div>
                {/* ── Messages ── */}
                <AnimatePresence>
                    {error && (
                        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="text-rose-600 text-xs bg-rose-50 border border-rose-200/50 px-3 py-2.5 rounded-lg">
                            {error}
                        </motion.p>
                    )}
                    {success && (
                        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="text-emerald-600 text-xs bg-emerald-50 border border-emerald-200/50
                                px-3 py-2.5 rounded-lg flex items-center gap-1.5">
                            <CheckCircle size={14} /> {success}
                        </motion.p>
                    )}
                </AnimatePresence>

                {/* ── Submit ── */}
                <button type="submit" disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-semibold text-sm
                        shadow-lg shadow-primary/20 cursor-pointer disabled:opacity-50 transition-all
                        hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0">
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Creating…
                        </span>
                    ) : 'Register Patient'}
                </button>
            </motion.form>
        </div>
    );
}
