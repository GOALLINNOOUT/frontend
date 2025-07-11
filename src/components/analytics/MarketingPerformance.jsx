import React, { useEffect, useState } from 'react';
import { Paper, Typography, Box, CircularProgress } from '@mui/material';
import axios from 'axios';
import PropTypes from 'prop-types';

 /**
 * MarketingPerformance analytics component
 * @param {Object} props
 * @param {{startDate: string, endDate: string}} props.dateRange - Date range filter
 */
const MarketingPerformance = ({ dateRange }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/v1/analytics/marketing', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setData(res.data);
      } catch (err) {
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

MarketingPerformance.propTypes = {
  dateRange: PropTypes.shape({
    startDate: PropTypes.string,
    endDate: PropTypes.string,
  }),
};

export default MarketingPerformance;
