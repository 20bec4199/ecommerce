import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Layout from './components/layout/Layout';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

// Public Route component (redirect to dashboard if authenticated)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return user ? <Navigate to="/dashboard" /> : children;
};

// Auth Success component for Google OAuth callback
const AuthSuccess = () => {
  const { user } = useAuth();

  React.useEffect(() => {
    // If user is authenticated, redirect to dashboard
    if (user) {
      window.location.href = '/dashboard';
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Authentication successful! Redirecting...</p>
      </div>
    </div>
  );
};

// Main App Content wrapped with Theme
const AppContent = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
          
          {/* Public routes - only accessible when not authenticated */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } 
          />
          
          {/* Protected routes - only accessible when authenticated */}
          <Route 
            path="/dashboard/*" 
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            } 
          />
          
          {/* Auth callback route */}
          <Route path="/auth/success" element={<AuthSuccess />} />
          
          {/* 404 fallback */}
          <Route path="*" element={
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Page not found</p>
                <a 
                  href="/dashboard" 
                  className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                >
                  Go to Dashboard
                </a>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;