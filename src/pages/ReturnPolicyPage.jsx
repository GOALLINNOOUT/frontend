import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Helmet } from 'react-helmet-async';

const ReturnPolicyPage = () => (
  <React.Fragment>
    <Helmet>
      <title>Return Policy | JC's Closet</title>
      <meta name="description" content="Read our return and refund policy for JC's Closet." />
    </Helmet>
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 6, p: { xs: 2, sm: 4 } }}>
      <Paper sx={{ p: { xs: 2, sm: 4 }, borderRadius: 4, boxShadow: 3 }}>
        <Typography variant="h4" fontWeight={700} mb={3} textAlign="center">
          Return & Refund Policy
        </Typography>
        <Typography variant="body1" mb={2}>
          At JC's Closet, we strive to ensure you are delighted with every purchase. If you are not completely satisfied, we offer a straightforward return and refund process. Please read the following guidelines carefully:
        </Typography>
        <Typography variant="subtitle1" fontWeight={600} mb={1}>
          Eligibility for Returns:
        </Typography>
        <ul style={{ marginLeft: 20 }}>
          <li>Returns must be requested within <strong>7 days</strong> of receiving your order. Requests made after this period may not be accepted.</li>
          <li>Items must be <strong>unused, unworn, and in their original packaging</strong> with all tags and labels attached.</li>
          <li>Perfumes, cosmetics, and personal care items are <strong>not eligible for return</strong> if opened, used, or if the seal is broken, due to hygiene reasons.</li>
          <li>Sale, clearance, or promotional items are <strong>final sale</strong> and cannot be returned or exchanged.</li>
          <li>Custom-made or personalized products are not eligible for return unless defective or damaged upon arrival.</li>
        </ul>
        <Typography variant="subtitle1" fontWeight={600} mb={1} mt={2}>
          How to Initiate a Return:
        </Typography>
        <ul style={{ marginLeft: 20 }}>
          <li>You can initiate a return by cancelling your order directly from the <strong>Order Page</strong> on our website. Simply locate your order and click "Cancel Order" if eligible.</li>
          <li>Alternatively, you may email our support team at <a href="mailto:favouradeyekun@gmail.com">favouradeyekun@gmail.com</a> with your order number, item(s) to return, and reason for return.</li>
          <li>Our team will review your request and provide instructions for shipping the item(s) back to us.</li>
          <li>Customers are responsible for return shipping costs unless the item is defective, damaged, or incorrect.</li>
        </ul>
        <Typography variant="subtitle1" fontWeight={600} mb={1} mt={2}>
          Refunds & Processing:
        </Typography>
        <ul style={{ marginLeft: 20 }}>
          <li>Once your return is received and inspected, we will notify you via email regarding the approval or rejection of your refund.</li>
          <li>If your refund is approved, you will be asked to provide your bank details. Refunds will be processed to your provided bank account within <strong>5-10 business days</strong>.</li>
          <li>If your return is rejected, we will provide a clear explanation and may return the item to you at your request.</li>
        </ul>
        <Typography variant="body1" mt={3} mb={2}>
          Please note: Items returned without prior approval or outside the stated policy may not be accepted or refunded. For any questions or concerns regarding our return policy, contact us at <a href="mailto:favouradeyekun@gmail.com">favouradeyekun@gmail.com</a>.
        </Typography>
        <Typography variant="body1" mt={3} mb={2}>
          Once your return is received and inspected, we will notify you of the approval or rejection of your refund. If approved, you will be asked for your bank details and the refund will be processed to your bank account within 5-10 business days.
        </Typography>
        <Typography variant="body1" color="text.secondary">
          For any questions or concerns regarding our return policy, please contact us at <a href="mailto:favouradeyekun@gmail.com">favouradeyekun@gmail.com</a>.
        </Typography>
      </Paper>
    </Box>
  </React.Fragment>
);

export default ReturnPolicyPage;
