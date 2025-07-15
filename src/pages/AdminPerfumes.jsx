// Ensure BACKEND_URL does not end with /api and always points to backend root
const BACKEND_URL = (import.meta.env.VITE_API_BASE_URL || 'https://jcserver.onrender.com').replace(/\/?api\/?$/, '');
const getImageUrl = (imgPath) => {
  if (!imgPath) return imgPath;
  if (/^https?:\/\//.test(imgPath)) return imgPath;
  // Always ensure /api/perfumes/uploads/ for perfume images
  if (imgPath.startsWith('/uploads/')) {
    return BACKEND_URL + '/api/perfumes' + imgPath;
  }
  if (imgPath.startsWith('/perfumes/uploads/')) {
    return BACKEND_URL + '/api' + imgPath;
  }
  if (imgPath.startsWith('/api/perfumes/uploads/')) {
    return BACKEND_URL + imgPath;
  }
  // If it's just a filename (no slashes), treat as /api/perfumes/uploads/filename
  if (!imgPath.includes('/')) {
    return BACKEND_URL + '/api/perfumes/uploads/' + imgPath;
  }
  return imgPath;
};
import React, { useEffect, useState } from 'react';
import * as api from '../utils/api';
import { Box, Typography, Paper, TextField, Button, Grid, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Stack, Radio, RadioGroup, FormControlLabel } from '@mui/material';
import { Add, Edit, Delete, UploadFile, Remove } from '@mui/icons-material';
import './AdminDashboard.css'; // Reuse and extend dashboard styles
import { Helmet } from 'react-helmet-async';
import Calculator from '../components/admin/Calculator';

const CATEGORY_OPTIONS = [
  'men', 'women', 'luxury', 'arab', 'designer', 'affordable'
];

const AdminPerfumes = () => {
  const [perfumes, setPerfumes] = useState([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    images: [],
    mainImageIndex: 0,
    promoEnabled: false,
    promoType: 'discount', // 'discount' or 'price'
    promoValue: '',
    promoStart: '',
    promoEnd: '',
    categories: []
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [perfumeToDelete, setPerfumeToDelete] = useState(null);
  const [errors, setErrors] = useState({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [hasMore, setHasMore] = useState(false);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'
  const [suggestions, setSuggestions] = useState([]);
  const [lowStockEdits, setLowStockEdits] = useState({});
  const suggestionTimeout = React.useRef(null);
  const formRef = React.useRef(null);

  // Helper: Get low stock perfumes (stock <= 5)
  const lowStockPerfumes = perfumes.filter(p => Number(p.stock) <= 5);

  async function fetchPerfumes(query = "", pageArg = page, limitArg = limit) {
    setLoading(true);
    try {
      let url = `/perfumes?page=${pageArg}&limit=${limitArg}`;
      if (query) url += `&search=${encodeURIComponent(query)}`;
      const res = await api.get(url);
      let perfumesArr = [];
      let hasMoreVal = false;
      if (res.data && Array.isArray(res.data.data)) {
        perfumesArr = res.data.data;
        hasMoreVal = !!res.data.hasMore;
      } else if (Array.isArray(res.data)) {
        perfumesArr = res.data;
      } else {
        perfumesArr = [];
      }
      setPerfumes(perfumesArr);
      setHasMore(hasMoreVal);
    } catch {
      setPerfumes([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPerfumes(search, page, limit);
    // eslint-disable-next-line
  }, [page, limit]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    if (name === 'categories') {
      setForm((prev) => {
        let categories = prev.categories || [];
        if (checked) {
          categories = [...categories, value];
        } else {
          categories = categories.filter((cat) => cat !== value);
        }
        return { ...prev, categories };
      });
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  }

  // Helper: Convert image file to WebP
  async function convertToWebP(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                // Create a new File object with .webp extension
                const webpFile = new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), { type: 'image/webp' });
                resolve(webpFile);
              } else {
                reject(new Error('WebP conversion failed'));
              }
            },
            'image/webp',
            0.80 // quality
          );
        };
        img.onerror = reject;
        img.src = event.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleFileChange(e) {
    const files = Array.from(e.target.files).slice(0, 5);
    setLoading(true);
    try {
      const webpFiles = await Promise.all(files.map(convertToWebP));
      setImageFiles(webpFiles);
    } catch {
      setMessage('Failed to convert image(s) to WebP.');
      setMessageType('error');
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 4000);
    } finally {
      setLoading(false);
    }
  }

  function handleRemoveFile(idx) {
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleRemoveImg(idx) {
    setForm((prev) => {
      const images = prev.images.filter((_, i) => i !== idx);
      let mainImageIndex = prev.mainImageIndex;
      if (mainImageIndex >= images.length) mainImageIndex = 0;
      return { ...prev, images, mainImageIndex };
    });
  }

  function handleMainImageChange(e) {
    setForm((prev) => ({ ...prev, mainImageIndex: parseInt(e.target.value) }));
  }

  function validateForm() {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.description.trim()) newErrors.description = 'Description is required';
    if (!form.price || isNaN(form.price)) newErrors.price = 'Valid price is required';
    if (!form.stock || isNaN(form.stock) || parseInt(form.stock) < 0) newErrors.stock = 'Valid stock is required';
    if (!editingId && imageFiles.length === 0) newErrors.images = 'At least one image is required';
    if (imageFiles.length > 5) newErrors.images = 'You can upload up to 5 images';
    if (form.promoEnabled) {
      if (!form.promoValue || isNaN(form.promoValue) || Number(form.promoValue) <= 0) newErrors.promoValue = 'Promo value required';
      if (!form.promoStart) newErrors.promoStart = 'Start date required';
      if (!form.promoEnd) newErrors.promoEnd = 'End date required';
    }
    if (!form.categories || form.categories.length === 0) newErrors.categories = 'Select at least one category';
    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validateForm();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    setLoading(true);
    setMessage("");
    setMessageType("");
    try {
      const data = new FormData();
      data.append('name', form.name);
      data.append('description', form.description);
      data.append('price', form.price);
      data.append('stock', form.stock);
      data.append('mainImageIndex', form.mainImageIndex);
      data.append('promoEnabled', form.promoEnabled);
      if (form.promoEnabled) {
        data.append('promoType', form.promoType);
        data.append('promoValue', form.promoValue);
        data.append('promoStart', form.promoStart);
        data.append('promoEnd', form.promoEnd);
      }
      form.categories.forEach(cat => data.append('categories', cat));
      form.images.forEach(img => data.append('images', img));
      imageFiles.forEach(file => data.append('images', file));
      let res;
      const token = localStorage.getItem('token');
      const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
      if (editingId) {
        res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/perfumes/${editingId}`, {
          method: 'PUT',
          headers: authHeader, // Attach token
          body: data
        });
      } else {
        res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/perfumes`, {
          method: 'POST',
          headers: authHeader, // Attach token
          body: data
        });
      }
      if (!res.ok) throw new Error('Failed to submit perfume');
      setForm({ name: '', description: '', price: '', stock: '', images: [], mainImageIndex: 0, promoEnabled: false, promoType: 'discount', promoValue: '', promoStart: '', promoEnd: '', categories: [] });
      setImageFiles([]);
      setEditingId(null);
      fetchPerfumes();
      setMessage(editingId ? 'Perfume updated successfully!' : 'Perfume added successfully!');
      setMessageType('success');
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3500);
    } catch {
      setMessage('An error occurred while submitting the perfume. Please try again.');
      setMessageType('error');
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 4000);
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(perfume) {
    setForm({
      name: perfume.name,
      description: perfume.description,
      price: perfume.price,
      stock: perfume.stock || '',
      images: perfume.images || [],
      mainImageIndex: perfume.mainImageIndex || 0,
      promoEnabled: perfume.promoEnabled || false,
      promoType: perfume.promoType || 'discount',
      promoValue: perfume.promoValue || '',
      promoStart: perfume.promoStart ? perfume.promoStart.slice(0, 10) : '',
      promoEnd: perfume.promoEnd ? perfume.promoEnd.slice(0, 10) : '',
      categories: perfume.categories || []
    });
    setImageFiles([]);
    setEditingId(perfume._id);
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }

  function openDeleteDialog(perfume) {
    setPerfumeToDelete(perfume);
    setDeleteDialogOpen(true);
  }

  function closeDeleteDialog() {
    setDeleteDialogOpen(false);
    setPerfumeToDelete(null);
  }

  async function confirmDelete() {
    if (!perfumeToDelete) return;
    setLoading(true);
    try {
      await api.del(`/perfumes/${perfumeToDelete._id}`);
      fetchPerfumes();
    } finally {
      setLoading(false);
      closeDeleteDialog();
    }
  }

  // ImageWithLoader: shows a spinner while the image is loading
  const ImageWithLoader = ({ src, alt, style }) => {
    const [loaded, setLoaded] = React.useState(false);
    return (
      <Box sx={{ position: 'relative', width: style?.width || 40, height: style?.height || 40, display: 'inline-block' }}>
        {!loaded && (
          <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, background: '#f5f7fa' }}>
            <CircularProgress size={20} thickness={5} />
          </Box>
        )}
        <img
          src={getImageUrl(src)}
          alt={alt}
          style={{ ...style, opacity: loaded ? 1 : 0, transition: 'opacity 0.2s' }}
          loading="lazy"
          onLoad={() => setLoaded(true)}
        />
      </Box>
    );
  };

  function handleSearchChange(e) {
    const value = e.target.value;
    setSearch(value);
    setPage(1);
    fetchPerfumes(value, 1, limit);
    // Debounced suggestion fetch
    if (suggestionTimeout.current) clearTimeout(suggestionTimeout.current);
    if (value.trim().length > 0) {
      suggestionTimeout.current = setTimeout(async () => {
        try {
          const res = await api.get(`/perfumes/suggestions?query=${encodeURIComponent(value)}`);
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
    setPage(1);
    fetchPerfumes(s, 1, limit);
  }

  // Handle inline edit change for low stock
  function handleLowStockEditChange(id, field, value) {
    setLowStockEdits(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  }

  // Save low stock edit
  async function handleLowStockSave(id) {
    const edit = lowStockEdits[id];
    if (!edit) return;
    setLoading(true);
    setMessage("");
    setMessageType("");
    try {
      const data = {};
      if (edit.stock !== undefined) data.stock = edit.stock;
      if (edit.price !== undefined) data.price = edit.price;
      const token = localStorage.getItem('token');
      const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/perfumes/${id}`, {
        method: 'PUT',
        headers: authHeader, // Attach token
        body: (() => { const fd = new FormData(); Object.entries(data).forEach(([k,v])=>fd.append(k,v)); return fd; })()
      });
      if (!res.ok) throw new Error('Failed to update perfume');
      setMessage('Perfume updated successfully!');
      setMessageType('success');
      setLowStockEdits(prev => { const n = { ...prev }; delete n[id]; return n; });
      fetchPerfumes();
      setTimeout(() => { setMessage(""); setMessageType(""); }, 3000);
    } catch {
      setMessage('Failed to update perfume.');
      setMessageType('error');
      setTimeout(() => { setMessage(""); setMessageType(""); }, 3500);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Helmet>
        <title>Admin Perfumes | JC's Closet</title>
        <meta name="description" content="Admin panel for managing perfumes at JC's Closet." />
      </Helmet>
      <div className="admin-dashboard">
        {/* Floating message */}
        {message && (
          <div style={{
            position: 'fixed',
            top: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            minWidth: 260,
            maxWidth: '90vw',
            boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
            borderRadius: 10,
            padding: '14px 28px',
            background: messageType === 'success' ? '#e6f9ed' : '#fdeaea',
            color: messageType === 'success' ? '#20744a' : '#b71c1c',
            border: `1.5px solid ${messageType === 'success' ? '#b7e4c7' : '#f5c6cb'}`,
            fontWeight: 600,
            fontSize: 16,
            textAlign: 'center',
            opacity: 1,
            transition: 'opacity 0.4s',
          }}>
            {message}
          </div>
        )}
        <h1>Perfumes</h1>
        <div className="dashboard-summary">
          <div className="summary-card users">
            <h3>Total Perfumes</h3>
            <p>{perfumes.length}</p>
          </div>
          <div className="search-bar-container" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, position: 'relative' }}>
            <input
              type="text"
              placeholder="🔍 Search perfumes..."
              value={search}
              onChange={handleSearchChange}
              className="search-bar-input"
              style={{
                padding: '10px 16px',
                borderRadius: 24,
                border: '1.5px solid #cbd5e1',
                minWidth: 180,
                maxWidth: 320,
                fontSize: 16,
                background: '#f8fafc',
                boxShadow: '0 1px 4px #e0e7ef',
                outline: 'none',
                transition: 'border 0.2s, box-shadow 0.2s',
                width: '100%',
              }}
              onFocus={e => e.target.style.border = '1.5px solid #1976d2'}
              onBlur={e => e.target.style.border = '1.5px solid #cbd5e1'}
            />
            {/* Suggestions dropdown */}
            {suggestions.length > 0 && (
              <div style={{
                position: 'absolute',
                top: 44,
                right: 0,
                left: 0,
                background: '#fff',
                border: '1px solid #e0e7ef',
                borderRadius: 8,
                boxShadow: '0 2px 12px #e0e7ef',
                zIndex: 1000,
                maxHeight: 220,
                overflowY: 'auto',
                marginTop: 2,
              }}>
                {suggestions.map((s, i) => (
                  <div
                    key={i}
                    style={{ padding: '10px 16px', cursor: 'pointer', fontSize: 15, color: '#222', borderBottom: i !== suggestions.length - 1 ? '1px solid #f1f5f9' : 'none', background: '#fff' }}
                    onMouseDown={() => handleSuggestionClick(s)}
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {(search.trim() === "" || editingId) && (
          <div className="dashboard-summary">
            <div className="summary-card orders" style={{ flex: 2 }}>
              <h3>{editingId ? 'Edit Perfume' : 'Add New Perfume'}</h3>
              <form ref={formRef} onSubmit={handleSubmit} encType="multipart/form-data">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ flex: 1, minWidth: 220 }}>
                    <TextField name="name" label="Name" value={form.name} onChange={handleChange} fullWidth required sx={{ mb: 1 }}
                      error={!!errors.name} helperText={errors.name} className="perfume-form-input" />
                  </div>
                  <div style={{ flex: 1, minWidth: 220 }}>
                    <TextField name="price" label="Price (₦)" value={form.price} onChange={handleChange} fullWidth required sx={{ mb: 1 }}
                      error={!!errors.price} helperText={errors.price} type="number" className="perfume-form-input" />
                  </div>
                  <div style={{ flex: 1, minWidth: 220 }}>
                    <TextField name="stock" label="Stock" value={form.stock} onChange={handleChange} fullWidth required sx={{ mb: 1 }}
                      error={!!errors.stock} helperText={errors.stock} type="number" className="perfume-form-input" />
                  </div>
                </div>
                <TextField name="description" label="Description" value={form.description} onChange={handleChange} fullWidth required sx={{ mb: 1 }}
                  error={!!errors.description} helperText={errors.description} multiline rows={2} className="perfume-form-textarea" />
                <div style={{ margin: '1rem 0' }}>
                  <label className="perfume-upload-label">
                    <UploadFile style={{ marginRight: 8, verticalAlign: 'middle' }} />
                    Select Images
                    <input type="file" accept="image/*" multiple hidden onChange={handleFileChange} />
                  </label>
                  {errors.images && (
                    <div className="perfume-error-text" style={{ color: 'red', fontSize: 13 }}>{errors.images}</div>
                  )}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                    {imageFiles.map((file, idx) => (
                      <span key={idx} className="perfume-file-chip">{file.name} <button type="button" onClick={() => handleRemoveFile(idx)}>&times;</button></span>
                    ))}
                    {form.images.length > 0 && form.images.map((img, idx) => (
                      <span key={idx} className="perfume-file-chip"><img src={getImageUrl(img)} alt="" style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 4, marginRight: 4 }} /><button type="button" onClick={() => handleRemoveImg(idx)}>&times;</button></span>
                    ))}
                  </div>
                  {(imageFiles.length > 0 || form.images.length > 0) && (
                    <div style={{ marginTop: 16 }}>
                      <span style={{ fontWeight: 500, fontSize: 14 }}>Select Main Image</span>
                      <RadioGroup row value={form.mainImageIndex} onChange={handleMainImageChange}>
                        {form.images.map((img, idx) => (
                          <FormControlLabel
                            key={img}
                            value={idx}
                            control={<Radio />}
                            label={<img src={getImageUrl(img)} alt="main" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} />}
                          />
                        ))}
                        {imageFiles.map((file, idx) => (
                          <FormControlLabel
                            key={file.name}
                            value={form.images.length + idx}
                            control={<Radio />}
                            label={<span>{file.name}</span>}
                          />
                        ))}
                      </RadioGroup>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', marginBottom: 8 }}>
                  <FormControlLabel
                    control={<input type="checkbox" name="promoEnabled" checked={form.promoEnabled} onChange={handleChange} />}
                    label="Enable Promotion"
                  />
                  {form.promoEnabled && (
                    <>
                      <FormControlLabel
                        control={<input type="radio" name="promoType" value="discount" checked={form.promoType === 'discount'} onChange={handleChange} />}
                        label="Discount (%)"
                      />
                      <FormControlLabel
                        control={<input type="radio" name="promoType" value="price" checked={form.promoType === 'price'} onChange={handleChange} />}
                        label="Promo Price (₦)"
                      />
                    </>
                  )}
                </div>
                {form.promoEnabled && (
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
                    <TextField
                      name="promoValue"
                      label={form.promoType === 'discount' ? 'Discount (%)' : 'Promo Price (₦)'}
                      value={form.promoValue}
                      onChange={handleChange}
                      fullWidth
                      required
                      error={!!errors.promoValue}
                      helperText={errors.promoValue}
                      type="number"
                      className="perfume-form-input"
                      style={{ flex: 1, minWidth: 180 }}
                    />
                    <TextField
                      name="promoStart"
                      label="Promo Start"
                      type="date"
                      value={form.promoStart}
                      onChange={handleChange}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      required
                      error={!!errors.promoStart}
                      helperText={errors.promoStart}
                      className="perfume-form-input"
                      style={{ flex: 1, minWidth: 180 }}
                    />
                    <TextField
                      name="promoEnd"
                      label="Promo End"
                      type="date"
                      value={form.promoEnd}
                      onChange={handleChange}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      required
                      error={!!errors.promoEnd}
                      helperText={errors.promoEnd}
                      className="perfume-form-input"
                      style={{ flex: 1, minWidth: 180 }}
                    />
                  </div>
                )}
                <div style={{ marginBottom: 8 }}>
                  <span style={{ fontWeight: 500, fontSize: 14 }}>Categories</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 4 }}>
                    {CATEGORY_OPTIONS.map((cat) => (
                      <FormControlLabel
                        key={cat}
                        control={
                          <input
                            type="checkbox"
                            name="categories"
                            value={cat}
                            checked={form.categories.includes(cat)}
                            onChange={handleChange}
                          />
                        }
                        label={cat.charAt(0).toUpperCase() + cat.slice(1)}
                      />
                    ))}
                  </div>
                  {errors.categories && (
                    <div className="perfume-error-text" style={{ color: 'red', fontSize: 13 }}>{errors.categories}</div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <button type="submit" className="primary-btn" disabled={loading}>
                    {editingId ? 'Update' : 'Add'} Perfume
                  </button>
                  {editingId && (
                    <button type="button" className="secondary-btn" onClick={() => { setForm({ name: '', description: '', price: '', stock: '', images: [], mainImageIndex: 0, promoEnabled: false, promoType: 'discount', promoValue: '', promoStart: '', promoEnd: '', categories: [] }); setImageFiles([]); setEditingId(null); }}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Only show low stock section if there are products with low stock */}
        {lowStockPerfumes.length > 0 && (
          <div className="low-stock-section" style={{ margin: '32px 0', background: '#fff8e1', borderRadius: 10, padding: 20, boxShadow: '0 2px 12px #f9e7c0', border: '1.5px solid #ffe082' }}>
            <h3 style={{ color: '#b26a00', marginBottom: 12 }}>Low Stock Products</h3>
            <table style={{ width: '100%', background: 'transparent' }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Current Stock</th>
                  <th>Price (₦)</th>
                  <th>Update Stock</th>
                  <th>Update Price</th>
                  <th>Save</th>
                </tr>
              </thead>
              <tbody>
                {lowStockPerfumes.map(p => (
                  <tr key={p._id}>
                    <td>{p.name}</td>
                    <td>{p.stock}</td>
                    <td>₦{p.price?.toLocaleString()}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        value={lowStockEdits[p._id]?.stock ?? p.stock}
                        onChange={e => handleLowStockEditChange(p._id, 'stock', e.target.value)}
                        style={{ width: 70, padding: 4, borderRadius: 4, border: '1px solid #ccc' }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        value={lowStockEdits[p._id]?.price ?? p.price}
                        onChange={e => handleLowStockEditChange(p._id, 'price', e.target.value)}
                        style={{ width: 90, padding: 4, borderRadius: 4, border: '1px solid #ccc' }}
                      />
                    </td>
                    <td>
                      <button
                        className="primary-btn"
                        style={{ padding: '4px 12px', fontSize: 14 }}
                        disabled={loading}
                        onClick={() => handleLowStockSave(p._id)}
                      >
                        Save
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="latest-orders">
          <h3>All Perfumes</h3>
          {loading ? (
            <div className="loading-spinner"><div className="spinner"></div>Loading perfumes...</div>
          ) : (
            <>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Promo</th>
                    <th>Categories</th>
                    <th>Images</th>
                    <th>Main Image</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {perfumes.map(perfume => (
                    <tr key={perfume._id}>
                      <td>{perfume.name}</td>
                      <td>{perfume.description}</td>
                      <td>₦{perfume.price?.toLocaleString()}</td>
                      <td>{perfume.stock}</td>
                      <td>
                        {perfume.promoEnabled ? (
                          <>
                            {perfume.promoType === 'discount' ? (
                              <span>-{perfume.promoValue}%<br /></span>
                            ) : (
                              <span>₦{perfume.promoValue?.toLocaleString()}<br /></span>
                            )}
                            <span style={{ fontSize: 12 }}>
                              {perfume.promoStart?.slice(0, 10)} to {perfume.promoEnd?.slice(0, 10)}
                            </span>
                          </>
                        ) : (
                          <span style={{ color: '#888' }}>None</span>
                        )}
                      </td>
                      <td>
                        {perfume.categories && perfume.categories.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {perfume.categories.map((cat) => (
                              <span key={cat} style={{ fontSize: 12, background: '#e0e7ef', padding: '2px 8px', borderRadius: 4, marginRight: 2 }}>{cat}</span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: '#888' }}>None</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {perfume.images && perfume.images.slice(0, 2).map((img, i) => (
                            <ImageWithLoader
                              key={i}
                              src={getImageUrl(img)}
                              alt=""
                              style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
                            />
                          ))}
                          {perfume.images && perfume.images.length > 2 && (
                            <span style={{ fontSize: 12, color: '#1976d2', alignSelf: 'center', marginLeft: 4 }}>+{perfume.images.length - 2} more</span>
                          )}
                        </div>
                      </td>
                      <td>
                        {perfume.images && perfume.images[perfume.mainImageIndex] && (
                          <ImageWithLoader
                            src={getImageUrl(perfume.images[perfume.mainImageIndex])}
                            alt="main"
                            style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4, border: '2px solid #1976d2' }}
                          />
                        )}
                      </td>
                      <td>
                        <button className="primary-btn" onClick={() => handleEdit(perfume)}>Edit</button>
                        <button className="secondary-btn" onClick={() => openDeleteDialog(perfume)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Pagination controls */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 24 }}>
                <button
                  className="primary-btn"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                >
                  Previous
                </button>
                <span style={{ fontWeight: 600 }}>
                  Page {page} {hasMore ? '' : '(last page)'}
                </span>
                <button
                  className="primary-btn"
                  onClick={() => setPage(p => p + 1)}
                  disabled={!hasMore || loading}
                >
                  Next
                </button>
                <span style={{ marginLeft: 16 }}>
                  Show
                  <select value={limit} onChange={e => { setLimit(Number(e.target.value)); setPage(1); }} style={{ margin: '0 6px', padding: '2px 6px', borderRadius: 4 }}>
                    {[5, 10, 20, 50].map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  per page
                </span>
              </div>
            </>
          )}
        </div>
        <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
          <DialogTitle>Delete Perfume</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete <b>{perfumeToDelete?.name}</b>?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDeleteDialog} color="primary">Cancel</Button>
            <Button onClick={confirmDelete} color="error" variant="contained">Delete</Button>
          </DialogActions>
        </Dialog>
        <div style={{ margin: '32px 0' }}>
          <Calculator />
        </div>
      </div>
    </>
  );
};

export default AdminPerfumes;

/* Add to AdminDashboard.css for better mobile responsiveness:
.search-bar-container {
  width: 100%;
  max-width: 400px;
}
@media (max-width: 600px) {
  .search-bar-container {
    max-width: 100%;
    margin-top: 12px;
    justify-content: center !important;
  }
  .search-bar-input {
    min-width: 0 !important;
    font-size: 15px !important;
    padding: 8px 12px !important;
  }
}
*/
