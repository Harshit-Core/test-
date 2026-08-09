import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Recommender from './pages/Recommender';
import JobBoard from './pages/JobBoard';
import Applications from './pages/Applications';
import SavedStacks from './pages/SavedStacks';
import AdminPanel from './pages/AdminPanel';
import Profile from './pages/Profile';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Recommender />} />
        <Route path="/jobs" element={<JobBoard />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/saved" element={<SavedStacks />} />
        <Route path="/profile" element={<Profile />} />
        {user.role === 'ADMIN' && (
          <Route path="/admin" element={<AdminPanel />} />
        )}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
