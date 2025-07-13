import React from 'react';
import getImageUrl from '../utils/getImageUrl';
import * as api from '../utils/api';
import { Container, Grid, Typography, Card, CardContent, CardMedia, Button, Box, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, CircularProgress, TextField } from '@mui/material';
import { motion } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { Helmet } from 'react-helmet-async';
import './FashionGrid.css'; // Add this import for custom grid styles
import { useTheme } from '@mui/material/styles';

function Fashion() {
  const [designs, setDesigns] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const [selectedLook, setSelectedLook] = React.useState(null);
  const [sizeGuideOpen, setSizeGuideOpen] = React.useState(false);
  const [sizeGuideUnit, setSizeGuideUnit] = React.useState('in'); // 'in' or 'cm'
  const [modalImgIdx, setModalImgIdx] = React.useState(0); // Track main image in modal
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [suggestions, setSuggestions] = React.useState([]);
  const searchTimeout = React.useRef(null);
  const suggestionTimeout = React.useRef(null);
  const [requestDialogOpen, setRequestDialogOpen] = React.useState(false);
  const [requestForm, setRequestForm] = React.useState({ name: '', email: '', phone: '', notes: '' });
  const [requestLoading, setRequestLoading] = React.useState(false);
  const [requestSuccess, setRequestSuccess] = React.useState(false);
  const [requestError, setRequestError] = React.useState('');
  const theme = useTheme();

  React.useEffect(() => {
    fetchInitialDesigns();
    // eslint-disable-next-line
  }, []);

  const fetchInitialDesigns = async () => {
    setLoading(true);
    try {
      const res = await api.getPaginatedDesigns(1, 6);
      setDesigns(res.data.designs || []);
      setHasMore(res.data.page < res.data.pages);
      setPage(1);
    } catch (err) {
      setDesigns([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreDesigns = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await api.getPaginatedDesigns(nextPage, 6);
      setDesigns(prev => [...prev, ...(res.data.designs || [])]);
      setHasMore(res.data.page < res.data.pages);
      setPage(nextPage);
    } catch (err) {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleOpen = (look) => {
    setSelectedLook(look);
    setModalImgIdx(0); // Reset to first image when opening modal
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedLook(null);
    setModalImgIdx(0);
  };

  const handleOpenSizeGuide = () => {
    setSizeGuideOpen(true);
  };

  const handleCloseSizeGuide = () => {
    setSizeGuideOpen(false);
  };

  // Size data (inches and cm)
  const sizeGuideData = [
    { size: 'XS', bust: [31, 32], waist: [24, 25], hips: [34, 35], bustCm: [79, 81], waistCm: [61, 64], hipsCm: [86, 89] },
    { size: 'S', bust: [33, 34], waist: [26, 27], hips: [36, 37], bustCm: [84, 86], waistCm: [66, 69], hipsCm: [91, 94] },
    { size: 'M', bust: [35, 36], waist: [28, 29], hips: [38, 39], bustCm: [89, 91], waistCm: [71, 74], hipsCm: [97, 99] },
    { size: 'L', bust: [37, 39], waist: [30, 32], hips: [40, 42], bustCm: [94, 99], waistCm: [76, 81], hipsCm: [102, 107] },
    { size: 'XL', bust: [40, 42], waist: [33, 35], hips: [43, 45], bustCm: [102, 107], waistCm: [84, 89], hipsCm: [109, 114] },
    { size: 'XXL', bust: [43, 45], waist: [36, 38], hips: [46, 48], bustCm: [109, 114], waistCm: [91, 97], hipsCm: [117, 122] },
    { size: '3XL', bust: [46, 48], waist: [39, 41], hips: [49, 51], bustCm: [117, 122], waistCm: [99, 104], hipsCm: [124, 130] },
    { size: '4XL', bust: [49, 51], waist: [42, 44], hips: [52, 54], bustCm: [124, 130], waistCm: [107, 112], hipsCm: [132, 137] },
    { size: '5XL', bust: [52, 54], waist: [45, 47], hips: [55, 57], bustCm: [132, 137], waistCm: [114, 119], hipsCm: [140, 145] },
  ];

  // --- Search & Suggestion logic ---
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchSearchedDesigns(value);
    }, 400);
    // Suggestions
    if (suggestionTimeout.current) clearTimeout(suggestionTimeout.current);
    if (value.length > 0) {
      suggestionTimeout.current = setTimeout(async () => {
        try {
          const res = await api.getDesignSuggestions(value);
          setSuggestions(res.data || []);
        } catch {
          setSuggestions([]);
        }
      }, 200);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (s) => {
    setSearch(s);
    setSuggestions([]);
    fetchSearchedDesigns(s);
  };

  const fetchSearchedDesigns = async (query) => {
    setLoading(true);
    try {
      const res = await api.getPaginatedDesigns(1, 6);
      let filtered = res.data.designs;
      if (query) {
        const q = query.toLowerCase();
        filtered = filtered.filter(d =>
          d.title.toLowerCase().includes(q) ||
          (d.desc && d.desc.toLowerCase().includes(q))
        );
      }
      setDesigns(filtered);
      setHasMore(false); // Hide load more for search
      setPage(1);
    } catch {
      setDesigns([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOpen = () => {
    setRequestForm({ name: '', email: '', phone: '', notes: '' });
    setRequestSuccess(false);
    setRequestError('');
    setRequestDialogOpen(true);
  };
  const handleRequestClose = () => {
    setRequestDialogOpen(false);
    setRequestSuccess(false);
    setRequestError('');
  };
  const handleRequestChange = (e) => {
    setRequestForm({ ...requestForm, [e.target.name]: e.target.value });
  };
  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setRequestLoading(true);
    setRequestSuccess(false);
    setRequestError('');
    try {
      await api.requestCustomLook({
        ...requestForm,
        designTitle: selectedLook?.title || '',
        designId: selectedLook?._id || '',
      });
      setRequestSuccess(true);
      setRequestForm({ name: '', email: '', phone: '', notes: '' });
    } catch (err) {
      setRequestError('Failed to send request. Please try again.');
    } finally {
      setRequestLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Fashion | JC's Closet</title>
        <meta name="description" content="Explore the latest fashion designs and exclusive pieces at JC's Closet. Elevate your wardrobe today." />
      </Helmet>
      <Container
        maxWidth="xl"
        sx={{
          py: { xs: 3, md: 6 },
          minHeight: '100vh',
          background: {
            xs: theme.palette.mode === 'dark'
              ? 'linear-gradient(120deg, #181c24 0%, #232a36 100%)'
              : 'linear-gradient(120deg, #f8fafc 0%, #e0e7ef 100%)',
            md: theme.palette.mode === 'dark'
              ? 'linear-gradient(120deg, #181c24 0%, #232a36 100%)'
              : 'linear-gradient(120deg, #f8fafc 0%, #e0e7ef 100%)',
          },
        }}
      >
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <Typography
            variant="h3"
            component="h2"
            fontWeight={800}
            gutterBottom
            textAlign="center"
            sx={{
              color: theme.palette.mode === 'dark' ? '#fff' : '#222',
              letterSpacing: 1.2,
              textShadow: theme.palette.mode === 'dark' ? '0 2px 12px #0008' : '0 2px 8px #e0e7ef',
            }}
          >
            Fashion Portfolio
          </Typography>
          <Typography
            variant="subtitle1"
            color={theme.palette.mode === 'dark' ? 'grey.300' : 'text.secondary'}
            textAlign="center"
            maxWidth="md"
            mx="auto"
            sx={{ fontSize: { xs: 16, md: 18 }, mb: 2 }}
          >
            Step into our world of style! Browse our portfolio to see exclusive designs, creative looks, and real client transformations. Each piece is crafted with passion and attention to detail.
          </Typography>
        </motion.div>

        {/* Search Bar */}
        <Box mt={6}>
          {/* Search and Suggestions */}
          <Box mb={3} display="flex" justifyContent="center" alignItems="center" position="relative" sx={{ minWidth: 240 }}>
            <Box position="relative" width="100%" maxWidth={340}>
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search fashion looks..."
                className="search-input"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `1.5px solid ${theme.palette.mode === 'dark' ? '#333a48' : theme.palette.grey.e0e7ef}`,
                  borderRadius: 12,
                  fontSize: 16,
                  background: theme.palette.mode === 'dark' ? '#232a36' : theme.palette.grey._fff,
                  color: theme.palette.mode === 'dark' ? '#fff' : '#222',
                  boxShadow: theme.palette.mode === 'dark'
                    ? '0 2px 12px #0004'
                    : '0 1px 8px #e0e7ef88',
                  outline: 'none',
                  transition: 'border 0.2s, box-shadow 0.2s',
                }}
                autoComplete="off"
              />
              {suggestions.length > 0 && (
                <Box
                  position="absolute"
                  top={48}
                  left={0}
                  right={0}
                  width="100%"
                  bgcolor={theme.palette.mode === 'dark' ? '#232a36' : theme.palette.grey._fff}
                  borderRadius={2}
                  boxShadow={theme.palette.mode === 'dark' ? 8 : 3}
                  zIndex={10}
                  border={`1.5px solid ${theme.palette.mode === 'dark' ? '#333a48' : theme.palette.grey.e0e7ef}`}
                  sx={{ maxHeight: 220, overflowY: 'auto' }}
                >
                  {suggestions.map((s, idx) => (
                    <Box
                      key={idx}
                      px={2}
                      py={1}
                      sx={{
                        cursor: 'pointer',
                        fontSize: 16,
                        color: theme.palette.mode === 'dark' ? '#fff' : '#222',
                        '&:hover': {
                          background: theme.palette.mode === 'dark' ? '#2d3646' : theme.palette.grey.f1f5f9,
                        },
                      }}
                      onClick={() => handleSuggestionClick(s)}
                    >
                      {s}
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Box>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <Typography
              variant="h4"
              component="h3"
              fontWeight={700}
              mb={3}
              textAlign="center"
              sx={{
                color: theme.palette.mode === 'dark' ? '#ffcc33' : theme.palette.primary.main,
                letterSpacing: 1.1,
              }}
            >
              Featured Looks
            </Typography>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={{ xs: 2, sm: 4 }} justifyContent="center" className="fashion-grid">
                {designs.map((look) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={look._id} className="fashion-grid-item">
                    <motion.div whileHover={{ scale: 1.04, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
                      <Card
                        className="fashion-card"
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          borderRadius: 4,
                          boxShadow: theme.palette.mode === 'dark' ? 8 : 3,
                          cursor: 'pointer',
                          background: theme.palette.mode === 'dark'
                            ? 'linear-gradient(120deg, #232a36 0%, #181c24 100%)'
                            : 'linear-gradient(120deg, #fff 0%, #f8fafc 100%)',
                          border: theme.palette.mode === 'dark' ? '1.5px solid #333a48' : '1.5px solid #e0e7ef',
                          transition: 'box-shadow 0.2s, border 0.2s',
                        }}
                        onClick={() => handleOpen(look)}
                        title={`View details for ${look.title}`}
                      >
                        <CardMedia
                          component="img"
                          height="220"
                          image={getImageUrl(look.imgs && look.imgs[0])}
                          alt={look.title}
                          sx={{
                            objectFit: 'cover',
                            borderTopLeftRadius: 4,
                            borderTopRightRadius: 4,
                            borderBottom: theme.palette.mode === 'dark' ? '1.5px solid #333a48' : '1.5px solid #e0e7ef',
                          }}
                          title={look.title}
                          loading="lazy"
                        />
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography
                            variant="h6"
                            fontWeight={700}
                            sx={{ color: theme.palette.mode === 'dark' ? '#ffcc33' : theme.palette.primary.main }}
                          >
                            {look.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            color={theme.palette.mode === 'dark' ? 'grey.300' : 'text.secondary'}
                            sx={{ mt: 0.5, fontSize: 15 }}
                          >
                            {look.desc}
                          </Typography>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            )}
          </motion.div>
        </Box>

        <Box mt={8}>
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <Typography
              variant="h4"
              component="h3"
              fontWeight={700}
              mb={3}
              textAlign="center"
              sx={{ color: theme.palette.mode === 'dark' ? '#ffcc33' : theme.palette.primary.main }}
            >
              Gallery
            </Typography>
            <Grid container spacing={2} justifyContent="center">
              {designs.slice(0, 4).map((look) => (
                <Grid item xs={12} sm={6} md={3} key={look.title + '-gallery'}>
                  <motion.div whileHover={{ scale: 1.03 }}>
                    <Box
                      component="img"
                      src={getImageUrl(look.imgs && look.imgs[0])}
                      alt={look.title}
                      sx={{
                        width: '100%',
                        height: { xs: 160, md: 180 },
                        objectFit: 'cover',
                        borderRadius: 3,
                        boxShadow: theme.palette.mode === 'dark' ? 8 : 2,
                        border: theme.palette.mode === 'dark' ? '1.5px solid #333a48' : '1.5px solid #e0e7ef',
                      }}
                      title={look.title}
                      loading="lazy"
                    />
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Box>

        {/* Book a Styling Session Button (moved outside Gallery Grid) */}
        <Box mt={4} textAlign="center">
          <Button
            href="/appointments"
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.5,
              fontWeight: 700,
              fontSize: 18,
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(90deg, #ffb347 0%, #ffcc33 100%)'
                : 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)',
              color: theme.palette.mode === 'dark' ? '#222' : '#fff',
              boxShadow: theme.palette.mode === 'dark' ? 8 : 4,
              '&:hover': {
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(90deg, #ffcc33 0%, #ffb347 100%)'
                  : 'linear-gradient(90deg, #1565c0 0%, #1976d2 100%)',
                boxShadow: theme.palette.mode === 'dark' ? 12 : 6,
                transform: 'scale(1.05)',
              },
            }}
            component={motion.a}
            whileHover={{ scale: 1.05 }}
            title="Book a styling session"
          >
            Book a Styling Session
          </Button>
        </Box>

        {/* Modal for design details */}
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
          <DialogTitle
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: theme.palette.mode === 'dark' ? '#232a36' : '#f8fafc',
              color: theme.palette.mode === 'dark' ? '#ffcc33' : theme.palette.primary.main,
              fontWeight: 700,
              fontSize: 22,
              letterSpacing: 1.1,
            }}
          >
            {selectedLook?.title}
            <IconButton onClick={handleClose} size="small" title="Close">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ background: theme.palette.mode === 'dark' ? '#232a36' : '#fff' }}>
            <Typography variant="subtitle1" mb={2} sx={{ color: theme.palette.mode === 'dark' ? 'grey.300' : 'text.secondary' }}>{selectedLook?.details}</Typography>
            {/* Removed price, size selector, color selector, and related error display */}
            {/* Show categories, sizes, and colors if available */}
            <Box mb={2}>
              {selectedLook?.categories?.length > 0 && (
                <Typography variant="body2" color="text.secondary" mb={0.5}>
                  <b>Categories:</b> {selectedLook.categories.join(', ')}
                </Typography>
              )}
              {selectedLook?.sizes?.length > 0 && (
                <Box display="flex" alignItems="center" mb={0.5}>
                  <Typography variant="body2" color="text.secondary" mb={0}>
                    <b>Sizes:</b> {selectedLook.sizes.join(', ')}
                  </Typography>
                  <IconButton size="small" sx={{ ml: 1 }} onClick={() => setSizeGuideOpen(true)} title="View size guide">
                    <HelpOutlineIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
              {selectedLook?.colors?.length > 0 && (
                <Box display="flex" flexWrap="wrap" alignItems="center" gap={1} mb={0.5}>
                  <b style={{ marginRight: 4 }}>Colors:</b>
                  {selectedLook.colors.map((color, idx) => {
                    // Check if color is a valid CSS color
                    const isColor = (() => {
                      const s = document.createElement('span');
                      s.style.color = '';
                      s.style.color = color;
                      return !!s.style.color;
                    })();
                    return isColor ? (
                      <span key={idx} style={{
                        display: 'inline-block',
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: color,
                        border: '1.5px solid ' + theme.palette.grey.e0e7ef,
                        marginRight: 6,
                        verticalAlign: 'middle',
                      }} title={color} />
                    ) : (
                      <span key={idx} style={{
                        display: 'inline-block',
                        padding: '2px 10px',
                        borderRadius: 12,
                        background: theme.palette.grey.f1f5f9,
                        color: theme.palette.grey._222,
                        border: '1px solid ' + theme.palette.grey.e0e7ef,
                        marginRight: 6,
                        verticalAlign: 'middle',
                      }}>{color}</span>
                    );
                  })}
                </Box>
              )}
            </Box>
            {/* Main image preview */}
            {selectedLook?.imgs?.length > 0 && (
              <Box mb={2}>
                <Box display="flex" justifyContent="center" mb={1}>
                  <Box
                    component="img"
                    src={getImageUrl(selectedLook.imgs[modalImgIdx])}
                    alt={selectedLook.title + ' main'}
                    sx={{
                      width: { xs: '100%', sm: 340, md: 400 },
                      height: 240,
                      objectFit: 'cover',
                      borderRadius: 3,
                      boxShadow: theme.palette.mode === 'dark' ? 8 : 2,
                      border: theme.palette.mode === 'dark' ? '2px solid #333a48' : '2px solid #e0e7ef',
                    }}
                    loading="lazy"
                  />
                </Box>
                {/* Thumbnails */}
                <Box display="flex" justifyContent="center" gap={1}>
                  {selectedLook.imgs.map((img, idx) => (
                    <Box
                      key={idx}
                      component="img"
                      src={getImageUrl(img)}
                      alt={selectedLook.title + ' thumb ' + idx}
                      onClick={() => setModalImgIdx(idx)}
                      sx={{
                        width: 54,
                        height: 54,
                        objectFit: 'cover',
                        borderRadius: 2,
                        border: idx === modalImgIdx
                          ? `2.5px solid ${theme.palette.mode === 'dark' ? '#ffcc33' : theme.palette.primary.main}`
                          : `2px solid ${theme.palette.mode === 'dark' ? '#333a48' : theme.palette.grey.e0e7ef}`,
                        boxShadow: idx === modalImgIdx ? (theme.palette.mode === 'dark' ? 8 : 3) : 1,
                        cursor: 'pointer',
                        opacity: idx === modalImgIdx ? 1 : 0.7,
                        transition: 'border 0.2s, box-shadow 0.2s, opacity 0.2s',
                        mr: idx !== selectedLook.imgs.length - 1 ? 1 : 0,
                      }}
                      title={`View image ${idx + 1} of ${selectedLook.title}`}
                      loading="lazy"
                    />
                  ))}
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ background: theme.palette.mode === 'dark' ? '#232a36' : '#f8fafc' }}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              onClick={handleRequestOpen}
              title="Request for this fashion look"
              sx={{
                fontWeight: 700,
                fontSize: 18,
                borderRadius: 3,
                px: 4,
                py: 1.5,
                boxShadow: theme.palette.mode === 'dark' ? 8 : 4,
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(90deg, #ffb347 0%, #ffcc33 100%)'
                  : 'linear-gradient(90deg, #ffb347 0%, #ffcc33 100%)',
                color: theme.palette.mode === 'dark' ? '#222' : '#222',
                '&:hover': {
                  background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(90deg, #ffcc33 0%, #ffb347 100%)'
                    : 'linear-gradient(90deg, #ffcc33 0%, #ffb347 100%)',
                  boxShadow: theme.palette.mode === 'dark' ? 12 : 6,
                  transform: 'scale(1.05)',
                },
                animation: 'pulse 1.5s infinite',
                '@keyframes pulse': {
                  '0%': { boxShadow: '0 0 0 0 #ffcc3340' },
                  '70%': { boxShadow: '0 0 0 10px #ffcc3300' },
                  '100%': { boxShadow: '0 0 0 0 #ffcc3340' },
                },
              }}
              startIcon={<HelpOutlineIcon />}
            >
              Request for Custom Look
            </Button>
          </DialogActions>
        </Dialog>

        {/* Request Custom Look Dialog */}
        <Dialog open={requestDialogOpen} onClose={handleRequestClose} maxWidth="sm" fullWidth>
          <DialogTitle
            sx={{
              background: theme.palette.mode === 'dark' ? '#232a36' : '#f8fafc',
              color: theme.palette.mode === 'dark' ? '#ffcc33' : theme.palette.primary.main,
              fontWeight: 700,
              fontSize: 20,
              letterSpacing: 1.1,
            }}
          >
            Request for Custom Look
          </DialogTitle>
          <DialogContent dividers sx={{ background: theme.palette.mode === 'dark' ? '#232a36' : '#fff' }}>
            {requestSuccess ? (
              <Box textAlign="center" py={3}>
                <Typography variant="h6" color="success.main" mb={2}>Request sent successfully!</Typography>
                <Button variant="contained" color="primary" onClick={handleRequestClose}>Close</Button>
              </Box>
            ) : (
              <form onSubmit={handleRequestSubmit}>
                <TextField
                  label="Name"
                  name="name"
                  value={requestForm.name}
                  onChange={handleRequestChange}
                  fullWidth
                  required
                  margin="normal"
                />
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={requestForm.email}
                  onChange={handleRequestChange}
                  fullWidth
                  required
                  margin="normal"
                />
                <TextField
                  label="Phone"
                  name="phone"
                  value={requestForm.phone}
                  onChange={handleRequestChange}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Design Title"
                  value={selectedLook?.title || ''}
                  fullWidth
                  margin="normal"
                  disabled
                />
                <TextField
                  label="Notes (optional)"
                  name="notes"
                  value={requestForm.notes}
                  onChange={handleRequestChange}
                  fullWidth
                  multiline
                  minRows={2}
                  margin="normal"
                />
                {requestError && <Typography color="error" mt={1}>{requestError}</Typography>}
                <Box mt={2} display="flex" justifyContent="flex-end" gap={2}>
                  <Button onClick={handleRequestClose} color="secondary" disabled={requestLoading}>Cancel</Button>
                  <Button type="submit" variant="contained" color="primary" disabled={requestLoading} startIcon={requestLoading ? <CircularProgress size={18} color="inherit" /> : null}>
                    {requestLoading ? 'Sending...' : 'Send Request'}
                  </Button>
                </Box>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Size Guide Dialog */}
        <Dialog open={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle
            sx={{
              background: theme.palette.mode === 'dark' ? '#232a36' : '#f8fafc',
              color: theme.palette.mode === 'dark' ? '#ffcc33' : theme.palette.primary.main,
              fontWeight: 700,
              fontSize: 20,
              letterSpacing: 1.1,
            }}
          >
            Size Guide
          </DialogTitle>
          <DialogContent dividers sx={{ background: theme.palette.mode === 'dark' ? '#232a36' : '#fff' }}>
            <Typography variant="subtitle1" mb={2} sx={{ color: theme.palette.mode === 'dark' ? 'grey.300' : 'text.secondary' }}>
              Our size guide helps you find the perfect fit. Please note that measurements are approximate and may vary slightly by design.
            </Typography>
            <Box mb={2} display="flex" alignItems="center" gap={2}>
              <Button
                variant={sizeGuideUnit === 'in' ? 'contained' : 'outlined'}
                color="primary"
                size="small"
                onClick={() => setSizeGuideUnit('in')}
                sx={{ minWidth: 80, fontWeight: 700, fontSize: 15 }}
              >
                Inches
              </Button>
              <Button
                variant={sizeGuideUnit === 'cm' ? 'contained' : 'outlined'}
                color="primary"
                size="small"
                onClick={() => setSizeGuideUnit('cm')}
                sx={{ minWidth: 80, fontWeight: 700, fontSize: 15 }}
              >
                Centimeters
              </Button>
            </Box>
            <Box mb={2}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: 15,
                  background: theme.palette.mode === 'dark' ? '#232a36' : '#fff',
                  color: theme.palette.mode === 'dark' ? '#fff' : '#222',
                  borderRadius: 8,
                  overflow: 'hidden',
                  boxShadow: theme.palette.mode === 'dark' ? '0 2px 12px #0004' : '0 1px 8px #e0e7ef88',
                }}
              >
                <thead>
                  <tr style={{ background: theme.palette.mode === 'dark' ? '#181c24' : theme.palette.grey._f8fafc }}>
                    <th style={{ padding: 10, border: `1.5px solid ${theme.palette.mode === 'dark' ? '#333a48' : theme.palette.grey.e0e7ef}` }}>Size</th>
                    <th style={{ padding: 10, border: `1.5px solid ${theme.palette.mode === 'dark' ? '#333a48' : theme.palette.grey.e0e7ef}` }}>Bust ({sizeGuideUnit})</th>
                    <th style={{ padding: 10, border: `1.5px solid ${theme.palette.mode === 'dark' ? '#333a48' : theme.palette.grey.e0e7ef}` }}>Waist ({sizeGuideUnit})</th>
                    <th style={{ padding: 10, border: `1.5px solid ${theme.palette.mode === 'dark' ? '#333a48' : theme.palette.grey.e0e7ef}` }}>Hips ({sizeGuideUnit})</th>
                  </tr>
                </thead>
                <tbody>
                  {sizeGuideData.map((row) => (
                    <tr key={row.size} style={{ background: theme.palette.mode === 'dark' ? '#232a36' : '#fff' }}>
                      <td style={{ padding: 10, border: `1.5px solid ${theme.palette.mode === 'dark' ? '#333a48' : theme.palette.grey.e0e7ef}` }}>{row.size}</td>
                      <td style={{ padding: 10, border: `1.5px solid ${theme.palette.mode === 'dark' ? '#333a48' : theme.palette.grey.e0e7ef}` }}>{sizeGuideUnit === 'in' ? `${row.bust[0]}-${row.bust[1]}` : `${row.bustCm[0]}-${row.bustCm[1]}`}</td>
                      <td style={{ padding: 10, border: `1.5px solid ${theme.palette.mode === 'dark' ? '#333a48' : theme.palette.grey.e0e7ef}` }}>{sizeGuideUnit === 'in' ? `${row.waist[0]}-${row.waist[1]}` : `${row.waistCm[0]}-${row.waistCm[1]}`}</td>
                      <td style={{ padding: 10, border: `1.5px solid ${theme.palette.mode === 'dark' ? '#333a48' : theme.palette.grey.e0e7ef}` }}>{sizeGuideUnit === 'in' ? `${row.hips[0]}-${row.hips[1]}` : `${row.hipsCm[0]}-${row.hipsCm[1]}`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
            <Typography variant="body2" color={theme.palette.mode === 'dark' ? 'grey.400' : 'text.secondary'}>
              For custom sizing or more details, please contact us directly.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ background: theme.palette.mode === 'dark' ? '#232a36' : '#f8fafc' }}>
            <Button onClick={() => setSizeGuideOpen(false)} color="primary" variant="contained" sx={{ fontWeight: 700, fontSize: 16, borderRadius: 2 }}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Load More Button */}
        {hasMore && (
          <Box mt={4} textAlign="center">
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={loadMoreDesigns}
              sx={{
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontWeight: 700,
                fontSize: 18,
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)'
                  : 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)',
                color: '#fff',
                boxShadow: theme.palette.mode === 'dark' ? 8 : 4,
                '&:hover': {
                  background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(90deg, #1565c0 0%, #1976d2 100%)'
                    : 'linear-gradient(90deg, #1565c0 0%, #1976d2 100%)',
                  boxShadow: theme.palette.mode === 'dark' ? 12 : 6,
                  transform: 'scale(1.05)',
                },
              }}
              disabled={loadingMore}
              startIcon={loadingMore ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {loadingMore ? 'Loading more...' : 'Load More Designs'}
            </Button>
          </Box>
        )}
      </Container>
    </>
  );
}

export default Fashion;
