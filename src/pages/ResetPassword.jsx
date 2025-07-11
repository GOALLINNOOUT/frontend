import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { post } from '../utils/api';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import AuthMotionWrapper from './AuthMotionWrapper';
import { Helmet } from 'react-helmet-async';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    const res = await post('/auth/reset-password', { token, password });
    setLoading(false);
    if (res.ok) {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setError(res.data?.error || 'Reset failed');
    }
  };

  return (
    <>
      <Helmet>
        <title>Reset Password | JC's Closet</title>
        <meta name="description" content="Reset your JC's Closet account password securely." />
      </Helmet>
      <AuthMotionWrapper>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 400, margin: 'auto' }}>
          <Typography variant="h4" align="center" sx={{ mb: 2, fontWeight: 700 }}>
            Reset Password
          </Typography>
          {success && <Alert severity="success">Password reset! Redirecting to login...</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="New Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Confirm Password"
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
            fullWidth
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
          </Button>
        </form>
      </AuthMotionWrapper>
    </>
  );
}
