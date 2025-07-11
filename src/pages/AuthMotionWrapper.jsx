import { motion } from 'framer-motion';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';

export default function AuthMotionWrapper({ children }) {
  return (
    <Box sx={{ minHeight: { xs: '60vh', sm: '100vh' }, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 2 }}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: 400 }}
      >
        <Paper elevation={1} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3 }}>
          {children}
        </Paper>
      </motion.div>
    </Box>
  );
}
