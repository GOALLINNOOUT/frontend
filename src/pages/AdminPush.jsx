import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, MenuItem } from '@mui/material';
import axios from 'axios';

const AdminPush = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('');
  const [target, setTarget] = useState('all');
  const [userId, setUserId] = useState('');
  const [status, setStatus] = useState('');

  const handleSend = async (e) => {
    e.preventDefault();
    setStatus('');
    try {
      if (target === 'all') {
        await axios.post('/api/push/send', { title, body, url });
        setStatus('Push sent to all subscribers!');
      } else if (target === 'user' && userId) {
        await axios.post(`/api/push/send/user/${userId}`, { title, body, url });
        setStatus('Push sent to user!');
      } else {
        setStatus('Please enter a user ID.');
      }
    } catch (err) {
      setStatus('Failed to send push.');
    }
  };

  return (
    <Box maxWidth={500} mx="auto" my={6}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
        <Typography variant="h5" fontWeight={700} mb={2}>Send Push Notification</Typography>
        <form onSubmit={handleSend}>
          <TextField label="Title" fullWidth required value={title} onChange={e => setTitle(e.target.value)} sx={{ mb: 2 }} />
          <TextField label="Body" fullWidth required value={body} onChange={e => setBody(e.target.value)} sx={{ mb: 2 }} />
          <TextField label="URL (optional)" fullWidth value={url} onChange={e => setUrl(e.target.value)} sx={{ mb: 2 }} />
          <TextField
            select
            label="Target"
            value={target}
            onChange={e => setTarget(e.target.value)}
            sx={{ mb: 2 }}
            fullWidth
          >
            <MenuItem value="all">All Users</MenuItem>
            <MenuItem value="user">Specific User</MenuItem>
          </TextField>
          {target === 'user' && (
            <TextField label="User ID" fullWidth value={userId} onChange={e => setUserId(e.target.value)} sx={{ mb: 2 }} />
          )}
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ py: 1.5, fontWeight: 600 }}>Send Push</Button>
        </form>
        {status && <Typography mt={3} color={status.includes('Failed') ? 'error' : 'primary'}>{status}</Typography>}
      </Paper>
    </Box>
  );
};

export default AdminPush;
