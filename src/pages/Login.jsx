import React, { useState, useContext } from 'react';
import { AuthContext } from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';
import { post } from '../utils/api';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import AuthMotionWrapper from './AuthMotionWrapper';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { Helmet } from 'react-helmet-async';

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [success, setSuccess] = useState(false); // Success state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotError, setForgotError] = useState('');

  const validate = () => {
    const errors = {};
    if (!email.trim()) errors.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Invalid email address.';
    if (!password) errors.password = 'Password is required.';
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters.';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const errors = validate();
    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setLoading(true);
    const res = await post('/auth/login', { email, password });
    setLoading(false);
    if (res.ok) {
      if (res.data.user.status === 'suspended' || res.data.user.status === 'blacklisted') {
        setError('Your account is suspended. Please contact support.');
        return;
      }
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.user.role); // Store user role
      window.dispatchEvent(new Event('role-changed'));
      // --- SESSION LOGGING: End previous session on login ---
      const oldSessionId = localStorage.getItem('sessionId');
      if (oldSessionId) {
        await post('/session/end', { sessionId: oldSessionId });
      }
      localStorage.removeItem('sessionId');
      // --- START NEW SESSION FOR LOGGED-IN USER ---
      try {
        const resSession = await fetch(`${import.meta.env.VITE_API_BASE_URL}/session/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await resSession.json();
        if (data && data.sessionId) {
          localStorage.setItem('sessionId', data.sessionId);
        }
      } catch {}
      // --- END SESSION LOGGING ---
      setUser(res.data.user); // Set user in AuthContext for immediate update
      if (onLogin) onLogin(res.data.user);
      setSuccess(true); // Show success message
      if (res.data.user.role === 'admin') {
        setTimeout(() => navigate('/admin/dashboard'), 1000); // Redirect admin to dashboard
      } else {
        setTimeout(() => navigate('/'), 2000); // Redirect user to home
      }
    } else {
      setError(res.data?.error || 'Login failed');
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotMsg('');
    setForgotError('');
    if (!forgotEmail.trim()) {
      setForgotError('Email is required.');
      return;
    }
    setForgotLoading(true);
    const res = await post('/auth/forgot-password', { email: forgotEmail });
    setForgotLoading(false);
    if (res.ok) {
      setForgotMsg('If this email exists, a reset link has been sent.');
      setForgotEmail('');
    } else {
      setForgotError(res.data?.error || 'Request failed');
    }
  };

  return (
    <>
      <Helmet>
        <title>Login | JC's Closet</title>
        <meta name="description" content="Login to your JC's Closet account to access your orders, appointments, and more." />
      </Helmet>
      <AuthMotionWrapper>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Typography variant="h4" align="center" sx={{ mb: 2, fontWeight: 700 }}>
            Login
          </Typography>
          {success && <Alert severity="success">Login successful! Redirecting...</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
          {Object.values(validationErrors).length > 0 && (
            <Alert severity="warning">
              {Object.values(validationErrors).map((msg, i) => (
                <div key={i}>{msg}</div>
              ))}
            </Alert>
          )}
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            fullWidth
            error={!!validationErrors.email}
            helperText={validationErrors.email}
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            fullWidth
            error={!!validationErrors.password}
            helperText={validationErrors.password}
          />
          <Typography variant="body2" align="right" sx={{ mt: -2, mb: 1 }}>
            <a href="#" style={{ color: '#AFCBFF', textDecoration: 'underline' }} onClick={e => { e.preventDefault(); setForgotOpen(true); }}>Forgot Password?</a>
          </Typography>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={loading}
            sx={{ mt: 1 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
          </Button>
        </form>
        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Don't have an account? <a href="/signup" style={{ color: '#AFCBFF', textDecoration: 'underline' }}>Sign up</a>
        </Typography>
        <Dialog open={forgotOpen} onClose={() => { setForgotOpen(false); setForgotMsg(''); setForgotError(''); }}>
          <DialogTitle>Forgot Password</DialogTitle>
          <form onSubmit={handleForgotSubmit}>
            <DialogContent>
              <TextField
                label="Enter your email"
                type="email"
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                fullWidth
                required
                autoFocus
                sx={{ mb: 2 }}
              />
              {forgotMsg && <Alert severity="success">{forgotMsg}</Alert>}
              {forgotError && <Alert severity="error">{forgotError}</Alert>}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => { setForgotOpen(false); setForgotMsg(''); setForgotError(''); }}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={forgotLoading}>
                {forgotLoading ? <CircularProgress size={20} color="inherit" /> : 'Send Reset Link'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </AuthMotionWrapper>
    </>
  );
}
