import React, { useState } from 'react';
import { Box, Typography, Paper, Tabs, Tab } from '@mui/material';
import AnalyticsFilters from '../components/analytics/AnalyticsFilters';
import SalesAnalytics from '../components/analytics/SalesAnalytics';
import ProductPerformance from '../components/analytics/ProductPerformance';
import CustomerBehavior from '../components/analytics/CustomerBehavior';
import TrafficEngagement from '../components/analytics/TrafficEngagement';
import OrdersOverview from '../components/analytics/OrdersOverview';
import MarketingPerformance from '../components/analytics/MarketingPerformance';
import ExportButtons from '../components/analytics/ExportButtons';

const AdminAnalytics = () => {
  const [tab, setTab] = useState(0);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  const handleDateFilter = (range) => {
    setDateRange(range);
  };

  // Add a key for each tab for robust backend mapping
  const tabList = [
    { key: 'sales', label: 'Sales', component: <SalesAnalytics dateRange={dateRange} /> },
    { key: 'products', label: 'Product Performance', component: <ProductPerformance dateRange={dateRange} /> },
    { key: 'customers', label: 'Customer Behavior', component: <CustomerBehavior dateRange={dateRange} /> },
    { key: 'traffic', label: 'Traffic & Engagement', component: <TrafficEngagement dateRange={dateRange} /> },
    { key: 'orders', label: 'Orders Overview', component: <OrdersOverview dateRange={dateRange} /> },
    { key: 'marketing', label: 'Marketing', component: <MarketingPerformance dateRange={dateRange} /> },
  ];

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Typography variant="h4" fontWeight={700} mb={2}>
        Admin Analytics Dashboard
      </Typography>
      <Paper sx={{ p: 2, mb: 3 }} elevation={2}>
        <AnalyticsFilters onChange={handleDateFilter} />
        <ExportButtons dateRange={dateRange} tab={tabList[tab].key} />
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mt: 2 }}
        >
          {tabList.map((t, idx) => (
            <Tab key={t.key} label={t.label} value={idx} />
          ))}
        </Tabs>
      </Paper>
      <Box mt={2}>
        {tabList[tab]?.component ? (
          tabList[tab].component
        ) : (
          <Typography color="error">Component not found or failed to render.</Typography>
        )}
      </Box>
    </Box>
  );
};

export default AdminAnalytics;
