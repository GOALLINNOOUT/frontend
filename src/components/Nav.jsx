import { AppBar, Toolbar, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, Button, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Slide from '@mui/material/Slide';
import { useTheme } from '@mui/material/styles';
import Badge from '@mui/material/Badge';
import { getCart } from '../utils/cart';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import LogoutButton from './user/LogoutButton';
import { useThemeMode } from '../context/ThemeModeContext';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

function Nav() {
  const theme = useTheme();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [role, setRole] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  // Separate anchor and open state for More and Account menus
  const [moreAnchorEl, setMoreAnchorEl] = useState(null);
  const [accountAnchorEl, setAccountAnchorEl] = useState(null);
  const moreMenuOpen = Boolean(moreAnchorEl);
  const accountMenuOpen = Boolean(accountAnchorEl);
  const { mode, toggleMode } = useThemeMode();

  useEffect(() => {
    const handleStorage = () => setRole(localStorage.getItem('role'));
    window.addEventListener('storage', handleStorage);
    window.addEventListener('role-changed', handleStorage);
    setRole(localStorage.getItem('role'));
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('role-changed', handleStorage);
    };
  }, []);

  useEffect(() => {
    const updateCartCount = () => {
      const cart = getCart();
      setCartCount(cart.reduce((sum, item) => sum + (item.quantity || 1), 0));
    };
    updateCartCount();
    window.addEventListener('cart-updated', updateCartCount);
    return () => {
      window.removeEventListener('cart-updated', updateCartCount);
    };
  }, []);

  // Define which links are visible to which roles
  // Arranged by importance
  const userLinks = [
    { to: '/', label: 'Home' },
    { to: '/perfumes', label: 'Perfumes' },
    { to: '/fashion', label: 'Design Gallery' },
    { to: '/cart', label: 'Cart' },
    { to: '/about', label: 'About' },
    { to: '/blog', label: 'Blog' },
    { to: '/contact', label: 'Contact' },
    { to: '/style-guide', label: 'Style Guide' },
  ];
  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/orders', label: 'Orders' },
    { to: '/admin/perfumes', label: 'Perfumes' },
    { to: '/admin', label: 'Fashion' },
    { to: '/admin/analytics', label: 'Analytics' }, // Added Analytics link
    { to: '/admin/customers', label: 'Users' },
    { to: '/admin/newsletter', label: 'Newsletter' },
    { to: '/admin/blog', label: 'Blogs' },
  ];
  const userMenuLinks = [
    { to: '/orders', label: 'My Orders' },
    { to: '/users', label: 'My Account' },
  ];
  // Admin dropdown links (can add more in the future)
  const adminMenuLinks = [
    // Example: { to: '/admin/profile', label: 'Admin Profile' },
  ];
  const linksToShow = role === 'admin' ? adminLinks : userLinks;

  // Account links for dropdown/drawer
  const accountLinks = role === 'user' ? userMenuLinks : role === 'admin' ? adminMenuLinks : [];

  // Add auth links for guests
  const authLinks = [
    { to: '/login', label: 'Login' },
    { to: '/signup', label: 'Sign Up' },
  ];

 


  const handleDrawerToggle = () => {
    setDrawerOpen((prev) => !prev);
  };
  // For More menu
  const handleMoreMenu = (event) => {
    setMoreAnchorEl(event.currentTarget);
  };
  const handleMoreClose = () => {
    setMoreAnchorEl(null);
  };
  // For Account menu
  const handleAccountMenu = (event) => {
    setAccountAnchorEl(event.currentTarget);
  };
  const handleAccountClose = () => {
    setAccountAnchorEl(null);
  };

  // Close dropdown menu on route change
  useEffect(() => {
    setMoreAnchorEl(null);
    setAccountAnchorEl(null);
  }, [location.pathname]);

  return (
    <AppBar position="sticky" color="inherit" elevation={0} sx={{ mb: theme.spacing(2), background: theme.palette.background.paper }}>
      <Toolbar
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: { xs: 1, sm: 2 },
          minHeight: { xs: 56, sm: 64 },
        }}
      >
        {/* Hamburger Menu (Mobile Only) */}
        <IconButton
          edge="start"
          color="primary"
          aria-label="open navigation menu"
          onClick={handleDrawerToggle}
          sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }}
        >
          <MenuIcon />
        </IconButton>
        {/* Logo (now text) */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: theme.spacing(6),
            mx: { xs: 1, md: 2 },
            bgcolor: theme.palette.background.default,
            borderRadius: theme.shape.borderRadius * 2,
            boxShadow: theme.shadows[1],
            p: { xs: 0.5, md: 1 },
            cursor: 'pointer',
            textDecoration: 'none',
          }}
          component={Link}
          to="/"
          aria-label="Go to home page"
        >
          <span style={{
            fontWeight: 700,
            fontSize: 28,
            letterSpacing: 1.5,
            color: theme.palette.primary.main,
            fontFamily: 'Montserrat, sans-serif',
            textShadow: '0 1px 4px rgba(0,0,0,0.04)'
          }}>
            JC's Closet
          </span>
        </Box>
        {/* Desktop Nav */}
        {/* On md: show main links + More dropdown; on lg+: show all links */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, flex: 2, justifyContent: 'center', alignItems: 'center' }} role="menu" aria-label="Main navigation">
          {/* On lg and up, show all links */}
          {linksToShow.map((link) => (
            <Button
              key={link.to}
              component={Link}
              to={link.to}
              variant={location.pathname === link.to ? 'contained' : 'text'}
              color="primary"
              sx={{
                display: { xs: 'none', md: ['/','/perfumes','/fashion','/cart'].includes(link.to) ? 'flex' : 'none', lg: 'flex' },
                textTransform: 'none',
                fontWeight: 500,
                px: theme.spacing(2),
                boxShadow: location.pathname === link.to ? theme.shadows[2] : 'none',
                bgcolor: location.pathname === link.to ? theme.palette.primary.main : 'transparent',
                color: location.pathname === link.to ? theme.palette.primary.contrastText : theme.palette.text.primary,
                '&:hover': {
                  bgcolor: location.pathname === link.to ? theme.palette.primary.dark : theme.palette.action.hover,
                },
              }}
              aria-label={link.label}
              role="menuitem"
            >
              {link.label}
            </Button>
          ))}
          {/* More dropdown for overflow links, only on md screens */}
          {linksToShow.filter(link => !['/','/perfumes','/fashion','/cart'].includes(link.to)).length > 0 && (
            <Box sx={{ display: { xs: 'none', md: 'flex', lg: 'none' } }}>
              <Button
                id="more-nav-button"
                aria-controls={moreMenuOpen ? 'more-nav-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={moreMenuOpen ? 'true' : undefined}
                onClick={handleMoreMenu}
                color="primary"
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  px: theme.spacing(2),
                  bgcolor: 'transparent',
                  color: theme.palette.text.primary,
                  '&:hover': {
                    bgcolor: theme.palette.action.hover,
                  },
                  borderRadius: 2,
                }}
                role="menuitem"
              >
                More
              </Button>
              <Menu
                id="more-nav-menu"
                anchorEl={moreAnchorEl}
                open={moreMenuOpen}
                onClose={handleMoreClose}
                MenuListProps={{ 'aria-labelledby': 'more-nav-button', role: 'menu' }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                PaperProps={{
                  sx: {
                    mt: 1,
                    minWidth: 180,
                    borderRadius: 2,
                    boxShadow: theme.shadows[4],
                    bgcolor: theme.palette.background.paper,
                  }
                }}
              >
                {linksToShow.filter(link => !['/','/perfumes','/fashion','/cart'].includes(link.to)).map((link) => (
                  <MenuItem
                    key={link.to}
                    component={Link}
                    to={link.to}
                    onClick={handleMoreClose}
                    selected={location.pathname === link.to}
                    aria-label={link.label}
                    role="menuitem"
                    sx={{
                      fontWeight: 500,
                      color: location.pathname === link.to ? theme.palette.primary.main : theme.palette.text.primary,
                      bgcolor: location.pathname === link.to ? theme.palette.action.selected : 'transparent',
                      '&:hover': {
                        bgcolor: theme.palette.action.hover,
                        color: theme.palette.primary.main,
                      },
                    }}
                  >
                    {link.label}
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          )}
        </Box>
        {/* Cart and Account icons always at far right */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            component={Link}
            to="/cart"
            color="primary"
            aria-label="cart"
            sx={{ ml: { xs: 1, md: 2 }, bgcolor: theme.palette.background.default, borderRadius: theme.shape.borderRadius }}
          >
            <Badge badgeContent={cartCount} color="secondary" max={99}>
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
          {/* Show Login/Sign Up for guests on desktop only (not mobile) */}
          {!role && (
            <Box sx={{ display: { xs: 'none', sm: 'none', md: 'flex' }, gap: 1, ml: 2 }}>
              {authLinks.map((link) => (
                <Button
                  key={link.to}
                  component={Link}
                  to={link.to}
                  variant={location.pathname === link.to ? 'contained' : 'outlined'}
                  color="secondary"
                  sx={{
                    fontWeight: 600,
                    borderRadius: 2,
                    px: 2,
                    boxShadow: location.pathname === link.to ? theme.shadows[2] : 'none',
                    bgcolor: location.pathname === link.to ? theme.palette.secondary.main : 'transparent',
                    color: location.pathname === link.to ? theme.palette.secondary.contrastText : theme.palette.secondary.main,
                    '&:hover': {
                      bgcolor: theme.palette.secondary.dark,
                      color: theme.palette.secondary.contrastText,
                    },
                  }}
                  aria-label={link.label}
                  role="menuitem"
                >
                  {link.label}
                </Button>
              ))}
              {/* Dark mode toggle for unauthenticated desktop users */}
              <IconButton
                onClick={toggleMode}
                color="primary"
                sx={{ ml: 1, borderRadius: 2, bgcolor: 'transparent', '&:hover': { bgcolor: theme.palette.action.hover } }}
                aria-label={mode === 'light' ? 'Enable dark mode' : 'Enable light mode'}
              >
                {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
              </IconButton>
            </Box>
          )}
          {/* Account icon for logged-in users only, only on md and up */}
          {role && (
            <Box sx={{ display: { xs: 'none', sm: 'none', md: 'flex' } }}>
              <IconButton
                onClick={handleAccountMenu}
                color="primary"
                sx={{ ml: 1 }}
                aria-label={role === 'admin' ? 'admin account menu' : 'account menu'}
                aria-controls={accountMenuOpen ? (role === 'admin' ? 'admin-menu' : 'user-menu') : undefined}
                aria-haspopup="true"
                aria-expanded={accountMenuOpen ? 'true' : undefined}
              >
                <AccountCircleIcon fontSize="large" />
              </IconButton>
            </Box>
          )}
        </Box>
        {/* Account dropdown menu (Logout at bottom), only on md and up */}
        {role && (
          <Menu
            id={role === 'admin' ? 'admin-menu' : 'user-menu'}
            anchorEl={accountAnchorEl}
            open={accountMenuOpen}
            onClose={handleAccountClose}
            MenuListProps={{ 'aria-labelledby': role === 'admin' ? 'admin-account-button' : 'account-button', role: 'menu' }}
            sx={{ display: { xs: 'none', sm: 'none', md: 'block' } }}
          >
            {accountLinks.map((link) => (
              <MenuItem
                key={link.to}
                component={Link}
                to={link.to}
                onClick={handleAccountClose}
                selected={location.pathname === link.to}
                aria-label={link.label}
                role="menuitem"
              >
                {link.label}
              </MenuItem>
            ))}
            {/* Dark mode toggle for desktop in dropdown */}
            <MenuItem onClick={toggleMode} sx={{ justifyContent: 'center', gap: 1 }}>
              {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
              {mode === 'light' ? 'Dark Mode' : 'Light Mode'}
            </MenuItem>
            <MenuItem divider sx={{ my: 1 }} />
            <MenuItem disableGutters disableRipple sx={{ justifyContent: 'center' }}>
              <LogoutButton />
            </MenuItem>
          </Menu>
        )}
        {/* Drawer for Mobile Nav */}
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={handleDrawerToggle}
          PaperProps={{
            sx: {
              width: { xs: 260, sm: 300 },
              p: 0,
              bgcolor: mode === 'dark' ? theme.palette.background.default : theme.palette.background.paper,
              color: mode === 'dark' ? theme.palette.text.primary : theme.palette.text.primary,
              boxShadow: theme.shadows[8],
              // Ensure all text inside is readable in dark mode
              '& *': {
                color: mode === 'dark' ? theme.palette.text.primary : undefined,
              },
            }
          }}
          transitionDuration={300}
          SlideProps={{ direction: 'right' }}
          aria-label="mobile navigation drawer"
        >
          <Slide direction="right" in={drawerOpen} mountOnEnter unmountOnExit timeout={400}>
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, pt: 2, pb: 1 }}>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 20,
                    letterSpacing: 1.2,
                    color: mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main,
                    fontFamily: 'Montserrat, sans-serif',
                    textShadow: mode === 'dark' ? '0 1px 8px rgba(0,0,0,0.5)' : '0 1px 4px rgba(0,0,0,0.04)',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    handleDrawerToggle();
                    window.location.href = '/';
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label="Go to home page"
                >
                  JC's Closet
                </span>
                <IconButton onClick={handleDrawerToggle} aria-label="close drawer" size="large"
                  sx={{ color: mode === 'dark' ? theme.palette.text.primary : undefined }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
              <List role="menu" aria-label="Main navigation">
                {/* Main nav links first */}
                {linksToShow.map((link) => (
                  <ListItem key={link.to} disablePadding>
                    <ListItemButton
                      component={Link}
                      to={link.to}
                      selected={location.pathname === link.to}
                      onClick={handleDrawerToggle}
                      sx={{
                        py: 2,
                        fontSize: '1.1rem',
                        color: mode === 'dark' ? theme.palette.text.primary : theme.palette.text.primary,
                        '&.Mui-selected': {
                          bgcolor: mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.main,
                          color: theme.palette.primary.contrastText,
                        },
                        '&:hover': {
                          bgcolor: mode === 'dark' ? theme.palette.action.selected : theme.palette.action.hover,
                        },
                      }}
                      aria-label={link.label}
                      role="menuitem"
                    >
                      <ListItemText primary={link.label} sx={{ color: mode === 'dark' ? theme.palette.text.primary : undefined }} />
                    </ListItemButton>
                  </ListItem>
                ))}
                {/* Divider and section label for account/auth links */}
                {!role && (
                  <Box sx={{ my: 2, mx: 2 }}>
                    <hr style={{ border: 0, borderTop: `1px solid ${mode === 'dark' ? theme.palette.divider : theme.palette.divider}` }} />
                    <Box sx={{ mt: 1, mb: 0.5, fontWeight: 600, fontSize: 14, color: mode === 'dark' ? theme.palette.text.secondary : theme.palette.text.secondary, letterSpacing: 1 }}>
                      Sign In / Register
                    </Box>
                  </Box>
                )}
                {/* Show only auth links for guests in Drawer */}
                {!role && authLinks.map((link) => (
                  <ListItem key={link.to} disablePadding>
                    <ListItemButton
                      component={Link}
                      to={link.to}
                      selected={location.pathname === link.to}
                      onClick={handleDrawerToggle}
                      sx={{
                        py: 2,
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        bgcolor: mode === 'dark' ? theme.palette.secondary.dark : theme.palette.secondary.main,
                        color: theme.palette.secondary.contrastText,
                        borderRadius: 2,
                        boxShadow: 2,
                        mb: 1,
                        '&.Mui-selected': {
                          bgcolor: mode === 'dark' ? theme.palette.secondary.main : theme.palette.secondary.dark,
                          color: theme.palette.secondary.contrastText,
                        },
                        '&:hover': {
                          bgcolor: mode === 'dark' ? theme.palette.secondary.main : theme.palette.secondary.dark,
                          color: theme.palette.secondary.contrastText,
                        },
                      }}
                      aria-label={link.label}
                      role="menuitem"
                    >
                      <ListItemText primary={link.label} sx={{ color: theme.palette.secondary.contrastText }} />
                    </ListItemButton>
                  </ListItem>
                ))}
                {/* Show account links and logout for logged-in users in Drawer (mobile only) */}
                {role && (
                  <>
                    <Box sx={{ my: 2, mx: 2 }}>
                      <hr style={{ border: 0, borderTop: `1px solid ${mode === 'dark' ? theme.palette.divider : theme.palette.divider}` }} />
                      <Box sx={{ mt: 1, mb: 0.5, fontWeight: 600, fontSize: 14, color: mode === 'dark' ? theme.palette.text.secondary : theme.palette.text.secondary, letterSpacing: 1 }}>
                        My Account
                      </Box>
                    </Box>
                    {accountLinks.map((link) => (
                      <ListItem key={link.to} disablePadding>
                        <ListItemButton
                          component={Link}
                          to={link.to}
                          selected={location.pathname === link.to}
                          onClick={handleDrawerToggle}
                          sx={{
                            py: 2,
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            bgcolor: mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.main,
                            color: theme.palette.primary.contrastText,
                            borderRadius: 2,
                            boxShadow: 2,
                            mb: 1,
                            '&.Mui-selected': {
                              bgcolor: mode === 'dark' ? theme.palette.primary.main : theme.palette.primary.dark,
                              color: theme.palette.primary.contrastText,
                            },
                            '&:hover': {
                              bgcolor: mode === 'dark' ? theme.palette.primary.main : theme.palette.primary.dark,
                              color: theme.palette.primary.contrastText,
                            },
                          }}
                          aria-label={link.label}
                          role="menuitem"
                        >
                          <ListItemText primary={link.label} sx={{ color: theme.palette.primary.contrastText }} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                    {/* Logout button for mobile */}
                    <ListItem disablePadding>
                      <ListItemButton onClick={handleDrawerToggle} sx={{ py: 2, fontWeight: 700, color: theme.palette.error.main, justifyContent: 'center' }}>
                        <LogoutButton />
                      </ListItemButton>
                    </ListItem>
                  </>
                )}
              </List>
              {/* Dark mode toggle for mobile in drawer */}
              <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'center', alignItems: 'center', py: 2 }}>
                <Button
                  onClick={toggleMode}
                  startIcon={mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
                  variant="outlined"
                  color={mode === 'dark' ? 'secondary' : 'primary'}
                  sx={{ borderRadius: 3, fontWeight: 600, color: mode === 'dark' ? theme.palette.secondary.contrastText : undefined, borderColor: mode === 'dark' ? theme.palette.secondary.contrastText : undefined }}
                  aria-label="toggle dark mode"
                >
                  {mode === 'light' ? 'Dark Mode' : 'Light Mode'}
                </Button>
              </Box>
            </Box>
          </Slide>
        </Drawer>
      </Toolbar>
    </AppBar>
  );
}

export default Nav;
