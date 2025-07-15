import { useTheme, Slide, Box, Alert, Typography } from '@mui/material';

export default function WelcomeMessage({ user, open, onClose }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Slide direction="down" in={open} mountOnEnter unmountOnExit>
      <Box
        sx={{
          position: 'fixed',
          top: { xs: 8, sm: 32 },
          left: { xs: 32, sm: '50%' },
          right: { xs: 0, sm: 'auto' },
          transform: { xs: 'none', sm: 'translateX(-50%)' },
          zIndex: 2000,
          width: { xs: '80%', sm: 400 },
          maxWidth: { xs: '80vw', sm: 420 },
          px: { xs: 0.5, sm: 0 },
        }}
      >
        <Alert
          severity="success"
          onClose={onClose}
          sx={{
            borderRadius: 3,
            boxShadow: 6,
            p: 2.5,
            background: isDark
              ? 'linear-gradient(90deg, #232526 0%, #414345 100%)'
              : 'linear-gradient(90deg, #AFCBFF 0%, #E0C3FC 100%)',
            color: isDark ? '#fff' : '#222',
            border: isDark ? '1.5px solid #444' : '1.5px solid #AFCBFF',
            backdropFilter: 'blur(2px)',
          }}
        >
          <Typography
            variant="h6"
            fontWeight={700}
            gutterBottom
            sx={{
              textAlign: 'center',
              letterSpacing: 0.5,
              color: isDark ? '#AFCBFF' : '#5A189A',
              textShadow: isDark ? '0 1px 8px #000' : '0 1px 8px #fff',
              wordBreak: 'break-word',
              fontSize: { xs: 18, sm: 22 },
              px: { xs: 0.5, sm: 0 },
            }}
          >
            Welcome
            {user && user.name && user.name.split(' ')[0]
              ? `, ${user.name.split(' ')[0]}`
              : user && user.firstName
                ? `, ${user.firstName}`
                : '!'}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              textAlign: 'center',
              fontSize: { xs: 14, sm: 16 },
              color: isDark ? '#E0C3FC' : '#333',
              fontWeight: 500,
              mb: 0.5,
              wordBreak: 'break-word',
              px: { xs: 0.5, sm: 0 },
            }}
          >
            You have successfully logged in. Enjoy your experience!
          </Typography>
        </Alert>
      </Box>
    </Slide>
  );
}
