import React, { useEffect, useState } from 'react';
import { Paper, Typography, Box, CircularProgress } from '@mui/material';
import * as api from '../../utils/api';
import PropTypes from 'prop-types';

 /**
 * MarketingPerformance analytics component
 * @param {Object} props
 * @param {{startDate: string, endDate: string}} props.dateRange - Date range filter
 */
const MarketingPerformance = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data, ok } = await api.get('/v1/analytics/marketing');
        if (!ok) throw new Error();
        setData(data);
      } catch {
        setError('Failed to load marketing performance analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight={180}><CircularProgress /></Box>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!data) return null;

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" fontWeight={600} mb={2}>Marketing Performance</Typography>
      <Box>
        <Typography>No marketing campaign analytics available. Campaign tracking is not enabled for this store.</Typography>
      </Box>
    </Paper>
  );
};



export default MarketingPerformance;
