import React, { useState } from 'react';
import { Box, TextField, Button, Alert, CircularProgress } from '@mui/material';

function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);
    try {
      
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSuccess('Thank you for subscribing!');
        setEmail('');
      } else {
        const data = await res.json();
        setError(data.message || 'Subscription failed.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, display: 'flex', gap: 1, flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center' }}>
      <TextField
        type="email"
        label="Your Email"
        size="small"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        sx={{ flex: 1, bgcolor: 'background.paper', borderRadius: 1 }}
        inputProps={{ 'aria-label': 'Email address' }}
      />
      <Button
        type="submit"
        variant="contained"
        color="secondary"
        disabled={loading}
        sx={{ minWidth: 120, fontWeight: 600 }}
      >
        {loading ? <CircularProgress size={22} color="inherit" /> : 'Subscribe'}
      </Button>
      {success && <Alert severity="success" sx={{ mt: { xs: 1, sm: 0 }, flex: 1 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mt: { xs: 1, sm: 0 }, flex: 1 }}>{error}</Alert>}
    </Box>
  );
}

export default NewsletterForm;
