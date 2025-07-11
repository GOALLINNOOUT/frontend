import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Paper, Typography, Grid, Box, CircularProgress, Stack, useTheme } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import axios from 'axios';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 2, boxShadow: 2 }}>
        <Typography variant="subtitle2" fontWeight={600}>{label}</Typography>
        {payload.map((entry, idx) => (
          <Typography key={idx} variant="body2" color={entry.color}>
            {entry.name}: {entry.name === 'Revenue' ? `₦${entry.value?.toLocaleString()}` : entry.value}
          </Typography>
        ))}
      </Box>
    );
  }
  return null;
};

/**
 * SalesAnalytics analytics component
 * @param {Object} props
 * @param {{startDate: string, endDate: string}} props.dateRange - Date range filter
 */
const SalesAnalytics = ({ dateRange }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [infoAnchor, setInfoAnchor] = useState({});
  const theme = useTheme();

  const infoTexts = {
    totalSales: 'The total number of orders placed in the selected period.',
    totalRevenue: 'The total amount of money earned from all sales in the selected period.',
    avgOrderValue: 'The average amount spent per order.',
    returnRate: 'The percentage of orders that were returned.',
    revenueTrends: 'Shows how your revenue and order count change over time. Helps you spot busy or slow periods.',
    topDays: 'The days with the highest sales and revenue.'
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

  const handleInfoOpen = (key) => (event) => setInfoAnchor({ ...infoAnchor, [key]: event.currentTarget });
  const handleInfoClose = (key) => () => setInfoAnchor({ ...infoAnchor, [key]: null });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/v1/analytics/sales', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setData(res.data);
      } catch {
        setError('Failed to load sales analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!dateRange.startDate || !dateRange.endDate) return;
    setLoading(true);
    setError(null);
    axios.get('/api/v1/analytics/sales', { params: dateRange })
      .then(res => setData(res.data))
      .catch(err => setError(err?.response?.data?.error || 'Failed to fetch sales analytics'))
      .finally(() => setLoading(false));
  }, [dateRange]);

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight={220}><CircularProgress /></Box>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!data) return null;

  return (
    <Paper sx={{ p: { xs: 2, md: 4 }, mb: 3, borderRadius: 4, boxShadow: 4, bgcolor: 'background.default' }}>
      <Typography variant="h5" fontWeight={700} mb={3} color="primary.main" textAlign="center" letterSpacing={1}>
        Sales Analytics
      </Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} justifyContent="space-between" alignItems="stretch" mb={4}>
        <Box flex={1} minWidth={150} sx={{ bgcolor: 'background.paper', borderRadius: 3, boxShadow: 1, p: 2, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
            <Typography variant="subtitle2" color="text.secondary">Total Sales</Typography>
            <IconButton size="small" onClick={handleInfoOpen('totalSales')}>
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
            <InfoPopover
              id="info-totalSales"
              open={Boolean(infoAnchor['totalSales'])}
              anchorEl={infoAnchor['totalSales']}
              onClose={handleInfoClose('totalSales')}
              text={infoTexts.totalSales}
            />
          </Box>
          <Typography variant="h4" fontWeight={700} color="primary.main">{data.totalSales}</Typography>
        </Box>
        <Box flex={1} minWidth={150} sx={{ bgcolor: 'background.paper', borderRadius: 3, boxShadow: 1, p: 2, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
            <Typography variant="subtitle2" color="text.secondary">Total Revenue</Typography>
            <IconButton size="small" onClick={handleInfoOpen('totalRevenue')}>
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
            <InfoPopover
              id="info-totalRevenue"
              open={Boolean(infoAnchor['totalRevenue'])}
              anchorEl={infoAnchor['totalRevenue']}
              onClose={handleInfoClose('totalRevenue')}
              text={infoTexts.totalRevenue}
            />
          </Box>
          <Typography variant="h4" fontWeight={700} color="success.main">₦{data.totalRevenue?.toLocaleString()}</Typography>
        </Box>
        <Box flex={1} minWidth={150} sx={{ bgcolor: 'background.paper', borderRadius: 3, boxShadow: 1, p: 2, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
            <Typography variant="subtitle2" color="text.secondary">Avg. Order Value</Typography>
            <IconButton size="small" onClick={handleInfoOpen('avgOrderValue')}>
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
            <InfoPopover
              id="info-avgOrderValue"
              open={Boolean(infoAnchor['avgOrderValue'])}
              anchorEl={infoAnchor['avgOrderValue']}
              onClose={handleInfoClose('avgOrderValue')}
              text={infoTexts.avgOrderValue}
            />
          </Box>
          <Typography variant="h4" fontWeight={700} color="secondary.main">₦{data.avgOrderValue?.toLocaleString()}</Typography>
        </Box>
        <Box flex={1} minWidth={150} sx={{ bgcolor: 'background.paper', borderRadius: 3, boxShadow: 1, p: 2, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
            <Typography variant="subtitle2" color="text.secondary">Return Rate</Typography>
            <IconButton size="small" onClick={handleInfoOpen('returnRate')}>
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
            <InfoPopover
              id="info-returnRate"
              open={Boolean(infoAnchor['returnRate'])}
              anchorEl={infoAnchor['returnRate']}
              onClose={handleInfoClose('returnRate')}
              text={infoTexts.returnRate}
            />
          </Box>
          <Typography variant="h4" fontWeight={700} color="error.main">{data.returnRate}%</Typography>
        </Box>
      </Stack>
      <Box mt={2}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle1" fontWeight={600} color="primary.dark">Revenue Trends</Typography>
          <IconButton size="small" onClick={handleInfoOpen('revenueTrends')}>
            <HelpOutlineIcon fontSize="small" />
          </IconButton>
          <InfoPopover
            id="info-revenueTrends"
            open={Boolean(infoAnchor['revenueTrends'])}
            anchorEl={infoAnchor['revenueTrends']}
            onClose={handleInfoClose('revenueTrends')}
            text={infoTexts.revenueTrends}
          />
        </Box>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data.revenueTrends || []} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis dataKey="date" tick={{ fontSize: 13 }} angle={-15} dy={10} />
            <YAxis tick={{ fontSize: 13 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: 14 }} />
            <Line type="monotone" dataKey="revenue" stroke={theme.palette.primary.main} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Revenue" />
            <Line type="monotone" dataKey="orders" stroke={theme.palette.success.main} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Orders" />
          </LineChart>
        </ResponsiveContainer>
      </Box>
      <Box mt={4}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle1" fontWeight={600} color="primary.dark">Top Performing Days</Typography>
          <IconButton size="small" onClick={handleInfoOpen('topDays')}>
            <HelpOutlineIcon fontSize="small" />
          </IconButton>
          <InfoPopover
            id="info-topDays"
            open={Boolean(infoAnchor['topDays'])}
            anchorEl={infoAnchor['topDays']}
            onClose={handleInfoClose('topDays')}
            text={infoTexts.topDays}
          />
        </Box>
        <Stack component="ul" direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pl: 2, m: 0, flexWrap: 'wrap' }}>
          {data.topDays?.map((d, i) => (
            <Box component="li" key={i} sx={{ listStyle: 'disc', fontSize: 16, color: 'text.primary', minWidth: 200 }}>
              <b>{d.date}:</b> ₦{d.revenue?.toLocaleString()} <span style={{ color: theme.palette.success.main }}>({d.orders} orders)</span>
            </Box>
          ))}
        </Stack>
      </Box>
    </Paper>
  );
};

SalesAnalytics.propTypes = {
  dateRange: PropTypes.shape({
    startDate: PropTypes.string,
    endDate: PropTypes.string,
  }),
};

export default SalesAnalytics;
