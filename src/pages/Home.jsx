import { Box, Typography, Button, Stack, useTheme, ButtonBase } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VerifiedIcon from '@mui/icons-material/Verified';
import ReplayIcon from '@mui/icons-material/Replay';
import { motion } from 'framer-motion';
import dressImg from '../assets/dress.jpg';
import stockImg from '../assets/istockphoto-92682250-612x612.webp';
// Icon imports for visual enhancement
import LocalMallIcon from '@mui/icons-material/LocalMall';
import StyleIcon from '@mui/icons-material/Style';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import ArticleIcon from '@mui/icons-material/Article';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import InstagramIcon from '@mui/icons-material/Instagram';
import StarRateIcon from '@mui/icons-material/StarRate';
import HandshakeIcon from '@mui/icons-material/Handshake';
import NewsletterForm from '../components/NewsletterForm';
import { Helmet } from 'react-helmet-async';
import React, { useEffect, useState } from 'react';
import { get, post } from '../utils/api';



function Home() {
  const theme = useTheme();
  // --- Review State ---
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewError, setReviewError] = useState(null);
  const [reviewForm, setReviewForm] = useState({ name: '', review: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState('');

  // Ref for reviews section
  const reviewsRef = React.useRef(null);

  useEffect(() => {
    async function fetchReviews() {
      setLoadingReviews(true);
      try {
        // Fetch only the last 6 approved reviews, sorted by most recent
        const res = await get('/reviews?approved=true&limit=6&sort=-createdAt');
        if (res.ok) setReviews(res.data);
        setReviewError(null);
      } catch (err) {
        setReviewError('Could not load reviews.');
      } finally {
        setLoadingReviews(false);
      }
    }
    fetchReviews();
  }, []);

  const handleReviewChange = e => {
    setReviewForm({ ...reviewForm, [e.target.name]: e.target.value });
  };

  const handleReviewSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMsg('');
    try {
      await post('/reviews', reviewForm);
      setReviewForm({ name: '', review: '' });
      setSubmitMsg('Thank you for your review!');
      // Refetch reviews to ensure only approved reviews are shown
      try {
        const res = await get('/reviews?approved=true');
        if (res.ok) setReviews(res.data);
        setReviewError(null);
      } catch {
        // ignore error here, user just submitted
      }
    } catch (err) {
      setSubmitMsg('Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  // Scroll to reviews section
  const scrollToReviews = () => {
    if (reviewsRef.current) {
      reviewsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <Helmet>
        <title>Home | JC's Closet</title>
        <meta name="description" content="Discover curated perfumes, exclusive fashion pieces, and personalized style advice at JC's Closet. Where Fashion Meets Fragrance." />
      </Helmet>
      <main
        style={{
          width: '100vw',
          minHeight: '100vh',
          background: `linear-gradient(135deg, ${theme.palette.background.default} 60%, ${theme.palette.primary.light} 100%)`,
          overflowX: 'hidden',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 1400, mx: 'auto', px: { xs: 1, md: 3 }, py: { xs: 2, md: 4 } }}>
          {/* Hero Section with Collage and Gradient Overlay */}
          <Box
            component={motion.section}
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            sx={{
              position: 'relative',
              minHeight: { xs: 360, md: 440 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 7,
              borderRadius: theme.shape.borderRadius * 2,
              overflow: 'hidden',
              boxShadow: 6,
              background: `linear-gradient(120deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            }}
          >
            {/* Collage Hero Images */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'row',
                gap: 0,
                zIndex: 0,
              }}
            >
              <img
                src={dressImg}
                alt="Dress hero"
                style={{
                  flex: 1,
                  width: '50%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  borderRadius: `${theme.shape.borderRadius * 2.2}px 0 0 ${theme.shape.borderRadius * 2.2}px`,
                  filter: 'brightness(0.82) saturate(1.15)',
                  margin: 0,
                  padding: 0,
                  display: 'block',
                  boxShadow: '0 0 32px 0 rgba(0,0,0,0.12)',
                }}
              />
              <img
                src={stockImg}
                alt="Fashion collage"
                style={{
                  flex: 1,
                  width: '50%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  borderRadius: `0 ${theme.shape.borderRadius * 2.2}px ${theme.shape.borderRadius * 2.2}px 0`,
                  filter: 'brightness(0.82) saturate(1.15)',
                  margin: 0,
                  padding: 0,
                  display: 'block',
                  boxShadow: '0 0 32px 0 rgba(0,0,0,0.12)',
                }}
              />
            </Box>
            {/* Gradient Overlay for better contrast */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: theme.palette.mode === 'dark'
                  ? 'rgba(10,10,10,0.82)'
                  : 'rgba(30,30,30,0.72)',
                zIndex: 1,
              }}
            />
            {/* Content */}
            <Box
              sx={{
                position: 'relative',
                zIndex: 2,
                color: '#fff',
                textAlign: 'center',
                width: { xs: '100%', md: '70%' },
                p: { xs: 2, md: 5 },
              }}
            >
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontWeight: 900,
                  mb: 2,
                  color: '#fff',
                  textShadow: '0 4px 24px #000b, 0 1px 0 #fff2',
                  letterSpacing: 1.5,
                }}
              >
                Welcome to JC's Closet
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  mb: 3,
                  color: '#fff',
                  textShadow: '0 2px 12px #000a',
                  fontWeight: 600,
                }}
              >
                Where Fashion Meets Fragrance
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mb: 3,
                  color: '#fff',
                  textShadow: '0 1px 8px #0007',
                  fontWeight: 500,
                  fontSize: { xs: '1.05rem', md: '1.18rem' },
                }}
              >
                Discover curated perfumes, exclusive fashion pieces, and personalized style advice. Refresh your wardrobe, find your signature scent, and get expert tips—all in one place.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                <Button
                  variant="contained"
                  size="large"
                  href="/perfumes"
                  sx={{
                    background: `linear-gradient(90deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
                    color: theme.palette.getContrastText(theme.palette.primary.main),
                    fontWeight: 700,
                    px: 4,
                    boxShadow: 3,
                    borderRadius: 3,
                    '&:hover': {
                      background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                      color: theme.palette.getContrastText(theme.palette.secondary.main),
                    },
                  }}
                >
                  Shop Perfumes
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  href="/appointments"
                  sx={{
                    borderColor: theme.palette.info.light,
                    color: theme.palette.info.light,
                    fontWeight: 700,
                    px: 4,
                    borderRadius: 3,
                    background: 'rgba(255,255,255,0.08)',
                    '&:hover': {
                      background: theme.palette.secondary.light,
                      color: theme.palette.primary.dark,
                      borderColor: theme.palette.secondary.main,
                    },
                  }}
                >
                  Book Appointment
                </Button>
              </Stack>
            </Box>
          </Box>

          {/* Info & Engagement Section */}
          <Box sx={{
            mb: 5,
            background: theme.palette.mode === 'light'
              ? `linear-gradient(120deg, #fff 60%, ${theme.palette.secondary.light} 100%)`
              : `linear-gradient(120deg, ${theme.palette.background.paper} 60%, ${theme.palette.secondary.light} 100%)`,
            borderRadius: theme.shape.borderRadius * 1.5,
            p: { xs: 2, md: 4 },
            boxShadow: 2,
          }}>
            <Typography
              variant="h4"
              sx={{ mb: 2, fontWeight: 700, color: theme.palette.primary.main, letterSpacing: 1 }}
            >
              What We Offer
            </Typography>
            <Stack spacing={2} direction="column">
              <ButtonBase
                component="a"
                href="/perfumes"
                sx={{ width: '100%', textAlign: 'left', borderRadius: 2, p: 0 }}
              >
                <Box
                  component={motion.div}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.5 }}
                  sx={{
                    display: 'flex', alignItems: 'center', p: 2, borderRadius: 2,
                    boxShadow: 'none',
                    background: theme.palette.mode === 'light' ? '#f7f7fa' : theme.palette.background.default,
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 1,
                    width: '100%',
                  }}
                  style={{ boxShadow: theme.shadows[1] || '0px 1px 3px rgba(0,0,0,0.12)' }}
                >
                  <LocalMallIcon sx={{ color: theme.palette.secondary.main, mr: { sm: 1, xs: 0 }, mb: { xs: 1, sm: 0 }, fontSize: 32 }} />
                  <Typography component="span" sx={{ color: theme.palette.text.primary, fontSize: '1.1rem', textAlign: { xs: 'center', sm: 'left' }, fontWeight: 600 }}>
                    Shop our <strong style={{ color: theme.palette.secondary.main }}> Perfume Collection </strong> for the latest and classic scents.
                  </Typography>
                </Box>
              </ButtonBase>
              <ButtonBase
                component="a"
                href="/fashion"
                sx={{ width: '100%', textAlign: 'left', borderRadius: 2, p: 0 }}
              >
                <Box
                  component={motion.div}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  sx={{
                    display: 'flex', alignItems: 'center', p: 2, borderRadius: 2,
                    boxShadow: 'none',
                    background: theme.palette.mode === 'light' ? '#f7f7fa' : theme.palette.background.default,
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 1,
                    width: '100%',
                  }}
                  style={{ boxShadow: theme.shadows[1] || '0px 1px 3px rgba(0,0,0,0.12)' }}
                >
                  <StyleIcon sx={{ color: theme.palette.secondary.main, mr: { sm: 1, xs: 0 }, mb: { xs: 1, sm: 0 }, fontSize: 32 }} />
                  <Typography component="span" sx={{ color: theme.palette.text.primary, fontSize: '1.1rem', textAlign: { xs: 'center', sm: 'left' }, fontWeight: 600 }}>
                    Browse the <strong style={{ color: theme.palette.secondary.main }}> Fashion Portfolio </strong> to see our unique designs and styling ideas.
                  </Typography>
                </Box>
              </ButtonBase>
              <ButtonBase
                component="a"
                href="/style-guide"
                sx={{ width: '100%', textAlign: 'left', borderRadius: 2, p: 0 }}
              >
                <Box
                  component={motion.div}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  sx={{
                    display: 'flex', alignItems: 'center', p: 2, borderRadius: 2,
                    boxShadow: 'none',
                    background: theme.palette.mode === 'light' ? '#f7f7fa' : theme.palette.background.default,
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 1,
                    width: '100%',
                  }}
                  style={{ boxShadow: theme.shadows[1] || '0px 1px 3px rgba(0,0,0,0.12)' }}
                >
                  <TipsAndUpdatesIcon sx={{ color: theme.palette.primary.main, mr: { sm: 1, xs: 0 }, mb: { xs: 1, sm: 0 }, fontSize: 32 }} />
                  <Typography component="span" sx={{ color: theme.palette.text.primary, fontSize: '1.1rem', textAlign: { xs: 'center', sm: 'left' }, fontWeight: 600 }}>
                    Use our <strong style={{ color: theme.palette.primary.main }}> Style Guide </strong> for personalized recommendations.
                  </Typography>
                </Box>
              </ButtonBase>
              <ButtonBase
                component="a"
                href="/appointments"
                sx={{ width: '100%', textAlign: 'left', borderRadius: 2, p: 0 }}
              >
                <Box
                  component={motion.div}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  sx={{
                    display: 'flex', alignItems: 'center', p: 2, borderRadius: 2,
                    boxShadow: 'none',
                    background: theme.palette.mode === 'light' ? '#f7f7fa' : theme.palette.background.default,
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 1,
                    width: '100%',
                  }}
                  style={{ boxShadow: theme.shadows[1] || '0px 1px 3px rgba(0,0,0,0.12)' }}
                >
                  <EventAvailableIcon sx={{ color: theme.palette.primary.main, mr: { sm: 1, xs: 0 }, mb: { xs: 1, sm: 0 }, fontSize: 32 }} />
                  <Typography component="span" sx={{ color: theme.palette.text.primary, fontSize: '1.1rem', textAlign: { xs: 'center', sm: 'left' }, fontWeight: 600 }}>
                    Book an <strong style={{ color: theme.palette.primary.main }}> Appointment </strong> for one-on-one consultations.
                  </Typography>
                </Box>
              </ButtonBase>
              <ButtonBase
                component="a"
                href="/blog"
                sx={{ width: '100%', textAlign: 'left', borderRadius: 2, p: 0 }}
              >
                <Box
                  component={motion.div}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  sx={{
                    display: 'flex', alignItems: 'center', p: 2, borderRadius: 2,
                    boxShadow: 'none',
                    background: theme.palette.mode === 'light' ? '#f7f7fa' : theme.palette.background.default,
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 1,
                    width: '100%',
                  }}
                  style={{ boxShadow: theme.shadows[1] || '0px 1px 3px rgba(0,0,0,0.12)' }}
                >
                  <ArticleIcon sx={{ color: theme.palette.secondary.main, mr: { sm: 1, xs: 0 }, mb: { xs: 1, sm: 0 }, fontSize: 32 }} />
                  <Typography component="span" sx={{ color: theme.palette.text.primary, fontSize: '1.1rem', textAlign: { xs: 'center', sm: 'left' }, fontWeight: 600 }}>
                    Stay updated with our <strong style={{ color: theme.palette.secondary.main }}> Blog </strong> for news, tips, and trends.
                  </Typography>
                </Box>
              </ButtonBase>
            </Stack>
          </Box>

          {/* User Involvement Section */}
          <Box sx={{
            mb: 5,
            background: `linear-gradient(120deg, ${theme.palette.info.main} 60%, ${theme.palette.primary.light} 100%)`,
            borderRadius: theme.shape.borderRadius * 1.5,
            p: { xs: 2, md: 4 },
            boxShadow: 2,
          }}>
            <Typography
              variant="h4"
              sx={{ mb: 2, fontWeight: 700, color: theme.palette.primary.main, letterSpacing: 1 }}
            >
              Get Involved
            </Typography>
            <Stack spacing={2} direction="column">
             
              <ButtonBase
                component="div"
                sx={{ width: '100%', textAlign: 'left', borderRadius: 2, p: 0 }}
                id="newsletter"
              >
                <Box
                  component={motion.div}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.5 }}
                  sx={{
                    display: 'flex', alignItems: 'center', p: 2, borderRadius: 2,
                    boxShadow: 'none',
                    background: theme.palette.info.light,
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2,
                    width: '100%',
                  }}
                  style={{ boxShadow: theme.shadows[1] || '0px 1px 3px rgba(0,0,0,0.12)' }}
                >
                  <MailOutlineIcon sx={{ color: theme.palette.secondary.main, mr: { sm: 1, xs: 0 }, mb: { xs: 1, sm: 0 }, fontSize: 32 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography component="span" sx={{ color: theme.palette.primary.contrastText, fontSize: '1.1rem', textAlign: { xs: 'center', sm: 'left' } }}>
                      Sign up for our{' '}
                      <span style={{ color: theme.palette.secondary.main, textDecoration: 'underline', fontWeight: 600 }}>
                        newsletter
                      </span>{' '}
                      to receive exclusive offers and style tips.
                    </Typography>
                    {/* Newsletter Form */}
                    <NewsletterForm />
                  </Box>
                </Box>
              </ButtonBase>
              <ButtonBase
                component="a"
                href="https://instagram.com/explore/tags/jcscloset"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ width: '100%', textAlign: 'left', borderRadius: 2, p: 0 }}
              >
                <Box
                  component={motion.div}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  sx={{
                    display: 'flex', alignItems: 'center', p: 2, borderRadius: 2,
                    boxShadow: 'none',
                    background: theme.palette.info.light,
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 1,
                    width: '100%',
                  }}
                  style={{ boxShadow: theme.shadows[1] || '0px 1px 3px rgba(0,0,0,0.12)' }}
                >
                  <InstagramIcon sx={{ color: theme.palette.primary.main, mr: { sm: 1, xs: 0 }, mb: { xs: 1, sm: 0 }, fontSize: 32 }} />
                  <Typography component="span" sx={{ color: theme.palette.primary.contrastText, fontSize: '1.1rem', textAlign: { xs: 'center', sm: 'left' } }}>
                    Share your looks with <strong style={{ color: theme.palette.primary.main }}> #JCsCloset </strong> on Instagram for a chance to be featured.
                  </Typography>
                </Box>
              </ButtonBase>
              <ButtonBase
                component="button"
                type="button"
                onClick={scrollToReviews}
                sx={{ width: '100%', textAlign: 'left', borderRadius: 2, p: 0, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <Box
                  component={motion.div}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  sx={{
                    display: 'flex', alignItems: 'center', p: 2, borderRadius: 2,
                    boxShadow: 'none',
                    background: theme.palette.info.light,
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 1,
                    width: '100%',
                  }}
                  style={{ boxShadow: theme.shadows[1] || '0px 1px 3px rgba(0,0,0,0.12)' }}
                >
                  <StarRateIcon sx={{ color: theme.palette.secondary.main, mr: { sm: 1, xs: 0 }, mb: { xs: 1, sm: 0 }, fontSize: 32 }} />
                  <Typography component="span" sx={{ color: theme.palette.primary.contrastText, fontSize: '1.1rem', textAlign: { xs: 'center', sm: 'left' } }}>
                    Leave a review or testimonial to help others discover JC's Closet.
                  </Typography>
                </Box>
              </ButtonBase>
              <ButtonBase
                component="a"
                href="/contact#collaborations"
                sx={{ width: '100%', textAlign: 'left', borderRadius: 2, p: 0 }}
              >
                <Box
                  component={motion.div}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  sx={{
                    display: 'flex', alignItems: 'center', p: 2, borderRadius: 2,
                    boxShadow: 'none',
                    background: theme.palette.info.light,
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 1,
                    width: '100%',
                  }}
                  style={{ boxShadow: theme.shadows[1] || '0px 1px 3px rgba(0,0,0,0.12)' }}
                >
                  <HandshakeIcon sx={{ color: theme.palette.primary.main, mr: { sm: 1, xs: 0 }, mb: { xs: 1, sm: 0 }, fontSize: 32 }} />
                  <Typography component="span" sx={{ color: theme.palette.primary.contrastText, fontSize: '1.1rem', textAlign: { xs: 'center', sm: 'left' } }}>
                    Contact us for collaborations, partnerships, or custom requests.
                  </Typography>
                </Box>
              </ButtonBase>
            </Stack>
          </Box>

          {/* About Us & Benefits Section */}
          <Box sx={{
            mb: 5,
            background: `linear-gradient(120deg, ${theme.palette.background.paper} 60%, ${theme.palette.primary.light} 100%)`,
            borderRadius: theme.shape.borderRadius * 1.5,
            p: { xs: 2, md: 5 },
            boxShadow: 3,
          }}>
            <Typography variant="h4" sx={{ mb: 2, fontWeight: 900, color: theme.palette.primary.main, letterSpacing: 1 }}>
              About JC's Closet
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, color: theme.palette.text.primary, fontWeight: 500, fontSize: { xs: '1.05rem', md: '1.15rem' } }}>
              JC's Closet is your destination for curated perfumes and exclusive fashion pieces. Our mission is to empower you to express your unique style with confidence, offering only authentic products, expert advice, and a seamless shopping experience.
            </Typography>
            <Typography variant="h6" sx={{ mt: 2, mb: 1, color: theme.palette.secondary.main, fontWeight: 700 }}>
              Why Shop With Us?
            </Typography>
            <ul style={{ margin: 0, paddingLeft: 20, color: theme.palette.text.primary, fontWeight: 500, fontSize: '1.08rem' }}>
              <li>Wide selection of premium perfumes and fashion</li>
              <li>Personalized style recommendations</li>
              <li>Secure payments & easy returns</li>
              <li>Exclusive offers for subscribers</li>
              <li>One-on-one styling sessions</li>
            </ul>
          </Box>

          {/* Our Process Section */}
          <Box sx={{
            mb: 5,
            background: `linear-gradient(120deg, ${theme.palette.info.light} 60%, ${theme.palette.secondary.light} 100%)`,
            borderRadius: theme.shape.borderRadius * 1.5,
            p: { xs: 2, md: 5 },
            boxShadow: 2,
          }}>
            <Typography variant="h4" sx={{ mb: 2, fontWeight: 900, color: theme.palette.primary.main, letterSpacing: 1 }}>
              How It Works
            </Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="flex-start" justifyContent="center">
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ color: theme.palette.secondary.main, mb: 1, fontWeight: 700 }}>
                  1. Explore
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: 500 }}>
                  Browse our curated collections of perfumes and fashion. Use filters and guides to find your perfect match.
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ color: theme.palette.secondary.main, mb: 1, fontWeight: 700 }}>
                  2. Personalize
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: 500 }}>
                  Get personalized recommendations or book a styling session for expert advice tailored to you.
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ color: theme.palette.secondary.main, mb: 1, fontWeight: 700 }}>
                  3. Purchase
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: 500 }}>
                  Enjoy secure checkout with Paystack, fast delivery, and easy returns. Track your order and stay updated every step of the way.
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* Reviews Section */}
          <Box
            ref={reviewsRef}
            sx={{
              mb: 6,
              background: `linear-gradient(120deg, ${theme.palette.background.paper} 60%, ${theme.palette.primary.light} 100%)`,
              borderRadius: theme.shape.borderRadius * 1.5,
              p: { xs: 2, md: 5 },
              boxShadow: 3,
            }}
          >
            <Typography variant="h4" sx={{ mb: 2, fontWeight: 900, color: theme.palette.primary.main, letterSpacing: 1 }}>
              Customer Reviews
            </Typography>
            {loadingReviews ? (
              <Typography sx={{ color: theme.palette.text.secondary }}>Loading reviews...</Typography>
            ) : reviewError ? (
              <Typography sx={{ color: 'error.main' }}>{reviewError}</Typography>
            ) : (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }} useFlexGap flexWrap="wrap">
                {reviews.length === 0 ? (
                  <Typography>No reviews yet. Be the first to leave one!</Typography>
                ) : (
                  reviews.map(r => (
                    <Box
                      key={r._id || r.createdAt}
                      sx={{
                        flex: '1 1 220px',
                        minWidth: 220,
                        maxWidth: 340,
                        p: 3,
                        borderRadius: 3,
                        background: `linear-gradient(120deg, ${theme.palette.background.default} 60%, ${theme.palette.secondary.light} 100%)`,
                        boxShadow: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        position: 'relative',
                        border: `1.5px solid ${theme.palette.secondary.light}`,
                        transition: 'box-shadow 0.2s',
                        '&:hover': {
                          boxShadow: 8,
                        },
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: theme.palette.secondary.dark, fontSize: '1.08rem', mb: 1, wordBreak: 'break-word' }}>
                        "{r.review}"
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.primary.main, fontWeight: 600, mt: 1 }}>
                        – {r.name}
                      </Typography>
                    </Box>
                  ))
                )}
              </Stack>
            )}
            {/* Review Form */}
            <Box component="form" sx={{ mt: 2 }} onSubmit={handleReviewSubmit}>
              <Typography variant="h6" sx={{ mb: 1, color: theme.palette.secondary.main, fontWeight: 700 }}>
                Leave a Review
              </Typography>
              <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }}>
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  required
                  value={reviewForm.name}
                  onChange={handleReviewChange}
                  disabled={submitting}
                  style={{
                    flex: 1,
                    padding: 10,
                    borderRadius: 8,
                    border: `1.5px solid ${theme.palette.secondary.main}`,
                    background: theme.palette.background.default,
                    color: theme.palette.text.primary,
                    fontWeight: 600,
                  }}
                />
                <input
                  type="text"
                  name="review"
                  placeholder="Your Review"
                  required
                  value={reviewForm.review}
                  onChange={handleReviewChange}
                  disabled={submitting}
                  style={{
                    flex: 2,
                    padding: 10,
                    borderRadius: 8,
                    border: `1.5px solid ${theme.palette.secondary.main}`,
                    background: theme.palette.background.default,
                    color: theme.palette.text.primary,
                    fontWeight: 600,
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="secondary"
                  sx={{ fontWeight: 700, px: 3, borderRadius: 2 }}
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </Button>
              </Stack>
              {submitMsg && (
                <Typography sx={{ mt: 1, color: submitMsg.startsWith('Thank') ? 'success.main' : 'error.main', fontWeight: 600 }}>{submitMsg}</Typography>
              )}
            </Box>
          </Box>

          {/* Trust Badges & Guarantees Section */}
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
            mb: 4,
            mt: 2,
            p: 2,
            background: `linear-gradient(90deg, ${theme.palette.background.paper} 60%, ${theme.palette.secondary.light} 100%)`,
            borderRadius: theme.shape.borderRadius * 1.5,
            boxShadow: 2,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <LockOutlinedIcon sx={{ color: theme.palette.primary.main, fontSize: 32 }} />
              <Typography variant="body2" sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>
                Secure Payment
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <VerifiedIcon sx={{ color: theme.palette.secondary.main, fontSize: 32 }} />
              <Typography variant="body2" sx={{ color: theme.palette.secondary.main, fontWeight: 700 }}>
                100% Satisfaction Guarantee
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <ReplayIcon sx={{ color: theme.palette.info.main, fontSize: 32 }} />
              <Typography variant="body2" sx={{ color: theme.palette.info.main, fontWeight: 700 }}>
                Easy Returns
              </Typography>
            </Box>
          </Box>

          {/* Call to Action */}
          <Box sx={{ textAlign: 'center', mt: 7 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: 2,
                color: theme.palette.primary.main,
                textShadow: '0 2px 12px #0005',
                letterSpacing: 1,
              }}
            >
              Ready to elevate your style?
            </Typography>
            <Button
              variant="contained"
              size="large"
              href="/appointments"
              sx={{
                background: `linear-gradient(90deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
                color: theme.palette.getContrastText(theme.palette.primary.main),
                fontWeight: 700,
                px: 5,
                py: 1.5,
                borderRadius: 3,
                boxShadow: 4,
                fontSize: '1.15rem',
                '&:hover': {
                  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  color: theme.palette.getContrastText(theme.palette.secondary.main),
                },
              }}
            >
              Book Your Style Session Now
            </Button>
          </Box>
        </Box>
      </main>
    </>
  );
}

export default Home;
