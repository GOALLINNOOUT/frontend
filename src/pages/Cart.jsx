import * as api from '../utils/api';
import React, { useEffect, useState } from 'react';
// Ensure BACKEND_URL does not end with /api and always points to backend root
const BACKEND_URL = (import.meta.env.VITE_API_BASE_URL || 'https://jcserver.onrender.com').replace(/\/?api\/?$/, '');
const getImageUrl = (imgPath) => {
  if (!imgPath) return imgPath;
  // If already absolute URL, return as is
  if (/^https?:\/\//.test(imgPath)) return imgPath;
  // If starts with /api/perfumes/uploads/ or /perfumes/uploads/, strip /api/perfumes or /perfumes and prefix backend
  if (imgPath.startsWith('/api/perfumes/uploads/')) {
    return BACKEND_URL + imgPath.replace('/api/perfumes', '');
  }
  if (imgPath.startsWith('/perfumes/uploads/')) {
    return BACKEND_URL + imgPath.replace('/perfumes', '');
  }
  // If starts with /api/uploads/, strip /api and prefix backend
  if (imgPath.startsWith('/api/uploads/')) {
    return BACKEND_URL + imgPath.replace('/api', '');
  }
  // If starts with /uploads/, always prefix with backend root
  if (imgPath.startsWith('/uploads/')) {
    return BACKEND_URL + imgPath;
  }
  return imgPath;
};
import { Box, Typography, Button, IconButton, Stack, TextField, Divider, Dialog, DialogTitle, DialogContent, useMediaQuery, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CloseIcon from '@mui/icons-material/Close';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { getPerfumePromo } from '../utils/perfumePromo';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import emptyCartImg from '../assets/empty-cart.png';

// Utility to get sessionId from localStorage (do not generate if missing)
function getSessionId() {
  return localStorage.getItem('sessionId') || null;
}

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogMessage, setErrorDialogMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Load cart from localStorage or cart utility
  useEffect(() => {
    setLoading(true);
    import('../utils/cart').then(cart => {
      setCartItems(cart.getCart());
      setLoading(false);
    });
    // Listen for cart updates
    const update = () => {
      setLoading(true);
      import('../utils/cart').then(cart => {
        setCartItems(cart.getCart());
        setLoading(false);
      });
    };
    window.addEventListener('cart-updated', update);
    return () => window.removeEventListener('cart-updated', update);
  }, []);

  useEffect(() => {
    const sum = cartItems.reduce((acc, item) => {
      const { displayPrice } = getPerfumePromo(item);
      return acc + (displayPrice * item.quantity);
    }, 0);
    setTotal(sum);
  }, [cartItems]);

  const handleQuantityChange = (id, delta, stock) => {
    import('../utils/cart').then(cart => {
      const items = cart.getCart().map(item => {
        if (item._id === id) {
          let qty = item.quantity + delta;
          if (qty < 1) qty = 1;
          if (qty > stock) qty = stock;
          // Log update action to backend
          const sessionId = getSessionId();
          if (sessionId) {
            api.post('/v1/cart-actions', {
              sessionId,
              productId: item._id,
              action: 'update',
              quantity: qty
            });
          }
          return { ...item, quantity: qty };
        }
        return item;
      });
      cart.setCart(items);
      setCartItems(items);
      window.dispatchEvent(new Event('cart-updated'));
    });
  };

  const handleRemove = (id) => {
    import('../utils/cart').then(cart => {
      const item = cart.getCart().find(i => i._id === id);
      cart.removeFromCart(id);
      setCartItems(cart.getCart());
      window.dispatchEvent(new Event('cart-updated'));
      // Log remove action to backend
      const sessionId = getSessionId();
      if (sessionId && item) {
        api.post('/v1/cart-actions', {
          sessionId,
          productId: item._id,
          action: 'remove',
          quantity: item.quantity
        });
      }
    });
  };

  const handleCheckout = async () => {
    setLoading(true);
    // Check stock for all cart items before proceeding
    try {
      const res = await api.post('/cart/check-stock', { items: cartItems.map(item => ({ _id: item._id, quantity: item.quantity })) });
      if (res.data && res.data.success) {
        setLoading(false);
        navigate('/checkout');
      } else {
        setErrorDialogMessage(res.data?.message || 'Some items are out of stock or unavailable. Please review your cart.');
        setErrorDialogOpen(true);
        setLoading(false);
      }
    } catch {
      setErrorDialogMessage('Could not verify stock. Please try again.');
      setErrorDialogOpen(true);
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Cart | JC's Closet</title>
        <meta name="description" content="View and manage your shopping cart at JC's Closet. Ready to checkout?" />
      </Helmet>
      <Box sx={{
        minHeight: '80vh',
        py: { xs: 2, md: 4 },
        px: { xs: 1, sm: 2, md: 0 },
        maxWidth: 800,
        mx: 'auto',
        bgcolor: theme.palette.grey.cartBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: { xs: 0, sm: 6 },
        boxShadow: { xs: 'none', sm: '0 4px 32px 0 rgba(74,144,226,0.08)' },
        mt: { xs: 0, sm: 4 },
        mb: { xs: 0, sm: 4 },
      }}>
        <Box sx={{
          width: '100%',
          maxWidth: 700,
          bgcolor: theme.palette.grey.cartPaper,
          borderRadius: { xs: 0, sm: 6 },
          boxShadow: { xs: 'none', sm: '0 2px 12px 0 rgba(74,144,226,0.10)' },
          p: { xs: 1, sm: 3, md: 4 },
          mx: 'auto',
          minHeight: { xs: '60vh', sm: '70vh' },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <Typography variant="h4" fontWeight={700} mb={4} textAlign="center" sx={{ letterSpacing: 1, color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <ShoppingCartIcon sx={{ fontSize: 36 }} /> Cart
          </Typography>
          {cartItems.length === 0 ? (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" flex={1} py={6}>
              <Box component="img"
                src={emptyCartImg}
                alt="Empty cart illustration"
                sx={{ width: 120, height: 120, mb: 2, objectFit: 'contain', opacity: 0.85 }}
                loading="lazy"
              />
              <Typography variant="h6" color="text.secondary" textAlign="center" mb={2} fontWeight={500}>
                Your cart is empty.
              </Typography>
              <Typography variant="body1" color="text.secondary" textAlign="center" mb={3}>
                Looks like you haven’t added anything yet. Start shopping now!
              </Typography>
              <Button variant="contained" color="primary" size="large" sx={{ fontWeight: 600, px: 4, py: 1.5, borderRadius: 3, boxShadow: 1 }} onClick={() => navigate('/perfumes')}>Browse Products</Button>
            </Box>
          ) : (
            <>
              <Box>
                <AnimatePresence>
                  {cartItems.map(item => {
                    const { displayPrice, promoActive, promoLabel } = getPerfumePromo(item);
                    return (
                      <motion.div
                        key={item._id + (item.size || '') + (item.color || '')}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={{ duration: 0.7 }}
                        style={{ marginBottom: 24 }}
                      >
                        <Box
                          display="flex"
                          flexDirection={isMobile ? 'column' : 'row'}
                          alignItems={isMobile ? 'center' : 'center'}
                          mb={0}
                          p={{ xs: 1, sm: 3, md: 4 }}
                          boxShadow={theme.palette.grey.cartShadow}
                          borderRadius={4}
                          bgcolor={theme.palette.grey.cartCard}
                          gap={isMobile ? 2 : 0}
                          width="100%"
                          sx={{
                            transition: 'box-shadow 0.2s, background 0.2s',
                            '&:hover': { boxShadow: '0 8px 32px 0 rgba(74,144,226,0.16)', bgcolor: theme.palette.grey.cartCardHover },
                            ...(isMobile && { minWidth: 0, mx: 'auto', textAlign: 'center' })
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'center', width: isMobile ? '100%' : 'auto' }}>
                            <motion.img
                              src={getImageUrl(item.img || item.image)}
                              alt={item.title || item.name}
                              whileHover={{ scale: 1.07, boxShadow: theme.palette.grey.cartShadow }}
                              whileTap={{ scale: 0.97 }}
                              style={{ width: isMobile ? 80 : 90, height: isMobile ? 80 : 90, objectFit: 'cover', borderRadius: 12, marginRight: isMobile ? 0 : 18, marginBottom: isMobile ? 8 : 0, cursor: 'pointer', boxShadow: theme.palette.grey.cartShadow, transition: 'box-shadow 0.2s' }}
                              onClick={() => {
                                setSelected(item);
                                setModalOpen(true);
                                setSelectedImageIndex(item.mainImageIndex || 0);
                              }}
                              title={`View image of ${item.title || item.name}`}
                              loading="lazy"
                            />
                          </Box>
                          <Box flex={1} minWidth={0} width="100%" sx={isMobile ? { mt: 1 } : {}}>
                            <Typography
                              variant="subtitle1"
                              fontWeight={700}
                              sx={{ cursor: 'pointer', display: 'inline-block', fontSize: { xs: 17, sm: 18 } }}
                              onClick={() => {
                                setSelected(item);
                                setModalOpen(true);
                                setSelectedImageIndex(item.mainImageIndex || 0);
                              }}
                              title={`View details for ${item.title || item.name}`}
                            >
                              {item.title || item.name}
                            </Typography>
                            {/* Show size and color if present */}
                            <Stack direction="row" alignItems="center" spacing={2} mt={1} mb={1} justifyContent={isMobile ? 'center' : 'flex-start'}>
                              {item.size && (
                                <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ background: theme.palette.grey.cartLabel, borderRadius: 2, px: 1.5, py: 0.5 }}>
                                  Size: {item.size}
                                </Typography>
                              )}
                              {item.color && (
                                <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ background: theme.palette.grey.cartLabel, borderRadius: 2, px: 1.5, py: 0.5 }}>
                                  Color: {item.color}
                                </Typography>
                              )}
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={1} mt={0.5} justifyContent={isMobile ? 'center' : 'flex-start'}>
                              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                ₦{displayPrice?.toLocaleString()}
                              </Typography>
                              {promoActive && (
                                <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                                  ₦{item.price?.toLocaleString()}
                                </Typography>
                              )}
                              {promoActive && promoLabel && (
                                <Typography variant="caption" color="error.main">{promoLabel}</Typography>
                              )}
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={1} mt={1} justifyContent={isMobile ? 'center' : 'flex-start'}>
                              <motion.div whileTap={{ scale: 0.9 }} style={{ display: 'inline-block' }}>
                                <Button size="small" variant="outlined" onClick={() => handleQuantityChange(item._id, -1, item.stock)} disabled={item.quantity <= 1} sx={{ minWidth: 32, fontWeight: 700, borderRadius: 2, borderColor: theme.palette.grey.cartThumbBorder, color: 'primary.main', '&:hover': { borderColor: 'primary.main', background: theme.palette.grey.cartCardHover } }} title="Decrease quantity">-</Button>
                              </motion.div>
                              <TextField value={item.quantity} size="small" inputProps={{ min: 1, max: item.stock, style: { textAlign: 'center', width: 40 } }} sx={{ width: 60, mx: 1 }} readOnly title="Quantity in cart" />
                              <motion.div whileTap={{ scale: 0.9 }} style={{ display: 'inline-block' }}>
                                <Button size="small" variant="outlined" onClick={() => handleQuantityChange(item._id, 1, item.stock)} disabled={item.quantity >= item.stock} sx={{ minWidth: 32, fontWeight: 700, borderRadius: 2, borderColor: theme.palette.grey.cartThumbBorder, color: 'primary.main', '&:hover': { borderColor: 'primary.main', background: theme.palette.grey.cartCardHover } }} title="Increase quantity">+</Button>
                              </motion.div>
                            </Stack>
                            <Typography variant="caption" color="text.secondary" mt={0.5} display={isMobile ? 'block' : 'inline'}>
                              In stock: {item.stock}
                            </Typography>
                          </Box>
                          <Box textAlign={isMobile ? 'center' : 'right'} minWidth={90} mt={isMobile ? 2 : 0} width={isMobile ? '100%' : 'auto'}>
                            <Typography variant="subtitle2" fontWeight={700} color="primary.main" fontSize={18}>
                              ₦{(displayPrice * item.quantity).toLocaleString()}
                            </Typography>
                            <motion.div whileTap={{ scale: 0.85 }} style={{ display: 'inline-block' }}>
                              <IconButton color="error" onClick={() => handleRemove(item._id)} sx={{ mt: 1, borderRadius: 2, background: theme.palette.grey.cartDialogCloseBg, '&:hover': { background: theme.palette.grey.cartDialogCloseBgHover } }} title={`Remove ${item.title || item.name} from cart`}><DeleteIcon /></IconButton>
                            </motion.div>
                          </Box>
                        </Box>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </Box>
              {/* Product Info Modal */}
              <AnimatePresence>
                {modalOpen && (
                  <Dialog
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    maxWidth="md"
                    fullWidth
                    PaperProps={{
                      component: motion.div,
                      initial: { scale: 0.95, opacity: 0 },
                      animate: { scale: 1, opacity: 1 },
                      exit: { scale: 0.95, opacity: 0 },
                      transition: { duration: 0.7 },
                      sx: { maxWidth: { xs: '100vw', md: 800 }, width: '100%', m: 0, borderRadius: { xs: 0, md: 4 }, height: { xs: '100vh', md: 'auto' }, display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.palette.grey.cartPaper }
                    }}
                  >
                    <DialogTitle sx={{ position: 'relative', display: 'flex', alignItems: 'center', fontSize: { xs: 22, md: 28 }, pr: 6 }}>
                      {selected?.name}
                      <IconButton onClick={() => setModalOpen(false)} sx={{ position: 'fixed', right: 8, top: 25, color: theme.palette.grey.cartDialogClose, zIndex: 1000, backgroundColor: theme.palette.grey.cartDialogCloseBg, '&:hover': { backgroundColor: theme.palette.grey.cartDialogCloseBgHover } }} title="Close">
                        <CloseIcon />
                      </IconButton>
                    </DialogTitle>
                    <DialogContent sx={{ p: { xs: 1, md: 3 }, width: { xs: '100vw', md: 700 }, maxWidth: { xs: '100vw', md: 700 }, minHeight: { xs: 'auto', md: 320 }, maxHeight: { xs: '100vh', md: 600 }, overflowY: 'auto', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, alignItems: { xs: 'center', md: 'flex-start' } }}>
                      {selected && (() => {
                        const { displayPrice, promoActive, promoLabel } = getPerfumePromo(selected);
                        return (
                          <>
                            <Box flexShrink={0} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: { md: 240 } }}>
                              {selected.images && selected.images[selectedImageIndex] && (
                                <motion.img
                                  src={getImageUrl(selected.images[selectedImageIndex])}
                                  alt={selected.name}
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ duration: 0.3 }}
                                  style={{ width: 220, height: 220, objectFit: 'cover', borderRadius: 12, boxShadow: theme.palette.grey.cartShadow }}
                                  loading="lazy"
                                />
                              )}
                              <Stack direction="row" spacing={1} mt={2} justifyContent="center" flexWrap="wrap">
                                {selected.images && selected.images.map((img, idx) => (
                                  <Box key={idx} sx={{ border: idx === selectedImageIndex ? `2px solid ${theme.palette.grey.cartThumbBorderActive}` : `1px solid ${theme.palette.grey.cartThumbBorder}`, borderRadius: 2, p: 0.5, cursor: 'pointer', background: theme.palette.grey.cartCard, '&:hover': { background: theme.palette.grey.cartCardHover } }} onClick={() => setSelectedImageIndex(idx)}>
                                    <motion.img
                                      src={getImageUrl(img)}
                                      alt={selected.name + '-' + idx}
                                      whileHover={{ scale: 1.1 }}
                                      style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6, opacity: idx === selectedImageIndex ? 1 : 0.7 }}
                                      loading="lazy"
                                    />
                                  </Box>
                                ))}
                              </Stack>
                            </Box>
                            <Box flex={1} minWidth={0} sx={{ mt: { xs: 3, md: 0 } }}>
                              <Typography variant="subtitle1" fontWeight={600} mb={1}>Description</Typography>
                              <Typography variant="body1" mb={2}>{selected.description}</Typography>
                              <Typography variant="subtitle1" fontWeight={600}>Price</Typography>
                              {promoActive ? (
                                <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                                  <Typography variant="h6" color="primary.main">₦{displayPrice?.toLocaleString()}</Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                                    ₦{selected.price?.toLocaleString()}
                                  </Typography>
                                  <Typography variant="caption" color="error.main">{promoLabel}</Typography>
                                </Stack>
                              ) : (
                                <Typography variant="h6" color="primary.main" mb={2}>₦{selected.price?.toLocaleString()}</Typography>
                              )}
                              <Typography variant="body2" color={selected.stock > 0 ? 'success.main' : 'error.main'} fontWeight={600} mb={2}>
                                {selected.stock > 0 ? `In Stock: ${selected.stock}` : 'Out of Stock'}
                              </Typography>
                              <Typography variant="subtitle2" fontWeight={600} mb={2} color="primary.main">
                                Total in Cart: {selected.quantity}
                              </Typography>
                            </Box>
                          </>
                        );
                      })()}
                    </DialogContent>
                  </Dialog>
                )}
              </AnimatePresence>
              <Divider sx={{ my: 3 }} />
              <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} justifyContent="space-between" alignItems={isMobile ? 'flex-start' : 'center'} mb={2} gap={isMobile ? 2 : 0}>
                <Typography variant="h6" fontWeight={700}>Total:</Typography>
                <Typography variant="h5" color="primary.main" fontWeight={700}>
                  ₦{total.toLocaleString()}
                </Typography>
              </Box>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} style={{ width: '100%' }} transition={{ duration: 0.7 }}>
                <Button variant="contained" color="primary" size="large" fullWidth sx={{ fontWeight: 700, py: 1.5, fontSize: 20, borderRadius: 4, boxShadow: 2, mt: 1, background: 'linear-gradient(90deg, #4A90E2 60%, #357ABD 100%)', '&:hover': { background: 'linear-gradient(90deg, #357ABD 60%, #4A90E2 100%)' } }} onClick={handleCheckout} title="Proceed to checkout">
                  Checkout
                </Button>
              </motion.div>
              {/* Info Section: Checkout, Order & Delivery */}
              <Box mt={4} mb={2} p={2} sx={{ bgcolor: theme.palette.grey.cartCardHover, borderRadius: 3, boxShadow: 1 }}>
                <Stack spacing={2}>
                  <Stack direction="row" alignItems="flex-start" spacing={1}>
                    <Box mt={0.5}><PaymentIcon color="primary" /></Box>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700}>Checkout</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Review your cart items and quantities before proceeding.<br />
                        Click “Checkout” to securely pay via Paystack. All payments are encrypted and safe.
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" alignItems="flex-start" spacing={1}>
                    <Box mt={0.5}><ReceiptLongIcon color="primary" /></Box>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700}>Order Process</Typography>
                      <Typography variant="body2" color="text.secondary">
                        After payment, you’ll receive an order confirmation by email.<br />
                        Orders are processed within 24 hours (excluding Sundays and public holidays).<br />
                        You can view your order history and status in your account dashboard/My Order's page.
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" alignItems="flex-start" spacing={1}>
                    <Box mt={0.5}><LocalShippingIcon color="primary" /></Box>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700}>Delivery</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Nationwide delivery: 2–5 business days.
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Box>
              {/* Cart Storage Notice */}
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1, mb: 2 }}>
                Note: Your cart is saved only on this device and browser. It will not sync across devices or accounts. Server based cart is coming soon.
              </Typography>
            </>
          )}
        </Box>
        {/* Error Dialog */}
        <Dialog
          open={errorDialogOpen}
          onClose={() => setErrorDialogOpen(false)}
          PaperProps={{
            component: motion.div,
            initial: { scale: 0.95, opacity: 0 },
            animate: { scale: 1, opacity: 1 },
            exit: { scale: 0.95, opacity: 0 },
            transition: { duration: 0.7 },
            sx: { borderRadius: 3, p: 2, background: theme.palette.grey.cartPaper }
          }}
        >
          <Typography variant="h6" fontWeight={700} mb={2} textAlign="center" color="error.main">
            Error
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={2} textAlign="center">
            {errorDialogMessage}
          </Typography>
          <Button variant="contained" color="primary" onClick={() => setErrorDialogOpen(false)} fullWidth title="Close error dialog">
            Close
          </Button>
        </Dialog>
        {loading && (
          <Box sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: theme.palette.grey.cartLoadingOverlay,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1300
          }}>
            <CircularProgress />
          </Box>
        )}
      </Box>
    </>
  );
};

export default Cart;
