import { useState } from 'react';
import { FaEnvelope, FaPhone, FaInstagram } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { post } from '../utils/api';
import { Helmet } from 'react-helmet-async';
import { useTheme } from '@mui/material/styles';

function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success'|'error', message: string }
  const theme = useTheme();

  // Validation helpers
  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Name is required.';
        if (value.trim().length < 2) return 'Name must be at least 2 characters.';
        return '';
      case 'email':
        if (!value.trim()) return 'Email is required.';
        // Simple email regex
        if (!/^\S+@\S+\.\S+$/.test(value)) return 'Invalid email address.';
        return '';
      case 'message':
        if (!value.trim()) return 'Message is required.';
        if (value.trim().length < 10) return 'Message must be at least 10 characters.';
        return '';
      default:
        return '';
    }
  };

  const validateForm = (formObj) => {
    const newErrors = {};
    Object.keys(formObj).forEach((key) => {
      const error = validateField(key, formObj[key]);
      if (error) newErrors[key] = error;
    });
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm(form);
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    setSubmitting(true);
    setStatus(null);
    try {
      const { ok, data } = await post('/contact', form);
      if (ok) {
        setStatus({ type: 'success', message: 'Message sent! We will get back to you soon.' });
        setForm({ name: '', email: '', message: '' });
        setErrors({});
      } else {
        setStatus({ type: 'error', message: data?.error || 'Failed to send message.' });
      }
    } catch {
      setStatus({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid =
    form.name &&
    form.email &&
    form.message &&
    Object.values(errors).every((err) => !err) &&
    !submitting;

  return (
    <>
      <Helmet>
        <title>Contact | JC's Closet</title>
        <meta name="description" content="Contact JC's Closet for inquiries, support, or collaborations. We're here to help you with all your fashion and fragrance needs." />
      </Helmet>
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        style={{
          width: '100vw',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(120deg, ${theme.palette.background.default} 60%, ${theme.palette.primary.main}10 100%)`,
          padding: '2rem 0',
          overflowX: 'hidden',
        }}
      >
        <div style={{ width: '100%', maxWidth: 1400, margin: '0 auto', padding: '0 1.5rem' }}>
          <motion.section
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, type: 'spring', bounce: 0.18 }}
            style={{
              background: `linear-gradient(120deg, ${theme.palette.grey.contactPaper} 80%, ${theme.palette.primary.main}08 100%)`,
              borderRadius: 24,
              boxShadow: theme.palette.grey.contactBoxShadow,
              maxWidth: 900,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '2.5rem',
              padding: '3rem 2.5rem',
              margin: '0 auto',
              backdropFilter: 'blur(2.5px)',
              border: `1.5px solid ${theme.palette.grey.contactInputBorder}`,
            }}
          >
            <motion.h2
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              style={{
                textAlign: 'center',
                marginBottom: 0,
                color: theme.palette.grey.contactPrimary,
                fontWeight: 800,
                fontSize: 38,
                letterSpacing: 1.2,
                textShadow: `0 2px 12px ${theme.palette.primary.main}22`,
              }}
            >
              Contact Us
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              style={{
                textAlign: 'center',
                color: theme.palette.grey.contactSubtitle,
                marginTop: 0,
                fontSize: 19,
                fontWeight: 500,
                letterSpacing: 0.2,
              }}
            >
              Have a question, feedback, or want to collaborate? We’d love to hear from you! Reach out using the details below or fill out our contact form.
            </motion.p>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.15 } },
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2.5rem',
                justifyContent: 'space-between',
              }}
            >
              <motion.div
                variants={{
                  hidden: { x: -30, opacity: 0 },
                  visible: { x: 0, opacity: 1 },
                }}
                style={{
                  flex: 1,
                  minWidth: 260,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.5rem',
                  background: `${theme.palette.grey.contactBg}CC`,
                  borderRadius: 16,
                  boxShadow: theme.palette.grey.contactFormShadow,
                  padding: '2rem 1.5rem',
                  border: `1px solid ${theme.palette.grey.contactInputBorder}`,
                }}
              >
                <h3 style={{ color: theme.palette.grey.contactPrimary, fontWeight: 700, fontSize: 22, marginBottom: 8 }}>Contact Information</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: theme.palette.grey.contactInfo, fontSize: 18, fontWeight: 500 }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <FaEnvelope style={{ color: theme.palette.grey.contactPrimary, fontSize: 22 }} />
                    <a href="mailto:favouradeyekun@gmail.com" style={{ color: theme.palette.grey.contactPrimary, textDecoration: 'none', fontWeight: 600 }}>favouradeyekun@gmail.com</a>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <FaPhone style={{ color: theme.palette.grey.contactPrimary, fontSize: 22 }} />
                    <a href="tel:+2348022335287" style={{ color: theme.palette.grey.contactPrimary, textDecoration: 'none', fontWeight: 600 }}>+234 802 233 5287</a>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <FaInstagram style={{ color: theme.palette.grey.contactPrimary, fontSize: 22 }} />
                    <a href="https://www.instagram.com/scentsation_by_jc?igsh=dmd6NjhhdXN4aWMz&utm_source=qr" target="_blank" rel="noopener noreferrer" style={{ color: theme.palette.grey.contactPrimary, textDecoration: 'none', fontWeight: 600 }}>@scentsation_by_jc</a>
                  </li>
                </ul>
              </motion.div>
              <motion.form
                onSubmit={handleSubmit}
                variants={{
                  hidden: { x: 30, opacity: 0 },
                  visible: { x: 0, opacity: 1 },
                }}
                style={{
                  flex: 1,
                  minWidth: 260,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.2rem',
                  background: `${theme.palette.grey.contactBg}CC`,
                  borderRadius: 16,
                  padding: '2rem 1.5rem',
                  boxShadow: theme.palette.grey.contactFormShadow,
                  border: `1px solid ${theme.palette.grey.contactInputBorder}`,
                  backdropFilter: 'blur(2px)',
                }}
              >
                <h3 style={{ margin: 0, marginBottom: 10, color: theme.palette.grey.contactPrimary, fontWeight: 700, fontSize: 22 }}>Send Us a Message</h3>
                <motion.input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  whileFocus={{ scale: 1.04, boxShadow: theme.palette.grey.contactInputFocus }}
                  style={{
                    padding: '1rem',
                    borderRadius: 8,
                    border: `1.5px solid ${theme.palette.grey.contactInputBorder}`,
                    fontSize: 17,
                    background: theme.palette.grey.contactPaper,
                    fontWeight: 500,
                    color: theme.palette.text.primary,
                    transition: 'border 0.2s, box-shadow 0.2s',
                  }}
                />
                {errors.name && (
                  <div style={{ color: theme.palette.grey.contactError, fontSize: 15, marginBottom: 4, fontWeight: 500 }}>{errors.name}</div>
                )}
                <motion.input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  whileFocus={{ scale: 1.04, boxShadow: theme.palette.grey.contactInputFocus }}
                  style={{
                    padding: '1rem',
                    borderRadius: 8,
                    border: `1.5px solid ${theme.palette.grey.contactInputBorder}`,
                    fontSize: 17,
                    background: theme.palette.grey.contactPaper,
                    fontWeight: 500,
                    color: theme.palette.text.primary,
                    transition: 'border 0.2s, box-shadow 0.2s',
                  }}
                />
                {errors.email && (
                  <div style={{ color: theme.palette.grey.contactError, fontSize: 15, marginBottom: 4, fontWeight: 500 }}>{errors.email}</div>
                )}
                <motion.textarea
                  name="message"
                  placeholder="Your Message"
                  rows={5}
                  required
                  value={form.message}
                  onChange={handleChange}
                  whileFocus={{ scale: 1.02, boxShadow: theme.palette.grey.contactInputFocus }}
                  style={{
                    padding: '1rem',
                    borderRadius: 8,
                    border: `1.5px solid ${theme.palette.grey.contactInputBorder}`,
                    fontSize: 17,
                    background: theme.palette.grey.contactPaper,
                    fontWeight: 500,
                    color: theme.palette.text.primary,
                    resize: 'vertical',
                    minHeight: 110,
                    transition: 'border 0.2s, box-shadow 0.2s',
                  }}
                />
                {errors.message && (
                  <div style={{ color: theme.palette.grey.contactError, fontSize: 15, marginBottom: 4, fontWeight: 500 }}>{errors.message}</div>
                )}
                <motion.button
                  type="submit"
                  disabled={!isFormValid}
                  whileHover={isFormValid ? { scale: 1.05, background: theme.palette.grey.contactPrimaryHover } : {}}
                  whileTap={isFormValid ? { scale: 0.98 } : {}}
                  style={{
                    background: isFormValid ? theme.palette.grey.contactPrimary : theme.palette.grey.contactPrimaryDisabled,
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '1rem',
                    fontSize: 18,
                    fontWeight: 700,
                    cursor: isFormValid ? 'pointer' : 'not-allowed',
                    opacity: isFormValid ? 1 : 0.7,
                    marginTop: 10,
                    boxShadow: theme.palette.grey.contactButtonShadow,
                    transition: 'background 0.2s, box-shadow 0.2s',
                    letterSpacing: 0.5,
                  }}
                >
                  {submitting ? 'Sending...' : 'Send'}
                </motion.button>
                {status && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ color: status.type === 'success' ? theme.palette.grey.contactSuccess : theme.palette.grey.contactError, marginTop: 10, fontSize: 16, fontWeight: 600, textAlign: 'center' }}
                  >
                    {status.message}
                  </motion.div>
                )}
              </motion.form>
            </motion.div>
            <p style={{ marginTop: '1.5rem', color: theme.palette.grey.contactFooter, textAlign: 'center', fontSize: 16, fontWeight: 500 }}>
              We aim to respond within 24 hours. Thank you for reaching out!
            </p>
          </motion.section>
        </div>
        <style>{`
          @media (min-width: 700px) {
            main > div > section > div {
              flex-direction: row;
            }
          }
          @media (max-width: 900px) {
            main > div > section {
              padding: 2rem 0.5rem !important;
            }
          }
          @media (max-width: 600px) {
            main > div > section {
              padding: 1rem 0.2rem !important;
            }
            main > div > section > div > form, main > div > section > div > div {
              padding: 1rem 0.5rem !important;
            }
            h2 {
              font-size: 28px !important;
            }
          }
        `}</style>
      </motion.main>
    </>
  );
}

export default Contact;
