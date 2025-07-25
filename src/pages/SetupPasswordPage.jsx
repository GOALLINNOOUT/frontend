import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { post } from '../utils/api';
import { Box, Button, TextField, Typography, Alert, CircularProgress, Paper } from '@mui/material';

const SetupPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) return setError('Your password must be at least 6 characters.');
    if (password !== confirm) return setError('Passwords do not match.');
    setLoading(true);
    try {
      const res = await post('/auth/setup-password', { token, password });
      if (res.ok) {
        setSuccess(res.data.message || 'Password set successfully!');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        let msg = res.data?.error || 'Failed to set password.';
        if (msg.includes('expired')) msg = 'Your password setup link has expired. Please request a new one.';
        if (msg.includes('required')) msg = 'Please fill in all required fields.';
        if (msg.includes('try again')) msg = 'Oops! Something went wrong. Please try again later.';
        setError(msg);
      }
    } catch (err) {
      setError('Oops! We could not set your password. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" bgcolor="#f8f8fa">
      <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: '100%' }}>
        <Typography variant="h5" fontWeight={600} mb={2} align="center">Set Up Your Account</Typography>
        <Typography variant="body2" color="text.secondary" mb={3} align="center">
          Create a password to access your order history and enjoy faster checkout next time.
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            label="New Password"
            type="password"
            fullWidth
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            sx={{ mb: 2 }}
            autoFocus
          />
          <TextField
            label="Confirm Password"
            type="password"
            fullWidth
            required
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            sx={{ mb: 3 }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={loading}
            sx={{ fontWeight: 600 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Set Password'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default SetupPasswordPage;
