import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import {
    LayoutDashboard, FileText, Pill, Activity, Bell, Users,
    UserPlus, Brain, ChevronLeft, ChevronRight, LogOut,
    Stethoscope, HeartPulse, UserCircle, Zap, MessageSquare
} from 'lucide-react';

const roleNavConfig = {
    doctor: {
        color: '#059669',
        gradient: 'linear-gradient(135deg, #059669, #10b981)',
        label: 'Doctor Portal',
        icon: Stethoscope,
    },
    nurse: {
        color: '#0d9488',
        gradient: 'linear-gradient(135deg, #0d9488, #14b8a6)',
        label: 'Nurse Portal',
        icon: HeartPulse,
    },
    patient: {
        color: '#047857',
        gradient: 'linear-gradient(135deg, #047857, #059669)',
        label: 'Patient Portal',
        icon: UserCircle,
    },
};

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const { questions, getUserNotifications } = useApp();

    const role = user?.role || 'patient';
    const config = roleNavConfig[role];
    const RoleIcon = config.icon;

    const pendingQCount = questions.filter(q => q.status === 'pending').length;
    const notifs = getUserNotifications(user?.id);
    const unreadCount = notifs.filter(n => !n.read).length;

    const navItems = {
        doctor: [
            { path: '/doctor', tab: '', label: 'Dashboard', icon: LayoutDashboard },
            { path: '/doctor?tab=patients', tab: 'patients', label: 'My Patients', icon: Users },
            { path: '/doctor?tab=prescribe', tab: 'prescribe', label: 'Prescribe', icon: Pill },
            { path: '/doctor?tab=reports', tab: 'reports', label: 'Reports', icon: FileText },
            { path: '/doctor?tab=notifications', tab: 'notifications', label: 'Patient Questions', icon: MessageSquare, badge: pendingQCount },
        ],
        nurse: [
            { path: '/nurse', tab: '', label: 'Dashboard', icon: LayoutDashboard },
            { path: '/nurse?tab=patients', tab: 'patients', label: 'Patient List', icon: Users },
            { path: '/nurse?tab=register', tab: 'register', label: 'Register Patient', icon: UserPlus },
            { path: '/nurse?tab=vitals', tab: 'vitals', label: 'Record Vitals', icon: Activity },
            { path: '/nurse?tab=notifications', tab: 'notifications', label: 'Questions', icon: MessageSquare, badge: pendingQCount },
        ],
        patient: [
            { path: '/patient', tab: '', label: 'Dashboard', icon: LayoutDashboard },
            { path: '/patient?tab=reports', tab: 'reports', label: 'My Reports', icon: FileText },
            { path: '/patient?tab=prescriptions', tab: 'prescriptions', label: 'Prescriptions', icon: Pill },
            { path: '/patient?tab=vitals', tab: 'vitals', label: 'My Vitals', icon: Activity },
            { path: '/patient?tab=ask', tab: 'ask', label: 'Ask AI', icon: Brain },
            { path: '/patient?tab=notifications', tab: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
        ],
    };

    const items = navItems[role] || [];

    const handleNavigate = (path) => {
        navigate(path);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (itemTab, itemPath) => {
        const [base] = itemPath.split('?');
        const currentBase = location.pathname;
        if (currentBase !== base) return false;

        const currentParams = new URLSearchParams(location.search);
        const currentTab = currentParams.get('tab') || '';

        return currentTab === itemTab;
    };

    return (
        <aside
            style={{
                width: collapsed ? 72 : 260,
                height: '100vh',
                position: 'fixed',
                left: 0,
                top: 0,
                background: 'var(--color-bg-secondary)',
                borderRight: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'width 0.25s ease',
                zIndex: 100,
                overflow: 'hidden',
            }}
        >
            {/* Brand */}
            <div style={{
                padding: collapsed ? '1.25rem 0.5rem' : '1.25rem 1.25rem',
                borderBottom: '1px solid var(--color-border-light)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                justifyContent: collapsed ? 'center' : 'flex-start',
            }}>
                <div style={{
                    width: 40, height: 40, borderRadius: 'var(--radius-md)',
                    background: config.gradient,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                }}>
                    <Zap size={22} color="white" />
                </div>
                {!collapsed && (
                    <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 700, fontSize: '1.0625rem' }}>TetherX</div>
                        <div style={{ fontSize: '0.6875rem', color: config.color, fontWeight: 500 }}>{config.label}</div>
                    </div>
                )}
            </div>

            {/* User mini-profile */}
            {!collapsed && (
                <div style={{
                    padding: '0.875rem 1.25rem',
                    borderBottom: '1px solid var(--color-border-light)',
                    display: 'flex', alignItems: 'center', gap: '0.625rem',
                }}>
                    <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: config.gradient,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0,
                    }}>
                        {user?.name?.charAt(0)}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {user?.name}
                        </div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                            {role}
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <nav style={{ flex: 1, padding: '0.75rem 0.5rem', overflowY: 'auto' }}>
                {items.map(item => {
                    const Icon = item.icon;
                    const active = isActive(item.tab, item.path);

                    return (
                        <button
                            key={item.path}
                            onClick={() => handleNavigate(item.path)}
                            title={collapsed ? item.label : undefined}
                            style={{
                                width: collapsed ? '100%' : 'calc(100% + 0.5rem)',
                                padding: collapsed ? '0.75rem' : '0.75rem 1.25rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                justifyContent: collapsed ? 'center' : 'flex-start',
                                background: active ? `${config.color}12` : 'transparent',
                                border: 'none',
                                borderRadius: collapsed ? 'var(--radius-md)' : '0 var(--radius-full) var(--radius-full) 0',
                                color: active ? config.color : 'var(--color-text-secondary)',
                                fontWeight: active ? 600 : 500,
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                marginBottom: '0.25rem',
                                transition: 'all 0.15s ease',
                                position: 'relative',
                                fontFamily: 'var(--font-sans)',
                                marginLeft: collapsed ? 0 : '-0.5rem',
                                borderLeft: active && !collapsed ? `4px solid ${config.color}` : '4px solid transparent',
                            }}
                        >
                            <Icon size={18} />
                            {!collapsed && <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>}
                            {!collapsed && item.badge > 0 && (
                                <span style={{
                                    background: '#ef4444', color: 'white',
                                    fontSize: '0.625rem', fontWeight: 700,
                                    padding: '0.0625rem 0.375rem', borderRadius: 'var(--radius-full)',
                                    minWidth: 20, textAlign: 'center',
                                }}>{item.badge}</span>
                            )}
                            {collapsed && item.badge > 0 && (
                                <span style={{
                                    position: 'absolute', top: 4, right: 4,
                                    width: 8, height: 8, borderRadius: '50%',
                                    background: '#ef4444',
                                }} />
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Footer */}
            <div style={{ padding: '0.75rem 0.5rem', borderTop: '1px solid var(--color-border-light)' }}>
                <button
                    onClick={handleLogout}
                    style={{
                        width: '100%',
                        padding: collapsed ? '0.75rem' : '0.625rem 1rem',
                        display: 'flex', alignItems: 'center', gap: '0.625rem',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        background: 'rgba(239,68,68,0.06)', border: 'none',
                        borderRadius: 'var(--radius-md)',
                        color: '#f87171', fontSize: '0.8125rem', cursor: 'pointer',
                        fontFamily: 'var(--font-sans)', fontWeight: 500,
                    }}
                >
                    <LogOut size={18} />
                    {!collapsed && 'Sign Out'}
                </button>

                <button
                    onClick={() => setCollapsed(!collapsed)}
                    style={{
                        width: '100%', marginTop: '0.375rem',
                        padding: collapsed ? '0.5rem' : '0.5rem 1rem',
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        background: 'none', border: 'none',
                        color: 'var(--color-text-muted)', fontSize: '0.75rem',
                        cursor: 'pointer', fontFamily: 'var(--font-sans)',
                    }}
                >
                    {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /> Collapse</>}
                </button>
            </div>
        </aside>
    );
}
