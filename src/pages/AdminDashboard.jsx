import React, { useEffect, useState } from 'react';
import * as api from '../utils/api';
import './AdminDashboard.css';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import dayjs from 'dayjs';
import { Helmet } from 'react-helmet-async';


const API_BASE = '/admin';

const AdminDashboard = () => {
  const [salesSummary, setSalesSummary] = useState(null);
  const [orderSummary, setOrderSummary] = useState(null);
  const [totalUsers, setTotalUsers] = useState(null);
  const [lowStock, setLowStock] = useState({ perfumes: [], designs: [] });
  const [latestOrders, setLatestOrders] = useState([]);
  const [securityLog, setSecurityLog] = useState([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMsg, setDialogMsg] = useState('');
  // const [showBlog, setShowBlog] = useState(false); // Removed unused
  // const { mode } = useThemeMode(); // Removed unused

  useEffect(() => {
    fetchDashboardData();
    fetchSecurityLog();
    // Intentionally not including fetchDashboardData/fetchSecurityLog in deps to avoid infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Remove recalculation of summary stats from latestOrders
    // Only use backend API responses for summary cards
    
  }, [latestOrders]);

  const fetchDashboardData = async (range = dateRange) => {
    setLoading(true);
    try {
      // Pass date range to all endpoints that support filtering
      const params = range && (range.start || range.end) ? { params: range } : {};
      const [sales, orders, users, stock, latest] = await Promise.all([
        api.get(`/admin/sales-summary`, params),
        api.get(`/admin/order-summary`, params),
        api.get(`/admin/total-users`, params),
        api.get(`/admin/low-stock`, params),
        api.get(`/admin/latest-orders`, params),
      ]);
      setSalesSummary(sales.data);
      setOrderSummary(orders.data);
      setTotalUsers(users.data.totalUsers);
      setLowStock(stock.data);
      setLatestOrders(latest.data);
    } catch {
      // handle error
    }
    setLoading(false);
  };

  const fetchSecurityLog = async () => {
    try {
      const res = await api.get(`/admin/security-log`);
      setSecurityLog(res.data);
    } catch {
      // Optionally handle error
    }
  };

  const handleDateChange = (e) => {
    setDateRange({ ...dateRange, [e.target.name]: e.target.value });
  };

  const handleFilter = () => {
    if (!dateRange.start || !dateRange.end) {
      setDialogMsg('Please select both start and end dates.');
      setDialogOpen(true);
      return;
    }
    if (dateRange.start > dateRange.end) {
      setDialogMsg('Start date cannot be after end date.');
      setDialogOpen(true);
      return;
    }
    fetchDashboardData(dateRange);
  };

  const quickFilters = [
    { label: 'Today', getRange: () => {
      const today = dayjs();
      return {
        start: today.startOf('day').format('YYYY-MM-DDTHH:mm:ss'),
        end: today.endOf('day').format('YYYY-MM-DDTHH:mm:ss')
      };
    }},
    { label: 'This Week', getRange: () => {
      const today = dayjs();
      const start = today.startOf('week');
      const end = today.endOf('week');
      return { start: start.format('YYYY-MM-DD'), end: end.format('YYYY-MM-DD') };
    }},
    { label: 'This Month', getRange: () => {
      const today = dayjs();
      const start = today.startOf('month');
      const end = today.endOf('month');
      return { start: start.format('YYYY-MM-DD'), end: end.format('YYYY-MM-DD') };
    }},
    { label: 'This Year', getRange: () => {
      const today = dayjs();
      const start = today.startOf('year');
      const end = today.endOf('year');
      return { start: start.format('YYYY-MM-DD'), end: end.format('YYYY-MM-DD') };
    }},
    { label: 'Last 3 Months', getRange: () => {
      const today = dayjs();
      const start = today.subtract(3, 'month').startOf('month');
      const end = today.endOf('month');
      return { start: start.format('YYYY-MM-DD'), end: end.format('YYYY-MM-DD') };
    }},
    { label: 'Last 6 Months', getRange: () => {
      const today = dayjs();
      const start = today.subtract(6, 'month').startOf('month');
      const end = today.endOf('month');
      return { start: start.format('YYYY-MM-DD'), end: end.format('YYYY-MM-DD') };
    }},
  ];

  const handleQuickFilter = (getRange) => {
    const range = getRange();
    setDateRange(range);
    fetchDashboardData(range);
  };

  if (loading) return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      Loading dashboard...
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | JC's Closet</title>
        <meta name="description" content="Overview and analytics for JC's Closet admin dashboard." />
      </Helmet>
      <div className="admin-dashboard">
        <h1>Dashboard</h1>
        <div className="dashboard-filters">
          <div className="quick-filters">
            {quickFilters.map(f => (
              <button key={f.label} type="button" onClick={() => handleQuickFilter(f.getRange)}>{f.label}</button>
            ))}
          </div>
          <label>
            Start Date:
            <input type="date" name="start" value={dateRange.start} onChange={handleDateChange} />
          </label>
          <label>
            End Date:
            <input type="date" name="end" value={dateRange.end} onChange={handleDateChange} />
          </label>
          <button onClick={handleFilter}>Filter</button>
        </div>
        <div className="dashboard-summary">
          <div className="summary-card sales">
            <h3>Sales</h3>
            <p>Total Sales: ₦{salesSummary?.totalRevenue?.toLocaleString() || 0}</p>
            <p>Average Order Value: ₦{salesSummary?.avgOrderValue?.toLocaleString() || 0}</p>
          </div>
          <div className="summary-card orders">
            <h3>Orders</h3>
            <p>Total Orders: {orderSummary?.totalOrders || 0}</p>
            <ul>
              {orderSummary?.statusBreakdown?.map(s => (
                <li key={s._id}>{s._id}: {s.count}</li>
              ))}
            </ul>
          </div>
          <div className="summary-card users">
            <h3>Users</h3>
            <p>Total Users: {totalUsers || 0}</p>
          </div>
          <div className="summary-card low-stock">
            <h3>Low Stock Alerts</h3>
            <ul>
              {lowStock.perfumes.map(p => (
                <li key={p._id}>Perfume: {p.name} (Qty: {p.stock})</li>
              ))}
              {lowStock.designs.map(d => (
                <li key={d._id}>Design: {d.name} (Qty: {d.quantity || 'N/A'})</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="latest-orders">
          <h3>Latest Orders</h3>
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Total</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {latestOrders.map(order => (
                <tr key={order._id}>
                  <td data-label="Order ID">{order._id}</td>
                  <td data-label="Customer">{order.customer?.name || order.customerName || order.user?.name || 'N/A'}</td>
                  <td data-label="Status" className={order.status ? order.status.toLowerCase() : ''}>{order.status}</td>
                  <td data-label="Total">₦{Array.isArray(order.cart)
                    ? order.cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0).toLocaleString()
                    : (order.total?.toLocaleString() || '0')}
                  </td>
                  <td data-label="Date">{new Date(order.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="security-log">
          <h3>Admin Security Log</h3>
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>IP Address</th>
                <th>Device OS/Brand</th>
                <th>Device Name</th>
              </tr>
            </thead>
            <tbody>
              {securityLog.length === 0 ? (
                <tr><td colSpan="5">No recent admin actions.</td></tr>
              ) : (
                securityLog.map((log, idx) => {
                  const deviceParts = (log.device || '').split(' | ');
                  const deviceOS = deviceParts[1] || 'N/A';
                  const deviceName = deviceParts[2] || 'N/A';
                  return (
                    <tr key={log._id || idx}>
                      <td data-label="Timestamp">{new Date(log.timestamp).toLocaleString()}</td>
                      <td data-label="Action">{log.action}</td>
                      <td data-label="IP Address">{log.ip || 'N/A'}</td>
                      <td data-label="Device OS/Brand">{deviceOS}</td>
                      <td data-label="Device Name">{deviceName}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="login-history">
          <h3>Admin Login/Logout History</h3>
          <table className="dashboard-table login-history-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>Admin</th>
                <th>IP Address</th>
                <th>Device OS/Brand</th>
                <th>Device Name</th>
              </tr>
            </thead>
            <tbody>
              {securityLog.filter(log => /login|logout/i.test(log.action)).length === 0 ? (
                <tr><td colSpan="6">No login/logout history found.</td></tr>
              ) : (
                securityLog.filter(log => /login|logout/i.test(log.action)).map((log, idx) => {
                  const deviceParts = (log.device || '').split(' | ');
                  const deviceOS = deviceParts[1] || 'N/A';
                  const deviceName = deviceParts[2] || 'N/A';
                  return (
                    <tr key={log._id || idx}>
                      <td data-label="Timestamp">{new Date(log.timestamp).toLocaleString()}</td>
                      <td data-label="Action">{log.action}</td>
                      <td data-label="Admin">{log.admin?.name || log.admin?.email || 'N/A'}</td>
                      <td data-label="IP Address">{log.ip || 'N/A'}</td>
                      <td data-label="Device OS/Brand">{deviceOS}</td>
                      <td data-label="Device Name">{deviceName}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
          <DialogTitle>Date Filter Error</DialogTitle>
          <DialogContent>{dialogMsg}</DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)} color="primary" autoFocus>
              OK
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </>
  );
};

export default AdminDashboard;
