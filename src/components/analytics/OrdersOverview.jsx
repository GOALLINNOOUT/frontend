import React, { useEffect, useState } from 'react';
import { Paper, Typography, Box, CircularProgress, Grid, Chip, Divider, useTheme } from '@mui/material';
import * as api from '../../utils/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, LineChart, Line, LabelList } from 'recharts';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper elevation={3} sx={{ p: 1, minWidth: 100 }}>
        <Typography variant="subtitle2" fontWeight={600}>{label}</Typography>
        {payload.map((entry, idx) => (
          <Typography key={idx} variant="body2" color={entry.color}>
            {entry.name}: <b>{entry.value}</b>
          </Typography>
        ))}
      </Paper>
    );
  }
  return null;
};

const OrdersOverview = ({ dateRange }) => {
  console.log('OrdersOverview rendered', dateRange);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [infoAnchor, setInfoAnchor] = useState({});
  const theme = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams(dateRange).toString();
        const { data, ok } = await api.get(`/v1/analytics/orders?${params}`);
        if (!ok) throw new Error();
        setData(data);
      } catch {
        setError('Failed to load orders overview analytics');
      } finally {
        setLoading(false);
      }
    };
    if (dateRange.startDate && dateRange.endDate) {
      fetchData();
    }
  }, [dateRange]);

  const handleInfoOpen = (key) => (event) => setInfoAnchor({ ...infoAnchor, [key]: event.currentTarget });
  const handleInfoClose = (key) => () => setInfoAnchor({ ...infoAnchor, [key]: null });

  const infoTexts = {
    status: 'Shows how many orders are in each status (e.g., pending, shipped, delivered, cancelled). Helps you track order progress.',
    trends: 'Shows how your order volume changes over time. Helps you spot busy periods or trends.',
    fulfillment: 'Shows the average number of days it takes to fulfill (complete) an order.',
    cancelled: 'Shows how many orders were cancelled or returned. Helps you monitor issues with orders.'
  };

  function InfoPopover({ id, open, anchorEl, onClose, text }) {
    return (
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{ sx: { p: 2, maxWidth: 320 } }}
      >
        <Typography variant="body2" color="text.secondary">{text}</Typography>
      </Popover>
    );
  }

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight={220}><CircularProgress /></Box>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!data) return null;

  return (
    <Paper elevation={4} sx={{ p: { xs: 2, md: 4 }, mb: 3, borderRadius: 4, background: `linear-gradient(135deg, ${theme.palette.background.paper} 80%, ${theme.palette.primary.light} 100%)` }}>
      <Typography variant="h5" fontWeight={700} mb={3} color="primary.main" letterSpacing={1}>
        Orders Overview
      </Typography>
      <Divider sx={{ mb: 3 }} />
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Box mb={4} sx={{ width: '90vw', background: theme.palette.background.default, borderRadius: 3, boxShadow: 2, p: { xs: 1, md: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', pl: 2, mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
                Order Status Breakdown
              </Typography>
              <IconButton size="small" onClick={handleInfoOpen('status')}>
                <HelpOutlineIcon fontSize="small" />
              </IconButton>
              <InfoPopover
                id="info-status"
                open={Boolean(infoAnchor['status'])}
                anchorEl={infoAnchor['status']}
                onClose={handleInfoClose('status')}
                text={infoTexts.status}
              />
            </Box>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={data.statusBreakdown || []} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke={theme.palette.divider} />
                <XAxis dataKey="status" tick={{ fontSize: 15, fill: theme.palette.text.secondary }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 15, fill: theme.palette.text.secondary }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: theme.palette.action.hover }} />
                <Legend iconType="circle" />
                <Bar dataKey="count" name="Orders" fill={theme.palette.primary.main} radius={[12, 12, 0, 0]} barSize={40}>
                  <LabelList dataKey="count" position="top" style={{ fontWeight: 700, fontSize: 15 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box mb={4} sx={{ width: '90vw', background: theme.palette.background.default, borderRadius: 3, boxShadow: 2, p: { xs: 1, md: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', pl: 2, mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
                Order Trends
              </Typography>
              <IconButton size="small" onClick={handleInfoOpen('trends')}>
                <HelpOutlineIcon fontSize="small" />
              </IconButton>
              <InfoPopover
                id="info-trends"
                open={Boolean(infoAnchor['trends'])}
                anchorEl={infoAnchor['trends']}
                onClose={handleInfoClose('trends')}
                text={infoTexts.trends}
              />
            </Box>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={data.orderTrends || []} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke={theme.palette.divider} />
                <XAxis dataKey="date" tick={{ fontSize: 15, fill: theme.palette.text.secondary }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 15, fill: theme.palette.text.secondary }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: theme.palette.action.hover }} />
                <Legend iconType="circle" />
                <Line type="monotone" dataKey="orders" stroke={theme.palette.success.main} strokeWidth={4} dot={{ r: 7 }} activeDot={{ r: 10 }} name="Orders" />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box mb={2} display="flex" flexDirection="column" alignItems="flex-start" gap={1}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
                Average Fulfillment Time
              </Typography>
              <IconButton size="small" onClick={handleInfoOpen('fulfillment')}>
                <HelpOutlineIcon fontSize="small" />
              </IconButton>
              <InfoPopover
                id="info-fulfillment"
                open={Boolean(infoAnchor['fulfillment'])}
                anchorEl={infoAnchor['fulfillment']}
                onClose={handleInfoClose('fulfillment')}
                text={infoTexts.fulfillment}
              />
            </Box>
            <Chip label={`Avg. Fulfillment: ${data.avgFulfillmentTime || 0} days`} color="info" sx={{ fontWeight: 600, fontSize: 16, px: 2, py: 1, borderRadius: 2, boxShadow: 1 }} />
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box mb={2} display="flex" flexDirection="column" alignItems="flex-start" gap={1}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
                Cancelled/Returned Orders
              </Typography>
              <IconButton size="small" onClick={handleInfoOpen('cancelled')}>
                <HelpOutlineIcon fontSize="small" />
              </IconButton>
              <InfoPopover
                id="info-cancelled"
                open={Boolean(infoAnchor['cancelled'])}
                anchorEl={infoAnchor['cancelled']}
                onClose={handleInfoClose('cancelled')}
                text={infoTexts.cancelled}
              />
            </Box>
            <Box display="flex" gap={2}>
              <Chip label={`Cancelled: ${data.cancelledCount || 0}`} color="warning" sx={{ fontWeight: 600, fontSize: 16, px: 2, py: 1, borderRadius: 2, boxShadow: 1 }} />
              <Chip label={`Returned: ${data.returnedCount || 0}`} color="error" sx={{ fontWeight: 600, fontSize: 16, px: 2, py: 1, borderRadius: 2, boxShadow: 1 }} />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default OrdersOverview;
