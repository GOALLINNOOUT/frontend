// Ensure BACKEND_URL does not end with /api and always points to backend root
const BACKEND_URL = (import.meta.env.VITE_API_BASE_URL || 'https://jcserver.onrender.com').replace(/\/?api\/?$/, '');
const getImageUrl = (imgPath) => {
  if (!imgPath) return imgPath;
  if (/^https?:\/\//.test(imgPath)) return imgPath;
  // Always use /api/designs/uploads/ for all design images
  if (imgPath.startsWith('/api/designs/uploads/')) {
    return BACKEND_URL + imgPath;
  }
  if (imgPath.startsWith('/designs/uploads/')) {
    return BACKEND_URL + '/api' + imgPath;
  }
  if (imgPath.startsWith('/uploads/')) {
    return BACKEND_URL + '/api/designs' + imgPath;
  }
  // If it's just a filename, treat as /api/designs/uploads/filename
  if (!imgPath.includes('/')) {
    return BACKEND_URL + '/api/designs/uploads/' + imgPath;
  }
  return imgPath;
};
import React from 'react';
import * as api from '../utils/api';
import { Box, Paper, Typography, TextField, Button, Grid, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Stack, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Add, Remove, Edit, Delete, UploadFile } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';
import { Helmet } from 'react-helmet-async';
import Calculator from '../components/admin/Calculator';

// Add constants for sizes and categories
const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const CATEGORY_OPTIONS = ['Dress', 'Shirt', 'Skirt', 'Trousers', 'Jacket', 'Gown', 'Top', 'Shorts', 'Other'];

function Admin() {
  const [designs, setDesigns] = React.useState([]);
  // Add new state for sizes, categories, and color variants
  const [form, setForm] = React.useState({ title: '', desc: '', details: '', imgs: [], sizes: [], categories: [], colors: [] });
  const [imageFiles, setImageFiles] = React.useState([]);
  const [editingId, setEditingId] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [designToDelete, setDesignToDelete] = React.useState(null);
  const [errors, setErrors] = React.useState({});
  const [visibleCount, setVisibleCount] = React.useState(5);
  const [search, setSearch] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [messageType, setMessageType] = React.useState("");
  const [suggestions, setSuggestions] = React.useState([]);
  // Add state for color input
  const [colorInput, setColorInput] = React.useState("");
  const formRef = React.useRef(null);
  const suggestionTimeout = React.useRef();

  async function fetchDesigns(query = "") {
    setLoading(true);
    try {
      const res = await api.get(`/designs${query ? `?search=${encodeURIComponent(query)}` : ''}`);
      setDesigns(res.data || []);
    } catch (error) {
      console.error('Error fetching designs:', error);
      setDesigns([]);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    fetchDesigns();
  }, []);

  function handleSearchChange(e) {
    const value = e.target.value;
    fetchDesigns(value);
    // Debounced suggestion fetch
    if (suggestionTimeout.current) clearTimeout(suggestionTimeout.current);
    if (value.trim().length > 0) {
      suggestionTimeout.current = setTimeout(async () => {
        try {
          const res = await api.get(`/designs/suggestions?query=${encodeURIComponent(value)}`);
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
    fetchDesigns(s);
  }
      let res;

  function handleChange(e) {
    const { name, value, checked } = e.target;
    // Handle multi-select for sizes, categories, and colors
    if (name === 'sizes') {
      setForm((prev) => ({
        ...prev,
        sizes: Array.isArray(prev.sizes)
          ? (checked
              ? [...prev.sizes, value]
              : prev.sizes.filter((s) => s !== value))
          : (checked ? [value] : []),
      }));
    } else if (name === 'categories') {
      setForm((prev) => ({
        ...prev,
        categories: Array.isArray(prev.categories)
          ? (checked
              ? [...prev.categories, value]
              : prev.categories.filter((c) => c !== value))
          : (checked ? [value] : []),
      }));
    } else if (name === 'colors') {
      setForm((prev) => ({ ...prev, colors: value.split(',').map((c) => c.trim()).filter(Boolean) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }

  function handleFileChange(e) {
    const files = Array.from(e.target.files);
    // Convert all images to webp before setting state
    Promise.all(files.map(async (file) => {
      if (!file.type.startsWith('image/')) return null;
      const img = document.createElement('img');
      const reader = new FileReader();
      return new Promise((resolve) => {
        reader.onload = async (ev) => {
          img.onload = async () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
              if (blob) {
                const webpFile = new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), { type: 'image/webp' });
                resolve(webpFile);
              } else {
                resolve(null);
              }
            }, 'image/webp', 0.90);
          };
          img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
      });
    })).then((webpFiles) => {
      setImageFiles(webpFiles.filter(Boolean));
    });
  }

  function handleRemoveFile(idx) {
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  function validateForm() {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (!form.desc.trim()) newErrors.desc = 'Description is required';
    if (!editingId && imageFiles.length === 0) newErrors.images = 'At least one image is required';
    if (!form.categories || form.categories.length === 0) newErrors.categories = 'At least one category is required';
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
      data.append('title', form.title);
      data.append('desc', form.desc);
      data.append('details', form.details);
      data.append('sizes', JSON.stringify(form.sizes));
      data.append('categories', JSON.stringify(form.categories));
      data.append('colors', JSON.stringify(form.colors));
      if (editingId && form.imgs && form.imgs.length > 0) {
        form.imgs.forEach(img => data.append('imgs', img));
      }
      // Only append webp files
      imageFiles.forEach(file => {
        if (file && file.type === 'image/webp') {
          data.append('images', file);
        }
      });
      let res;
      if (editingId) {
        res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/designs/${editingId}`, {
          method: 'PUT',
          body: data,
          credentials: 'include',
        });
      } else {
        res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/designs`, {
          method: 'POST',
          body: data,
          credentials: 'include',
        });
      }
      if (!res.ok) throw new Error('Failed to submit design');
      setForm({ title: '', desc: '', details: '', imgs: [], sizes: [], categories: [], colors: [] });
      setImageFiles([]);
      setEditingId(null);
      fetchDesigns();
      setMessage(editingId ? 'Design updated successfully!' : 'Design added successfully!');
      setMessageType('success');
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3500);
    } catch {
      setMessage('An error occurred while submitting the design. Please try again.');
      setMessageType('error');
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 4000);
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(design) {
    setForm({
      title: design.title || '',
      desc: design.desc || '',
      details: design.details || '',
      imgs: Array.isArray(design.imgs) ? design.imgs : [],
      sizes: Array.isArray(design.sizes) ? design.sizes : [],
      categories: Array.isArray(design.categories) ? design.categories : [],
      colors: Array.isArray(design.colors) ? design.colors : [],
    });
    setImageFiles([]);
    setEditingId(design._id);
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }

  function openDeleteDialog(design) {
    setDesignToDelete(design);
    setDeleteDialogOpen(true);
  }

  function closeDeleteDialog() {
    setDeleteDialogOpen(false);
    setDesignToDelete(null);
  }

  async function confirmDelete() {
    if (!designToDelete) return;
    setLoading(true);
    try {
      await api.del(`/designs/${designToDelete._id}`);
      fetchDesigns();
    } finally {
      setLoading(false);
      closeDeleteDialog();
    }
  }

  function handleRemoveImg(idx) {
    setForm((prev) => {
      const imgs = prev.imgs.filter((_, i) => i !== idx);
      return { ...prev, imgs };
    });
  }

  // Handle color input change
  function handleColorInputChange(e) {
    setColorInput(e.target.value);
  }

  // Handle color input key down (Enter or comma)
  function handleColorInputKeyDown(e) {
    if ((e.key === 'Enter' || e.key === ',') && colorInput.trim()) {
      e.preventDefault();
      const newColor = colorInput.trim().replace(/,$/, '');
      if (newColor && Array.isArray(form.colors) && !form.colors.includes(newColor)) {
        setForm((prev) => ({ ...prev, colors: [...prev.colors, newColor] }));
      } else if (newColor && !Array.isArray(form.colors)) {
        setForm((prev) => ({ ...prev, colors: [newColor] }));
      }
      setColorInput("");
    }
  }

  // Remove color by index
  function handleRemoveColor(idx) {
    setForm((prev) => ({ ...prev, colors: prev.colors.filter((_, i) => i !== idx) }));
  }

  // ImageWithLoader: shows a spinner while the image is loading
  function ImageWithLoader({ src, alt, style }) {
    const [loaded, setLoaded] = React.useState(false);
    return (
      <div style={{ position: 'relative', width: style?.width || 40, height: style?.height || 40, display: 'inline-block' }}>
        {!loaded && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, background: '#f5f7fa' }}>
            <div className="spinner" style={{ width: 20, height: 20, border: '3px solid #e0e7ef', borderTop: '3px solid #1976d2', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          </div>
        )}
        <img
          src={getImageUrl(src)}
          alt={alt}
          style={{ ...style, opacity: loaded ? 1 : 0, transition: 'opacity 0.2s' }}
          loading="lazy"
          onLoad={() => setLoaded(true)}
        />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Fashion | JC's Closet</title>
        <meta name="description" content="Admin dashboard for JC's Closet. Manage Designs." />
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
        <h1>Fashion</h1>
        <div className="dashboard-summary">
          <div className="summary-card users">
            <h3>Total Designs</h3>
            <p>{designs.length}</p>
          </div>
          <div className="search-bar-container" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, position: 'relative' }}>
            <input
              type="text"
              placeholder="🔍 Search designs..."
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
        {/* Only show add/edit card if not searching, or if editing */}
        {(search.trim() === "" || editingId) && (
          <div className="dashboard-summary">
            <div className="summary-card orders" style={{ flex: 2 }}>
              <h3>{editingId ? 'Edit Design' : 'Add New Design'}</h3>
              <form ref={formRef} onSubmit={handleSubmit} encType="multipart/form-data">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ flex: 1, minWidth: 220 }}>
                    <input name="title" placeholder="Title" value={form.title} onChange={handleChange} className="input" required />
                    {errors.title && <div className="error-text">{errors.title}</div>}
                  </div>
                  <div style={{ flex: 1, minWidth: 220 }}>
                    <input name="desc" placeholder="Short Description" value={form.desc} onChange={handleChange} className="input" required />
                    {errors.desc && <div className="error-text">{errors.desc}</div>}
                  </div>
                  {/* Removed price input */}
                </div>
                {/* Category selection */}
                <div style={{ margin: '10px 0' }}>
                  <label style={{ fontWeight: 500 }}>Categories <span style={{ color: 'red' }}>*</span>:</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
                    {CATEGORY_OPTIONS.map((cat) => (
                      <label key={cat} style={{ fontSize: 15, marginRight: 10 }}>
                        <input
                          type="checkbox"
                          name="categories"
                          value={cat}
                          checked={Array.isArray(form.categories) && form.categories.includes(cat)}
                          onChange={handleChange}
                          style={{ marginRight: 4 }}
                        />
                        {cat}
                      </label>
                    ))}
                  </div>
                  {errors.categories && <div className="error-text">{errors.categories}</div>}
                </div>
                {/* Size selection (optional) */}
                <div style={{ margin: '10px 0' }}>
                  <label style={{ fontWeight: 500 }}>Sizes (optional):</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
                    {SIZE_OPTIONS.map((size) => (
                      <label key={size} style={{ fontSize: 15, marginRight: 10 }}>
                        <input
                          type="checkbox"
                          name="sizes"
                          value={size}
                          checked={Array.isArray(form.sizes) && form.sizes.includes(size)}
                          onChange={handleChange}
                          style={{ marginRight: 4 }}
                        />
                        {size}
                      </label>
                    ))}
                  </div>
                </div>
                {/* Color variants */}
                <div style={{ margin: '10px 0' }}>
                  <label style={{ fontWeight: 500 }}>Color Variants:</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
                    {Array.isArray(form.colors) && form.colors.map((color, idx) => (
                      <span key={idx} className="file-chip">{color} <button type="button" onClick={() => handleRemoveColor(idx)}>&times;</button></span>
                    ))}
                  </div>
                  <input
                    name="colorInput"
                    placeholder="Type a color and press Enter or ,"
                    value={colorInput}
                    onChange={handleColorInputChange}
                    onKeyDown={handleColorInputKeyDown}
                    className="input"
                    style={{ width: '100%', marginTop: 4 }}
                  />
                </div>
                <textarea name="details" placeholder="Details" value={form.details} onChange={handleChange} className="input" rows={3} style={{ width: '100%', marginTop: 8 }} />
                <div style={{ margin: '1rem 0' }}>
                  <label className="upload-label">
                    <input type="file" accept="image/*" multiple onChange={handleFileChange} style={{ display: 'none' }} />
                    <span>Select Images</span>
                  </label>
                  {errors.images && <div className="error-text">{errors.images}</div>}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                    {imageFiles.map((file, idx) => (
                      <span key={idx} className="file-chip">{file.name} <button type="button" onClick={() => handleRemoveFile(idx)}>&times;</button></span>
                    ))}
                    {form.imgs.length > 0 && form.imgs.map((img, idx) => (
                      <span key={idx} className="file-chip"><img src={getImageUrl(img)} alt="" style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 4, marginRight: 4 }} /><button type="button" onClick={() => handleRemoveImg(idx)}>&times;</button></span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <button type="submit" className="primary-btn" disabled={loading}>{editingId ? 'Update' : 'Add'} Design</button>
                  {editingId && <button type="button" className="secondary-btn" onClick={() => { setForm({ title: '', desc: '', details: '', imgs: [], sizes: [], categories: [], colors: [] }); setImageFiles([]); setEditingId(null); }}>Cancel</button>}
                </div>
              </form>
            </div>
          </div>
        )}
        <div className="latest-orders">
          <h3>All Designs</h3>
          {loading ? (
            <div className="loading-spinner"><div className="spinner"></div>Loading designs...</div>
          ) : (
            <>
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Categories</th>
                    <th>Sizes</th>
                    <th>Colors</th>
                    {/* Removed price column */}
                    <th>Images</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {designs.slice(0, visibleCount).map(design => (
                    <tr key={design._id}>
                      <td>{design.title}</td>
                      <td>{design.desc}</td>
                      <td>{Array.isArray(design.categories) && design.categories.length > 0 ? design.categories.join(', ') : '-'}</td>
                      <td>{Array.isArray(design.sizes) && design.sizes.length > 0 ? design.sizes.join(', ') : '-'}</td>
                      <td>{Array.isArray(design.colors) && design.colors.length > 0 ? design.colors.join(', ') : '-'}</td>
                      {/* Removed price cell */}
                      <td>
                        {/* Images */}
                        <div style={{ display: 'flex', gap: 4 }}>
                          {design.imgs && design.imgs.slice(0, 2).map((img, i) => (
                            <ImageWithLoader
                              key={i}
                              src={getImageUrl(img)}
                              alt=""
                              style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4, boxShadow: '0 1px 4px #e3eafc' }}
                            />
                          ))}
                          {design.imgs && design.imgs.length > 2 && (
                            <span style={{ fontSize: 12, color: '#1976d2', alignSelf: 'center', marginLeft: 4 }}>+{design.imgs.length - 2} more</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <button className="primary-btn" onClick={() => handleEdit(design)}>Edit</button>
                        <button className="secondary-btn" onClick={() => openDeleteDialog(design)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {designs.length > visibleCount && (
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  <button className="primary-btn" onClick={() => setVisibleCount(v => v + 5)}>
                    Load More
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
          <DialogTitle>Delete Design</DialogTitle>
          <DialogContent>
            Are you sure you want to delete <b>{designToDelete?.title}</b>?
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
}

export default Admin;


