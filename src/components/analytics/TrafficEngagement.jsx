import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, CircularProgress, Grid, Chip, Divider, useTheme } from '@mui/material';
import { get } from '../../utils/api';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, LineChart, Line, BarChart, Bar, LabelList } from 'recharts';
import PropTypes from 'prop-types';
import PageVisitsTrendChart from './PageVisitsTrendChart';

import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';


// Theme-responsive tooltip styles (match CustomerBehavior)

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

const CustomTooltip = ({ active, payload, label, tooltipStyles }) => {
  if (active && payload && payload.length) {
    const styles = tooltipStyles;
    return (
      <Box sx={styles.contentStyle}>
        <Typography variant="subtitle2" fontWeight={600} sx={styles.labelStyle}>{label}</Typography>
        {payload.map((entry, i) => (
          <Typography key={i} variant="body2" sx={{ color: entry.color || styles.itemStyle.color, fontWeight: styles.itemStyle.fontWeight }}>
            {entry.name}: <b>{entry.value}</b>
          </Typography>
        ))}
      </Box>
    );
  }
  return null;
};

 /**
 * TrafficEngagement analytics component
 * @param {Object} props
 * @param {{startDate: string, endDate: string}} props.dateRange - Date range filter
 */
const TrafficEngagement = ({ dateRange }) => {
  console.log('TrafficEngagement rendered', dateRange);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [infoAnchor, setInfoAnchor] = useState({});

  const theme = useTheme();
  const tooltipStyles = getTooltipStyles(theme);

  const infoTexts = {
    visitsTrend: 'Shows how many people visited your site over time.',
    avgSessionDuration: 'The average time a visitor spends on your site per session.',
    bounceRate: 'The percentage of visitors who leave after viewing only one page.',
    topLandingPages: 'Pages where visitors most often start their session.',
    topReferrers: 'Websites or sources that send visitors to your site.',
    topExitPages: 'Pages where visitors most often leave your site.',
    pageViewsPerSession: 'How many pages each visitor views during a single session.'
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
      setError(null);
      try {
        // Build query string for startDate and endDate
        let url = '/v1/analytics/traffic';
        if (dateRange.startDate && dateRange.endDate) {
          const params = new URLSearchParams({
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
          });
          url += `?${params.toString()}`;
        }
        // Token sent via HTTP-only cookie
        const res = await get(url, { credentials: 'include' });
        setData(res.data);
      } catch (err) {
        setError(err?.response?.data?.error || 'Failed to load traffic & engagement analytics');
      } finally {
        setLoading(false);
      }
    };
    if (dateRange.startDate && dateRange.endDate) {
      fetchData();
    }
  }, [dateRange]);

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight={220}><CircularProgress /></Box>;
  if (error) return <Typography color="error.main" align="center" mt={2}>{error}</Typography>;

  if (!data) return null;

  // --- OS Chart Data from backend ---
  // Use backend-calculated 'oses' array: [{ type, percent }]
  let osChartData = [];
  if (data && Array.isArray(data.oses)) {
    osChartData = data.oses.map(o => ({
      os: o.type,
      percent: Number(o.percent)
    }));
  }

  // --- Browser Chart Data from backend ---
  // Use backend-calculated 'browsers' array: [{ name, count }]
  let browserChartData = [];
  let totalBrowserCount = 0;
  if (data && Array.isArray(data.browsers)) {
    totalBrowserCount = data.browsers.reduce((sum, b) => sum + b.count, 0);
    browserChartData = data.browsers.map(b => ({
      browser: b.name,
      count: b.count,
      percent: totalBrowserCount > 0 ? ((b.count / totalBrowserCount) * 100).toFixed(1) : '0.0'
    }));
  }

  // Prepare pageViewsPerSession data for chart: use user email if present and non-empty, else Session ID N
  let pageViewsPerSessionData = [];
  if (data && Array.isArray(data.pageViewsPerSession)) {
    pageViewsPerSessionData = data.pageViewsPerSession.map((s, i) => {
      let label = '';
      if (s.email && typeof s.email === 'string' && s.email.trim() !== '') {
        // Use only the part before '@' for brevity, but make label unique by appending index
        label = `${s.email.split('@')[0]} #${i + 1}`;
      } else {
        label = `Session ${i + 1}`;
      }
      return { ...s, label };
    });
  }

  return (
    <Card sx={{ borderRadius: 4, boxShadow: 3, mb: 3, bgcolor: 'background.default' }}>
      <CardContent>
        <Typography variant="h5" fontWeight={700} mb={1} color="primary.main">Traffic & Engagement</Typography>
        <Typography variant="subtitle1" color="text.secondary" mb={3}>
          Key metrics for the selected period
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <Box sx={{ bgcolor: theme.palette.background.paper, borderRadius: 3, p: 2, boxShadow: 1, height: '100%', width: '90vw' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" fontWeight={600} color="primary.dark">Visits Trend</Typography>
                <IconButton size="small" onClick={handleInfoOpen('visitsTrend')}>
                  <HelpOutlineIcon fontSize="small" />
                </IconButton>
                <InfoPopover
                  id="info-visitsTrend"
                  open={Boolean(infoAnchor['visitsTrend'])}
                  anchorEl={infoAnchor['visitsTrend']}
                  onClose={handleInfoClose('visitsTrend')}
                  text={infoTexts.visitsTrend}
                />
              </Box>
              <Box sx={{ width: '90vw'}}>
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={data.visitsTrends || []} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="visitsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1976d2" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#1976d2" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} angle={-20} dy={10} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip theme={theme} tooltipStyles={tooltipStyles} />} />
                    <Legend verticalAlign="top" height={36} iconType="circle"/>
                    <Line type="monotone" dataKey="visits" stroke="#1976d2" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 7 }} name="Visits" fill="url(#visitsGradient)" />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={5}>
            <Box display="flex" flexDirection="column" gap={3} height="100%" justifyContent="space-between">
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="subtitle2" fontWeight={600} color="primary.dark">Avg. Session Duration</Typography>
                  <IconButton size="small" onClick={handleInfoOpen('avgSessionDuration')}>
                    <HelpOutlineIcon fontSize="small" />
                  </IconButton>
                  <InfoPopover
                    id="info-avgSessionDuration"
                    open={Boolean(infoAnchor['avgSessionDuration'])}
                    anchorEl={infoAnchor['avgSessionDuration']}
                    onClose={handleInfoClose('avgSessionDuration')}
                    text={infoTexts.avgSessionDuration}
                  />
                </Box>
                <Chip label={`Avg. Duration: ${data.avgSessionDuration || 0} min`} color="info" sx={{ mt: 1, fontWeight: 600, fontSize: 16, px: 2, py: 1 }} />
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="subtitle2" fontWeight={600} color="primary.dark">Bounce Rate</Typography>
                  <IconButton size="small" onClick={handleInfoOpen('bounceRate')}>
                    <HelpOutlineIcon fontSize="small" />
                  </IconButton>
                  <InfoPopover
                    id="info-bounceRate"
                    open={Boolean(infoAnchor['bounceRate'])}
                    anchorEl={infoAnchor['bounceRate']}
                    onClose={handleInfoClose('bounceRate')}
                    text={infoTexts.bounceRate}
                  />
                </Box>
                <Chip label={`Bounce Rate: ${data.bounceRate || 0}%`} color="warning" sx={{ mt: 1, fontWeight: 600, fontSize: 16, px: 2, py: 1 }} />
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="subtitle2" fontWeight={600} color="primary.dark">Top Landing Pages</Typography>
                  <IconButton size="small" onClick={handleInfoOpen('topLandingPages')}>
                    <HelpOutlineIcon fontSize="small" />
                  </IconButton>
                  <InfoPopover
                    id="info-topLandingPages"
                    open={Boolean(infoAnchor['topLandingPages'])}
                    anchorEl={infoAnchor['topLandingPages']}
                    onClose={handleInfoClose('topLandingPages')}
                    text={infoTexts.topLandingPages}
                  />
                </Box>
                {/* Chart for Top Landing Pages */}
                <Box sx={{ bgcolor: theme.palette.background.paper, borderRadius: 3, p: 2, boxShadow: 1, width: '90vw', mt: 2 }}>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart
                      data={data.topLandingPages || []}
                      layout="horizontal"
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      barCategoryGap={40}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="page" type="category" tick={{ fontSize: 18, fontWeight: 600 }} />
                      <YAxis type="number" allowDecimals={false} tick={{ fontSize: 18, fontWeight: 600 }} />
                      <Tooltip 
                        formatter={(value) => [`${value} visits`, 'Visits']}
                        contentStyle={tooltipStyles.contentStyle}
                        labelStyle={tooltipStyles.labelStyle}
                        itemStyle={tooltipStyles.itemStyle}
                      />
                      <Bar dataKey="visits" fill={theme.palette.primary.main} barSize="100%" radius={[10, 10, 0, 0]} name="Visits">
                        <LabelList dataKey="visits" position="top" fontSize={16} fontWeight={700} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
                {/* List fallback for accessibility */}
                <Box component="ul" sx={{ m: 0, pl: 3, fontSize: 15, color: 'text.secondary', display: 'none' }}>
                  {(data.topLandingPages || []).map((p, i) => (
                    <li key={i} style={{ marginBottom: 4, listStyle: 'disc' }}>
                      <b>{p.page}</b> <span style={{ color: theme.palette.text.disabled }}>({p.visits} visits)</span>
                    </li>
                  ))}
                </Box>
              </Box>
              {/* New: Top Referrers section */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="subtitle2" fontWeight={600} color="primary.dark">Top Referrers</Typography>
                  <IconButton size="small" onClick={handleInfoOpen('topReferrers')}>
                    <HelpOutlineIcon fontSize="small" />
                  </IconButton>
                  <InfoPopover
                    id="info-topReferrers"
                    open={Boolean(infoAnchor['topReferrers'])}
                    anchorEl={infoAnchor['topReferrers']}
                    onClose={handleInfoClose('topReferrers')}
                    text={infoTexts.topReferrers}
                  />
                </Box>
                <Box sx={{ bgcolor: theme.palette.background.paper, borderRadius: 3, p: 2, boxShadow: 1, width: 340, mt: 2 }}>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 15, color: theme.palette.text.secondary }}>
                    {(data.topReferrers || []).map((r, i) => (
                      <li key={i} style={{ marginBottom: 4, listStyle: 'disc' }}>
                        <b>{r.referrer}</b> <span style={{ color: theme.palette.text.disabled }}>({r.visits} visits)</span>
                      </li>
                    ))}
                  </ul>
                </Box>
              </Box>
              {/* New: Top Most Viewed Pages section */}
              <Box mt={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" fontWeight={600} color="primary.dark">Top Most Viewed Pages</Typography>
                  <IconButton size="small" onClick={handleInfoOpen('topMostViewedPages')}>
                    <HelpOutlineIcon fontSize="small" />
                  </IconButton>
                  <InfoPopover
                    id="info-topMostViewedPages"
                    open={Boolean(infoAnchor['topMostViewedPages'])}
                    anchorEl={infoAnchor['topMostViewedPages']}
                    onClose={handleInfoClose('topMostViewedPages')}
                    text={"Pages with the highest number of views in the selected period."}
                  />
                </Box>
                <Box sx={{ bgcolor: theme.palette.background.paper, borderRadius: 3, p: 2, boxShadow: 1, width: '90vw', mt: 2 }}>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart
                      data={data.topMostViewedPages || []}
                      layout="horizontal"
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      barCategoryGap={40}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="page" type="category" tick={{ fontSize: 16, fontWeight: 600 }} />
                      <YAxis type="number" allowDecimals={false} tick={{ fontSize: 16, fontWeight: 600 }} />
                      <Tooltip 
                        formatter={(value) => [`${value} views`, 'Views']}
                        contentStyle={tooltipStyles.contentStyle}
                        labelStyle={tooltipStyles.labelStyle}
                        itemStyle={tooltipStyles.itemStyle}
                      />
                      <Bar dataKey="views" fill={theme.palette.success.main} barSize="100%" radius={[10, 10, 0, 0]} name="Views">
                        <LabelList dataKey="views" position="top" fontSize={15} fontWeight={700} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
                {/* List fallback for accessibility */}
                <Box component="ul" sx={{ m: 0, pl: 3, fontSize: 15, color: 'text.secondary', display: 'none' }}>
                  {(data.topMostViewedPages || []).map((p, i) => (
                    <li key={i} style={{ marginBottom: 4, listStyle: 'disc' }}>
                      <b>{p.page}</b> <span style={{ color: theme.palette.text.disabled }}>({p.views} views)</span>
                    </li>
                  ))}
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
        {/* New: OS Usage Chart (styled like Top Landing Pages) */}
        <Box mt={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="subtitle2" fontWeight={600} color="primary.dark">Operating System Usage</Typography>
            <IconButton size="small" onClick={handleInfoOpen('osUsage')}>
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
            <InfoPopover
              id="info-osUsage"
              open={Boolean(infoAnchor['osUsage'])}
              anchorEl={infoAnchor['osUsage']}
              onClose={handleInfoClose('osUsage')}
              text={"Distribution of operating systems used by your visitors (Android, iOS, Windows, MacOS, Other)."}
            />
          </Box>
          {/* Chart for OS Usage, styled like Top Landing Pages */}
          <Box sx={{ bgcolor: theme.palette.background.paper, borderRadius: 3, p: 2, boxShadow: 1, width: '90vw', mt: 2 }}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={osChartData}
                layout="horizontal"
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                barCategoryGap={40}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="os" type="category" tick={{ fontSize: 18, fontWeight: 600 }} />
                <YAxis type="number" domain={[0, 100]} allowDecimals={false} tick={{ fontSize: 18, fontWeight: 600 }} tickFormatter={(v) => v + '%'} />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Percent']}
                  contentStyle={tooltipStyles.contentStyle}
                  labelStyle={tooltipStyles.labelStyle}
                  itemStyle={tooltipStyles.itemStyle}
                />
                <Bar dataKey="percent" fill={theme.palette.secondary.main} barSize="100%" radius={[10, 10, 0, 0]} name="Percent">
                  <LabelList dataKey="percent" position="top" fontSize={16} fontWeight={700} formatter={(v) => `${v}%`} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
          {/* List fallback for accessibility */}
          <Box component="ul" sx={{ m: 0, pl: 3, fontSize: 15, color: 'text.secondary', display: 'none' }}>
            {osChartData.map((o, i) => (
              <li key={i} style={{ marginBottom: 4, listStyle: 'disc' }}>
                <b>{o.os}</b> <span style={{ color: theme.palette.text.disabled }}>({o.count} users)</span>
              </li>
            ))}
          </Box>
        </Box>

        {/* New: Browser Usage Chart */}
        <Box mt={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="subtitle2" fontWeight={600} color="primary.dark">Browser Usage</Typography>
            <IconButton size="small" onClick={handleInfoOpen('browserUsage')}>
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
            <InfoPopover
              id="info-browserUsage"
              open={Boolean(infoAnchor['browserUsage'])}
              anchorEl={infoAnchor['browserUsage']}
              onClose={handleInfoClose('browserUsage')}
              text={"Browser usage distribution: shows the number and percent of page views by browser (e.g., Chrome, Safari, Firefox, Edge, etc.) in the selected period. Percent is of total browser-identified page views."}
            />
          </Box>
          <Box sx={{ bgcolor: theme.palette.background.paper, borderRadius: 3, p: 2, boxShadow: 1, width: '90vw', mt: 2 }}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={browserChartData}
                layout="horizontal"
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                barCategoryGap={40}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="browser" type="category" tick={{ fontSize: 18, fontWeight: 600 }} />
                <YAxis type="number" allowDecimals={false} tick={{ fontSize: 18, fontWeight: 600 }} />
                <Tooltip 
                  formatter={(value, name, props) => {
                    const percent = props.payload.percent;
                    return [`${value} page views (${percent}%)`, 'Page Views'];
                  }}
                  contentStyle={tooltipStyles.contentStyle}
                  labelStyle={tooltipStyles.labelStyle}
                  itemStyle={tooltipStyles.itemStyle}
                />
                <Bar dataKey="count" fill={theme.palette.info.main} barSize="100%" radius={[10, 10, 0, 0]} name="Page Views">
                  <LabelList 
                    dataKey="count" 
                    position="top" 
                    fontSize={16} 
                    fontWeight={700} 
                    content={(props) => {
                      const { x, y, width, value, index } = props;
                      const percent = browserChartData[index]?.percent;
                      return (
                        <text x={x + width / 2} y={y - 8} textAnchor="middle" fontSize={16} fontWeight={700} fill={theme.palette.text.primary}>
                          {value} ({percent}%)
                        </text>
                      );
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
          {/* List fallback for accessibility */}
          <Box component="ul" sx={{ m: 0, pl: 3, fontSize: 15, color: 'text.secondary', display: 'none' }}>
            {browserChartData.map((b, i) => (
              <li key={i} style={{ marginBottom: 4, listStyle: 'disc' }}>
                <b>{b.browser}</b> <span style={{ color: theme.palette.text.disabled }}>({b.count} page views, {b.percent}%)</span>
              </li>
            ))}
          </Box>
        </Box>
        {/* New: Page Visits Trend Chart on its own row */}
        <Box mt={6}>
          <PageVisitsTrendChart dateRange={dateRange} />
        </Box>
        {/* New: Top Exit Pages section */}
        <Box mt={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2" fontWeight={600} color="primary.dark">Top Exit Pages</Typography>
            <IconButton size="small" onClick={handleInfoOpen('topExitPages')}>
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
            <InfoPopover
              id="info-topExitPages"
              open={Boolean(infoAnchor['topExitPages'])}
              anchorEl={infoAnchor['topExitPages']}
              onClose={handleInfoClose('topExitPages')}
              text={infoTexts.topExitPages}
            />
          </Box>
          <Box sx={{ bgcolor: theme.palette.background.paper, borderRadius: 3, p: 2, boxShadow: 1, width: '90vw', mt: 2 }}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={data.topExitPages || []}
                layout="horizontal"
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                barCategoryGap={40}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="page" type="category" tick={{ fontSize: 18, fontWeight: 600 }} />
                <YAxis type="number" allowDecimals={false} tick={{ fontSize: 18, fontWeight: 600 }} />
                <Tooltip 
                  formatter={(value) => [`${value} exits`, 'Exits']}
                  contentStyle={tooltipStyles.contentStyle}
                  labelStyle={tooltipStyles.labelStyle}
                  itemStyle={tooltipStyles.itemStyle}
                />
                <Bar dataKey="exits" fill={theme.palette.error.main} barSize="100%" radius={[10, 10, 0, 0]} name="Exits">
                  <LabelList dataKey="exits" position="top" fontSize={16} fontWeight={700} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
          {/* List fallback for accessibility */}
          <Box component="ul" sx={{ m: 0, pl: 3, fontSize: 15, color: 'text.secondary', display: 'none' }}>
            {(data.topExitPages || []).map((p, i) => (
              <li key={i} style={{ marginBottom: 4, listStyle: 'disc' }}>
                <b>{p.page}</b> <span style={{ color: theme.palette.text.disabled }}>({p.exits} exits)</span>
              </li>
            ))}
          </Box>
        </Box>
        {/* New: Page Views Per Session section */}
        <Box mt={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2" fontWeight={600} color="primary.dark">Page Views Per Session</Typography>
            <IconButton size="small" onClick={handleInfoOpen('pageViewsPerSession')}>
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
            <InfoPopover
              id="info-pageViewsPerSession"
              open={Boolean(infoAnchor['pageViewsPerSession'])}
              anchorEl={infoAnchor['pageViewsPerSession']}
              onClose={handleInfoClose('pageViewsPerSession')}
              text={infoTexts.pageViewsPerSession}
            />
          </Box>
          <Box sx={{ bgcolor: theme.palette.background.paper, borderRadius: 3, p: 2, boxShadow: 1, width: '90vw', mt: 2 }}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={pageViewsPerSessionData}
                layout="horizontal"
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                barCategoryGap={40}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" type="category" tick={{ fontSize: 13, fontWeight: 600 }} interval={0} angle={-15}/>
                <YAxis dataKey="pageViews" type="number" allowDecimals={false} tick={{ fontSize: 13, fontWeight: 600 }} />
                <Tooltip 
                  formatter={(value) => [`${value} page views`, 'Page Views']}
                  contentStyle={tooltipStyles.contentStyle}
                  labelStyle={tooltipStyles.labelStyle}
                  itemStyle={tooltipStyles.itemStyle}
                />
                <Bar dataKey="pageViews" fill={theme.palette.primary.dark} barSize="100%" radius={[10, 10, 0, 0]} name="Page Views">
                  <LabelList dataKey="pageViews" position="top" fontSize={13} fontWeight={700} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
          {/* List fallback for accessibility */}
          <Box component="ul" sx={{ m: 0, pl: 3, fontSize: 15, color: 'text.secondary', display: 'none' }}>
            {pageViewsPerSessionData.map((s, i) => (
              <li key={i} style={{ marginBottom: 4, listStyle: 'disc' }}>
                <b>{s.label}</b> <span style={{ color: theme.palette.text.disabled }}>({s.pageViews} page views)</span>
              </li>
            ))}
          </Box>
        </Box>
        </CardContent>
      </Card>
    
  );
};

TrafficEngagement.propTypes = {
  dateRange: PropTypes.shape({
    startDate: PropTypes.string,
    endDate: PropTypes.string,
  }),
};

export default TrafficEngagement;
