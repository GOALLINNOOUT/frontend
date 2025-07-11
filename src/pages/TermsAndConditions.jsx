import { Box, Typography, Container } from '@mui/material';
import { Helmet } from 'react-helmet-async';

function TermsAndConditions() {
  return (
    <>
      <Helmet>
        <title>Terms and Conditions | JC's Closet</title>
        <meta name="description" content="Read the terms and conditions for using JC's Closet. Learn about your rights, obligations, and our policies regarding orders, payments, privacy, and more." />
      </Helmet>
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom fontWeight={700} color="primary.main">
            Terms and Conditions
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Welcome to JC's Closet. By accessing or using our website, you agree to comply with and be bound by the following terms and conditions. Please review them carefully before using our services.
          </Typography>
          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 1 }} fontWeight={600}>
            1. Acceptance of Terms
          </Typography>
          <Typography variant="body2" paragraph>
            By using this website, you confirm that you are at least 16 years old or have the consent of a parent or guardian. If you do not agree to these terms, please do not use our services.
          </Typography>
          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 1 }} fontWeight={600}>
            2. Use of the Site
          </Typography>
          <Typography variant="body2" paragraph>
            You agree to use JC's Closet for lawful purposes only. You must not misuse the site, including but not limited to hacking, transmitting malware, spamming, infringing intellectual property, or engaging in fraudulent activities.
          </Typography>
          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 1 }} fontWeight={600}>
            3. User Accounts & Security
          </Typography>
          <Typography variant="body2" paragraph>
            To access certain features, you may need to create an account. You are responsible for maintaining the confidentiality of your credentials and for all activities under your account. Notify us immediately of any unauthorized use. We use industry-standard security practices, including password hashing and JWT-based authentication, to protect your data.
          </Typography>
          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 1 }} fontWeight={600}>
            4. Privacy & Data Protection
          </Typography>
          <Typography variant="body2" paragraph>
            Your privacy is important to us. We collect, use, and store your data in accordance with our Privacy Policy. We do not sell your personal information. Data is stored securely and only used for order processing, account management, and service improvement. Third-party integrations (e.g., Paystack) may process your data as required to provide their services.
          </Typography>
          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 1 }} fontWeight={600}>
            5. Product Information & Pricing
          </Typography>
          <Typography variant="body2" paragraph>
            We strive to ensure all product descriptions, images, and prices are accurate. However, errors may occur. We reserve the right to correct any errors and to change or update information at any time without prior notice. All prices are listed in Naira (NGN) unless otherwise stated.
          </Typography>
          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 1 }} fontWeight={600}>
            6. Orders & Payments
          </Typography>
          <Typography variant="body2" paragraph>
            All orders are subject to acceptance and availability. Payment must be made in full before dispatch. We use Paystack for secure payment processing. By placing an order, you agree to Paystack's terms and conditions. JC's Closet is not responsible for payment processing errors or delays caused by third-party providers.
          </Typography>
          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 1 }} fontWeight={600}>
            7. Shipping & Delivery
          </Typography>
          <Typography variant="body2" paragraph>
            Shipping times and costs are provided at checkout. JC's Closet is not responsible for delays caused by third-party carriers or customs. Risk of loss passes to you upon delivery to the carrier. Please ensure your shipping information is accurate.
          </Typography>
          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 1 }} fontWeight={600}>
            8. Returns & Refunds
          </Typography>
          <Typography variant="body2" paragraph>
            Please review our Returns & Refunds Policy for details on eligibility, process, and timelines. Not all products may be eligible for return due to hygiene or other reasons. Refunds are processed to the original payment method after returned items are inspected.
          </Typography>
          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 1 }} fontWeight={600}>
            9. Booking & Personal Shopping
          </Typography>
          <Typography variant="body2" paragraph>
            You may book personal styling or fragrance consultations directly through our website. Bookings are subject to availability. We are not responsible for any technical issues that may affect the booking process.
          </Typography>
          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 1 }} fontWeight={600}>
            10. Intellectual Property
          </Typography>
          <Typography variant="body2" paragraph>
            All content, trademarks, and data on this site are the property of JC's Closet or its licensors. Unauthorized use, reproduction, or distribution is strictly prohibited.
          </Typography>
          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 1 }} fontWeight={600}>
            11. Limitation of Liability
          </Typography>
          <Typography variant="body2" paragraph>
            JC's Closet is not liable for any indirect, incidental, or consequential loss or damage arising from your use of the site, products, or services. Our liability is limited to the value of the goods purchased.
          </Typography>
          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 1 }} fontWeight={600}>
            12. Third-Party Links & Services
          </Typography>
          <Typography variant="body2" paragraph>
            Our site may contain links to third-party websites or services. JC's Closet is not responsible for the content, privacy practices, or accuracy of external sites. Access them at your own risk.
          </Typography>
          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 1 }} fontWeight={600}>
            13. Indemnification
          </Typography>
          <Typography variant="body2" paragraph>
            You agree to indemnify and hold harmless JC's Closet, its affiliates, and employees from any claims, damages, or expenses arising from your use of the site or violation of these terms.
          </Typography>
          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 1 }} fontWeight={600}>
            14. Changes to Terms
          </Typography>
          <Typography variant="body2" paragraph>
            We reserve the right to update these terms at any time. Continued use of the site means you accept the new terms. Please review this page regularly for updates.
          </Typography>
          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 1 }} fontWeight={600}>
            15. Governing Law
          </Typography>
          <Typography variant="body2" paragraph>
            These terms are governed by the laws of the Federal Republic of Nigeria.
          </Typography>
          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 1 }} fontWeight={600}>
            16. Contact Us
          </Typography>
          <Typography variant="body2" paragraph>
            For questions about these Terms and Conditions, please contact us at <a href="mailto:favouradeyekun@gmail.com">favouradeyekun@gmail.com</a>.
          </Typography>
          <Typography variant="body2" sx={{ mt: 5, color: 'text.secondary' }}>
            This document is intended to provide clarity and transparency regarding your rights and obligations when using JC's Closet. Please review it regularly for updates.
          </Typography>
        </Box>
      </Container>
    </>
  );
}

export default TermsAndConditions;
