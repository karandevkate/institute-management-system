import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import TrainerDashboard from './pages/TrainerDashboard';
import StudentDashboard from './pages/StudentDashboard';
import PendingApproval from './pages/PendingApproval';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;
  if (user.role === 'ROLE_STUDENT' && !(user.isVerified ?? user.verified)) return <Navigate to="/pending" />;

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/pending" element={<PendingApproval />} />
          
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/trainer/*" element={
            <ProtectedRoute allowedRoles={['ROLE_TRAINER', 'ROLE_ADMIN']}>
              <TrainerDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/student/*" element={
            <ProtectedRoute allowedRoles={['ROLE_STUDENT', 'ROLE_TRAINER', 'ROLE_ADMIN']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />

          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
