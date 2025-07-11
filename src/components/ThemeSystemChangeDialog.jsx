import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

function ThemeSystemChangeDialog({ open, systemMode, onAccept, onCancel }) {
  return (
    <Dialog open={open} onClose={onCancel} aria-labelledby="theme-system-dialog-title">
      <DialogTitle id="theme-system-dialog-title">System Theme Changed</DialogTitle>
      <DialogContent>
        <Typography gutterBottom>
          Your system color scheme is now set to <b>{systemMode === 'dark' ? 'Dark' : 'Light'} Mode</b>.<br />
          Would you like to switch the website to match your system?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="inherit">Keep Current</Button>
        <Button onClick={onAccept} color="primary" variant="contained">Switch to {systemMode === 'dark' ? 'Dark' : 'Light'} Mode</Button>
      </DialogActions>
    </Dialog>
  );
}

export default ThemeSystemChangeDialog;
