import { Box, Typography, Link as MuiLink } from '@mui/material'
import InstagramIcon from '@mui/icons-material/Instagram';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';
import TwitterIcon from '@mui/icons-material/Twitter';
import SvgIcon from '@mui/material/SvgIcon';
import { motion } from 'framer-motion'
import logoImg from '../assets/WhatsApp Image 2025-06-30 at 14.59.32_f1f86020.jpg'

// TikTok SVG Icon
function TikTokIcon(props) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path d="M12.75 2h2.25c.41 2.09 2.13 3.72 4.25 3.97v2.21c-1.01-.01-2.01-.19-2.95-.54v7.86c0 3.31-2.69 6-6 6s-6-2.69-6-6 2.69-6 6-6c.13 0 .25 0 .38.01v2.22c-.13-.01-.25-.01-.38-.01-2.09 0-3.78 1.69-3.78 3.78s1.69 3.78 3.78 3.78 3.78-1.69 3.78-3.78V2z" fill="#000"/>
    </SvgIcon>
  );
}

function Footer() {
  return (
    <Box component={motion.footer}
      sx={{
        mt: 4,
        py: 2,
        textAlign: 'center',
        bgcolor: 'background.paper',
        color: 'text.secondary',
        boxShadow: 1,
        width: '99%',
        left: 0,
        position: 'relative',
        overflowX: 'hidden',
      }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
        <img src={logoImg} alt="JC's Closet Logo" style={{ height: 80, width: 'auto', borderRadius: 8, objectFit: 'cover', boxShadow: 'none' }} />
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
        JC's Closet
      </Typography>
      <Typography variant="body2" sx={{ mb: 0.5 }}>
        Fashion | Perfume | Style
      </Typography>
      <Typography variant="body2" sx={{ mb: 1, color: 'text.primary', fontWeight: 400 }}>
        JC's Closet is your destination for curated fashion, luxury perfumes, and personalized style guidance. We blend elegance and trend to help you express your unique personality, whether for everyday looks or special occasions.
      </Typography>
      <Typography variant="caption" sx={{ mb: 2, display: 'block', color: 'text.secondary' }}>
        Discover the latest collections, book a style appointment, or subscribe to our newsletter for exclusive updates and offers.
      </Typography>
      <Typography variant="body2" sx={{ mb: 0.5 }}>
        Contact: <MuiLink href="mailto:favouradeyekun@gmail.com" underline="hover">favouradeyekun@gmail.com</MuiLink> | <MuiLink href="tel:+2348022335287" underline="hover">+234 802 233 5287</MuiLink>
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 1 }}>
        {/* Social media icons and contact */}
        <MuiLink href="mailto:favouradeyekun@gmail.com" underline="none" color="inherit" aria-label="Email">
          <EmailIcon sx={{ fontSize: 24, color: '#1976d2' }} />
        </MuiLink>
        <MuiLink href="https://wa.me/2348022335287" underline="none" color="inherit" aria-label="WhatsApp" target="_blank" rel="noopener">
          <WhatsAppIcon sx={{ fontSize: 24, color: '#25D366' }} />
        </MuiLink>
        <MuiLink href="https://www.tiktok.com/@osunosogboperfumevendor?_t=ZM-8xnxkF8zy9m&_r=1" underline="none" color="inherit" aria-label="TikTok" target="_blank" rel="noopener">
          <TikTokIcon sx={{ fontSize: 24 }} />
        </MuiLink>
        <MuiLink href="https://x.com/starrjola?s=11&t=0Q8N-GU0qzui0gCYqwEkQg" underline="none" color="inherit" aria-label="Twitter/X" target="_blank" rel="noopener">
          <TwitterIcon sx={{ fontSize: 24, color: '#1DA1F2' }} />
        </MuiLink>
        <MuiLink href="https://www.instagram.com/scentsation_by_jc?igsh=dmd6NjhhdXN4aWMz&utm_source=qr" underline="none" color="inherit" aria-label="Instagram" target="_blank" rel="noopener">
          <InstagramIcon sx={{ fontSize: 24, color: '#E4405F' }} />
        </MuiLink>
      </Box>
      <Typography variant="body2" sx={{ mt: 2, mb: 0.5, color: 'text.secondary' }}>
        <MuiLink href="/terms" underline="hover" color="inherit" sx={{ mx: 1 }}>
          Terms & Conditions
        </MuiLink>
        |
        <MuiLink href="/privacy" underline="hover" color="inherit" sx={{ mx: 1 }}>
          Privacy Policy
        </MuiLink>
      </Typography>
      <Typography variant="body2">
        &copy; {new Date().getFullYear()} JC's Closet. All rights reserved.
      </Typography>
    </Box>
  );
}

export default Footer
