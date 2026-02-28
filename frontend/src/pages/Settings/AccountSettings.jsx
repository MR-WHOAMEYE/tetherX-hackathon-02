import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Clock, Key, Camera, BadgeCheck, Building2 } from 'lucide-react';

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

    const initials = (s.name || 'Dr Admin').split(' ').map(w => w[0]).join('').slice(0, 2);

    return (
        <div className="space-y-6">
            {/* Profile Hero Card */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl overflow-hidden"
                style={{
                    background: 'rgba(255, 255, 255, 0.75)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.8)',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.02)',
                }}
            >
                {/* Banner Gradient */}
                <div
                    className="relative"
                    style={{
                        height: '140px',
                        background: 'linear-gradient(135deg, #0F766E 0%, #14B8A6 40%, #0EA5E9 100%)',
                    }}
                >
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 50%)',
                    }} />
                    {/* Decorative pattern */}
                    <svg className="absolute inset-0 w-full h-full opacity-[0.06]" style={{ mixBlendMode: 'overlay' }}>
                        <defs>
                            <pattern id="settings-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                                <circle cx="2" cy="2" r="1" fill="white" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#settings-dots)" />
                    </svg>
                    {/* Edit Button positioned on the banner */}
                    <div className="absolute top-4 right-5 z-10">
                        <button
                            onClick={() => editing ? handleSave() : setEditing(true)}
                            className="px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all duration-200"
                            style={{
                                background: editing
                                    ? 'rgba(255, 255, 255, 0.95)'
                                    : 'rgba(255, 255, 255, 0.2)',
                                color: editing ? '#0F766E' : 'white',
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
                            }}
                        >
                            {editing ? '✓ Save Changes' : 'Edit Profile'}
                        </button>
                    </div>
                </div>

                {/* Profile Info — positioned below banner with avatar overlapping */}
                <div className="px-7 pb-7 relative" style={{ marginTop: '-48px' }}>
                    {/* Avatar */}
                    <div className="relative group mb-4" style={{ width: 'fit-content' }}>
                        <div
                            className="flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
                            style={{
                                width: '88px',
                                height: '88px',
                                borderRadius: '20px',
                                background: 'linear-gradient(135deg, #0F766E, #14B8A6)',
                                border: '4px solid white',
                                boxShadow: '0 8px 24px rgba(15, 118, 110, 0.25)',
                            }}
                        >
                            {initials}
                        </div>
                        <button
                            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-white shadow-md flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            style={{ border: '1px solid rgba(0, 0, 0, 0.06)' }}
                        >
                            <Camera size={12} className="text-text-secondary" />
                        </button>
                    </div>

                    {/* Name, Role & Details */}
                    <div>
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                            <h3
                                className="text-xl font-bold text-text-primary"
                                style={{ fontFamily: 'var(--font-family-display)' }}
                            >
                                {s.name || 'Dr. Admin'}
                            </h3>
                            <span
                                className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider"
                                style={{
                                    background: 'linear-gradient(135deg, #0F766E10, #14B8A610)',
                                    color: '#0F766E',
                                    border: '1px solid rgba(15, 118, 110, 0.1)',
                                }}
                            >
                                <BadgeCheck size={10} /> {s.role || 'Admin'}
                            </span>
                        </div>
                        <div className="flex items-center gap-5">
                            <span className="text-sm text-text-secondary flex items-center gap-1.5">
                                <Mail size={13} className="text-text-muted" /> {s.email || 'admin@hospital.ai'}
                            </span>
                            <span className="text-sm text-text-secondary flex items-center gap-1.5">
                                <Building2 size={13} className="text-text-muted" /> Healthcare System
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Editable Fields */}
            {editing && (
                <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className="rounded-2xl p-6"
                    style={{
                        background: 'rgba(255, 255, 255, 0.75)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.8)',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.02)',
                    }}
                >
                    <h4 className="text-sm font-bold text-text-primary flex items-center gap-2.5 mb-5">
                        <div className="w-1.5 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #0F766E, #14B8A6)' }} />
                        Edit Profile Information
                    </h4>
                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-2 block">
                                Full Name
                            </label>
                            <div
                                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
                                style={{
                                    background: 'rgba(240, 253, 250, 0.6)',
                                    border: '1px solid rgba(15, 118, 110, 0.1)',
                                }}
                            >
                                <User size={15} className="text-text-muted flex-shrink-0" />
                                <input
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="flex-1 bg-transparent text-sm font-medium text-text-primary outline-none placeholder:text-text-muted"
                                    placeholder="Enter full name"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-2 block">
                                Email Address
                            </label>
                            <div
                                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
                                style={{
                                    background: 'rgba(240, 253, 250, 0.6)',
                                    border: '1px solid rgba(15, 118, 110, 0.1)',
                                }}
                            >
                                <Mail size={15} className="text-text-muted flex-shrink-0" />
                                <input
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="flex-1 bg-transparent text-sm font-medium text-text-primary outline-none placeholder:text-text-muted"
                                    placeholder="Enter email address"
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Account Settings */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl p-6"
                style={{
                    background: 'rgba(255, 255, 255, 0.75)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.8)',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.02)',
                }}
            >
                <h4 className="text-sm font-bold text-text-primary flex items-center gap-2.5 mb-5">
                    <div className="w-1.5 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #0F766E, #14B8A6)' }} />
                    Account Settings
                </h4>

                {/* Session Timeout */}
                <div
                    className="flex items-center justify-between py-4 px-4 rounded-xl mb-3 transition-all duration-200 group"
                    style={{
                        background: 'rgba(240, 253, 250, 0.3)',
                        border: '1px solid transparent',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(240, 253, 250, 0.6)';
                        e.currentTarget.style.border = '1px solid rgba(15, 118, 110, 0.06)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(240, 253, 250, 0.3)';
                        e.currentTarget.style.border = '1px solid transparent';
                    }}
                >
                    <div className="flex items-center gap-3.5">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: 'rgba(15, 118, 110, 0.08)' }}
                        >
                            <Clock size={18} className="text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-text-primary">Session Timeout</p>
                            <p className="text-[11px] text-text-secondary mt-0.5">Auto-logout after inactivity period</p>
                        </div>
                    </div>
                    <select
                        value={s.session_timeout || 30}
                        onChange={e => onUpdate('profile', 'session_timeout', Number(e.target.value))}
                        className="text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer focus:outline-none transition-all duration-200"
                        style={{
                            background: 'rgba(15, 118, 110, 0.06)',
                            color: '#0F766E',
                            border: '1px solid rgba(15, 118, 110, 0.1)',
                        }}
                    >
                        <option value={15}>15 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={60}>1 hour</option>
                        <option value={120}>2 hours</option>
                    </select>
                </div>

                {/* Password */}
                <div
                    className="flex items-center justify-between py-4 px-4 rounded-xl transition-all duration-200 group"
                    style={{
                        background: 'rgba(245, 158, 11, 0.03)',
                        border: '1px solid transparent',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(245, 158, 11, 0.06)';
                        e.currentTarget.style.border = '1px solid rgba(245, 158, 11, 0.08)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(245, 158, 11, 0.03)';
                        e.currentTarget.style.border = '1px solid transparent';
                    }}
                >
                    <div className="flex items-center gap-3.5">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: 'rgba(245, 158, 11, 0.08)' }}
                        >
                            <Key size={18} className="text-amber-500" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-text-primary">Password</p>
                            <p className="text-[11px] text-text-secondary mt-0.5">Last changed 30 days ago</p>
                        </div>
                    </div>
                    <button
                        className="px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all duration-200"
                        style={{
                            background: 'rgba(245, 158, 11, 0.06)',
                            color: '#D97706',
                            border: '1px solid rgba(245, 158, 11, 0.12)',
                        }}
                    >
                        Change Password
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
