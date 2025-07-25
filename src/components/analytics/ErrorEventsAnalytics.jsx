import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, CircularProgress, Divider, useTheme } from '@mui/material';
import { get } from '../../utils/api';
import { Modal, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Tooltip as MuiTooltip } from '@mui/material';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, LabelList } from 'recharts';

/**
 * ErrorEventsAnalytics - Visualizes error boundary events for admin/analytics
 */
const ErrorEventsAnalytics = ({ dateRange }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalErrors, setModalErrors] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        let url = '/v1/analytics/errors';
        if (dateRange?.startDate && dateRange?.endDate) {
          const params = new URLSearchParams({
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
          });
          url += `?${params.toString()}`;
        }
        const res = await get(url);
        setData(res.data.errors || []);
      } catch (err) {
        setError('Failed to load error events');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dateRange]);

  // Aggregate errors by day
  const daily = {};
  data.forEach(e => {
    const day = e.timestamp?.slice(0, 10) || 'Unknown';
    if (!daily[day]) daily[day] = [];
    daily[day].push(e);
  });
  const chartData = Object.entries(daily).map(([date, events]) => ({
    date,
    count: events.length,
    errors: events,
  }));

  // Handler for bar click to show error details
  const handleBarClick = (data, index) => {
    setModalErrors(chartData[index]?.errors || []);
    setModalOpen(true);
  };

  return (
    <Card elevation={2} sx={{ mb: 3, borderRadius: 3, bgcolor: theme.palette.background.paper }}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight={700} color="error.main" gutterBottom>
          Error Boundary Events
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Shows the number of error boundary events (crashes) per day. Click a bar to see error details.
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={220}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" sx={{ my: 3 }}>{error}</Typography>
        ) : !chartData.length ? (
          <Typography color="text.secondary" sx={{ my: 3 }}>
            No error events in the selected date range.
          </Typography>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }} onClick={handleBarClick}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke={theme.palette.text.secondary} />
              <YAxis stroke={theme.palette.text.secondary} allowDecimals={false} />
              <Tooltip formatter={(value) => [`${value} errors`, 'Errors']} />
              <Bar dataKey="count" fill={theme.palette.error.main} barSize={40} radius={[10, 10, 0, 0]} name="Errors" onClick={handleBarClick}>
                <LabelList dataKey="count" position="top" fontSize={16} fontWeight={700} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* Modal for error details per day */}
        <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 3,
            borderRadius: 2,
            minWidth: 350,
            maxWidth: 600,
            maxHeight: '80vh',
            overflowY: 'auto',
          }}>
            <Typography variant="h6" mb={2} color="error.main">Error Details</Typography>
            {modalErrors.length === 0 ? (
              <Typography>No error details for this day.</Typography>
            ) : (
              <TableContainer component={Paper} sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date/Time</TableCell>
                      <TableCell>Error Message</TableCell>
                      <TableCell>Page URL</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Stack</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {modalErrors.map((err, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{err.timestamp ? new Date(err.timestamp).toLocaleString() : ''}</TableCell>
                        <TableCell>{err.message}</TableCell>
                        <TableCell>
                          <MuiTooltip title={err.url || ''}>
                            <span style={{ maxWidth: 120, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{err.url}</span>
                          </MuiTooltip>
                        </TableCell>
                        <TableCell>{err.user || '-'}</TableCell>
                        <TableCell>
                          <MuiTooltip title={err.stack || ''}>
                            <span style={{ maxWidth: 120, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{err.stack ? err.stack.slice(0, 30) + '...' : '-'}</span>
                          </MuiTooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            <Box textAlign="right">
              <Button variant="contained" color="primary" onClick={() => setModalOpen(false)}>Close</Button>
            </Box>
          </Box>
        </Modal>

        {/* Table of recent errors (last 10) */}
        <Typography variant="subtitle2" mt={4} mb={1} color="text.secondary">Recent Error Events</Typography>
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date/Time</TableCell>
                <TableCell>Error Message</TableCell>
                <TableCell>Page URL</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Stack</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.slice(0, 10).map((err, idx) => (
                <TableRow key={idx}>
                  <TableCell>{err.timestamp ? new Date(err.timestamp).toLocaleString() : ''}</TableCell>
                  <TableCell>{err.message}</TableCell>
                  <TableCell>
                    <MuiTooltip title={err.url || ''}>
                      <span style={{ maxWidth: 120, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{err.url}</span>
                    </MuiTooltip>
                  </TableCell>
                  <TableCell>{err.user || '-'}</TableCell>
                  <TableCell>
                    <MuiTooltip title={err.stack || ''}>
                      <span style={{ maxWidth: 120, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{err.stack ? err.stack.slice(0, 30) + '...' : '-'}</span>
                    </MuiTooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default ErrorEventsAnalytics;
