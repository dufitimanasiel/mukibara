import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import AdminManagers from './pages/admin/AdminManagers';
import AdminPins from './pages/admin/AdminPins';
import AdminStats from './pages/admin/AdminStats';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import ManagerAnnouncements from './pages/manager/ManagerAnnouncements';
import CreateAnnouncement from './pages/manager/CreateAnnouncement';
import CitizenAnnouncements from './pages/citizen/CitizenAnnouncements';

const CitizenRoute = ({ children }) => {
  const { isCitizen } = useAuth();
  if (!isCitizen) return <Navigate to="/injira" replace />;
  return children;
};

const AppRoutes = () => {
  const { isAuthenticated, user, isCitizen } = useAuth();

  return (
    <Routes>
      <Route
        path="/injira"
        element={
          isAuthenticated ? (
            <Navigate to={user?.role === 'admin' ? '/admin' : '/umuyobozi'} replace />
          ) : isCitizen ? (
            <Navigate to="/abaturage" replace />
          ) : (
            <LoginPage />
          )
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="amatangazo" element={<AdminAnnouncements />} />
        <Route path="abayobozi" element={<AdminManagers />} />
        <Route path="pin" element={<AdminPins />} />
        <Route path="imibare" element={<AdminStats />} />
      </Route>

      <Route
        path="/umuyobozi"
        element={
          <ProtectedRoute roles={['manager']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ManagerDashboard />} />
        <Route path="amatangazo" element={<ManagerAnnouncements />} />
        <Route path="itangazo-rishya" element={<CreateAnnouncement />} />
      </Route>

      <Route
        path="/abaturage"
        element={
          <CitizenRoute>
            <CitizenAnnouncements />
          </CitizenRoute>
        }
      />

      <Route path="*" element={<Navigate to="/injira" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { borderRadius: '12px', background: '#1e293b', color: '#fff', fontSize: '14px' },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
};

export default App;
