import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { Box, Typography, Paper, List, ListItem, ListItemText, CircularProgress, Alert } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { motion } from 'framer-motion';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    // Fetch notifications for the logged-in user
    axios.get('/api/notifications')
      .then(res => {
        setNotifications(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load notifications');
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
      <CircularProgress color="primary" size={40} />
    </Box>
  );
  if (error) return (
    <Box my={4} mx="auto" maxWidth={500}>
      <Alert severity="error">{error}</Alert>
    </Box>
  );

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      maxWidth={600}
      mx="auto"
      my={6}
      px={2}
    >
      <Helmet>
        <title>Notifications{unreadCount > 0 ? ` (${unreadCount})` : ''} | JC's Closet</title>
        <meta name="description" content="View all your notifications, updates, and alerts from JC's Closet. Stay informed about your orders, account, and more." />
      </Helmet>
      <Paper elevation={3} sx={{ borderRadius: 4, p: { xs: 2, sm: 4 }, mb: 2 }}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <NotificationsIcon color="primary" sx={{ fontSize: 36 }} />
          <Typography variant="h4" fontWeight={700} color="primary.main">Notifications</Typography>
        </Box>
        {notifications.length === 0 ? (
          <Typography variant="body1" color="text.secondary" align="center" mt={4}>
            No notifications yet.
          </Typography>
        ) : (
          <List>
            {notifications.map((note) => (
              <ListItem
                key={note._id}
                component={motion.li}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
                sx={{
                  bgcolor: note.read ? 'background.paper' : 'action.hover',
                  borderRadius: 2,
                  mb: 2,
                  boxShadow: note.read ? 0 : 2,
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <ListItemText
                  primary={note.message}
                  primaryTypographyProps={{ fontWeight: note.read ? 400 : 600, fontSize: '1.08rem', color: note.read ? 'text.primary' : 'primary.main' }}
                  secondary={new Date(note.createdAt).toLocaleString()}
                  secondaryTypographyProps={{ fontSize: '0.95rem', color: 'text.secondary', mt: 1 }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default Notifications;
