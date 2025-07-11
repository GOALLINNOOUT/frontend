import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { Helmet } from 'react-helmet-async';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';
import './AdminDashboard.css';

const API_USERS = '/api/admin/customers';
const API_ORDERS = '/api/admin/customer-orders';
const API_REVIEWS = '/api/reviews';

// Axios interceptor to add JWT token to all requests if present
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // or use your auth context
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

function AdminCustomers() {
  const theme = useTheme();
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [dialog, setDialog] = useState({ open: false, user: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [viewCustomer, setViewCustomer] = useState(null);
  const [viewOrdersModal, setViewOrdersModal] = useState(false);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [editCustomer, setEditCustomer] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewActionLoading, setReviewActionLoading] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const suggestionTimeout = React.useRef(null);

  useEffect(() => {
    fetchCustomers();
    fetchReviews();
  }, []);

  const fetchCustomers = async (query = "") => {
    let url = API_USERS;
    if (query && query.trim()) url += `?search=${encodeURIComponent(query.trim())}`;
    const res = await axios.get(url);
    setCustomers(res.data);
  };

  const fetchOrderHistory = async (user) => {
    setSelectedCustomer(user);
    setLoadingOrders(true);
    setViewOrdersModal(true);
    try {
      const res = await axios.get(`${API_ORDERS}?email=${encodeURIComponent(user.email)}`);
      setOrderHistory(res.data);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleBlacklist = (user) => {
    setDialog({ open: true, user });
  };

  const handleUnsuspend = (user) => {
    setDialog({ open: true, user, unsuspend: true });
  };

  const confirmBlacklist = async () => {
    setActionLoading(true);
    try {
      if (dialog.unsuspend) {
        await axios.patch(`/api/admin/unsuspend-user`, { email: dialog.user.email });
      } else {
        await axios.patch(`/api/admin/blacklist-user`, { email: dialog.user.email });
      }
      await fetchCustomers();
    } finally {
      setActionLoading(false);
      setDialog({ open: false, user: null, unsuspend: false });
    }
  };

  function handleSearchChange(e) {
    const value = e.target.value;
    setSearch(value);
    fetchCustomers(value);
    // Debounced suggestion fetch
    if (suggestionTimeout.current) clearTimeout(suggestionTimeout.current);
    if (value.trim().length > 0) {
      suggestionTimeout.current = setTimeout(async () => {
        try {
          const res = await axios.get(`${API_USERS}/suggestions?query=${encodeURIComponent(value)}`);
          setSuggestions(res.data || []);
        } catch {
          setSuggestions([]);
        }
      }, 200);
    } else {
      setSuggestions([]);
    }
  }

  function handleSuggestionClick(s) {
    setSearch(s);
    setSuggestions([]);
    fetchCustomers(s);
  }

  function openEditDialog(user) {
    setEditCustomer(user);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'customer',
      status: user.status || 'active',
      phone: user.phone || '',
      address: user.address || '',
      state: user.state || '',
      lga: user.lga || '',
    });
  }

  function handleEditFormChange(e) {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    setEditLoading(true);
    try {
      await axios.patch('/api/admin/update-customer', {
        _id: editCustomer._id,
        ...editForm,
      });
      await fetchCustomers();
      setEditCustomer(null);
      setSnackbar({ open: true, message: 'Customer updated successfully!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err?.response?.data?.error || 'Failed to update customer', severity: 'error' });
    } finally {
      setEditLoading(false);
    }
  }

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const res = await axios.get(API_REVIEWS);
      setReviews(res.data);
      setReviewError(null);
    } catch (err) {
      setReviewError('Failed to load reviews');
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleApproveReview = async (id) => {
    setReviewActionLoading(true);
    try {
      await axios.patch(`${API_REVIEWS}/${id}/approve`);
      await fetchReviews();
      setSnackbar({ open: true, message: 'Review approved!', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to approve review', severity: 'error' });
    } finally {
      setReviewActionLoading(false);
    }
  };

  const handleDeleteReview = async (id) => {
    setReviewActionLoading(true);
    try {
      await axios.delete(`${API_REVIEWS}/${id}`);
      await fetchReviews();
      setSnackbar({ open: true, message: 'Review deleted!', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete review', severity: 'error' });
    } finally {
      setReviewActionLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Users Management | JC's Closet</title>
        <meta name="description" content="Admin panel for managing users at JC's Closet." />
      </Helmet>
      <div className="admin-dashboard">
        <h1>Users</h1>
        <div className="dashboard-filters" style={{flexWrap:'wrap',gap:'1rem',marginBottom:'2rem',position:'relative'}}>
          <input
            type="text"
            placeholder="Search by name or email..."
            style={{
              padding:'0.6rem 1.1rem',
              border:`1.5px solid ${theme.palette.custom.customersInputBorder}`,
              borderRadius:8,
              fontSize:'1.08rem',
              background:theme.palette.custom.customersInputBg,
              color:theme.palette.custom.customersInputText,
              minWidth:220
            }}
            value={search}
            onChange={handleSearchChange}
            aria-label="Search Customers"
            autoComplete="off"
          />
          {suggestions.length > 0 && (
            <div style={{
              position: 'absolute',
              top: 48,
              left: 0,
              right: 0,
              background: theme.palette.custom.customersSuggestionBg,
              border: `1px solid ${theme.palette.custom.customersSuggestionBorder}`,
              borderRadius: 8,
              boxShadow: `0 2px 12px ${theme.palette.custom.customersSuggestionBorder}`,
              zIndex: 1000,
              maxHeight: 220,
              overflowY: 'auto',
              marginTop: 2,
            }}>
              {suggestions.map((s, i) => (
                <div
                  key={i}
                  style={{
                    padding: '10px 16px',
                    cursor: 'pointer',
                    fontSize: 15,
                    color: theme.palette.custom.customersSuggestionText,
                    borderBottom: i !== suggestions.length - 1 ? `1px solid ${theme.palette.custom.customersSuggestionBorderBottom}` : 'none',
                    background: theme.palette.custom.customersSuggestionBg
                  }}
                  onMouseDown={() => handleSuggestionClick(s)}
                >
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{overflowX:'auto'}}>
          <table className="latest-orders" style={{minWidth:600,width:'100%',borderCollapse:'collapse',marginBottom:32}}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.filter(u=>!u._hide).map(user => (
                <tr key={user._id} style={{background:user.status==='suspended'||user.status==='blacklisted'?theme.palette.custom.customersRowSuspendedBg:'',opacity:user.status==='suspended'||user.status==='blacklisted'?0.7:1}}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td><span style={{fontWeight:600,color:user.status==='suspended'||user.status==='blacklisted'?theme.palette.custom.customersStatusSuspended:theme.palette.custom.customersStatusActive}}>{user.status||'active'}</span></td>
                  <td style={{display:'flex',flexWrap:'wrap',gap:8}}>
                    <Button size="small" variant="outlined" onClick={() => setViewCustomer(user)}>
                      View Info
                    </Button>
                    <Button size="small" variant="outlined" onClick={() => fetchOrderHistory(user)}>
                      View Orders
                    </Button>
                    <Button size="small" variant="outlined" color="primary" onClick={() => openEditDialog(user)}>
                      Edit
                    </Button>
                    {user.status === 'suspended' || user.status === 'blacklisted' ? (
                      <Button size="small" variant="contained" color="success" onClick={() => handleUnsuspend(user)}>
                        Unsuspend
                      </Button>
                    ) : (
                      <Button size="small" variant="contained" color="error" onClick={() => handleBlacklist(user)}>
                        Suspend
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Dialog open={dialog.open} onClose={() => setDialog({ open: false, user: null, unsuspend: false })}>
          <DialogTitle>{dialog.unsuspend ? 'Unsuspend User' : 'Suspend/Blacklist User'}</DialogTitle>
          <DialogContent>
            {dialog.unsuspend
              ? 'Are you sure you want to unsuspend this user? They will regain access to their account.'
              : 'Are you sure you want to suspend/blacklist this user? They will not be able to log in or place orders.'}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialog({ open: false, user: null, unsuspend: false })}>Cancel</Button>
            <Button onClick={confirmBlacklist} color={dialog.unsuspend ? 'success' : 'error'} disabled={actionLoading} autoFocus>
              Confirm
            </Button>
          </DialogActions>
        </Dialog>

        {/* Customer Info Dialog */}
        <Dialog open={!!viewCustomer} onClose={() => setViewCustomer(null)} maxWidth="sm" fullWidth>
          <DialogTitle>Customer Info</DialogTitle>
          <DialogContent dividers>
            {viewCustomer && (
              <div style={{ lineHeight: 1.7, fontSize: '1.08rem', color: theme.palette.custom.customersInfoText }}>
                <b>Name:</b> {viewCustomer.name}<br />
                <b>Email:</b> {viewCustomer.email}<br />
                <b>Role:</b> {viewCustomer.role}<br />
                <b>Status:</b> {viewCustomer.status || 'active'}<br />
                <b>Created At:</b> {viewCustomer.createdAt ? new Date(viewCustomer.createdAt).toLocaleString() : '-'}<br />
                {viewCustomer.phone && (<><b>Phone:</b> {viewCustomer.phone}<br /></>)}
                {viewCustomer.address && (<><b>Address:</b> {viewCustomer.address}<br /></>)}
                {viewCustomer.state && (<><b>State:</b> {viewCustomer.state}<br /></>)}
                {viewCustomer.lga && (<><b>LGA:</b> {viewCustomer.lga}<br /></>)}
                {/* Show any other fields dynamically */}
                {Object.entries(viewCustomer).map(([key, value]) => (
                  ['_id','name','email','role','status','createdAt','phone','address','state','lga','password','resetPasswordToken','resetPasswordExpires','__v'].includes(key) ? null : (
                    <div key={key}><b>{key}:</b> {String(value)}</div>
                  )
                ))}
              </div>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewCustomer(null)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Order History Modal */}
        <Dialog open={viewOrdersModal} onClose={() => setViewOrdersModal(false)} maxWidth="md" fullWidth>
          <DialogTitle>Order History</DialogTitle>
          <DialogContent dividers>
            {selectedCustomer && (
              <div style={{marginBottom:16,fontWeight:600}}>
                {selectedCustomer.name} ({selectedCustomer.email})
              </div>
            )}
            {loadingOrders ? (
              <div className="loading-spinner"><div className="spinner"></div>Loading orders...</div>
            ) : orderHistory.length === 0 ? (
              <div>No orders found for this customer.</div>
            ) : (
              <div style={{overflowX:'auto'}}>
                <table className="latest-orders" style={{minWidth:500,width:'100%'}}>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Paid At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderHistory.map(order => (
                      <tr key={order._id}>
                        <td>{order._id.slice(-6).toUpperCase()}</td>
                        <td>₦{order.amount.toLocaleString()}</td>
                        <td>{order.status}</td>
                        <td>{new Date(order.paidAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewOrdersModal(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Edit Customer Dialog */}
        <Dialog open={!!editCustomer} onClose={() => setEditCustomer(null)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Customer</DialogTitle>
          <DialogContent dividers>
            {editCustomer && (
              <form onSubmit={handleEditSubmit} style={{display:'flex',flexDirection:'column',gap:20,marginTop:8}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
                  <div>
                    <label style={{fontWeight:600,marginBottom:4,display:'block'}}>Name</label>
                    <input name="name" value={editForm.name} onChange={handleEditFormChange} required style={{width:'100%',padding:'10px 12px',border:`1.5px solid ${theme.palette.custom.customersInputBorder}`,borderRadius:7,fontSize:'1.07rem',background:theme.palette.custom.customersInputBg,color:theme.palette.custom.customersInputText}} />
                  </div>
                  <div>
                    <label style={{fontWeight:600,marginBottom:4,display:'block'}}>Email</label>
                    <input name="email" value={editForm.email} onChange={handleEditFormChange} required style={{width:'100%',padding:'10px 12px',border:`1.5px solid ${theme.palette.custom.customersInputBorder}`,borderRadius:7,fontSize:'1.07rem',background:theme.palette.custom.customersInputBg,color:theme.palette.custom.customersInputText}} />
                  </div>
                  <div>
                    <label style={{fontWeight:600,marginBottom:4,display:'block'}}>Role</label>
                    <select name="role" value={editForm.role} onChange={handleEditFormChange} style={{width:'100%',padding:'10px 12px',border:`1.5px solid ${theme.palette.custom.customersInputBorder}`,borderRadius:7,fontSize:'1.07rem',background:theme.palette.custom.customersInputBg,color:theme.palette.custom.customersInputText}}>
                      <option value="customer">Customer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label style={{fontWeight:600,marginBottom:4,display:'block'}}>Status</label>
                    <select name="status" value={editForm.status} onChange={handleEditFormChange} style={{width:'100%',padding:'10px 12px',border:`1.5px solid ${theme.palette.custom.customersInputBorder}`,borderRadius:7,fontSize:'1.07rem',background:theme.palette.custom.customersInputBg,color:theme.palette.custom.customersInputText}}>
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="blacklisted">Blacklisted</option>
                    </select>
                  </div>
                  <div>
                    <label style={{fontWeight:600,marginBottom:4,display:'block'}}>Phone</label>
                    <input name="phone" value={editForm.phone} onChange={handleEditFormChange} style={{width:'100%',padding:'10px 12px',border:`1.5px solid ${theme.palette.custom.customersInputBorder}`,borderRadius:7,fontSize:'1.07rem',background:theme.palette.custom.customersInputBg,color:theme.palette.custom.customersInputText}} />
                  </div>
                  <div>
                    <label style={{fontWeight:600,marginBottom:4,display:'block'}}>Address</label>
                    <input name="address" value={editForm.address} onChange={handleEditFormChange} style={{width:'100%',padding:'10px 12px',border:`1.5px solid ${theme.palette.custom.customersInputBorder}`,borderRadius:7,fontSize:'1.07rem',background:theme.palette.custom.customersInputBg,color:theme.palette.custom.customersInputText}} />
                  </div>
                  <div>
                    <label style={{fontWeight:600,marginBottom:4,display:'block'}}>State</label>
                    <input name="state" value={editForm.state} onChange={handleEditFormChange} style={{width:'100%',padding:'10px 12px',border:`1.5px solid ${theme.palette.custom.customersInputBorder}`,borderRadius:7,fontSize:'1.07rem',background:theme.palette.custom.customersInputBg,color:theme.palette.custom.customersInputText}} />
                  </div>
                  <div>
                    <label style={{fontWeight:600,marginBottom:4,display:'block'}}>LGA</label>
                    <input name="lga" value={editForm.lga} onChange={handleEditFormChange} style={{width:'100%',padding:'10px 12px',border:`1.5px solid ${theme.palette.custom.customersInputBorder}`,borderRadius:7,fontSize:'1.07rem',background:theme.palette.custom.customersInputBg,color:theme.palette.custom.customersInputText}} />
                  </div>
                </div>
                <DialogActions style={{marginTop:12,justifyContent:'flex-end'}}>
                  <Button onClick={() => setEditCustomer(null)} disabled={editLoading} style={{minWidth:100}}>Cancel</Button>
                  <Button type="submit" variant="contained" color="primary" disabled={editLoading} style={{minWidth:120,fontWeight:600,boxShadow:`0 2px 8px ${theme.palette.custom.customersEditBtnShadow}`}}>
                    {editLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </DialogActions>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Reviews Management Section */}
        <div style={{marginTop:48,marginBottom:32}}>
          <h2>Reviews Management</h2>
          {loadingReviews ? (
            <div>Loading reviews...</div>
          ) : reviewError ? (
            <div style={{color:'red'}}>{reviewError}</div>
          ) : (
            <div style={{overflowX:'auto'}}>
              <table className="latest-orders" style={{minWidth:500,width:'100%',borderCollapse:'collapse',marginBottom:16}}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Review</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.length === 0 ? (
                    <tr><td colSpan={5}>No reviews found.</td></tr>
                  ) : (
                    reviews.map(r => {
                      const isDark = theme.palette.mode === 'dark';
                      const approvedBg = theme.palette.custom.customersRowApprovedBg;
                      const pendingBg = isDark ? theme.palette.background.paper : '#fff';
                      const pendingText = isDark ? theme.palette.warning.light : theme.palette.warning.main;
                      return (
                        <tr key={r._id} style={{background: r.approved ? approvedBg : pendingBg}}>
                          <td style={{color: r.approved ? undefined : pendingText}}>{r.name}</td>
                          <td style={{color: r.approved ? undefined : pendingText}}>{r.review}</td>
                          <td><span style={{fontWeight:600,color:r.approved?theme.palette.success.main:pendingText}}>{r.approved ? 'Approved' : 'Pending'}</span></td>
                          <td style={{color: r.approved ? undefined : pendingText}}>{r.createdAt ? new Date(r.createdAt).toLocaleString() : '-'}</td>
                          <td style={{display:'flex',gap:8}}>
                            {!r.approved && (
                              <Button size="small" variant="contained" color="success" onClick={() => handleApproveReview(r._id)} disabled={reviewActionLoading}>
                                Approve
                              </Button>
                            )}
                            <Button size="small" variant="contained" color="error" onClick={() => handleDeleteReview(r._id)} disabled={reviewActionLoading}>
                              Delete
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert onClose={() => setSnackbar(s => ({ ...s, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
    </>
  );
}

export default AdminCustomers;
