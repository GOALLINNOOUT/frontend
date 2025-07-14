import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, CircularProgress, Grid, useTheme, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import * as api from '../../utils/api';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, LineChart, Line } from 'recharts';
import PropTypes from 'prop-types';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{ bgcolor: 'background.paper', p: 1.5, borderRadius: 2, boxShadow: 2 }}>
        <Typography variant="subtitle2" fontWeight={600}>{label}</Typography>
        {payload.map((entry, i) => (
          <Typography key={i} variant="body2" color={entry.color}>
            {entry.name}: <b>{entry.value}</b>
          </Typography>
        ))}
      </Box>
    );
  }
  return null;
};

/**
 * PageVisitsTrendChart - Shows visits per page (not unique IP) over time
 * @param {Object} props
 * @param {{startDate: string, endDate: string}} props.dateRange
 */
const PageVisitsTrendChart = ({ dateRange }) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPage, setSelectedPage] = useState('');
  const [infoAnchor, setInfoAnchor] = useState({});
  const theme = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams(dateRange).toString();
        const response = await api.get(`/v1/analytics/page-visits-trend?${params}`);
        const { data, ok } = response;
        if (!ok) throw new Error();
        setData(data.pageVisitsTrends || {});
        // Default to first page if not set
        if (!selectedPage && Object.keys(data.pageVisitsTrends || {}).length > 0) {
          setSelectedPage(Object.keys(data.pageVisitsTrends)[0]);
        }
      } catch {
        setError('Failed to load page visits trend');
      } finally {
        setLoading(false);
      }
    };
    if (dateRange.startDate && dateRange.endDate) {
      fetchData();
    }
    // eslint-disable-next-line
  }, [dateRange]);

  const handleInfoOpen = (key) => (event) => setInfoAnchor({ ...infoAnchor, [key]: event.currentTarget });
  const handleInfoClose = (key) => () => setInfoAnchor({ ...infoAnchor, [key]: null });

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight={220}><CircularProgress /></Box>;
  if (error) return <Typography color="error.main" align="center" mt={2}>{error}</Typography>;
  if (!data || Object.keys(data).length === 0) return null;

  const pages = Object.keys(data);
  const chartData = selectedPage ? data[selectedPage]?.filter(row => {
    // Filter by dateRange if present
    if (!dateRange?.startDate || !dateRange?.endDate) return true;
    const d = new Date(row.date);
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    return d >= start && d <= end;
  }) : [];

  const infoTexts = {
    visitsOverTime: 'Shows how many times a specific page was visited during the selected period. Helps you see which pages are busiest.'
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

  return (
    <Card sx={{ borderRadius: 4, boxShadow: 3, mb: 3, bgcolor: 'background.default' }}>
      <CardContent>
        <Typography variant="h5" fontWeight={700} mb={1} color="primary.main">Page Visits Trend</Typography>
        <Typography variant="subtitle1" color="text.secondary" mb={3}>
          Total visits per page for the selected period
        </Typography>
        <Grid container spacing={4} alignItems="flex-start">
          <Grid item xs={12} md={5}>
            <FormControl sx={{ minWidth: 220, mb: 2, bgcolor: theme.palette.background.paper, borderRadius: 2, boxShadow: 1 }} size="medium">
              <InputLabel id="page-select-label">Page</InputLabel>
              <Select
                labelId="page-select-label"
                value={selectedPage}
                label="Page"
                onChange={e => setSelectedPage(e.target.value)}
                sx={{ fontWeight: 600 }}
              >
                {pages.map(page => (
                  <MenuItem key={page} value={page} sx={{ fontFamily: 'monospace', fontSize: 15 }}>{page}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box mt={2}>
              <Typography variant="body2" color="text.secondary">
                <b>Tip:</b> Select a page to view its visit trend.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={7}>
            <Box sx={{ bgcolor: theme.palette.background.paper, borderRadius: 3, p: 2, boxShadow: 1, height: '100%', width: '90vw', maxWidth: 700 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" fontWeight={600} color="primary.dark">Visits Over Time</Typography>
                <IconButton size="small" onClick={handleInfoOpen('visitsOverTime')}>
                  <HelpOutlineIcon fontSize="small" />
                </IconButton>
                <InfoPopover
                  id="info-visitsOverTime"
                  open={Boolean(infoAnchor['visitsOverTime'])}
                  anchorEl={infoAnchor['visitsOverTime']}
                  onClose={handleInfoClose('visitsOverTime')}
                  text={infoTexts.visitsOverTime}
                />
              </Box>
              <Box sx={{ width: '100%' }}>
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="pageVisitsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#43a047" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#43a047" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} angle={-20} dy={10} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="top" height={36} iconType="circle"/>
                    <Line type="monotone" dataKey="visits" stroke="#43a047" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 7 }} name="Visits" fill="url(#pageVisitsGradient)" />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

PageVisitsTrendChart.propTypes = {
  dateRange: PropTypes.shape({
    startDate: PropTypes.string,
    endDate: PropTypes.string,
  }),
};

export default PageVisitsTrendChart;
