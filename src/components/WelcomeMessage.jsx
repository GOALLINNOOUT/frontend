import React from 'react';
import { Alert, Slide, Typography, Box } from '@mui/material';

export default function WelcomeMessage({ user, open, onClose }) {
  return (
    <Slide direction="down" in={open} mountOnEnter unmountOnExit>
      <Box
        sx={{
          position: 'fixed',
          top: { xs: 16, sm: 32 },
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2000,
          width: { xs: '90%', sm: 400 },
        }}
      >
        <Alert
          severity="success"
          onClose={onClose}
          sx={{
            borderRadius: 3,
            boxShadow: 3,
            p: 2,
            background: 'linear-gradient(90deg, #AFCBFF 0%, #E0C3FC 100%)',
            color: '#222',
          }}
        >
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Welcome
            {user?.name
              ? `, ${user.name.split(' ')[0]}`
              : ''}!
          </Typography>
          <Typography variant="body1">
            You have successfully logged in. Enjoy your experience!
          </Typography>
        </Alert>
      </Box>
    </Slide>
  );
}
