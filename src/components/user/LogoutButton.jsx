import React, { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LogoutButton = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await axios.post('/api/users/logout', {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      // --- SESSION LOGGING: End session on logout ---
      const sessionId = localStorage.getItem('sessionId');
      if (sessionId) {
        await fetch('/api/session/end', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        });
        // Remove sessionId for next visit; backend will set new one
        localStorage.removeItem('sessionId');
      }
      // --- END SESSION LOGGING ---
    } catch {
      // Optionally handle error
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      // Optionally clear other user-related data
      // Notify other tabs
      window.dispatchEvent(new Event('role-changed'));
      setLoading(false);
      // Redirect to login page
      navigate('/login');
    }
  };

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Button
        variant="outlined"
        color="error"
        onClick={handleClickOpen}
        sx={{ ml: 2, minWidth: 100 }}
      >
        Logout
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to log out of your account?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary" disabled={loading}>Cancel</Button>
          <Button onClick={async () => { await handleLogout(); handleClose(); }} color="error" variant="contained" disabled={loading}>
            {loading ? 'Logging out...' : 'Logout'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LogoutButton;
