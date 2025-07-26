import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { post } from '../utils/api';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import AuthMotionWrapper from './AuthMotionWrapper';
import { Helmet } from 'react-helmet-async';

export default function Signup({ onSignup }) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!name.trim()) errors.name = 'Name is required.';
    else if (name.trim().length < 2) errors.name = 'Name must be at least 2 characters.';
    if (!email.trim()) errors.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Invalid email address.';
    if (!password) errors.password = 'Password is required.';
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters.';
    if (!confirm) errors.confirm = 'Please confirm your password.';
    else if (password !== confirm) errors.confirm = 'Passwords do not match.';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const errors = validate();
    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setLoading(true);
    // Allow admin signup if user enters special code (for demo, use 'admin@jc')
    let role = 'user';
    // if (email === 'admin@jc.com') role = 'admin';
    const res = await post('/auth/signup', { name, email, password, role });
    setLoading(false);
    if (res.ok) {
      // Only save user role in localStorage
      localStorage.setItem('role', res.data.user.role);
      if (onSignup) onSignup(res.data.user);
      if (res.data.user.role === 'admin') {
        navigate('/admin'); // Redirect admin directly
      } else {
        navigate('/login');
      }
    } else {
      setError(res.data?.error || 'Signup failed');
    }
  };

  return (
    <>
      <Helmet>
        <title>Sign Up | JC's Closet</title>
        <meta name="description" content="Create a new account at JC's Closet to shop, book appointments, and more." />
      </Helmet>
      <AuthMotionWrapper>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Typography variant="h4" align="center" sx={{ mb: 2, fontWeight: 700 }}>
            Sign Up
          </Typography>
          {error && <Alert severity="error">{error}</Alert>}
          {Object.values(validationErrors).length > 0 && (
            <Alert severity="warning">
              {Object.values(validationErrors).map((msg, i) => (
                <div key={i}>{msg}</div>
              ))}
            </Alert>
          )}
          <TextField
            label="Name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            fullWidth
            error={!!validationErrors.name}
            helperText={validationErrors.name}
          />
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
          <TextField
            label="Confirm Password"
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
            fullWidth
            error={!!validationErrors.confirm}
            helperText={validationErrors.confirm}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={loading}
            sx={{ mt: 1 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
          </Button>
        </form>
        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Already have an account? <a href="/login" style={{ color: '#AFCBFF', textDecoration: 'underline' }}>Login</a>
        </Typography>
      </AuthMotionWrapper>
    </>
  );
}
