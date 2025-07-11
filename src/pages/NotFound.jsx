import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';
import { Helmet } from 'react-helmet-async';

const NotFound = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <>
      <Helmet>
        <title>404 Not Found | JC's Closet</title>
        <meta name="description" content="The page you are looking for does not exist." />
      </Helmet>
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        sx={{
          minHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: theme.palette.background.default,
          px: 2,
        }}
      >
        <Typography
          component={motion.h1}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          variant="h1"
          sx={{
            fontWeight: 900,
            fontSize: { xs: '5rem', md: '8rem' },
            color: theme.palette.primary.main,
            mb: 2,
            letterSpacing: 8,
          }}
        >
          404
        </Typography>
        <Typography
          variant="h5"
          sx={{
            color: theme.palette.text.primary,
            mb: 2,
            textAlign: 'center',
            maxWidth: 500,
          }}
        >
          Oops! The page you are looking for does not exist or has been moved.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          sx={{
            mt: 2,
            borderRadius: 3,
            boxShadow: theme.shadows[4],
            textTransform: 'none',
            fontWeight: 700,
          }}
          component={motion.button}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/')}
        >
          Go Home
        </Button>
      </Box>
    </>
  );
};

export default NotFound;
