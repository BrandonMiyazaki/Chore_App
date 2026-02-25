import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Header from './components/Header';
import Login from './pages/Login';
import LessonBoard from './pages/LessonBoard';
import MyLessons from './pages/MyLessons';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import ParentDashboard from './pages/ParentDashboard';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="md:pt-0">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/lessons"
            element={
              <ProtectedRoute>
                <Header />
                <LessonBoard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-lessons"
            element={
              <ProtectedRoute>
                <Header />
                <MyLessons />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <Header />
                <Leaderboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Header />
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent"
            element={
              <ProtectedRoute>
                <Header />
                <ParentDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}
