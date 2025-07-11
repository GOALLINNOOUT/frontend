import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
  MenuItem,
  Paper,
  Alert,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { post } from '../utils/api';
import { Helmet } from 'react-helmet-async';

function Appointments() {
  const [form, setForm] = useState({ name: '', email: '', service: '', datetime: null });
  const [customService, setCustomService] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const formRef = useRef(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleServiceChange = (e) => {
    setForm({ ...form, service: e.target.value });
    setError('');
    if (e.target.value !== 'Other') setCustomService('');
  };

  const handleDateTimeChange = (newValue) => {
    setForm((prev) => ({ ...prev, datetime: newValue }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const serviceValue = form.service === 'Other' ? customService : form.service;
    if (!form.name || !form.email || !serviceValue || !form.datetime) {
      setError('Please fill in all fields.');
      return;
    }
    // Validate not booking in the past
    const now = new Date();
    const selected = new Date(form.datetime);
    if (selected < now) {
      setError('You cannot book an appointment in the past.');
      return;
    }
    // Validate not booking more than 3 months 1 day in the future
    const maxDate = new Date(now);
    maxDate.setMonth(maxDate.getMonth() + 3);
    maxDate.setDate(maxDate.getDate() + 1);
    if (selected > maxDate) {
      setError('You cannot book an appointment more than 3 months and 1 day from today.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { ok, data } = await post('/appointments', { ...form, service: serviceValue, datetime: selected });
      if (!ok) {
        setError(data?.error || 'Failed to book appointment.');
        setLoading(false);
        return;
      }
      setSubmitted(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to select service and scroll to form
  const selectServiceAndScroll = (service) => {
    setForm(f => ({ ...f, service }));
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  return (
    <>
      <Helmet>
        <title>Appointments | JC's Closet</title>
        <meta name="description" content="Book a personal style or fragrance appointment with JC's Closet. Get expert advice tailored to you." />
      </Helmet>
      <main style={{ width: '100vw', minHeight: '100vh', background: theme.palette.background.default, overflowX: 'hidden' }}>
        <Box sx={{ width: '100%', maxWidth: 1400, mx: 'auto', px: { xs: 1, md: 3 }, py: { xs: 2, md: 4 } }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant="h4" component="h2" gutterBottom align="center">
              Book an Appointment
            </Typography>
            <Typography variant="body1" align="center" sx={{ mb: 2 }}>
              Ready for a style transformation or fragrance consultation? Book an appointment with our experts for a personalized experience.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
              {/* Service Option: Wardrobe styling sessions */}
              <motion.div
                initial={{ x: -60, opacity: 0, scale: 0.95 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.04, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
                transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
              >
                <Box
                  role="button"
                  tabIndex={0}
                  onClick={() => selectServiceAndScroll('Wardrobe Styling')}
                  onKeyPress={e => { if (e.key === 'Enter' || e.key === ' ') selectServiceAndScroll('Wardrobe Styling'); }}
                  sx={{ cursor: 'pointer', outline: form.service === 'Wardrobe Styling' ? `2px solid ${theme.palette.primary.main}` : 'none', borderRadius: 3 }}
                >
                  <Paper elevation={3} sx={{ p: 2.5, borderRadius: 3, bgcolor: 'primary.light', color: 'primary.contrastText', fontWeight: 600, fontSize: 18, boxShadow: 3 }}>
                    Wardrobe styling sessions
                  </Paper>
                </Box>
              </motion.div>
              {/* Service Option: Perfume selection consultations */}
              <motion.div
                initial={{ x: -60, opacity: 0, scale: 0.95 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.04, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
                transition={{ delay: 0.35, duration: 0.5, type: 'spring' }}
              >
                <Box
                  role="button"
                  tabIndex={0}
                  onClick={() => selectServiceAndScroll('Perfume Consultation')}
                  onKeyPress={e => { if (e.key === 'Enter' || e.key === ' ') selectServiceAndScroll('Perfume Consultation'); }}
                  sx={{ cursor: 'pointer', outline: form.service === 'Perfume Consultation' ? `2px solid ${theme.palette.primary.main}` : 'none', borderRadius: 3 }}
                >
                  <Paper elevation={3} sx={{ p: 2.5, borderRadius: 3, bgcolor: 'primary.light', color: 'primary.contrastText', fontWeight: 600, fontSize: 18, boxShadow: 3 }}>
                    Perfume selection consultations
                  </Paper>
                </Box>
              </motion.div>
              {/* Service Option: Virtual and in-person options available */}
              <motion.div
                initial={{ x: -60, opacity: 0, scale: 0.95 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.04, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
                transition={{ delay: 0.5, duration: 0.5, type: 'spring' }}
              >
                <Box
                  role="button"
                  tabIndex={0}
                  onClick={() => selectServiceAndScroll('Virtual Session')}
                  onKeyPress={e => { if (e.key === 'Enter' || e.key === ' ') selectServiceAndScroll('Virtual Session'); }}
                  sx={{ cursor: 'pointer', outline: form.service === 'Virtual Session' ? `2px solid ${theme.palette.primary.main}` : 'none', borderRadius: 3 }}
                >
                  <Paper elevation={3} sx={{ p: 2.5, borderRadius: 3, bgcolor: 'primary.light', color: 'primary.contrastText', fontWeight: 600, fontSize: 18, boxShadow: 3 }}>
                    Virtual and in-person options available
                  </Paper>
                </Box>
              </motion.div>
            </Box>
            <Paper elevation={3} sx={{ mt: 3, p: isMobile ? 2 : 4, borderRadius: 3 }} ref={formRef}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Request a Booking
              </Typography>
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <Alert severity="success" sx={{ mb: 2 }}>
                    Thank you! We have received your request. We will contact you soon to confirm your appointment.
                  </Alert>
                </motion.div>
              ) : (
                <motion.form
                  onSubmit={handleSubmit}
                  style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    initial={{ x: 40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                  >
                    <TextField
                      label="Name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      fullWidth
                      variant="outlined"
                      size="medium"
                    />
                  </motion.div>
                  <motion.div
                    initial={{ x: 40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.18, duration: 0.4 }}
                  >
                    <TextField
                      label="Email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      fullWidth
                      variant="outlined"
                      size="medium"
                    />
                  </motion.div>
                  <motion.div
                    initial={{ x: 40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.26, duration: 0.4 }}
                  >
                    <TextField
                      select
                      label="Service"
                      name="service"
                      value={form.service}
                      onChange={handleServiceChange}
                      required
                      fullWidth
                      variant="outlined"
                      size="medium"
                    >
                      <MenuItem value="">Select a service</MenuItem>
                      <MenuItem value="Wardrobe Styling">Styling</MenuItem>
                      <MenuItem value="Perfume Consultation">Perfume Consultation</MenuItem>
                      <MenuItem value="Virtual Session">Virtual Session</MenuItem>
                      <MenuItem value="In-person Session">In-person Session</MenuItem>
                      <MenuItem value="Other">Other (please specify)</MenuItem>
                    </TextField>
                  </motion.div>
                  {form.service === 'Other' && (
                    <motion.div
                      initial={{ x: 40, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.34, duration: 0.4 }}
                    >
                      <TextField
                        label="Custom Service"
                        name="customService"
                        value={customService}
                        onChange={e => setCustomService(e.target.value)}
                        required
                        fullWidth
                        variant="outlined"
                        size="medium"
                        sx={{ mt: 1 }}
                      />
                    </motion.div>
                  )}
                  <motion.div
                    initial={{ x: 40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.42, duration: 0.4 }}
                  >
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DateTimePicker
                        label="Date & Time"
                        value={form.datetime}
                        onChange={handleDateTimeChange}
                        renderInput={(params) => (
                          <TextField {...params} name="datetime" required fullWidth variant="outlined" size="medium" />
                        )}
                      />
                    </LocalizationProvider>
                  </motion.div>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Alert severity="error">{error}</Alert>
                    </motion.div>
                  )}
                  <motion.div
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      size="large"
                      sx={{ mt: 1, fontWeight: 600 }}
                      disabled={loading}
                    >
                      {loading ? 'Booking...' : 'Request Appointment'}
                    </Button>
                  </motion.div>
                </motion.form>
              )}
              <Typography variant="body2" sx={{ mt: 3, color: 'text.secondary' }}>
                <strong>Prefer to book directly?</strong> <br />
                Email us at <a href="mailto:favouradeyekun@gmail.com">favouradeyekun@gmail.com</a> or call <a href="tel:+2348022335287">+234 802 233 5287</a>.
              </Typography>
            </Paper>
          </motion.div>
        </Box>
      </main>
    </>
  );
}

export default Appointments;
