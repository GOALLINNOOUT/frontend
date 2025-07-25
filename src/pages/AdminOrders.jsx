import React, { useEffect, useState, useRef } from 'react';
// Helper: subscribe admin to push notifications and send to backend
async function subscribeAdminToPush() {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    const reg = await navigator.serviceWorker.ready;
    try {
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array('BAnXpkSuLZLZcgOO0ibI-Z3grRNhkuszV8R7ZyGsRuPMUaAFnIhEtVyvdi8aqGxGVr5PCeG57DPnTt7iOgFgfdU')
      });
      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      // Send subscription to backend with admin flag
      await fetch('https://jcserver.onrender.com/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ ...subscription, admin: true })
      });
      console.log('Admin push subscription sent to backend:', subscription);
    } catch (err) {
      console.error('Admin push subscription error:', err);
    }
  }
}

// Helper to convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

import * as api from '../utils/api';
import './AdminDashboard.css';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

import { Helmet } from 'react-helmet-async';


function AdminOrders() {

  // Only show button if not already granted/denied
  const handleAdminNotif = async () => {
    setNotifLoading(true);
    if ('Notification' in window && Notification.permission !== 'granted') {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setAdminNotifStatus('granted');
          localStorage.setItem('jc_closet_admin_notif', 'granted');
          new Notification('Admin notifications enabled!');
          await subscribeAdminToPush();
        } else {
          setAdminNotifStatus('denied');
          localStorage.setItem('jc_closet_admin_notif', 'denied');
        }
      } catch (e) {
        setAdminNotifStatus('error');
        localStorage.setItem('jc_closet_admin_notif', 'error');
      }
    } else if (Notification.permission === 'granted') {
      setAdminNotifStatus('granted');
      localStorage.setItem('jc_closet_admin_notif', 'granted');
      await subscribeAdminToPush();
    } else {
      setAdminNotifStatus('denied');
      localStorage.setItem('jc_closet_admin_notif', 'denied');
    }
    setNotifLoading(false);
  };
  // Admin notification opt-in state (must be inside component)
  const [adminNotifStatus, setAdminNotifStatus] = useState(() => localStorage.getItem('jc_closet_admin_notif') || 'idle'); // idle | granted | denied | error
  const [notifLoading, setNotifLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [statesLoading, setStatesLoading] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [updating, setUpdating] = useState('');
  const [deleting, setDeleting] = useState('');
  const [dialog, setDialog] = useState({ open: false, type: '', orderId: '', status: '' });
  const [email, setEmail] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [detailsOrder, setDetailsOrder] = useState(null);
  const suggestionTimeout = useRef(null);

  const fetchOrders = async (emailTerm = '', stateTerm = '', isInitial = false) => {
    if (isInitial) {
      setInitialLoading(true);
    } else {
      setTableLoading(true);
    }
    try {
      let url = '/orders';
      const params = [];
      if (emailTerm && emailTerm.trim()) params.push(`email=${encodeURIComponent(emailTerm.trim())}`);
      if (stateTerm && stateTerm.trim()) params.push(`state=${encodeURIComponent(stateTerm.trim())}`);
      if (params.length) url += `?${params.join('&')}`;
      const res = await api.get(url);
      setOrders(Array.isArray(res.data) ? res.data : []);
    } finally {
      if (isInitial) setInitialLoading(false);
      setTableLoading(false);
    }
  };

  // Fetch available states for dropdown
  useEffect(() => {
    setStatesLoading(true);
    api.get('/orders/states').then(res => setStates(res.data || [])).finally(() => setStatesLoading(false));
  }, []);

  useEffect(() => {
    fetchOrders('', '', true);
  }, []);

  // Only search by email
  function handleEmailChange(e) {
    const value = e.target.value;
    setEmail(value);
    fetchOrders(value, selectedState);
    // Debounced suggestion fetch
    if (suggestionTimeout.current) clearTimeout(suggestionTimeout.current);
    if (value.trim().length > 0) {
      suggestionTimeout.current = setTimeout(async () => {
        setSuggestionsLoading(true);
        try {
          const res = await api.get(`/orders/suggestions?query=${encodeURIComponent(value)}`);
          setSuggestions(res.data || []);
        } catch {
          setSuggestions([]);
        } finally {
          setSuggestionsLoading(false);
        }
      }, 200);
    } else {
      setSuggestions([]);
      setSuggestionsLoading(false);
    }
  }

  function handleSuggestionClick(s) {
    setEmail(s);
    setSuggestions([]);
    fetchOrders(s, selectedState);
  }

  function handleStateChange(e) {
    setSelectedState(e.target.value);
    fetchOrders(email, e.target.value);
  }

  const handleStatus = (id, status) => {
    setDialog({ open: true, type: 'status', orderId: id, status });
  };

  const handleDelete = (id) => {
    setDialog({ open: true, type: 'delete', orderId: id });
  };

  const confirmAction = async () => {
    if (dialog.type === 'delete') {

// --- PATCH: Add support for 'out_for_delivery' status in admin order actions and details ---
      setDeleting(dialog.orderId);
      await api.del(`/orders/${dialog.orderId}`);
      await fetchOrders();
      setDeleting('');
      setDialog({ open: false, type: '', orderId: '', status: '' });
    } else if (dialog.type === 'status') {
      setUpdating(dialog.orderId);
      await api.patch(`/orders/${dialog.orderId}`, { status: dialog.status });
      await fetchOrders();
      setUpdating('');
      setDialog({ open: false, type: '', orderId: '', status: '' });
    }
  };

  const cancelDialog = () => setDialog({ open: false, type: '', orderId: '', status: '' });

  if (initialLoading) return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      Loading orders...
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Admin Orders | JC's Closet</title>
        <meta name="description" content="Admin panel for managing orders at JC's Closet." />
      </Helmet>
      <div className="admin-dashboard">
        {/* Admin notification opt-in dialog */}
        <Dialog open={adminNotifStatus === 'idle'}>
          <DialogTitle>Enable Admin Notifications?</DialogTitle>
          <DialogContent>
            <p>Would you like to receive notifications for new orders and important admin events?</p>
            {adminNotifStatus === 'error' && <span style={{ color: '#b71c1c', fontWeight: 500 }}>Error enabling notifications. Please try again.</span>}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setAdminNotifStatus('denied'); localStorage.setItem('jc_closet_admin_notif', 'denied'); }}>No, thanks</Button>
            <Button
              onClick={handleAdminNotif}
              variant="contained"
              color="info"
              disabled={notifLoading}
              startIcon={notifLoading ? <CircularProgress size={18} color="inherit" /> : null}
              autoFocus
            >
              {notifLoading ? 'Enabling...' : 'Yes, enable'}
            </Button>
          </DialogActions>
        </Dialog>
        {/* Show result dialog if accepted or denied */}
        <Dialog open={adminNotifStatus === 'granted' || adminNotifStatus === 'denied'} onClose={() => {}}>
          <DialogTitle>Admin Notifications</DialogTitle>
          <DialogContent>
            {adminNotifStatus === 'granted' && <span style={{ color: '#388e3c', fontWeight: 500 }}>Notifications enabled! You will now receive admin alerts.</span>}
            {adminNotifStatus === 'denied' && <span style={{ color: '#b71c1c', fontWeight: 500 }}>Notifications are disabled. You can enable them in your browser settings later.</span>}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setAdminNotifStatus('done'); }}>OK</Button>
          </DialogActions>
        </Dialog>
        <h1>Orders</h1>
        <div style={{ marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 16, position: 'relative' }}>
          <input
            type="text"
            placeholder="🔍 Search by customer email..."
            value={email}
            onChange={handleEmailChange}
            style={{ padding: 8, width: 320, maxWidth: '100%', borderRadius: 24, border: '1.5px solid #cbd5e1', fontSize: 16, background: '#f8fafc', boxShadow: '0 1px 4px #e0e7ef', outline: 'none', transition: 'border 0.2s, box-shadow 0.2s' }}
            onFocus={e => e.target.style.border = '1.5px solid #1976d2'}
            onBlur={e => e.target.style.border = '1.5px solid #cbd5e1'}
            aria-label="Search Orders by Email"
          />
          {(suggestionsLoading || suggestions.length > 0) && (
            <div style={{
              position: 'absolute',
              top: 44,
              left: 0,
              right: 0,
              background: '#fff',
              border: '1px solid #e0e7ef',
              borderRadius: 8,
              boxShadow: '0 2px 12px #e0e7ef',
              zIndex: 1000,
              maxHeight: 220,
              overflowY: 'auto',
              marginTop: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: suggestionsLoading && suggestions.length === 0 ? 'center' : 'flex-start',
              minHeight: suggestionsLoading && suggestions.length === 0 ? 60 : undefined,
            }}>
              {suggestionsLoading && suggestions.length === 0 && (
                <div style={{ padding: '16px 0' }}><CircularProgress size={22} /></div>
              )}
              {suggestions.map((s, i) => (
                <div
                  key={i}
                  style={{ padding: '10px 16px', cursor: 'pointer', fontSize: 15, color: '#222', borderBottom: i !== suggestions.length - 1 ? '1px solid #f1f5f9' : 'none', background: '#fff', width: '100%' }}
                  onMouseDown={() => handleSuggestionClick(s)}
                >
                  {s}
                </div>
              ))}
            </div>
          )}
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <select
              value={selectedState}
              onChange={handleStateChange}
              style={{ padding: 8, width: 180, borderRadius: 24, border: '1.5px solid #cbd5e1', fontSize: 16, background: '#f8fafc', boxShadow: '0 1px 4px #e0e7ef', outline: 'none', transition: 'border 0.2s, box-shadow 0.2s' }}
              aria-label="Filter by State"
              disabled={statesLoading}
            >
              <option value="">All States</option>
              {states.map((state, i) => (
                <option key={state + i} value={state}>{state}</option>
              ))}
            </select>
            {statesLoading && (
              <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }}>
                <CircularProgress size={18} />
              </div>
            )}
          </div>
        </div>
        <div className="latest-orders" style={{ position: 'relative', width: '100%' }}>
          <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', borderRadius: 8, border: '1px solid #e0e7ef', background: '#fff', boxShadow: '0 1px 4px #e0e7ef' }}>
            <table style={{ minWidth: 1100, width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Location</th>
                  <th>Items</th>
                  <th>Subtotal</th>
                  <th>Delivery</th>
                  <th>Grand Total</th>
                  <th>Status</th>
                  <th>Paid At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(orders) ? orders : []).map(order => (
                  <tr key={order._id} className="order-row">
                    <td data-label="Order ID">{order._id.slice(-6).toUpperCase()}</td>
                    <td data-label="Customer">
                      <b>{order.customer.name}</b><br />
                      <span style={{ fontSize: 13 }}>{order.customer.email}<br />{order.customer.phone}</span>
                    </td>
                    <td data-label="Location">
                      <span style={{ fontSize: 13 }}>
                        {order.customer.address}<br/>
                        <b>{order.customer.state}</b> / {order.customer.lga}
                      </span>
                    </td>
                    <td data-label="Items">
                      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                        {order.cart.map(item => (
                          <li key={item._id}>{item.name} x{item.quantity}</li>
                        ))}
                      </ul>
                    </td>
                    <td data-label="Subtotal">₦{order.amount?.toLocaleString()}</td>
                    <td data-label="Delivery">₦{order.deliveryFee?.toLocaleString?.() ?? order.deliveryFee ?? '-'}</td>
                    <td data-label="Grand Total">₦{order.grandTotal?.toLocaleString?.() ?? order.grandTotal ?? '-'}</td>
                    <td data-label="Status" className={order.status ? order.status.toLowerCase() : ''}>
                      {order.status}
                      {order.status === 'paid' && (
                        <Button size="small" variant="outlined" color="info" disabled={updating === order._id} onClick={() => handleStatus(order._id, 'shipped')}>Mark as Shipped</Button>
                      )}

                      {order.status === 'shipped' && (
                        <>
                          <Button size="small" variant="outlined" color="warning" disabled={updating === order._id} onClick={() => handleStatus(order._id, 'out_for_delivery')}>Mark as Out for Delivery</Button>
                          <Button size="small" variant="outlined" color="secondary" disabled={updating === order._id} onClick={() => handleStatus(order._id, 'delivered')}>Mark as Delivered</Button>
                          <Button size="small" variant="outlined" color="error" disabled={updating === order._id} onClick={() => handleStatus(order._id, 'cancelled')}>Cancel</Button>
                        </>
                      )}

                      {order.status === 'out_for_delivery' && (
                        <>
                          <Button size="small" variant="outlined" color="secondary" disabled={updating === order._id} onClick={() => handleStatus(order._id, 'delivered')}>Mark as Delivered</Button>
                          <Button size="small" variant="outlined" color="error" disabled={updating === order._id} onClick={() => handleStatus(order._id, 'cancelled')}>Cancel</Button>
                        </>
                      )}
                      {order.status === 'paid' && (
                        <Button size="small" variant="outlined" color="error" disabled={updating === order._id} onClick={() => handleStatus(order._id, 'cancelled')}>Cancel</Button>
                      )}
                    </td>
                    <td data-label="Paid At">
                      {new Date(order.paidAt).toLocaleString()}
                      {order.shippedAt && <><br /><span style={{fontSize:12}}>Shipped: {new Date(order.shippedAt).toLocaleString()}</span></>}
                      {order.deliveredAt && <><br /><span style={{fontSize:12}}>Delivered: {new Date(order.deliveredAt).toLocaleString()}</span></>}
                      {order.cancelledAt && <><br /><span style={{fontSize:12, color:'#b71c1c'}}>Cancelled: {new Date(order.cancelledAt).toLocaleString()}</span></>}
                    </td>
                    <td data-label="Actions">
                      <Button color="primary" onClick={() => setDetailsOrder(order)} style={{marginRight:8}}>View Details</Button>
                      <Button color="error" onClick={() => handleDelete(order._id)} disabled={deleting === order._id}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {tableLoading && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(255,255,255,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2
            }}>
              <CircularProgress size={36} />
            </div>
          )}
        </div>
        <Dialog open={dialog.open} onClose={cancelDialog}>
          <DialogTitle>{dialog.type === 'delete' ? 'Delete Order' : 'Update Order Status'}</DialogTitle>
          <DialogContent>
            {dialog.type === 'delete' ? 'Are you sure you want to delete this order? This action cannot be undone.' : `Are you sure you want to mark this order as "${dialog.status}"? The customer will be notified.`}
          </DialogContent>
          <DialogActions>
            <Button onClick={cancelDialog} disabled={updating || deleting}>Cancel</Button>
            <Button
              onClick={confirmAction}
              color={dialog.type === 'delete' ? 'error' : 'primary'}
              autoFocus
              disabled={Boolean(updating || deleting)}
              startIcon={(updating || deleting) && <CircularProgress size={18} color="inherit" />}
            >
              {(updating || deleting) ? 'Processing...' : 'Confirm'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Order Details Modal */}
        <Dialog open={!!detailsOrder} onClose={() => setDetailsOrder(null)} maxWidth="md" fullWidth>
          <DialogTitle>Order Details</DialogTitle>
          <DialogContent dividers>
            {detailsOrder && (
              <div style={{fontSize:15, lineHeight:1.7}}>
                <b>Order ID:</b> {detailsOrder._id}<br/>
                <b>Status:</b> {detailsOrder.status}<br/>
                <b>Subtotal:</b> ₦{detailsOrder.amount?.toLocaleString()}<br/>
                <b>Delivery Fee:</b> ₦{detailsOrder.deliveryFee?.toLocaleString?.() ?? detailsOrder.deliveryFee ?? '-'}<br/>
                <b>Grand Total:</b> ₦{detailsOrder.grandTotal?.toLocaleString?.() ?? detailsOrder.grandTotal ?? '-'}<br/>
                <b>Paid At:</b> {detailsOrder.paidAt ? new Date(detailsOrder.paidAt).toLocaleString() : '-'}<br/>
                {detailsOrder.shippedAt && (<><b>Shipped At:</b> {new Date(detailsOrder.shippedAt).toLocaleString()}<br/></>)}
                {detailsOrder.outForDeliveryAt && (<><b>Out for Delivery At:</b> {new Date(detailsOrder.outForDeliveryAt).toLocaleString()}<br/></>)}
                {detailsOrder.deliveredAt && (<><b>Delivered At:</b> {new Date(detailsOrder.deliveredAt).toLocaleString()}<br/></>)}
                {detailsOrder.cancelledAt && (<><b>Cancelled At:</b> <span style={{color:'#b71c1c'}}>{new Date(detailsOrder.cancelledAt).toLocaleString()}</span><br/></>)}
                <hr style={{margin:'12px 0'}}/>
                <b>Customer Info:</b><br/>
                Name: {detailsOrder.customer?.name}<br/>
                Email: {detailsOrder.customer?.email}<br/>
                Phone: {detailsOrder.customer?.phone}<br/>
                Address: {detailsOrder.customer?.address}<br/>
                State: {detailsOrder.customer?.state}<br/>
                LGA: {detailsOrder.customer?.lga}<br/>
                <hr style={{margin:'12px 0'}}/>
                <b>Items:</b>
                <ul style={{margin:0, paddingLeft:18}}>
                  {detailsOrder.cart.map(item => (
                    <li key={item._id}>
                      {item.name} x{item.quantity} (₦{item.price.toLocaleString()} each)
                    </li>
                  ))}
                </ul>
                <hr style={{margin:'12px 0'}}/>
                <b>Payment Ref:</b> {detailsOrder.paystackRef || '-'}<br/>
                <b>Notes:</b> {detailsOrder.notes || '-'}
              </div>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailsOrder(null)}>Close</Button>
          </DialogActions>
        </Dialog>
      </div>
    </>
  );
}

export default AdminOrders;
