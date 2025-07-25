import React, { useState } from "react";
import { Box, Typography, Button, useTheme } from '@mui/material';
import { logErrorToServer } from '../../utils/logError';

function ErrorBoundary({ children }) {
  const theme = useTheme();
  const [hasError, setHasError] = useState(false);

  // Custom error boundary logic using error boundary pattern
  class Boundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
      return { hasError: true };
    }
    componentDidCatch(error, errorInfo) {
      // Log error to analytics backend
      logErrorToServer(error, errorInfo);
      setHasError(true);
    }
    render() {
      if (this.state.hasError || hasError) {
        return (
          <Box
            minHeight="100vh"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            sx={{
              background: theme.palette?.background?.default || 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)',
              color: theme.palette?.text?.primary || '#222',
              fontFamily: theme.typography?.fontFamily || 'Segoe UI, Arial, sans-serif',
              p: 2,
            }}
          >
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: 24 }}>
              <circle cx="12" cy="12" r="10" fill={theme.palette?.error?.main || '#f44336'} />
              <path d="M12 7v5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="16" r="1" fill="#fff" />
            </svg>
            <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 1 }}>
              Oops! Something went wrong.
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, maxWidth: 400, textAlign: 'center' }}>
              We're sorry, but an unexpected error has occurred. Please try reloading the page. If the problem persists, contact support.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => window.location.reload()}
              sx={{ borderRadius: 2, px: 4, fontSize: 18, boxShadow: 3 }}
            >
              Reload Page
            </Button>
          </Box>
        );
      }
      return this.props.children;
    }
  }
  return <Boundary>{children}</Boundary>;
}

export default ErrorBoundary;
