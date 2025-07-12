import React, { useEffect, useState } from 'react';
import * as api from '../utils/api';
import { Box, Paper, Typography, Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Checkbox, CircularProgress, Alert, Stack } from '@mui/material';
import dayjs from 'dayjs';
import Avatar from '@mui/material/Avatar';
import EmailIcon from '@mui/icons-material/Email';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import { useTheme } from '@mui/material/styles';



const AdminNewsletter = () => {
  const theme = useTheme();
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [notifyStatus, setNotifyStatus] = useState('');
  const [error, setError] = useState('');

  // Fetch subscribers
  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/newsletter/subscribers');
      setSubscribers(res.data);
    } catch {
      setError('Failed to fetch subscribers.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  // Delete subscriber
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this subscriber?')) return;
    try {
      await api.del(`/newsletter/subscribers/${id}`);
      setSubscribers(subscribers.filter(s => s._id !== id));
    } catch {
      setError('Failed to delete subscriber.');
    }
  };

  // Select/deselect subscriber
  const toggleSelect = (id) => {
    setSelected(selected.includes(id)
      ? selected.filter(sid => sid !== id)
      : [...selected, id]);
  };

  // Send notification
  const handleNotify = async (e) => {
    e.preventDefault();
    setNotifyStatus('');
    setError('');
    if (!subject || !message) {
      setError('Subject and message required.');
      return;
    }
    try {
      const res = await api.post('/newsletter/notify', {
        subject,
        message,
        subscriberIds: selected.length ? selected : undefined,
      });
      setNotifyStatus(res.data.message);
      setSubject('');
      setMessage('');
      setSelected([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send notification.');
    }
  };

  return (
    <Box sx={{ maxWidth: 950, mx: 'auto', p: { xs: 1, sm: 3 }, minHeight: '100vh', background: theme.palette.custom.newsletterGradientBg }}>
      <Paper elevation={4} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 4, mt: 5, boxShadow: `0 4px 32px ${theme.palette.custom.newsletterPaperShadow}` }}>
        <Typography variant="h4" fontWeight={800} mb={2} color="primary.main" letterSpacing={1.5} sx={{ fontFamily: 'Montserrat, sans-serif' }}>
          <EmailIcon sx={{ mr: 1, mb: '-4px', color: 'secondary.main' }} /> Newsletter Subscribers
        </Typography>
        <Stack spacing={2} mb={3}>
          {error && <Alert severity="error">{error}</Alert>}
          {notifyStatus && <Alert severity="success">{notifyStatus}</Alert>}
        </Stack>
        <Box component="form" onSubmit={handleNotify} mb={4} sx={{ background: theme.palette.custom.newsletterFormBg, borderRadius: 2, p: 2, boxShadow: 1 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2} alignItems="flex-end">
            <TextField
              label="Subject"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              fullWidth
              size="small"
              required
              sx={{ flex: 2 }}
            />
          </Stack>
          <TextField
            label="Message"
            value={message}
            onChange={e => setMessage(e.target.value)}
            fullWidth
            multiline
            minRows={3}
            required
            sx={{ background: theme.palette.custom.newsletterTextFieldBg, borderRadius: 1, mb: 2 }}
          />
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            endIcon={<SendIcon />}
            sx={{ minWidth: 200, fontWeight: 700, py: 1.2, fontSize: '1rem', boxShadow: 2 }}
            disabled={loading}
          >
            Send {selected.length ? `to ${selected.length} selected` : 'to all'}
          </Button>
        </Box>
        <Typography variant="subtitle1" fontWeight={700} mb={1} color="primary.dark" sx={{ letterSpacing: 1 }}>
          Subscribers List
        </Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 2, borderRadius: 2, boxShadow: 0 }}>
          <Table size="small" sx={{ minWidth: 600 }}>
            <TableHead sx={{ background: theme.palette.custom.newsletterTableHeadBg }}>
              <TableRow>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Select</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Subscribed At</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Delete</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : (
                subscribers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">No subscribers found.</TableCell>
                  </TableRow>
                ) : (
                  subscribers.map(sub => (
                    <TableRow key={sub._id} hover sx={{ transition: 'background 0.2s', '&:hover': { background: theme.palette.custom.newsletterTableRowHover } }}>
                      <TableCell align="center">
                        <Checkbox
                          checked={selected.includes(sub._id)}
                          onChange={() => toggleSelect(sub._id)}
                          color="primary"
                        />
                      </TableCell>
                      <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 28, height: 28, bgcolor: 'secondary.main', fontSize: 16 }}>
                          {sub.email[0]?.toUpperCase()}
                        </Avatar>
                        <span style={{ fontWeight: 500 }}>{sub.email}</span>
                      </TableCell>
                      <TableCell>{dayjs(sub.subscribedAt).format('YYYY-MM-DD HH:mm')}</TableCell>
                      <TableCell align="center">
                        <Button
                          color="error"
                          size="small"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDelete(sub._id)}
                          sx={{ fontWeight: 600 }}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default AdminNewsletter;
