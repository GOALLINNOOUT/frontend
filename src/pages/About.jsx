import { Box, Typography, Grid, Paper, Avatar, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import ownerImg from '../assets/WhatsApp Image 2025-06-30 at 14.59.33_e255ed3b.jpg';
import { Helmet } from 'react-helmet-async';

function About() {
  const theme = useTheme();
  return (
    <>
      <Helmet>
        <title>About | JC's Closet</title>
        <meta name="description" content="Learn more about JC's Closet, our mission, and the team behind your favorite fashion and fragrance destination." />
      </Helmet>
      <Box
        component={motion.main}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        sx={{
          width: '100vw',
          minHeight: '100vh',
          px: { xs: 0, md: 0 },
          py: { xs: 2, md: 6 },
          bgcolor: `linear-gradient(135deg, ${theme.palette.grey.f8fafc} 0%, ${theme.palette.grey.e0e7ff} 100%)`,
          overflowX: 'hidden',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Box sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 1, sm: 2, md: 4 }, width: '100%' }}>
          <Typography
            variant="h3"
            fontWeight={700}
            color="primary"
            gutterBottom
            sx={{
              textAlign: 'center',
              letterSpacing: 1,
              mb: { xs: 2, md: 4 },
              textShadow: theme.palette.grey._textShadowBlue08,
            }}
          >
            About JC's Closet
          </Typography>
          <Grid container spacing={{ xs: 2, md: 6 }} alignItems="center" sx={{ mb: 4 }}>
            <Grid item xs={12} md={5}>
              <Paper
                elevation={6}
                sx={{
                  p: { xs: 2, sm: 3 },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  bgcolor: theme.palette.grey._rgbaWhite95,
                  borderRadius: 4,
                  boxShadow: theme.palette.grey._boxShadowBlue12,
                  border: '2px solid',
                  borderColor: 'primary.light',
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: 420,
                }}
                component={motion.div}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.7 }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: 16,
                    background: `linear-gradient(90deg, ${theme.palette.grey._a5b4fc} 0%, ${theme.palette.grey._f472b6} 100%)`,
                    zIndex: 1,
                  }}
                />
                <Avatar
                  src={ownerImg}
                  alt="Brand Owner"
                  sx={{ width: { xs: 180, sm: 220, md: 260 }, height: { xs: 180, sm: 220, md: 260 }, mb: 2, boxShadow: 6, border: '4px solid', borderColor: 'primary.main', zIndex: 2 }}
                  imgProps={{ loading: 'lazy', style: { objectFit: 'cover' } }}
                />
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mt: 1, zIndex: 2 }}>
                  Adeyekun Anjolaoluwa
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ zIndex: 2 }}>
                  Founder & Creative Director
                </Typography>
                <Typography variant="body1" sx={{ mt: 2, zIndex: 2, fontStyle: 'italic', color: 'text.primary' }} align="center">
                  Jola is passionate about empowering individuals to express their unique style. With years of experience in fashion and fragrance, she leads JC's Closet with creativity, vision, and a commitment to excellence.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={7}>
              <Box
                component={motion.div}
                initial={{ x: 40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.7 }}
                sx={{
                  bgcolor: theme.palette.grey._rgbaWhite85,
                  borderRadius: 4,
                  p: { xs: 2, sm: 3, md: 4 },
                  boxShadow: theme.palette.grey._boxShadowBlue10,
                  border: '1.5px solid',
                  borderColor: 'secondary.light',
                  minHeight: 420,
                }}
              >
                <Typography variant="body1" sx={{ mb: 2, fontSize: { xs: 16, md: 18 } }}>
                  JC's Closet was founded with a passion for helping individuals express their unique style through fashion and fragrance. Our journey began with a simple belief: everyone deserves to feel confident and inspired by what they wear and how they present themselves.
                </Typography>
                <Typography variant="h5" fontWeight={700} color="secondary" sx={{ mt: 2, mb: 1, letterSpacing: 0.5 }}>
                  Our Mission
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, fontSize: { xs: 16, md: 18 } }}>
                  To empower our clients with curated collections, expert advice, and a personalized approach to style and scent.
                </Typography>
                <Typography variant="h5" fontWeight={700} color="secondary" sx={{ mt: 2, mb: 1, letterSpacing: 0.5 }}>
                  Our Vision
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, fontSize: { xs: 16, md: 18 } }}>
                  To be the go-to destination for fashion enthusiasts and fragrance lovers seeking authenticity, creativity, and quality.
                </Typography>
                <Typography variant="h5" fontWeight={700} color="secondary" sx={{ mt: 2, mb: 1, letterSpacing: 0.5 }}>
                  Why Choose Us?
                </Typography>
                <Box component="ul" sx={{ pl: 3, mb: 2, fontSize: { xs: 16, md: 18 }, color: 'text.primary' }}>
                  <li><Typography variant="body1">Handpicked, high-quality products</Typography></li>
                  <li><Typography variant="body1">Personalized style and scent recommendations</Typography></li>
                  <li><Typography variant="body1">Expert team with years of industry experience</Typography></li>
                  <li><Typography variant="body1">Commitment to customer satisfaction</Typography></li>
                </Box>
                <Typography variant="h5" fontWeight={700} color="secondary" sx={{ mt: 2, mb: 1, letterSpacing: 0.5 }}>
                  Our Story
                </Typography>
                <Typography variant="body1" sx={{ fontSize: { xs: 16, md: 18 } }}>
                  From humble beginnings, JC's Closet has grown into a trusted brand, serving a diverse clientele with a love for fashion and fragrance. We believe in celebrating individuality, supporting sustainable practices, and building a community where everyone feels welcome.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </>
  );
}

export default About;
