import React, { useState } from 'react';
import { Paper, Typography, TextField, Button, Stack, Alert } from '@mui/material';
import { post } from '../../utils/api';

const ChangePassword = () => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setMessage('');
    if (form.newPassword !== form.confirm) {
      setError('New passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await post('/users/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setSuccess('Password changed successfully!');
        setForm({ currentPassword: '', newPassword: '', confirm: '' });
      } else {
        setError(response.data?.error || 'Failed to change password');
      }
    } catch (err) {
      setError('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={1} sx={{ p: 3, mb: 2 }}>
      <Typography variant="h6" fontWeight={600} mb={2}>Change Password</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField label="Current Password" type="password" name="currentPassword" value={form.currentPassword} onChange={handleChange} fullWidth required />
          <TextField label="New Password" type="password" name="newPassword" value={form.newPassword} onChange={handleChange} fullWidth required />
          <TextField label="Confirm New Password" type="password" name="confirm" value={form.confirm} onChange={handleChange} fullWidth required />
          <Button type="submit" variant="contained" color="primary" disabled={loading}>{loading ? 'Changing...' : 'Change Password'}</Button>
        </Stack>
      </form>
    </Paper>
  );
};

export default ChangePassword;
