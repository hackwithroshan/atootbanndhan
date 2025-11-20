
import React, { useState, useCallback, useEffect } from 'react';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import { AdminRole, LoggedInUserSessionData } from './types';
import { API_URL } from './utils/api';

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'auth' | 'dashboard' | 'adminDashboard'>('home');
  const [loggedInUser, setLoggedInUser] = useState<LoggedInUserSessionData | null>(null);
  const [adminRole, setAdminRole] = useState<AdminRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: { 'x-auth-token': token },
        });

        if (res.ok) {
          const userData = await res.json();
          // Robust check for any admin role
          if (userData.role && userData.role !== 'user' && Object.values(AdminRole).includes(userData.role as AdminRole)) {
             setAdminRole(userData.role);
             setLoggedInUser(null); // Ensure user is not set for admin view
             setView('adminDashboard');
          } else {
            // Regular user
            setLoggedInUser({
              id: userData._id,
              email: userData.email,
              gender: userData.gender,
              name: userData.fullName,
              photoUrl: userData.profilePhotoUrl,
              membershipTier: userData.membershipTier,
            });
            setAdminRole(null); // Ensure admin is not set
            setView('dashboard');
          }
        } else {
          // Token is invalid or expired
          localStorage.removeItem('token');
          setView('home');
        }
      } catch (error) {
        console.error("Failed to load user session:", error);
        localStorage.removeItem('token');
        setView('home');
      }
    } else {
        setView('home'); // Set view to home if no token
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const handleLoginSignupClick = useCallback(() => {
    setView('auth');
  }, []);

  const handleCloseAuth = useCallback(() => {
    setView('home');
  }, []);

  const handleAuthSuccess = useCallback((authData: { token: string }) => {
    localStorage.setItem('token', authData.token);
    setIsLoading(true); // Show loading while user data is being fetched
    loadUser(); // Let loadUser handle routing and state setting
  }, [loadUser]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    setLoggedInUser(null);
    setAdminRole(null);
    setView('home');
  }, []);

  const renderView = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-screen bg-rose-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-rose-500"></div>
          <p className="ml-4 text-lg text-gray-600">Loading Your Experience...</p>
        </div>
      );
    }
    switch (view) {
      case 'auth':
        return <AuthPage onAuthSuccess={handleAuthSuccess} onClose={handleCloseAuth} />;
      case 'dashboard':
        if (loggedInUser) {
          return <DashboardPage loggedInUser={loggedInUser} onLogout={handleLogout} />;
        }
        // Fallback to home if user is not loaded but view is dashboard
        setView('home');
        return <HomePage onLoginSignupClick={handleLoginSignupClick} onAdminLoginClick={() => {}} />;
      case 'adminDashboard':
        if (adminRole) {
          return <AdminDashboardPage adminRole={adminRole} onAdminLogout={handleLogout} />;
        }
        // Fallback to home if admin role is not loaded
        setView('home');
        return <HomePage onLoginSignupClick={handleLoginSignupClick} onAdminLoginClick={() => {}} />;
      case 'home':
      default:
        return <HomePage onLoginSignupClick={handleLoginSignupClick} onAdminLoginClick={() => {}} />;
    }
  };

  return (
    <div className="App">
      {renderView()}
    </div>
  );
};

export default App;