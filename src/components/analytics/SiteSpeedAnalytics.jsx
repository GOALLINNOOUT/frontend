import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, CircularProgress, useTheme, IconButton, Popover, Divider, Tabs, Tab } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PropTypes from 'prop-types';
import * as api from '../../utils/api';

const METRICS = [
  { key: 'LCP', label: 'Largest Contentful Paint' },
  { key: 'FID', label: 'First Input Delay' },
  { key: 'CLS', label: 'Cumulative Layout Shift' },
  { key: 'FCP', label: 'First Contentful Paint' },
  { key: 'TTFB', label: 'Time to First Byte' },
  { key: 'INP', label: 'Interaction to Next Paint' },
];

function getTooltipStyles(theme) {
  return {
    contentStyle: {
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.primary,
      borderRadius: 8,
      fontSize: 14,
      border: `1px solid ${theme.palette.divider}`,
      boxShadow: theme.shadows[1],
    },
    labelStyle: {
      color: theme.palette.text.secondary,
      fontWeight: 600,
    },
    itemStyle: {
      color: theme.palette.text.primary,
      fontWeight: 500,
    },
  };
}

const SiteSpeedAnalytics = ({ dateRange }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [infoAnchor, setInfoAnchor] = useState(null);
  const [tab, setTab] = useState(0);
  const theme = useTheme();
  const tooltipStyles = getTooltipStyles(theme);

  const infoText = 'Web Vitals measure real user performance. Metrics like LCP, FID, CLS, INP, FCP, and TTFB help you understand and improve site speed and user experience.';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!dateRange?.startDate || !dateRange?.endDate) return;
        const params = new URLSearchParams({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        }).toString();
        const res = await api.get(`/v1/analytics/web-vitals?${params}`);
        setData(res.data.metrics || []);
      } catch (err) {
        setError('Failed to load site speed analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dateRange]);

  const currentMetric = METRICS[tab].key;
  const metricData = data.filter(d => d.name === currentMetric);

  // Aggregate by day for line chart
  const daily = {};
  metricData.forEach(d => {
    const day = d.timestamp.slice(0, 10);
    if (!daily[day]) daily[day] = [];
    daily[day].push(d.value);
  });
  const chartData = Object.entries(daily).map(([date, values]) => ({
    date,
    avg: values.reduce((a, b) => a + b, 0) / values.length,
    p95: values.sort((a, b) => a - b)[Math.floor(values.length * 0.95)] || 0,
    count: values.length,
  }));

  return (
    <Card elevation={2} sx={{ mb: 3, borderRadius: 3, bgcolor: theme.palette.background.paper }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={1}>
          <Typography variant="subtitle1" fontWeight={700} color="primary.main" flexGrow={1}>
            Site Speed & Performance (Web Vitals)
          </Typography>
          <IconButton size="small" onClick={e => setInfoAnchor(e.currentTarget)} aria-label="info">
            <HelpOutlineIcon fontSize="small" />
          </IconButton>
          <Popover
            open={Boolean(infoAnchor)}
            anchorEl={infoAnchor}
            onClose={() => setInfoAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            PaperProps={{ sx: { p: 2, maxWidth: 320 } }}
          >
            <Typography variant="body2" color="text.secondary">{infoText}</Typography>
          </Popover>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 2 }}>
          {METRICS.map((m, i) => (
            <Tab key={m.key} label={m.label} value={i} />
          ))}
        </Tabs>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={220}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" sx={{ my: 3 }}>{error}</Typography>
        ) : !metricData.length ? (
          <Typography color="text.secondary" sx={{ my: 3 }}>
            No data for {METRICS[tab].label} in the selected date range.
          </Typography>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <XAxis dataKey="date" stroke={theme.palette.text.secondary} />
              <YAxis stroke={theme.palette.text.secondary} />
              <Tooltip contentStyle={tooltipStyles.contentStyle} labelStyle={tooltipStyles.labelStyle} itemStyle={tooltipStyles.itemStyle} />
              <Legend />
              <Line type="monotone" dataKey="avg" name="Average" stroke="#1976d2" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="p95" name="95th Percentile" stroke="#d32f2f" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
        <Box sx={{ fontSize: 12, color: '#888', mt: 1 }}>
          Web Vitals are measured from real user sessions. Aim for green scores for best UX.
        </Box>
      </CardContent>
    </Card>
  );
};

SiteSpeedAnalytics.propTypes = {
  dateRange: PropTypes.shape({
    startDate: PropTypes.string,
    endDate: PropTypes.string,
  }).isRequired,
};

export default SiteSpeedAnalytics;
