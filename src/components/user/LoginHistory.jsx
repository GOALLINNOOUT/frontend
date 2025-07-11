import React, { useEffect, useState } from 'react';
import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import axios from 'axios';

const LoginHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/users/login-history', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHistory(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load login history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleDeleteHistory = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete('/api/users/login-history', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory([]);
      setSuccess('Login/logout history deleted successfully.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete history');
    } finally {
      setLoading(false);
      setDialogOpen(false);
    }
  };

  return (
    <Paper elevation={1} sx={{ p: 3, mb: 2 }}>
      <Typography variant="h6" fontWeight={600} mb={2}>Login History</Typography>
      <Button
        variant="outlined"
        color="error"
        size="small"
        sx={{ mb: 2, float: 'right' }}
        onClick={() => setDialogOpen(true)}
        disabled={loading || history.length === 0}
      >
        Delete History
      </Button>
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        aria-labelledby="delete-history-dialog-title"
      >
        <DialogTitle id="delete-history-dialog-title">Delete Login/Logout History?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete your entire login/logout history? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleDeleteHistory} color="error" variant="contained" disabled={loading} autoFocus>
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer sx={{
          width: '100%',
          overflowX: 'auto',
          '@media (max-width:600px)': {
            boxShadow: 'none',
            p: 0,
          }
        }}>
          <Table size="small" sx={{ minWidth: 320 }}>
            <TableHead>
              <TableRow sx={{
                '@media (max-width:600px)': {
                  display: 'none',
                }
              }}>
                <TableCell>Date</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>IP Address</TableCell>
                <TableCell>Device</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">No login/logout history found.</TableCell>
                </TableRow>
              ) : (
                history.map((item, idx) => (
                  <React.Fragment key={idx}>
                    {/* Desktop row */}
                    <TableRow
                      sx={{
                        '@media (max-width:600px)': { display: 'none' }
                      }}
                    >
                      <TableCell>{new Date(item.createdAt).toLocaleString()}</TableCell>
                      <TableCell sx={{ textTransform: 'capitalize' }}>{item.action}</TableCell>
                      <TableCell>{item.ip}</TableCell>
                      <TableCell>{item.device}</TableCell>
                    </TableRow>
                    {/* Mobile row */}
                    <TableRow
                      sx={{
                        display: 'none',
                        '@media (max-width:600px)': {
                          display: 'table-row',
                          background: idx % 2 === 0 ? '#f9f9f9' : '#fff',
                        }
                      }}
                    >
                      <TableCell colSpan={4} sx={{ p: 1 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {new Date(item.createdAt).toLocaleString()} - {item.action.charAt(0).toUpperCase() + item.action.slice(1)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          IP: {item.ip || 'N/A'}
                        </Typography>
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          Device: {item.device || 'N/A'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};

export default LoginHistory;
