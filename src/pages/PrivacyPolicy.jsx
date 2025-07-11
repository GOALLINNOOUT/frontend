import { Box, Typography, Container } from '@mui/material';
import { Helmet } from 'react-helmet-async';

function PrivacyPolicy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | JC's Closet</title>
        <meta name="description" content="Learn how JC's Closet collects, uses, and protects your personal information. Read our privacy policy for details on data security, your rights, and our practices." />
      </Helmet>
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom fontWeight={700} color="primary.main">
            Privacy Policy
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            JC's Closet is committed to protecting your privacy. This policy explains how we collect, use, store, and safeguard your information in compliance with industry standards and applicable laws.
          </Typography>
          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 1 }} fontWeight={600}>
            1. Information We Collect
          </Typography>
          <Typography variant="body2" paragraph>
            We collect information you provide when you register, place an order, book a service, or contact us. This may include your name, email, phone number, address, and payment details. We may also collect information automatically through cookies and analytics tools (such as device/browser type, IP address, and usage data).
          </Typography>
          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 1 }} fontWeight={600}>
            2. How We Use Your Information
          </Typography>
          <Typography variant="body2" paragraph>
            Your information is used to process orders, manage your account, provide customer support, personalize your experience, improve our services, and communicate with you (including transactional and marketing emails, if you opt in). We do not sell your data to third parties.
          </Typography>
          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 1 }} fontWeight={600}>
            3. Data Security
          </Typography>
          <Typography variant="body2" paragraph>
            We implement industry-standard security measures, including encryption, secure payment gateways, and access controls, to protect your data from unauthorized access, alteration, or disclosure. Passwords are hashed and sensitive data is handled securely.
          </Typography>
          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 1 }} fontWeight={600}>
            4. Cookies & Tracking
          </Typography>
          <Typography variant="body2" paragraph>
            Our website uses cookies and similar technologies to enhance your experience, analyze site usage, and support core functionality (such as keeping you logged in and remembering your cart). You can disable cookies in your browser settings, but some features may not function properly.
          </Typography>
          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 1 }} fontWeight={600}>
            5. Third-Party Services
          </Typography>
          <Typography variant="body2" paragraph>
            We use trusted third-party services (such as payment processors like Paystack, email providers, and analytics tools) to operate our business. These providers have their own privacy policies and may process your data as required to deliver their services. We do not control their privacy practices.
          </Typography>
          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 1 }} fontWeight={600}>
            6. Data Retention
          </Typography>
          <Typography variant="body2" paragraph>
            We retain your personal information only as long as necessary to fulfill the purposes outlined in this policy, comply with legal obligations, resolve disputes, and enforce our agreements. Data no longer needed is securely deleted.
          </Typography>
          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 1 }} fontWeight={600}>
            7. Your Rights & Choices
          </Typography>
          <Typography variant="body2" paragraph>
            You have the right to access, update, or delete your personal information. You may also opt out of marketing communications at any time by following the unsubscribe instructions in our emails or contacting us directly. To exercise your rights, please contact us using the details below.
          </Typography>
          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 1 }} fontWeight={600}>
            8. Children's Privacy
          </Typography>
          <Typography variant="body2" paragraph>
            Our services are not intended for children under 16. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, please contact us for prompt removal.
          </Typography>
          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 1 }} fontWeight={600}>
            9. International Users
          </Typography>
          <Typography variant="body2" paragraph>
            If you access our site from outside Nigeria, your information may be transferred to, stored, and processed in Nigeria or other countries. By using our services, you consent to such transfers as permitted by law.
          </Typography>
          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 1 }} fontWeight={600}>
            10. Security Practices
          </Typography>
          <Typography variant="body2" paragraph>
            While we use reasonable measures to protect your data, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security, but we strive to use best practices at all times.
          </Typography>
          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 1 }} fontWeight={600}>
            11. Changes to This Policy
          </Typography>
          <Typography variant="body2" paragraph>
            We may update this policy from time to time to reflect changes in our practices or legal requirements. Continued use of our site means you accept the updated policy. Please review this page regularly for updates.
          </Typography>
          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 1 }} fontWeight={600}>
            12. Contact Us
          </Typography>
          <Typography variant="body2" paragraph>
            If you have questions or concerns about this Privacy Policy or your data, please contact us at <a href="mailto:favouradeyekun@gmail.com">favouradeyekun@gmail.com</a>.
          </Typography>
          <Typography variant="body2" sx={{ mt: 5, color: 'text.secondary' }}>
            This policy is designed to help you understand how your information is handled at JC's Closet. Please review it regularly for updates and changes.
          </Typography>
        </Box>
      </Container>
    </>
  );
}

export default PrivacyPolicy;
