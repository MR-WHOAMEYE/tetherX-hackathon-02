import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Clock, Key } from 'lucide-react';

export default function AccountSettings({ settings, onUpdate }) {
    const s = settings?.profile || {};
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(s.name || 'Dr. Admin');
    const [email, setEmail] = useState(s.email || 'admin@hospital.ai');

    const handleSave = () => {
        onUpdate('profile', 'name', name);
        onUpdate('profile', 'email', email);
        setEditing(false);
    };

    return (
        <div className="max-w-2xl space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-black/[0.04]">
                <div className="flex items-start gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-primary/20 flex-shrink-0">
                        {(s.name || 'A').charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-bold text-text-primary">{s.name || 'Dr. Admin'}</h3>
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-primary/10 text-primary uppercase tracking-wider">
                                {s.role || 'Admin'}
                            </span>
                        </div>
                        <p className="text-sm text-text-secondary">{s.email || 'admin@hospital.ai'}</p>
                    </div>
                    <button
                        onClick={() => editing ? handleSave() : setEditing(true)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors bg-primary text-white hover:bg-primary-dark"
                    >
                        {editing ? 'Save' : 'Edit Profile'}
                    </button>
                </div>
            </div>

            {/* Editable Fields */}
            {editing && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-black/[0.04] space-y-4"
                >
                    <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
                        <div className="w-1 h-4 rounded-full bg-primary" /> Edit Profile
                    </h4>
                    <div>
                        <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Full Name</label>
                        <div className="mt-1.5 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-surface ring-1 ring-black/[0.04]">
                            <User size={14} className="text-text-muted flex-shrink-0" />
                            <input value={name} onChange={e => setName(e.target.value)}
                                className="flex-1 bg-transparent text-sm text-text-primary outline-none" />
                        </div>
                    </div>
                    <div>
                        <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Email Address</label>
                        <div className="mt-1.5 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-surface ring-1 ring-black/[0.04]">
                            <Mail size={14} className="text-text-muted flex-shrink-0" />
                            <input value={email} onChange={e => setEmail(e.target.value)}
                                className="flex-1 bg-transparent text-sm text-text-primary outline-none" />
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Session & Password */}
            <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-black/[0.04] space-y-1">
                <h4 className="text-sm font-bold text-text-primary flex items-center gap-2 mb-4">
                    <div className="w-1 h-4 rounded-full bg-primary" /> Account Settings
                </h4>
                <div className="flex items-center justify-between py-3 border-b border-black/[0.04]">
                    <div className="flex items-center gap-3">
                        <Clock size={16} className="text-primary" />
                        <div>
                            <p className="text-sm font-medium text-text-primary">Session Timeout</p>
                            <p className="text-[11px] text-text-secondary">Auto-logout after inactivity</p>
                        </div>
                    </div>
                    <select
                        value={s.session_timeout || 30}
                        onChange={e => onUpdate('profile', 'session_timeout', Number(e.target.value))}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg bg-surface ring-1 ring-black/[0.04] text-text-primary cursor-pointer focus:outline-none"
                    >
                        <option value={15}>15 min</option>
                        <option value={30}>30 min</option>
                        <option value={60}>1 hour</option>
                        <option value={120}>2 hours</option>
                    </select>
                </div>
                <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                        <Key size={16} className="text-amber-500" />
                        <div>
                            <p className="text-sm font-medium text-text-primary">Password</p>
                            <p className="text-[11px] text-text-secondary">Last changed 30 days ago</p>
                        </div>
                    </div>
                    <button className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-surface ring-1 ring-black/[0.04] text-text-primary cursor-pointer hover:bg-gray-50 transition-colors">
                        Change Password
                    </button>
                </div>
            </div>
        </div>
    );
}
