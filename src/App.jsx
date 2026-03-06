import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import NotificationToast from './components/NotificationToast';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import NurseDashboard from './pages/nurse/NurseDashboard';
import PatientDashboard from './pages/patient/PatientDashboard';

// ─── Protected Route ────────────────────────────────────────────
function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--color-bg-primary)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--color-text-tertiary)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to correct dashboard if role mismatch
    const roleRoutes = { doctor: '/doctor', nurse: '/nurse', patient: '/patient' };
    return <Navigate to={roleRoutes[user.role] || '/login'} replace />;
  }

  return children;
}

// ─── Public Route (redirects if already logged in) ──────────────
function PublicRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (isAuthenticated) {
    const roleRoutes = { doctor: '/doctor', nurse: '/nurse', patient: '/patient' };
    return <Navigate to={roleRoutes[user.role] || '/login'} replace />;
  }

  return children;
}

// ─── App Layout (with sidebar + topbar) ─────────────────────────
function AppLayout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{
        flex: 1,
        marginLeft: 260,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        transition: 'margin-left 0.25s ease',
      }}>
        <TopBar />
        <main style={{ flex: 1, overflow: 'auto' }}>
          {children}
        </main>
      </div>
      <NotificationToast />
    </div>
  );
}

// ─── Root Redirect ──────────────────────────────────────────────
function RootRedirect() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const roleRoutes = { doctor: '/doctor', nurse: '/nurse', patient: '/patient' };
  return <Navigate to={roleRoutes[user.role] || '/login'} replace />;
}

// ─── Main App ───────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <Routes>
            {/* Auth Routes (no sidebar) */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/verify/:userId" element={<VerifyEmail />} />

            {/* Doctor Routes */}
            <Route path="/doctor" element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <AppLayout><DoctorDashboard /></AppLayout>
              </ProtectedRoute>
            } />

            {/* Nurse Routes */}
            <Route path="/nurse" element={
              <ProtectedRoute allowedRoles={['nurse']}>
                <AppLayout><NurseDashboard /></AppLayout>
              </ProtectedRoute>
            } />

            {/* Patient Routes */}
            <Route path="/patient" element={
              <ProtectedRoute allowedRoles={['patient']}>
                <AppLayout><PatientDashboard /></AppLayout>
              </ProtectedRoute>
            } />

            {/* Root */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
