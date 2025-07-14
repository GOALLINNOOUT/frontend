import React, { useState, useEffect } from 'react';
import { Paper, Typography, TextField, Button, Stack, CircularProgress, Alert } from '@mui/material';
import { get, put } from '../../utils/api';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch user profile on mount
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await get('/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userObj = res.data && res.data.data;
        setUser(userObj);
        setForm({
          name: userObj?.name || '',
          email: userObj?.email || '',
          phone: userObj?.phone || '',
        });
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const res = await put('/users/me', form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userObj = res.data && res.data.data;
      setUser(userObj);
      setEditMode(false);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Stack alignItems="center" py={4}><CircularProgress /></Stack>;

  return (
    <Paper elevation={1} sx={{ p: 3, mb: 2 }}>
      <Typography variant="h6" fontWeight={600} mb={2}>Profile Info</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {editMode ? (
        <form onSubmit={handleSave}>
          <Stack spacing={2}>
            <TextField label="Name" name="name" value={form.name} onChange={handleChange} fullWidth />
            <TextField label="Email" name="email" value={form.email} onChange={handleChange} fullWidth />
            <TextField label="Phone" name="phone" value={form.phone} onChange={handleChange} fullWidth />
            <Stack direction="row" spacing={2}>
              <Button type="submit" variant="contained" color="primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
              <Button type="button" variant="outlined" onClick={() => setEditMode(false)} disabled={saving}>Cancel</Button>
            </Stack>
          </Stack>
        </form>
      ) : (
        <Stack spacing={1}>
          <Typography><b>Name:</b> {user?.name}</Typography>
          <Typography><b>Email:</b> {user?.email}</Typography>
          <Typography><b>Phone:</b> {user?.phone}</Typography>
          <Button variant="contained" onClick={() => setEditMode(true)} sx={{ mt: 1, width: 140 }}>Edit</Button>
        </Stack>
      )}
    </Paper>
  );
};

export default UserProfile;
