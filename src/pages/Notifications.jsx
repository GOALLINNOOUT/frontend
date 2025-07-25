import React, { useEffect, useState } from 'react';
import socket from '../utils/socket';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet-async';
import * as api from '../utils/api';
import {
  Box, Typography, Paper, List, ListItem, ListItemText, CircularProgress, Alert,
  IconButton, Chip, Button, Stack, useTheme
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import InfoIcon from '@mui/icons-material/Info';
import SystemSecurityUpdateGoodIcon from '@mui/icons-material/SystemSecurityUpdateGood';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import { motion } from 'framer-motion';

const Notifications = () => {
  const theme = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const unreadCount = notifications.filter(n => !n.read).length;
  // removed unused marking state
  const [markingId, setMarkingId] = useState(null); // for per-item loading
  const [markingAll, setMarkingAll] = useState(false); // for mark all as read

  useEffect(() => {
    fetchNotifications();
    // Connect socket and identify user
    let userId = null;
    console.log('[Notifications] Fetching user ID for socket...');
    api.get('/users/me').then(res => {
      console.log('[Notifications] /users/me response:', res.data);
      userId = res.data?.data?._id;
      console.log('[Notifications] Got userId:', userId);
      if (userId) {
        console.log('[Notifications] Connecting socket...');
        socket.connect();
        socket.emit('identify', userId);
        console.log('[Notifications] Emitted identify for user:', userId);
      } else {
        console.warn('[Notifications] No userId found, socket not connected');
      }
    }).catch(err => {
      console.error('[Notifications] Failed to fetch userId:', err);
    });
    // Listen for notification events
    socket.on('notification', (data) => {
      console.log('[Notifications] Received socket notification:', data);
      setNotifications(prev => [data, ...prev]);
      toast.info(data.message, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    });
    socket.on('connect', () => {
      console.log('[Notifications] Socket connected:', socket.id);
    });
    socket.on('disconnect', () => {
      console.log('[Notifications] Socket disconnected');
    });
    return () => {
      socket.off('notification');
      socket.off('connect');
      socket.off('disconnect');
      socket.disconnect();
      console.log('[Notifications] Socket disconnected and listeners removed');
    };
    //
  }, []);

  const fetchNotifications = () => {
    setLoading(true);
    api.get('/notifications')
      .then(res => {
        if (Array.isArray(res.data)) {
          setNotifications(res.data);
        } else {
          setNotifications([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load notifications');
        setNotifications([]);
        setLoading(false);
      });
  };


  const markAsRead = async (id) => {
    setMarkingId(id);
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch {
      setError('Failed to mark as read');
    }
    setMarkingId(null);
  };

  const markAllAsRead = async () => {
    setMarkingAll(true);
    try {
      const unreadIds = notifications.filter(n => !n.read).map(n => n._id);
      await Promise.all(unreadIds.map(id => api.patch(`/notifications/${id}/read`)));
      setNotifications((prev) => prev.map(n => unreadIds.includes(n._id) ? { ...n, read: true } : n));
    } catch {
      setError('Failed to mark all as read');
    }
    setMarkingAll(false);
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh" sx={{ bgcolor: theme.palette.background.default }}>
      <CircularProgress color="primary" size={40} />
    </Box>
  );
  if (error) return (
    <Box my={4} mx="auto" maxWidth={500} sx={{ bgcolor: theme.palette.background.default }}>
      <Alert severity="error">{error}</Alert>
    </Box>
  );

  return (
    <Box
      component={motion.main}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{
        width: '100vw',
        minHeight: '100vh',
        bgcolor: theme.palette.background.default,
        px: { xs: 0, md: 0 },
        py: { xs: 2, md: 6 },
        overflowX: 'hidden',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Helmet>
        <title>Notifications{unreadCount > 0 ? ` (${unreadCount})` : ''} | JC's Closet</title>
        <meta name="description" content="View all your notifications, updates, and alerts from JC's Closet. Stay informed about your orders, account, and more." />
      </Helmet>
      <Box sx={{ maxWidth: 700, mx: 'auto', px: { xs: 1, sm: 2, md: 4 }, width: '100%' }}>
        <Paper elevation={4} sx={{ borderRadius: 4, p: { xs: 1.5, sm: 4 }, mb: 2, bgcolor: theme.palette.background.paper, boxShadow: theme.shadows[3] }}>
          <Box display="flex" alignItems="center" gap={2} mb={2} flexWrap="wrap">
            <NotificationsIcon color="primary" sx={{ fontSize: 36 }} />
            <Typography variant="h4" fontWeight={700} color="primary" flexGrow={1} sx={{ textAlign: { xs: 'center', sm: 'left' } }}>Notifications</Typography>
            {unreadCount > 0 && (
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={markingAll ? <CircularProgress size={18} color="inherit" /> : <DoneAllIcon />}
                onClick={markAllAsRead}
                disabled={markingAll}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, minWidth: 140 }}
              >
                {markingAll ? 'Marking...' : 'Mark all as read'}
              </Button>
            )}
          </Box>
          {notifications.length === 0 ? (
            <Typography variant="body1" color="text.secondary" align="center" mt={4}>
              No notifications yet.
            </Typography>
          ) : (
            <List sx={{ width: '100%', p: 0 }}>
              {notifications.map((note) => (
                <ListItem
                  key={note._id}
                  component={motion.li}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 }}
                  sx={{
                    bgcolor: note.read ? theme.palette.background.paper : theme.palette.action.selected,
                    borderRadius: 3,
                    mb: 2,
                    boxShadow: note.read ? 0 : 2,
                    p: { xs: 1.5, sm: 2 },
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { sm: 'center' },
                    gap: 2,
                    position: 'relative',
                    border: note.read
                      ? `1px solid ${theme.palette.divider}`
                      : `2px solid ${theme.palette.primary.light}`,
                    transition: 'background 0.2s, border 0.2s',
                  }}
                >
                  <Stack direction="row" alignItems="center" gap={1} mb={{ xs: 1, sm: 0 }}>
                    {note.type === 'order' && <LocalMallIcon color="primary" sx={{ fontSize: 22 }} />}
                    {note.type === 'system' && <SystemSecurityUpdateGoodIcon color="info" sx={{ fontSize: 22 }} />}
                    {note.type === 'info' && <InfoIcon color="info" sx={{ fontSize: 22 }} />}
                    <Chip
                      label={note.type ? note.type.charAt(0).toUpperCase() + note.type.slice(1) : 'Info'}
                      size="small"
                      color={note.type === 'order' ? 'primary' : note.type === 'system' ? 'info' : 'default'}
                      sx={{ fontWeight: 600, textTransform: 'capitalize', mr: 1, bgcolor: note.type === 'info' ? theme.palette.info.light : undefined, color: note.type === 'info' ? theme.palette.info.contrastText : undefined }}
                    />
                  </Stack>
                  <ListItemText
                    primary={note.message}
                    primaryTypographyProps={{ fontWeight: note.read ? 400 : 600, fontSize: '1.08rem', color: note.read ? theme.palette.text.primary : theme.palette.primary.main }}
                    secondary={new Date(note.createdAt).toLocaleString()}
                    secondaryTypographyProps={{ fontSize: '0.95rem', color: theme.palette.text.secondary, mt: 1 }}
                  />
                  {!note.read && (
                    <IconButton
                      edge="end"
                      color="primary"
                      aria-label="mark as read"
                      onClick={() => markAsRead(note._id)}
                      disabled={markingId === note._id || markingAll}
                      sx={{ ml: { sm: 2 }, mt: { xs: 1, sm: 0 }, alignSelf: { xs: 'flex-end', sm: 'center' }, position: 'relative' }}
                    >
                      {markingId === note._id ? (
                        <CircularProgress size={22} color="inherit" />
                      ) : (
                        <MarkEmailReadIcon />
                      )}
                    </IconButton>
                  )}
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default Notifications;
