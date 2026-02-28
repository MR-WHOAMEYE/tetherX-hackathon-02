import { memo } from 'react';
import { Zap, Building2, FileDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuickActionsBar = memo(function QuickActionsBar() {
    const navigate = useNavigate();

    const actions = [
        { icon: Zap, label: 'Run Simulation', path: '/simulation', color: '#7C3AED' },
        { icon: Building2, label: 'Critical Departments', path: '/operations', color: '#DC2626' },
        { icon: FileDown, label: 'Executive Report', path: '/reports', color: '#0F766E' },
    ];

    return (
        <div
            className="bg-white rounded-xl p-5 border border-gray-100 h-full"
            style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
        >
            <p style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
                Quick Actions
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {actions.map((a) => (
                    <button
                        key={a.label}
                        onClick={() => navigate(a.path)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '10px 14px', borderRadius: 8,
                            background: `${a.color}08`, border: `1px solid ${a.color}10`,
                            color: a.color, fontSize: 13, fontWeight: 600,
                            cursor: 'pointer', transition: 'background 0.15s', textAlign: 'left',
                            outline: 'none', width: '100%',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = `${a.color}14`}
                        onMouseLeave={e => e.currentTarget.style.background = `${a.color}08`}
                    >
                        <a.icon size={14} />
                        {a.label}
                    </button>
                ))}
            </div>
        </div>
    );
});

export default QuickActionsBar;
