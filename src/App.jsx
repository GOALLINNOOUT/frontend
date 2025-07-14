import React, { useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { ThemeProvider, CssBaseline } from '@mui/material';
import { ThemeModeProvider, useThemeMode } from './context/ThemeModeContext';
import { getTheme } from './theme';
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import Perfumes from './pages/Perfumes'
import Fashion from './pages/Fashion'
import StyleGuide from './pages/StyleGuide'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout';
import Appointments from './pages/Appointments'
import Admin from './pages/Admin'
import Blog from './pages/Blog'
import AdminPerfumes from './pages/AdminPerfumes'
import Header from './components/Header'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import Login from './pages/Login';
import Signup from './pages/Signup';
import RoleRoute from './components/RoleRoute';
import NotFound from './pages/NotFound';
import AdminOrders from './pages/AdminOrders';
import ResetPassword from './pages/ResetPassword';
import OrderConfirmation from './pages/OrderConfirmation';
import AdminDashboard from './pages/AdminDashboard';
import AdminBlog from './pages/AdminBlog';
import BlogPost from './pages/BlogPost';
import AdminNewsletter from './pages/AdminNewsletter';
import AdminCustomers from './pages/AdminCustomers';
import OrderPage from './pages/OrderPage';
import Users from './pages/Users';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import AdminAnalytics from './pages/AdminAnalytics';
import SetupPasswordPage from './pages/SetupPasswordPage';
import usePageViewLogger from './hooks/usePageViewLogger';
import './App.css'

function useSessionLogger() {
  useEffect(() => {
    const endSession = (event) => {
      // Only end session if NOT a page reload (refresh)
      // pagehide with event.persisted === false means tab/browser close or navigation away (not bfcache)
      if (event.type === 'pagehide' && !event.persisted) {
        const sessionId = localStorage.getItem('sessionId');
        if (sessionId) {
          const url = `${import.meta.env.VITE_API_BASE_URL}/session/end`;
          const data = JSON.stringify({ sessionId });
          if (navigator.sendBeacon) {
            const blob = new Blob([data], { type: 'application/json' });
            navigator.sendBeacon(url, blob);
          } else {
            fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: data
            });
          }
          localStorage.removeItem('sessionId');
        }
      }
    };
    window.addEventListener('pagehide', endSession);
    return () => window.removeEventListener('pagehide', endSession);
  }, []);
}

function useSessionStart() {
  useEffect(() => {
    // Only start a session if one does not exist
    if (!localStorage.getItem('sessionId')) {
      fetch(`${import.meta.env.VITE_API_BASE_URL}/session/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.sessionId) {
            localStorage.setItem('sessionId', data.sessionId);
          }
        })
        .catch(() => {});
    }
  }, []);
}

// Utility to handle invalid session globally
export function handleInvalidSession(error) {
  if (
    error?.response?.status === 401 ||
    (typeof error === 'string' && error.includes('No active session found')) ||
    (error?.message && error.message.includes('No active session found'))
  ) {
    localStorage.removeItem('sessionId');
    // Optionally, trigger a new session start or redirect
  }
}

function AppContent() {
  const { theme } = useThemeMode();
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HelmetProvider>
        <Router>
          <PageViewLoggerWrapper />
          <ScrollToTop />
          <div className="app-container">
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/perfumes" element={<Perfumes />} />
              <Route path="/fashion" element={<Fashion />} />
              <Route path="/style-guide" element={<StyleGuide />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/admin" element={
                <RoleRoute role="admin">
                  <Admin />
                </RoleRoute>
              } />
              <Route path="/blog" element={<Blog />} />
              <Route path="/admin/perfumes" element={
                <RoleRoute role="admin">
                  <AdminPerfumes />
                </RoleRoute>
              } />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/dashboard" element={
                <RoleRoute role="admin">
                  <AdminDashboard />
                </RoleRoute>
              } />
              <Route path="/admin/blog" element={
                <RoleRoute role="admin">
                  <AdminBlog />
                </RoleRoute>
              } />
              <Route path="/admin/newsletter" element={
                <RoleRoute role="admin">
                  <AdminNewsletter />
                </RoleRoute>
              } />
              <Route path="/admin/customers" element={
                <RoleRoute role="admin">
                  <AdminCustomers />
                </RoleRoute>
              } />
              <Route path="/admin/analytics" element={
                <RoleRoute role="admin">
                  <AdminAnalytics />
                </RoleRoute>
              } />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/setup-password/:token" element={<SetupPasswordPage />} />
              <Route path="/order-confirmation" element={<OrderConfirmation />} />
              <Route path="/blog/:id" element={<BlogPost />} />
              <Route path="/orders" element={<OrderPage />} />
              <Route path="/users" element={<Users />} />
              <Route path="/terms" element={<TermsAndConditions />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
          </div>
        </Router>
      </HelmetProvider>
    </ThemeProvider>
  );
}

function App() {
  useSessionLogger();
  useSessionStart();
  return (
    <ThemeModeProvider>
      <AppContent />
    </ThemeModeProvider>
  );
}

function PageViewLoggerWrapper() {
  usePageViewLogger();
  return null;
}

export default App
