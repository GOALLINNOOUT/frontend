import React, { useEffect, useState, useContext } from 'react';
import { Box, Typography, Paper, Divider, CircularProgress, Stack, Button, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Grid, useMediaQuery, useTheme, Tooltip } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import { AuthContext } from '../components/AuthContext';
import { get, del as apiDelete, patch as apiPatch } from '../utils/api';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import HomeIcon from '@mui/icons-material/Home';
import PhoneIcon from '@mui/icons-material/Phone';

const statusColor = {
  paid: 'info',
  shipped: 'primary',
  delivered: 'success',
  cancelled: 'error',
};

const statusLabel = {
  paid: 'Paid',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const statusIcon = {
  paid: <ShoppingBagIcon fontSize="small" sx={{ mr: 0.5 }} />, 
  shipped: <LocalShippingIcon fontSize="small" sx={{ mr: 0.5 }} />, 
  delivered: <CheckCircleIcon fontSize="small" sx={{ mr: 0.5 }} />, 
  cancelled: <CancelIcon fontSize="small" sx={{ mr: 0.5 }} />, 
};

const OrderPage = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState(0);
  const [dialog, setDialog] = useState({ open: false, type: '', message: '', onConfirm: null });
  const [successDialog, setSuccessDialog] = useState({ open: false, message: '' });
  const [errorDialog, setErrorDialog] = useState({ open: false, message: '' });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    get('/orders/my')
      .then(res => {
        if (res.ok) setOrders(res.data);
        else setError('Failed to fetch orders.');
      })
      .catch(() => setError('Failed to fetch orders.'))
      .finally(() => setLoading(false));
  }, [user]);

  // Categorize orders
  const unfulfilled = orders.filter(o => o.status === 'paid' || o.status === 'shipped');
  const fulfilled = orders.filter(o => o.status === 'delivered');
  const cancelled = orders.filter(o => o.status === 'cancelled');

  let ordersToShow = orders;
  if (tab === 1) ordersToShow = unfulfilled;
  else if (tab === 2) ordersToShow = fulfilled;
  else if (tab === 3) ordersToShow = cancelled;

  const handleCancel = (orderId) => {
    setDialog({
      open: true,
      type: 'confirm',
      message: 'Are you sure you want to cancel this order?',
      onConfirm: async () => {
        setDialog({ ...dialog, open: false });
        setLoading(true);
        try {
          const res = await apiPatch(`/orders/${orderId}/cancel`);
          if (res.ok) {
            setOrders(orders => orders.map(o => o._id === orderId ? { ...o, status: 'cancelled', cancelledAt: new Date().toISOString() } : o));
            setSuccessDialog({ open: true, message: 'Order cancelled successfully.' });
          } else {
            setErrorDialog({ open: true, message: res.data?.error || 'Failed to cancel order.' });
          }
        } catch {
          setErrorDialog({ open: true, message: 'Failed to cancel order.' });
        }
        setLoading(false);
      }
    });
  };

  if (!user) {
    return (
      <Box sx={{ maxWidth: 500, mx: 'auto', mt: 8, p: 3, textAlign: 'center' }}>
        <Typography variant="h5" fontWeight={700} mb={2}>Sign in to view your orders</Typography>
        <Button href="/login" variant="contained" color="primary">Login</Button>
      </Box>
    );
  }

  return (
    <React.Fragment>
      <Helmet>
        <title>My Orders | JC's Closet</title>
        <meta name="description" content="View your order history and details at JC's Closet." />
      </Helmet>
      <Box sx={{ maxWidth: 1100, mx: 'auto', mt: 6, p: { xs: 1, sm: 3 } }}>
        <Typography variant="h4" fontWeight={700} mb={3} textAlign={isMobile ? 'center' : 'left'}>
          My Orders
        </Typography>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ mb: 3, borderRadius: 2, bgcolor: 'background.paper', boxShadow: 1 }}
          variant={isMobile ? 'scrollable' : 'standard'}
          scrollButtons={isMobile ? 'auto' : false}
        >
          <Tab label={`All (${orders.length})`} />
          <Tab label={`Unfulfilled (${unfulfilled.length})`} />
          <Tab label={`Fulfilled (${fulfilled.length})`} />
          <Tab label={`Cancelled (${cancelled.length})`} />
        </Tabs>
        {loading ? (
          <Stack alignItems="center" py={6}><CircularProgress /></Stack>
        ) : error ? (
          <Typography color="error" textAlign="center">{error}</Typography>
        ) : ordersToShow.length === 0 ? (
          <Typography textAlign="center">No orders found.</Typography>
        ) : (
          <Grid container spacing={3}>
            {ordersToShow.map(order => (
              <Grid item xs={12} sm={12} md={6} lg={4} key={order._id}>
                <Paper
                  sx={{
                    p: 2.5,
                    borderRadius: 4,
                    boxShadow: 3,
                    transition: 'box-shadow 0.2s, transform 0.2s',
                    '&:hover': {
                      boxShadow: 8,
                      transform: 'translateY(-4px) scale(1.01)',
                    },
                    minHeight: 320,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700} letterSpacing={1} mb={0.5}>
                        Order #{order._id.slice(-6).toUpperCase()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Placed: {new Date(order.paidAt).toLocaleString()}
                      </Typography>
                    </Box>
                    <Tooltip title={statusLabel[order.status] || order.status} arrow>
                      <Chip
                        icon={statusIcon[order.status]}
                        label={statusLabel[order.status] || order.status}
                        color={statusColor[order.status] || 'default'}
                        size="small"
                        sx={{ fontWeight: 600, fontSize: 14, px: 1.5 }}
                      />
                    </Tooltip>
                  </Stack>
                  <Divider sx={{ my: 2 }} />
                  <Box>
                    <Typography variant="subtitle2" mb={1} fontWeight={600}>
                      Items:
                    </Typography>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {order.cart.map(item => (
                        <li key={item._id} style={{ marginBottom: 2 }}>
                          <span style={{ fontWeight: 500 }}>{item.name}</span> x{item.quantity} (₦{item.price.toLocaleString()} each)
                        </li>
                      ))}
                    </ul>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Stack direction="row" spacing={2} alignItems="flex-start" flexWrap="wrap">
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <HomeIcon sx={{ mr: 0.5, color: 'primary.main' }} fontSize="small" />
                      <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                        {order.customer?.address}, {order.customer?.lga}, {order.customer?.state}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <PhoneIcon sx={{ mr: 0.5, color: 'primary.main' }} fontSize="small" />
                      <Typography variant="body2">{order.customer?.phone}</Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="center" mt={1}>
                    <Typography variant="body2" fontWeight={600} color="text.secondary">
                      Subtotal: <span style={{ color: theme.palette.success.main, fontWeight: 700 }}>₦{order.amount?.toLocaleString()}</span>
                    </Typography>
                    {order.deliveryFee !== undefined && (
                      <Typography variant="body2" fontWeight={600} color="info.main">
                        Delivery: <span style={{ fontWeight: 700 }}>₦{order.deliveryFee?.toLocaleString()}</span>
                      </Typography>
                    )}
                    {order.grandTotal !== undefined && (
                      <Typography variant="body2" fontWeight={700} color="secondary.main">
                        Grand Total: <span style={{ fontWeight: 800 }}>₦{order.grandTotal?.toLocaleString()}</span>
                      </Typography>
                    )}
                  </Stack>
                  {order.notes && (
                    <Typography variant="body2" mt={1} color="info.main">
                      Notes: {order.notes}
                    </Typography>
                  )}
                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      sx={{ mt: 2, fontWeight: 700, borderRadius: 2, boxShadow: 1, textTransform: 'none' }}
                      onClick={() => handleCancel(order._id)}
                      disabled={loading}
                      fullWidth={isMobile}
                    >
                      Cancel Order
                    </Button>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
        {/* Confirm Dialog */}
        <Dialog open={dialog.open && dialog.type === 'confirm'} onClose={() => setDialog({ ...dialog, open: false })} fullWidth maxWidth="xs">
          <DialogTitle>Confirm Action</DialogTitle>
          <DialogContent>{dialog.message}</DialogContent>
          <DialogActions>
            <Button onClick={() => setDialog({ ...dialog, open: false })}>No</Button>
            <Button onClick={dialog.onConfirm} color="error" autoFocus>Yes</Button>
          </DialogActions>
        </Dialog>
        {/* Success Dialog */}
        <Dialog open={successDialog.open} onClose={() => setSuccessDialog({ open: false, message: '' })} fullWidth maxWidth="xs">
          <DialogTitle>Success</DialogTitle>
          <DialogContent>{successDialog.message}</DialogContent>
          <DialogActions>
            <Button onClick={() => setSuccessDialog({ open: false, message: '' })} autoFocus>OK</Button>
          </DialogActions>
        </Dialog>
        {/* Error Dialog */}
        <Dialog open={errorDialog.open} onClose={() => setErrorDialog({ open: false, message: '' })} fullWidth maxWidth="xs">
          <DialogTitle>Error</DialogTitle>
          <DialogContent>{errorDialog.message}</DialogContent>
          <DialogActions>
            <Button onClick={() => setErrorDialog({ open: false, message: '' })} autoFocus>OK</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </React.Fragment>
  );
};

export default OrderPage;
