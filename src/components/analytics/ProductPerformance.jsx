import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Paper, Typography, Grid, Box, CircularProgress, Chip, List, ListItem, ListItemText, Card, CardContent, Divider, Tooltip as MuiTooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import * as api from '../../utils/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, LabelList, Cell } from 'recharts';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';

const COLORS = ['#1976d2', '#43a047', '#fbc02d', '#e53935', '#8e24aa', '#00bcd4'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper elevation={3} sx={{ p: 1, minWidth: 120 }}>
        <Typography variant="subtitle2" fontWeight={600}>{label}</Typography>
        {payload.map((entry, i) => (
          <Box key={i} display="flex" alignItems="center" gap={1}>
            <Box sx={{ width: 10, height: 10, bgcolor: entry.color, borderRadius: '50%' }} />
            <Typography variant="body2">{entry.name}: <b>{entry.value}</b></Typography>
          </Box>
        ))}
      </Paper>
    );
  }
  return null;
};

const SectionCard = ({ title, children, theme }) => {
  return (
    <Card elevation={2} sx={{ mb: 3, borderRadius: 3, bgcolor: theme.palette.productAnalytics.sectionBg }}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight={700} mb={1} color="primary.main">{title}</Typography>
        <Divider sx={{ mb: 2 }} />
        {children}
      </CardContent>
    </Card>
  );
};

const ProductPerformance = ({ dateRange }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [infoAnchor, setInfoAnchor] = useState({});
  const [highlightedBar, setHighlightedBar] = useState(null);


  // Refs for each chart section
  const chartRefs = {
    topSelling: React.useRef(null),
    leastPerforming: React.useRef(null),
    mostViewed: React.useRef(null),
    conversionRates: React.useRef(null),
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        }).toString();
        const { data, ok } = await api.get(`/v1/analytics/products?${params}`);
        if (!ok) throw new Error();
        setData(data);
      } catch {
        setError('Failed to load product performance analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dateRange]);

  const handleInfoOpen = (key) => (event) => setInfoAnchor({ ...infoAnchor, [key]: event.currentTarget });
  const handleInfoClose = (key) => () => setInfoAnchor({ ...infoAnchor, [key]: null });

  const infoTexts = {
    topSelling: 'Products with the highest sales and revenue in the selected period.',
    leastPerforming: 'Products with the lowest sales and revenue.',
    mostViewed: 'Products that were viewed the most by users.',
    conversionRate: 'Shows what percentage of users who viewed a product actually added it to cart.',
    stockAlerts: 'Products with low stock (5 or fewer left).',
    stagnant: 'Products that have not had any sales in the selected period.'
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

  // Scroll to chart and highlight bar
  const handleListItemClick = (section, id) => {
    setHighlightedBar(`${section}-${id}`);
    setTimeout(() => setHighlightedBar(null), 3000);
    if (chartRefs[section] && chartRefs[section].current) {
      chartRefs[section].current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Early returns to prevent null data access
  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight={180}><CircularProgress /></Box>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!data) return null;

  // Helper: get bar fill color
  const getBarFill = (section, id, defaultColor) =>
    highlightedBar === `${section}-${id}` ? theme.palette.primary.dark : defaultColor;

  const content = (
    <Paper sx={{ p: { xs: 1, sm: 3 }, mb: 2, bgcolor: theme.palette.productAnalytics.paperBg, borderRadius: 4, boxShadow: 2, width: '90vw', maxWidth: '100%', mx: 'auto' }}>
      <Typography variant="h5" fontWeight={700} mb={3} color="primary.main" textAlign="center" letterSpacing={1}>
        Product Performance Analytics
      </Typography>
      <Grid container spacing={4}>
        {/* Top-Selling Products */}
        <Grid item xs={12}>
          <SectionCard title={<Box sx={{ display: 'flex', alignItems: 'center' }}>
            <span>Top-Selling Products</span>
            <IconButton size="small" onClick={handleInfoOpen('topSelling')}>
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
            <InfoPopover
              id="info-topSelling"
              open={Boolean(infoAnchor['topSelling'])}
              anchorEl={infoAnchor['topSelling']}
              onClose={handleInfoClose('topSelling')}
              text={infoTexts.topSelling}
            />
          </Box>} theme={theme}>
            <List dense sx={{ fontSize: 18 }}>
              {data.topSelling?.map((p) => (
                <ListItem
                  key={p._id}
                  sx={{ mb: 1, borderRadius: 2, '&:hover': { bgcolor: theme.palette.productAnalytics.hoverBlue }, fontSize: 18, cursor: 'pointer', bgcolor: highlightedBar === `topSelling-${p._id}` ? 'primary.light' : undefined }}
                  onClick={() => handleListItemClick('topSelling', p._id)}
                >
                  <ListItemText
                    primary={<Typography fontWeight={600} fontSize={18}>{p.name}</Typography>}
                    secondary={<>
                      <span style={{ fontSize: 16 }}>Sold: <b>{p.quantity}</b></span> | <span style={{ fontSize: 16 }}>Revenue: <b>₦{p.revenue?.toLocaleString()}</b></span>
                    </>}
                  />
                  {p.stock !== null && <Chip label={`Stock: ${p.stock}`} color={p.stock <= 5 ? 'error' : 'success'} size="medium" sx={{ fontSize: 16 }} />}
                </ListItem>
              ))}
            </List>
            <Box mt={3} ref={chartRefs.topSelling}>
              <ResponsiveContainer width="99%" minWidth={320} minHeight={320} height={320}>
                <BarChart data={data.topSelling || []} margin={{ top: 30, right: 40, left: 10, bottom: 30 }} barCategoryGap={30}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 18, fontWeight: 600 }} interval={0} angle={-15} textAnchor="end" height={80} />
                  <YAxis tick={{ fontSize: 18, fontWeight: 600 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 18, fontWeight: 700 }} />
                  <Bar dataKey="quantity" fill={theme.palette.productAnalytics.blue} name="Sold" radius={[10,10,0,0]} barSize={50} >
                    <LabelList dataKey="quantity" position="top" style={{ fontSize: 16, fontWeight: 700 }} />
                    {data.topSelling?.map((entry) => (
                      <Cell key={entry._id} fill={getBarFill('topSelling', entry._id, theme.palette.productAnalytics.blue)} />
                    ))}
                  </Bar>
                  <Bar dataKey="revenue" fill={theme.palette.productAnalytics.green} name="Revenue" radius={[10,10,0,0]} barSize={50} >
                    <LabelList dataKey="revenue" position="top" formatter={v => `₦${v?.toLocaleString()}`} style={{ fontSize: 16, fontWeight: 700 }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </SectionCard>
        </Grid>
        {/* Least Performing Products */}
        <Grid item xs={12}>
          <SectionCard title={<Box sx={{ display: 'flex', alignItems: 'center' }}>
            <span>Least Performing Products</span>
            <IconButton size="small" onClick={handleInfoOpen('leastPerforming')}>
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
            <InfoPopover
              id="info-leastPerforming"
              open={Boolean(infoAnchor['leastPerforming'])}
              anchorEl={infoAnchor['leastPerforming']}
              onClose={handleInfoClose('leastPerforming')}
              text={infoTexts.leastPerforming}
            />
          </Box>} theme={theme}>
            <List dense sx={{ fontSize: 18 }}>
              {data.leastPerforming?.map((p) => (
                <ListItem
                  key={p._id}
                  sx={{ mb: 1, borderRadius: 2, '&:hover': { bgcolor: theme.palette.productAnalytics.hoverRed }, fontSize: 18, cursor: 'pointer', bgcolor: highlightedBar === `leastPerforming-${p._id}` ? 'primary.light' : undefined }}
                  onClick={() => handleListItemClick('leastPerforming', p._id)}
                >
                  <ListItemText
                    primary={<Typography fontWeight={600} fontSize={18}>{p.name}</Typography>}
                    secondary={<>
                      <span style={{ fontSize: 16 }}>Sold: <b>{p.quantity}</b></span> | <span style={{ fontSize: 16 }}>Revenue: <b>₦{p.revenue?.toLocaleString()}</b></span>
                    </>}
                  />
                  {p.stock !== null && <Chip label={`Stock: ${p.stock}`} color={p.stock <= 5 ? 'error' : 'default'} size="medium" sx={{ fontSize: 16 }} />}
                </ListItem>
              ))}
            </List>
            <Box mt={3} ref={chartRefs.leastPerforming}>
              <ResponsiveContainer width="99%" minWidth={320} minHeight={320} height={320}>
                <BarChart data={data.leastPerforming || []} margin={{ top: 30, right: 40, left: 10, bottom: 30 }} barCategoryGap={30}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 18, fontWeight: 600 }} interval={0} angle={-15} textAnchor="end" height={80} />
                  <YAxis tick={{ fontSize: 18, fontWeight: 600 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 18, fontWeight: 700 }} />
                  <Bar dataKey="quantity" fill={theme.palette.productAnalytics.red} name="Sold" radius={[10,10,0,0]} barSize={50} >
                    <LabelList dataKey="quantity" position="top" style={{ fontSize: 16, fontWeight: 700 }} />
                    {data.leastPerforming?.map((entry) => (
                      <Cell key={entry._id} fill={getBarFill('leastPerforming', entry._id, theme.palette.productAnalytics.red)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </SectionCard>
        </Grid>
        {/* Most Viewed Products */}
        <Grid item xs={12}>
          <SectionCard title={<Box sx={{ display: 'flex', alignItems: 'center' }}>
            <span>Most Viewed Products</span>
            <IconButton size="small" onClick={handleInfoOpen('mostViewed')}>
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
            <InfoPopover
              id="info-mostViewed"
              open={Boolean(infoAnchor['mostViewed'])}
              anchorEl={infoAnchor['mostViewed']}
              onClose={handleInfoClose('mostViewed')}
              text={infoTexts.mostViewed}
            />
          </Box>} theme={theme}>
            <List dense sx={{ fontSize: 18 }}>
              {data.mostViewed?.map((p) => (
                <ListItem
                  key={p._id}
                  sx={{ mb: 1, borderRadius: 2, '&:hover': { bgcolor: theme.palette.productAnalytics.hoverYellow }, fontSize: 18, cursor: 'pointer', bgcolor: highlightedBar === `mostViewed-${p._id}` ? 'primary.light' : undefined }}
                  onClick={() => handleListItemClick('mostViewed', p._id)}
                >
                  <ListItemText
                    primary={<Typography fontWeight={600} fontSize={18}>{p.name}</Typography>}
                    secondary={<>
                      <span style={{ fontSize: 16 }}>Views: <b>{p.views}</b></span> | <span style={{ fontSize: 16 }}>Sold: <b>{p.quantity}</b></span>
                    </>}
                  />
                </ListItem>
              ))}
            </List>
            <Box mt={3} ref={chartRefs.mostViewed}>
              <ResponsiveContainer width="99%" minWidth={320} minHeight={320} height={320}>
                <BarChart data={data.mostViewed || []} margin={{ top: 30, right: 40, left: 10, bottom: 30 }} barCategoryGap={30}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 18, fontWeight: 600 }} interval={0} angle={-15} textAnchor="end" height={80} />
                  <YAxis tick={{ fontSize: 18, fontWeight: 600 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 18, fontWeight: 700 }} />
                  <Bar dataKey="views" fill={theme.palette.productAnalytics.yellow} name="Views" radius={[10,10,0,0]} barSize={50} >
                    <LabelList dataKey="views" position="top" style={{ fontSize: 16, fontWeight: 700 }} />
                    {data.mostViewed?.map((entry) => (
                      <Cell key={entry._id} fill={getBarFill('mostViewed', entry._id, theme.palette.productAnalytics.yellow)} />
                    ))}
                  </Bar>
                  <Bar dataKey="quantity" fill={theme.palette.productAnalytics.blue} name="Sold" radius={[10,10,0,0]} barSize={50} >
                    <LabelList dataKey="quantity" position="top" style={{ fontSize: 16, fontWeight: 700 }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </SectionCard>
        </Grid>
        {/* Conversion Rate */}
        <Grid item xs={12}>
          <SectionCard title={<Box sx={{ display: 'flex', alignItems: 'center' }}>
            <span>Conversion Rate</span>
            <IconButton size="small" onClick={handleInfoOpen('conversionRate')}>
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
            <InfoPopover
              id="info-conversionRate"
              open={Boolean(infoAnchor['conversionRate'])}
              anchorEl={infoAnchor['conversionRate']}
              onClose={handleInfoClose('conversionRate')}
              text={infoTexts.conversionRate}
            />
          </Box>} theme={theme}>
            <List dense sx={{ fontSize: 18 }}>
              {data.conversionRates?.map((p, i) => (
                <ListItem
                  key={i}
                  sx={{ mb: 1, borderRadius: 2, '&:hover': { bgcolor: theme.palette.productAnalytics.hoverPurple }, fontSize: 18, cursor: 'pointer', bgcolor: highlightedBar === `conversionRates-${i}` ? 'primary.light' : undefined }}
                  onClick={() => handleListItemClick('conversionRates', i)}
                >
                  <ListItemText
                    primary={<Typography fontWeight={600} fontSize={18}>{p.name}</Typography>}
                    secondary={p.conversionRate !== null ? <span style={{ fontSize: 16 }}>{p.conversionRate}%</span> : 'N/A'}
                  />
                </ListItem>
              ))}
            </List>
            <Box mt={3} ref={chartRefs.conversionRates}>
              <ResponsiveContainer width="99%" minWidth={320} minHeight={320} height={320}>
                <BarChart data={data.conversionRates?.filter(p => p.conversionRate !== null) || []} margin={{ top: 30, right: 40, left: 10, bottom: 30 }} barCategoryGap={30}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 18, fontWeight: 600 }} interval={0} angle={-15} textAnchor="end" height={80} />
                  <YAxis tick={{ fontSize: 18, fontWeight: 600 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 18, fontWeight: 700 }} />
                  <Bar dataKey="conversionRate" fill={theme.palette.productAnalytics.purple} name="Conversion Rate (%)" radius={[10,10,0,0]} barSize={50} >
                    <LabelList dataKey="conversionRate" position="top" style={{ fontSize: 16, fontWeight: 700 }} />
                    {data.conversionRates?.filter(p => p.conversionRate !== null).map((entry, idx) => (
                      <Cell key={idx} fill={highlightedBar === `conversionRates-${idx}` ? theme.palette.secondary.main : theme.palette.productAnalytics.purple} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </SectionCard>
        </Grid>
        {/* Stock Alerts */}
        <Grid item xs={12}>
          <SectionCard title={<Box sx={{ display: 'flex', alignItems: 'center' }}>
            <span>Stock Alerts (≤5)</span>
            <IconButton size="small" onClick={handleInfoOpen('stockAlerts')}>
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
            <InfoPopover
              id="info-stockAlerts"
              open={Boolean(infoAnchor['stockAlerts'])}
              anchorEl={infoAnchor['stockAlerts']}
              onClose={handleInfoClose('stockAlerts')}
              text={infoTexts.stockAlerts}
            />
          </Box>} theme={theme}>
            <List dense sx={{ fontSize: 18 }}>
              {data.stockAlerts?.map((p) => (
                <ListItem key={p._id} sx={{ mb: 1, borderRadius: 2, bgcolor: theme.palette.productAnalytics.alertOrange, fontSize: 18 }}>
                  <ListItemText
                    primary={<Typography fontWeight={600} fontSize={18}>{p.name}</Typography>}
                    secondary={<span style={{ fontSize: 16 }}>Stock: {p.stock}</span>}
                  />
                </ListItem>
              ))}
            </List>
          </SectionCard>
        </Grid>
        {/* Stagnant Products */}
        <Grid item xs={12}>
          <SectionCard title={<Box sx={{ display: 'flex', alignItems: 'center' }}>
            <span>Stagnant Products (No Sales)</span>
            <IconButton size="small" onClick={handleInfoOpen('stagnant')}>
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
            <InfoPopover
              id="info-stagnant"
              open={Boolean(infoAnchor['stagnant'])}
              anchorEl={infoAnchor['stagnant']}
              onClose={handleInfoClose('stagnant')}
              text={infoTexts.stagnant}
            />
          </Box>} theme={theme}>
            <List dense sx={{ fontSize: 18 }}>
              {data.stagnantProducts?.map((p) => (
                <ListItem key={p._id} sx={{ mb: 1, borderRadius: 2, bgcolor: theme.palette.productAnalytics.stagnantGray, fontSize: 18 }}>
                  <ListItemText primary={<Typography fontWeight={600} fontSize={18}>{p.name}</Typography>} />
                </ListItem>
              ))}
            </List>
          </SectionCard>
        </Grid>
      </Grid>
    </Paper>
  );

  return content;
};

ProductPerformance.propTypes = {
  dateRange: PropTypes.shape({
    startDate: PropTypes.string,
    endDate: PropTypes.string,
  }),
};

export default ProductPerformance;
