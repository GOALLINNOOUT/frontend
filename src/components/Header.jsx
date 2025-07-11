import { AppBar, Toolbar, Typography, Box, useTheme } from '@mui/material'
import { motion } from 'framer-motion'
import Nav from './Nav'

function Header() {
  const theme = useTheme()
  return (
    <AppBar
      component={motion.header}
      position="fixed"
      color="default"
      elevation={2}
      sx={{
        mb: theme.spacing(4),
        background: theme.palette.background.paper, // Made darker for more contrast
        boxShadow: theme.shadows[1],
      }}
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Toolbar sx={{ flexDirection: 'column', alignItems: 'center', py: theme.spacing(2) }}>
        {/* Logo */}
        <Box sx={{ width: '100%' }}>
          <Nav />
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Header
