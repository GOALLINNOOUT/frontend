import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, useTheme, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
// Helper: subscribe user to push notifications and send to backend
async function subscribeUserToPush() {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    const reg = await navigator.serviceWorker.ready;
    try {
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array('BAnXpkSuLZLZcgOO0ibI-Z3grRNhkuszV8R7ZyGsRuPMUaAFnIhEtVyvdi8aqGxGVr5PCeG57DPnTt7iOgFgfdU')
      });
      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      // Send subscription to backend with Authorization header if token exists
      await fetch('https://jcserver.onrender.com/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(subscription)
      });
      console.log('Push subscription sent to backend:', subscription);
    } catch (err) {
      console.error('Push subscription error:', err);
    }
  }
}

// Helper to convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

function OrderConfirmation() {
  const navigate = useNavigate();
  const theme = useTheme();
  const location = useLocation();
  const [showNotifDialog, setShowNotifDialog] = useState(false);
  const [notifStatus, setNotifStatus] = useState('idle'); // idle | granted | denied | error
  // Check if the user was auto-created (passed from checkout page or API response)
  const wasAutoCreated = location.state?.wasAutoCreated;
  const email = location.state?.email;

  useEffect(() => {
    // Show notification dialog after order confirmation
    setShowNotifDialog(true);
  }, []);

  const handleNotifAccept = async () => {
    setShowNotifDialog(false);
    if ('Notification' in window && Notification.permission !== 'granted') {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setNotifStatus('granted');
          new Notification('Notifications enabled!');
          subscribeUserToPush();
        } else {
          setNotifStatus('denied');
        }
      } catch (e) {
        setNotifStatus('error');
      }
    } else if (Notification.permission === 'granted') {
      setNotifStatus('granted');
      subscribeUserToPush();
    } else {
      setNotifStatus('denied');
    }
  };
  const handleNotifDecline = () => {
    setShowNotifDialog(false);
    setNotifStatus('denied');
  };

  return (
    <>
      <Helmet>
        <title>Order Confirmation | JC's Closet</title>
        <meta name="description" content="Thank you for your order at JC's Closet. Your payment was successful and your order is being processed." />
      </Helmet>
      <Dialog open={showNotifDialog} onClose={handleNotifDecline}>
        <DialogTitle>Enable Order Notifications?</DialogTitle>
        <DialogContent>
          <Typography>Would you like to receive notifications about your order status and updates?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleNotifDecline}>No, thanks</Button>
          <Button onClick={handleNotifAccept} variant="contained" autoFocus>Yes, enable</Button>
        </DialogActions>
      </Dialog>
      <Box
        sx={{
          maxWidth: 500,
          width: '100%',
          mx: 'auto',
          mt: { xs: 6, sm: 8 },
          p: { xs: 2, sm: 4 },
          textAlign: 'center',
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 80%, ${theme.palette.primary.light} 100%)`,
          borderRadius: { xs: 3, sm: theme.shape.borderRadius * 2 },
          boxShadow: { xs: theme.shadows[1], sm: theme.shadows[3] },
          border: { xs: 'none', sm: `1.5px solid ${theme.palette.divider}` },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: { xs: 350, sm: 400 },
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: { xs: 2, sm: 3 },
            mt: { xs: 1, sm: 0 },
          }}
        >
          <Box
            sx={{
              background: theme.palette.success.light,
              borderRadius: '50%',
              width: 64,
              height: 64,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: theme.shadows[2],
              mr: 1,
            }}
          >
            <span role="img" aria-label="check" style={{ fontSize: 38, color: theme.palette.success.main }}>
              ✔️
            </span>
          </Box>
        </Box>
        <Typography
          variant="h4"
          fontWeight={700}
          mb={{ xs: 1.5, sm: 2 }}
          sx={{ color: theme.palette.primary.main, fontFamily: theme.typography.fontFamily, letterSpacing: 0.5 }}
        >
          Thank You for Your Order!
        </Typography>
        <Typography
          variant="body1"
          mb={{ xs: 2, sm: 3 }}
          sx={{ color: theme.palette.text.secondary, fontFamily: theme.typography.fontFamily, fontSize: { xs: 16, sm: 18 }, lineHeight: 1.7 }}
        >
          {wasAutoCreated ? (
            <>
              Your order was placed as a guest and an account has been created for you with your email <b>{email}</b>.<br />
              <b>Check your email for a link to set your password and activate your account, It expires in an hour.</b><br />
              Once set, you can log in to view your order history and enjoy faster checkout next time.<br />
              <span style={{ color: theme.palette.success.main, fontWeight: 500 }}>Delivery is within 2-5 business days nationwide.</span>
            </>
          ) : (
            <>
              Your payment was successful and your order has been received.<br />
              <b>A confirmation email has been sent to you.</b> If you do not receive it within a few minutes, please check your spam folder or contact support.<br />
              <span style={{ color: theme.palette.success.main, fontWeight: 500 }}>Delivery is within 2-5 business days nationwide.</span>
            </>
          )}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          sx={{
            minWidth: 180,
            fontWeight: 600,
            fontFamily: theme.typography.fontFamily,
            mt: 1,
            borderRadius: 2,
            boxShadow: theme.shadows[2],
            fontSize: { xs: 16, sm: 18 },
            py: 1.2,
            px: 3,
            transition: 'all 0.2s',
            '&:hover': {
              background: theme.palette.primary.dark,
              transform: 'scale(1.03)',
              boxShadow: theme.shadows[4],
            },
          }}
          onClick={() => navigate('/')}
        >
          Back to Home
        </Button>
      </Box>
    </>
  );
}

export default OrderConfirmation;
