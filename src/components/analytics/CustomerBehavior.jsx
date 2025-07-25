import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Card, CardContent, Typography, Grid, Box, CircularProgress, List, ListItem, ListItemText, Chip, Stack, Divider, Avatar, useTheme
} from '@mui/material';
import * as api from '../../utils/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell, LabelList
} from 'recharts';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';

const CustomerBehavior = ({ dateRange }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [liveVisitorsTrend, setLiveVisitorsTrend] = useState([]);
  const [funnelData, setFunnelData] = useState({ funnel: [], topCartProducts: [] });
  const [error, setError] = useState(null);
  const [infoAnchor, setInfoAnchor] = useState({});
  const [colorModeUsage, setColorModeUsage] = useState([]);
  const theme = useTheme();
  const analyticsColors = theme.palette.customerAnalytics;
  const COLORS = [
    analyticsColors.blue,
    analyticsColors.green,
    analyticsColors.yellow,
    analyticsColors.red,
    analyticsColors.purple,
    analyticsColors.cyan,
  ];

  // Tooltip style for theme support
  const tooltipStyle = {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    borderRadius: 8,
    fontSize: 14,
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: theme.shadows[1],
  };
  const tooltipLabelStyle = {
    color: theme.palette.text.secondary,
    fontWeight: 600,
  };
  const tooltipItemStyle = {
    color: theme.palette.text.primary,
    fontWeight: 500,
  };

  const infoTexts = {
    live: '<strong>Live Visitors</strong> shows how many people are currently browsing your site. <strong>Live Carts</strong> shows how many people just added items to their cart.',
    newReturning: 'This chart compares new customers (first-time buyers) to returning customers (those who have shopped before). More returning customers means people are coming back to your store.',
    topBuyers: 'This list shows your customers who have spent the most in your store. These are your most valuable shoppers.',
    retention: 'Retention rate shows the percentage of customers who come back and shop again. A higher rate means more loyal customers.',
    locations: 'This chart shows where your customers are located. It helps you see which states or regions your store is most popular in.',
    devices: 'This chart shows what devices (like phones, tablets, or computers) your customers use to shop. It helps you understand how people access your store.',
    clv: 'Customer Lifetime Value (CLV) is the total amount a customer is expected to spend in your store over time. Higher CLV means customers are spending more with you.',
    spend: 'This chart shows how much each customer have spent. It helps you see your typical order value per customer.',
    topCart: "This chart shows which products are most often added to customers' carts. It helps you spot your most popular items.",
    funnel: 'This chart shows the steps customers take from visiting your site to making a purchase. It helps you see where people drop off in the buying process.'
    ,colorMode: 'This chart shows which color mode (light, dark, or system) your users prefer. It helps you understand how people like to view your site.'
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
        <Typography variant="body2" color="text.secondary" dangerouslySetInnerHTML={{ __html: text }} />
      </Popover>
    );
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        }).toString();
        const { data: customersData, ok: ok1 } = await api.get(`/v1/analytics/customers?${params}`);
        if (!ok1) throw new Error();
        setData(customersData);
        const { data: funnelDataRes, ok: ok2 } = await api.get(`/v1/analytics/funnel?${params}`);
        if (!ok2) throw new Error();
        setFunnelData(funnelDataRes);
        // Fetch live visitors trend for the last 15 minutes
        const { data: liveTrend, ok: ok3 } = await api.get(`/v1/analytics/live-visitors-trend?minutes=15`);
        if (ok3 && Array.isArray(liveTrend?.trend)) {
          setLiveVisitorsTrend(liveTrend.trend);
        } else {
          setLiveVisitorsTrend([]);
        }
        // Fetch color mode usage
        const { data: colorModeData, ok: ok4 } = await api.get(`/v1/analytics/color-mode-usage?${params}`);
        if (ok4 && Array.isArray(colorModeData?.colorModeUsage)) {
          setColorModeUsage(colorModeData.colorModeUsage);
        } else {
          setColorModeUsage([]);
        }
      } catch {
        setError('Failed to load customer behavior analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dateRange]);

  const handleInfoOpen = (key) => (event) => setInfoAnchor({ ...infoAnchor, [key]: event.currentTarget });
  const handleInfoClose = (key) => () => setInfoAnchor({ ...infoAnchor, [key]: null });

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight={220}><CircularProgress /></Box>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!data) return null;

  return (
    <Card sx={{ p: { xs: 1, sm: 3 }, mb: 3, borderRadius: 4, boxShadow: 3, background: `linear-gradient(135deg, ${theme.palette.background.paper} 80%, ${theme.palette.primary.light}10%)` }}>
      <CardContent>
        <Typography variant="h5" fontWeight={700} mb={2} color="primary.main" letterSpacing={1}>
          Customer Behavior Analytics
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={4}>
          {/* Color Mode Usage Chart */}
          <Grid item xs={12}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
                  Color Mode Usage
                </Typography>
                <IconButton size="small" onClick={handleInfoOpen('colorMode')}>
                  <HelpOutlineIcon fontSize="small" />
                </IconButton>
                <InfoPopover
                  id="info-colorMode"
                  open={Boolean(infoAnchor['colorMode'])}
                  anchorEl={infoAnchor['colorMode']}
                  onClose={handleInfoClose('colorMode')}
                  text={infoTexts.colorMode}
                />
              </Box>
              <Box sx={{ width: '90vw', maxWidth: '100%', height: 320, background: analyticsColors.lightBg, borderRadius: 3, p: 2, mb: 2 }}>
                {Array.isArray(colorModeUsage) && colorModeUsage.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={colorModeUsage} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorModeGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={analyticsColors.blue} stopOpacity={0.8} />
                          <stop offset="100%" stopColor={analyticsColors.purple} stopOpacity={0.7} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="colorMode" tick={{ fontSize: 14, fontWeight: 600 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 13 }} />
                      <Tooltip 
                        contentStyle={tooltipStyle}
                        labelStyle={tooltipLabelStyle}
                        itemStyle={tooltipItemStyle}
                        formatter={(value) => `${value} user${value === 1 ? '' : 's'}`}
                      />
                      <Legend />
                      <Bar dataKey="count" fill="url(#colorModeGradient)" radius={[8, 8, 0, 0]} name="Users">
                        <LabelList dataKey="count" position="top" style={{ fontWeight: 700, fontSize: 15 }} />
                        {colorModeUsage.map((entry, idx) => (
                          <Cell key={`cell-cm-${idx}`} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Typography color="text.secondary" fontSize={16} textAlign="center" width="100%">
                    No color mode data available.
                  </Typography>
                )}
              </Box>
            </Stack>
          </Grid>
          {/* Live Visitors Trend Chart (last 15 minutes) */}
          <Grid item xs={12}>
            <Box sx={{ width: '90vw', maxWidth: '100%', height: 320, background: analyticsColors.lightBg, borderRadius: 3, p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
                  Live Visitors (last 15 minutes)
                </Typography>
                <IconButton size="small" onClick={handleInfoOpen('live')}>
                  <HelpOutlineIcon fontSize="small" />
                </IconButton>
                <InfoPopover
                  id="info-live"
                  open={Boolean(infoAnchor['live'])}
                  anchorEl={infoAnchor['live']}
                  onClose={handleInfoClose('live')}
                  text={infoTexts.live}
                />
              </Box>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={liveVisitorsTrend} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="liveVisitorsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={analyticsColors.blue} stopOpacity={0.8} />
                      <stop offset="100%" stopColor={analyticsColors.green} stopOpacity={0.7} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="minute" tick={{ fontSize: 13 }} interval={0} angle={-15} textAnchor="end" height={60} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 13 }} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle}
                    formatter={(value) => `${value} visitor${value === 1 ? '' : 's'}`}
                  />
                  <Legend />
                  <Bar dataKey="count" fill="url(#liveVisitorsGradient)" name="Active Visitors" radius={[8, 8, 0, 0]}>
                    <LabelList dataKey="count" position="top" style={{ fontWeight: 600, fontSize: 13 }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Grid>

          {/* New vs Returning Customers */}
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
                  New vs Returning Customers
                </Typography>
                <IconButton size="small" onClick={handleInfoOpen('newReturning')}>
                  <HelpOutlineIcon fontSize="small" />
                </IconButton>
                <InfoPopover
                  id="info-newReturning"
                  open={Boolean(infoAnchor['newReturning'])}
                  anchorEl={infoAnchor['newReturning']}
                  onClose={handleInfoClose('newReturning')}
                  text={infoTexts.newReturning}
                />
              </Box>
              {/* Info: New vs Returning Customers */}
              <Typography variant="body2" color="text.secondary">
               
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Chip label={`New: ${data.newCustomers}`} color="primary" size="medium" sx={{ fontWeight: 600, fontSize: 16 }} />
                <Chip label={`Returning: ${data.returningCustomers}`} color="success" size="medium" sx={{ fontWeight: 600, fontSize: 16 }} />
              </Stack>
              <Box sx={{ width: '100%', height: 220, background: analyticsColors.lightBg, borderRadius: 3, p: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[{ name: 'New', value: data.newCustomers }, { name: 'Returning', value: data.returningCustomers }]} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={analyticsColors.blue} stopOpacity={0.8} />
                        <stop offset="100%" stopColor={analyticsColors.green} stopOpacity={0.7} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 14, fontWeight: 600 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 13 }} />
                    <Tooltip 
                      contentStyle={tooltipStyle}
                      labelStyle={tooltipLabelStyle}
                      itemStyle={tooltipItemStyle}
                    />
                    <Legend />
                    <Bar dataKey="value" fill="url(#barGradient)" radius={[8, 8, 0, 0]} name="Customers">
                      <LabelList dataKey="value" position="top" style={{ fontWeight: 700, fontSize: 15 }} />
                      <Cell fill={COLORS[0]} />
                      <Cell fill={COLORS[1]} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Stack>
          </Grid>

          {/* Top Buyers */}
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
                  Top Buyers
                </Typography>
                <IconButton size="small" onClick={handleInfoOpen('topBuyers')}>
                  <HelpOutlineIcon fontSize="small" />
                </IconButton>
                <InfoPopover
                  id="info-topBuyers"
                  open={Boolean(infoAnchor['topBuyers'])}
                  anchorEl={infoAnchor['topBuyers']}
                  onClose={handleInfoClose('topBuyers')}
                  text={infoTexts.topBuyers}
                />
              </Box>
              {/* Info: Top Buyers */}
              <Typography variant="body2" color="text.secondary">
               
              </Typography>
              <List dense sx={{ bgcolor: analyticsColors.lightBg, borderRadius: 3, p: 2, minHeight: 220 }}>
                {data.topBuyers?.length === 0 && (
                  <ListItem>
                    <ListItemText primary="No data available" />
                  </ListItem>
                )}
                {data.topBuyers?.map((b, i) => (
                  <ListItem key={i} sx={{ mb: 1 }}>
                    <Avatar sx={{ bgcolor: COLORS[i % COLORS.length], mr: 2, width: 36, height: 36 }}>
                      {b.name?.[0]?.toUpperCase() || '?'}
                    </Avatar>
                    <ListItemText
                      primary={<Typography fontWeight={600}>{b.name}</Typography>}
                      secondary={<>
                        <Typography variant="body2" color="text.secondary">{b.email}</Typography>
                        <Typography variant="body2" color="primary.main" fontWeight={600}>₦{b.spend?.toLocaleString()}</Typography>
                      </>}
                    />
                  </ListItem>
                ))}
              </List>
            </Stack>
          </Grid>

          {/* Retention Rate */}
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
                  Customer Retention Rate
                </Typography>
                <IconButton size="small" onClick={handleInfoOpen('retention')}>
                  <HelpOutlineIcon fontSize="small" />
                </IconButton>
                <InfoPopover
                  id="info-retention"
                  open={Boolean(infoAnchor['retention'])}
                  anchorEl={infoAnchor['retention']}
                  onClose={handleInfoClose('retention')}
                  text={infoTexts.retention}
                />
              </Box>
              {/* Info: Retention Rate */}
              <Typography variant="body2" color="text.secondary">
                
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <Chip label={`Retention Rate: ${data.retentionRate}%`} color="info" size="medium" sx={{ fontWeight: 600, fontSize: 16 }} />
              </Box>
            </Stack>
          </Grid>

          {/* Customer Locations */}
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
                  Customer Locations
                </Typography>
                <IconButton size="small" onClick={handleInfoOpen('locations')}>
                  <HelpOutlineIcon fontSize="small" />
                </IconButton>
                <InfoPopover
                  id="info-locations"
                  open={Boolean(infoAnchor['locations'])}
                  anchorEl={infoAnchor['locations']}
                  onClose={handleInfoClose('locations')}
                  text={infoTexts.locations}
                />
              </Box>
              {/* Info: Customer Locations */}
              <Typography variant="body2" color="text.secondary">
                
              </Typography>
              <Box sx={{ width: '100vw', height: 320, background: analyticsColors.lightBg, borderRadius: 3, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {(Array.isArray(data.locations) && data.locations.length > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.locations} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="locGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={analyticsColors.cyan} stopOpacity={0.8} />
                          <stop offset="100%" stopColor={analyticsColors.blue} stopOpacity={0.7} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="state" tick={{ fontSize: 13 }} interval={0} angle={-15} textAnchor="end" height={60} />
                      <YAxis tick={{ fontSize: 13 }} />
                      <Tooltip 
                        contentStyle={tooltipStyle}
                        labelStyle={tooltipLabelStyle}
                        itemStyle={tooltipItemStyle}
                      />
                      <Legend />
                      <Bar dataKey="count" fill="url(#locGradient)" radius={[8, 8, 0, 0]} name="Customers">
                        <LabelList dataKey="count" position="top" style={{ fontWeight: 600, fontSize: 13 }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Typography color="text.secondary" fontSize={16} textAlign="center" width="100%">
                    No customer location data available.
                  </Typography>
                )}
              </Box>
            </Stack>
          </Grid>

          {/* Devices Used */}
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
                  Devices Used
                </Typography>
                <IconButton size="small" onClick={handleInfoOpen('devices')}>
                  <HelpOutlineIcon fontSize="small" />
                </IconButton>
                <InfoPopover
                  id="info-devices"
                  open={Boolean(infoAnchor['devices'])}
                  anchorEl={infoAnchor['devices']}
                  onClose={handleInfoClose('devices')}
                  text={infoTexts.devices}
                />
              </Box>
              {/* Info: Devices Used */}
              <Typography variant="body2" color="text.secondary">
                
              </Typography>
              <Box sx={{ width: '90vw', height: 320, background: analyticsColors.lightBg, borderRadius: 3, p: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.devices || []} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="devGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={analyticsColors.purple} stopOpacity={0.8} />
                        <stop offset="100%" stopColor={analyticsColors.cyan} stopOpacity={0.7} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="type" tick={{ fontSize: 13 }} interval={0} angle={-15} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 13 }} />
                    <Tooltip 
                      contentStyle={tooltipStyle}
                      labelStyle={tooltipLabelStyle}
                      itemStyle={tooltipItemStyle}
                    />
                    <Legend />
                    <Bar dataKey="percent" fill="url(#devGradient)" name="Device Usage (%)" radius={[8, 8, 0, 0]}>
                      <LabelList dataKey="percent" position="top" style={{ fontWeight: 600, fontSize: 13 }} />
                      {(data.devices || []).map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Stack>
          </Grid>

          {/* Customer Lifetime Value & Average Spend */}
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
                  Customer Lifetime Value
                </Typography>
                <IconButton size="small" onClick={handleInfoOpen('clv')}>
                  <HelpOutlineIcon fontSize="small" />
                </IconButton>
                <InfoPopover
                  id="info-clv"
                  open={Boolean(infoAnchor['clv'])}
                  anchorEl={infoAnchor['clv']}
                  onClose={handleInfoClose('clv')}
                  text={infoTexts.clv}
                />
              </Box>
              {/* Info: Customer Lifetime Value */}
              <Typography variant="body2" color="text.secondary">
                
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <Chip label={`Avg. CLV: ₦${data.customerLifetimeValue?.toLocaleString() ?? '0'}`} color="info" size="medium" sx={{ fontWeight: 600, fontSize: 16 }} />
                {data.topCustomerLifetimeValue && (
                  <Chip label={`Top CLV: ₦${data.topCustomerLifetimeValue?.toLocaleString()}`} color="success" size="medium" sx={{ fontWeight: 600, fontSize: 16 }} />
                )}
              </Box>
            </Stack>
          </Grid>

          {/* Average Spend per Customer */}
          <Grid item xs={12}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
                  Spend per Customer
                </Typography>
                <IconButton size="small" onClick={handleInfoOpen('spend')}>
                  <HelpOutlineIcon fontSize="small" />
                </IconButton>
                <InfoPopover
                  id="info-spend"
                  open={Boolean(infoAnchor['spend'])}
                  anchorEl={infoAnchor['spend']}
                  onClose={handleInfoClose('spend')}
                  text={infoTexts.spend}
                />
              </Box>
              {/* Info: Spend per Customer */}
              <Typography variant="body2" color="text.secondary">
                
              </Typography>
              <Box sx={{ width: '90vw', height: 320, background: analyticsColors.lightBg, borderRadius: 3, p: 2 }}>
                {Array.isArray(data.averageSpendPerCustomer) && data.averageSpendPerCustomer.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.averageSpendPerCustomer} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={analyticsColors.blue} stopOpacity={0.8} />
                          <stop offset="100%" stopColor={analyticsColors.green} stopOpacity={0.7} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 13 }} interval={0} angle={-15} textAnchor="end" height={60} />
                      <YAxis tick={{ fontSize: 13 }} allowDecimals={false} />
                      <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle}
                        formatter={(value) => `₦${Number(value).toLocaleString()}`}
                      />
                      <Legend />
                      <Bar dataKey="spend" fill="url(#spendGradient)" name="Amt. Spent" radius={[8, 8, 0, 0]}>
                        <LabelList dataKey="spend" position="top" style={{ fontWeight: 600, fontSize: 13 }} formatter={(value) => `₦${Number(value).toLocaleString()}`} />
                        {(data.averageSpendPerCustomer || []).map((entry, idx) => (
                          <Cell key={`cell-spend-${idx}`} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Typography color="text.secondary" fontSize={16} textAlign="center" width="100%">
                    No spend data available.
                  </Typography>
                )}
              </Box>
            </Stack>
          </Grid>

          {/* Top Added-to-Cart Products */}
          <Grid item xs={12}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
                  Top Added-to-Cart Products
                </Typography>
                <IconButton size="small" onClick={handleInfoOpen('topCart')}>
                  <HelpOutlineIcon fontSize="small" />
                </IconButton>
                <InfoPopover
                  id="info-topCart"
                  open={Boolean(infoAnchor['topCart'])}
                  anchorEl={infoAnchor['topCart']}
                  onClose={handleInfoClose('topCart')}
                  text={infoTexts.topCart}
                />
              </Box>
              {/* Info: Top Added-to-Cart Products */}
              <Typography variant="body2" color="text.secondary">
               
              </Typography>
              <Box sx={{ width: '90vw', height: 320, background: analyticsColors.lightBg, borderRadius: 3, p: 2 }}>
                {Array.isArray(funnelData.topCartProducts) && funnelData.topCartProducts.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={funnelData.topCartProducts} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="cartGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={analyticsColors.yellow} stopOpacity={0.8} />
                          <stop offset="100%" stopColor={analyticsColors.red} stopOpacity={0.7} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 13 }} interval={0} angle={-15} textAnchor="end" height={60} />
                      <YAxis tick={{ fontSize: 13 }} allowDecimals={false} />
                      <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} />
                      <Legend />
                      <Bar dataKey="count" fill="url(#cartGradient)" name="Added to Cart" radius={[8, 8, 0, 0]}>
                        <LabelList dataKey="count" position="top" style={{ fontWeight: 600, fontSize: 13 }} />
                        {(funnelData.topCartProducts || []).map((entry, idx) => (
                          <Cell key={`cell-cart-${idx}`} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Typography color="text.secondary" fontSize={16} textAlign="center" width="100%">
                    No cart data available.
                  </Typography>
                )}
              </Box>
            </Stack>
          </Grid>

          {/* Funnel Visualization: Visit → Add to Cart → Checkout → Purchase */}
          <Grid item xs={12}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
                  Funnel: Visit → Add to Cart → Checkout → Purchase
                </Typography>
                <IconButton size="small" onClick={handleInfoOpen('funnel')}>
                  <HelpOutlineIcon fontSize="small" />
                </IconButton>
                <InfoPopover
                  id="info-funnel"
                  open={Boolean(infoAnchor['funnel'])}
                  anchorEl={infoAnchor['funnel']}
                  onClose={handleInfoClose('funnel')}
                  text={infoTexts.funnel}
                />
              </Box>
              {/* Info: Funnel Visualization */}
              <Typography variant="body2" color="text.secondary">
  
              </Typography>
              <Box sx={{ width: '90vw', height: 320, background: analyticsColors.lightBg, borderRadius: 3, p: 2 }}>
                {Array.isArray(funnelData.funnel) && funnelData.funnel.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={funnelData.funnel} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="funnelGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={analyticsColors.blue} stopOpacity={0.8} />
                          <stop offset="100%" stopColor={analyticsColors.green} stopOpacity={0.7} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="stage" tick={{ fontSize: 13 }} interval={0} angle={-15} textAnchor="end" height={60} />
                      <YAxis tick={{ fontSize: 13 }} allowDecimals={false} />
                      <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} />
                      <Legend />
                      <Bar dataKey="count" fill="url(#funnelGradient)" name="Users" radius={[8, 8, 0, 0]}>
                        <LabelList dataKey="count" position="top" style={{ fontWeight: 600, fontSize: 13 }} />
                        {(funnelData.funnel || []).map((entry, idx) => (
                          <Cell key={`cell-funnel-${idx}`} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Typography color="text.secondary" fontSize={16} textAlign="center" width="100%">
                    No funnel data available.
                  </Typography>
                )}
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

CustomerBehavior.propTypes = {
  dateRange: PropTypes.shape({
    startDate: PropTypes.string,
    endDate: PropTypes.string,
  }),
};

export default CustomerBehavior;
