import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Bell, Search, LogOut, User, ChevronDown, X } from 'lucide-react';

export default function TopBar() {
    const { user, logout } = useAuth();
    const { getUserNotifications, markAllNotificationsRead } = useApp();
    const [showNotifs, setShowNotifs] = useState(false);
    const [showProfile, setShowProfile] = useState(false);

    const notifs = getUserNotifications(user?.id);
    const unreadCount = notifs.filter(n => !n.read).length;

    const roleColors = { doctor: '#059669', nurse: '#0d9488', patient: '#047857' };
    const roleColor = roleColors[user?.role] || '#059669';

    return (
        <header style={{
            height: 60,
            background: 'var(--color-bg-secondary)',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.5rem',
            position: 'sticky',
            top: 0,
            zIndex: 50,
        }}>
            {/* Search */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-full)', padding: '0.375rem 1rem',
                width: 320,
            }}>
                <Search size={15} color="var(--color-text-muted)" />
                <input
                    type="text"
                    placeholder="Search..."
                    style={{
                        background: 'transparent', border: 'none', outline: 'none',
                        color: 'var(--color-text-primary)', fontSize: '0.8125rem',
                        width: '100%', fontFamily: 'var(--font-sans)',
                    }}
                />
            </div>

            {/* Right side */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {/* Online indicator */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.375rem',
                    padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)',
                    background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
                }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                    <span style={{ fontSize: '0.6875rem', color: '#059669', fontWeight: 500 }}>Online</span>
                </div>

                {/* Notifications */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => { setShowNotifs(!showNotifs); setShowProfile(false); }}
                        style={{
                            width: 36, height: 36, borderRadius: 'var(--radius-md)',
                            background: showNotifs ? 'var(--color-bg-tertiary)' : 'transparent',
                            border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--color-text-secondary)', position: 'relative',
                        }}
                    >
                        <Bell size={18} />
                        {unreadCount > 0 && (
                            <span style={{
                                position: 'absolute', top: 2, right: 2,
                                width: 18, height: 18, borderRadius: '50%',
                                background: '#ef4444', color: 'white',
                                fontSize: '0.5625rem', fontWeight: 700,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>{unreadCount}</span>
                        )}
                    </button>

                    {showNotifs && (
                        <div className="animate-fade-in" style={{
                            position: 'absolute', top: '100%', right: 0, marginTop: 8,
                            width: 360, maxHeight: 420, overflowY: 'auto',
                            background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)',
                        }}>
                            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Notifications</span>
                                {unreadCount > 0 && (
                                    <button onClick={() => markAllNotificationsRead(user?.id)} style={{ background: 'none', border: 'none', color: roleColor, fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                                        Mark all read
                                    </button>
                                )}
                            </div>
                            {notifs.length === 0 ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>No notifications</div>
                            ) : (
                                notifs.slice(0, 8).map(n => (
                                    <div key={n.id} style={{
                                        padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border-light)',
                                        background: n.read ? 'transparent' : `${roleColor}06`,
                                    }}>
                                        <div style={{ fontSize: '0.8125rem', fontWeight: n.read ? 400 : 600, color: 'var(--color-text-primary)' }}>{n.title}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: '0.125rem' }}>{n.message.slice(0, 80)}</div>
                                        <div style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>{new Date(n.createdAt).toLocaleString()}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Profile */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => { setShowProfile(!showProfile); setShowNotifs(false); }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            background: 'none', border: 'none', cursor: 'pointer',
                            padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-md)',
                        }}
                    >
                        <div style={{
                            width: 34, height: 34, borderRadius: '50%',
                            background: `linear-gradient(135deg, ${roleColor}, ${roleColor}cc)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontWeight: 700, fontSize: '0.8125rem',
                        }}>
                            {user?.name?.charAt(0)}
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{user?.name}</div>
                            <div style={{ fontSize: '0.625rem', color: roleColor, textTransform: 'capitalize' }}>{user?.role}</div>
                        </div>
                        <ChevronDown size={14} color="var(--color-text-muted)" />
                    </button>

                    {showProfile && (
                        <div className="animate-fade-in" style={{
                            position: 'absolute', top: '100%', right: 0, marginTop: 8,
                            width: 200, background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)', overflow: 'hidden',
                        }}>
                            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border-light)' }}>
                                <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{user?.name}</div>
                                <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>{user?.email}</div>
                            </div>
                            <button onClick={logout} style={{
                                width: '100%', padding: '0.625rem 1rem',
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                background: 'none', border: 'none',
                                color: '#f87171', fontSize: '0.8125rem',
                                cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 500,
                            }}>
                                <LogOut size={14} /> Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
