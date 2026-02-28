export default function ChartCard({ title, subtitle, children, className = '', delay = 0 }) {
    return (
        <div
            className={`bg-white rounded-xl p-5 border border-gray-100 ${className}`}
            style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
        >
            {(title || subtitle) && (
                <div style={{ marginBottom: 16 }}>
                    {title && <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>{title}</h3>}
                    {subtitle && <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 3 }}>{subtitle}</p>}
                </div>
            )}
            {children}
        </div>
    );
}
