// Ensure BACKEND_URL does not end with /api and always points to backend root
const BACKEND_URL = (import.meta.env.VITE_API_BASE_URL || 'https://jcserver.onrender.com').replace(/\/?api\/?$/, '');
const getImageUrl = (imgPath) => {
  if (!imgPath) return imgPath;
  if (/^https?:\/\//.test(imgPath)) return imgPath;
  // Always use /api/articles/uploads/ for all article images
  if (imgPath.startsWith('/api/articles/uploads/')) {
    return BACKEND_URL + imgPath;
  }
  if (imgPath.startsWith('/articles/uploads/')) {
    return BACKEND_URL + '/api' + imgPath;
  }
  if (imgPath.startsWith('/uploads/')) {
    return BACKEND_URL + '/api/articles' + imgPath;
  }
  // If it's just a filename, treat as /api/articles/uploads/filename
  if (!imgPath.includes('/')) {
    return BACKEND_URL + '/api/articles/uploads/' + imgPath;
  }
  return imgPath;
};
import React, { useEffect, useRef, useState } from 'react';
import * as api from '../utils/api';
import { format } from 'date-fns';
import './AdminDashboard.css';
import { Helmet } from 'react-helmet-async';
import { useTheme } from '@mui/material/styles';

const initialForm = { title: '', content: '', image: '', author: '', tags: '' };

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
              const webpFile = new File(
                [blob],
                file.name.replace(/\.[^.]+$/, '.webp'),
                { type: 'image/webp' }
              );
              resolve(webpFile);
            } else {
              reject(new Error('WebP conversion failed'));
            }
          },
          'image/webp',
          0.9
        );
      };
      img.onerror = reject;
      img.src = event.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Simple Dialog component
function Dialog({ open, title, message, onClose, onConfirm, confirmText = 'OK', cancelText = 'Cancel', type = 'info' }) {
  const theme = useTheme();
  if (!open) return null;
  const dialogColors = {
    error: theme.palette.custom.dialogError,
    success: theme.palette.custom.dialogSuccess,
    info: theme.palette.custom.dialogTitleDefault,
    warning: theme.palette.warning.main || theme.palette.custom.dialogTitleDefault,
  };
  return (
    <div className="dialog-backdrop" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: theme.palette.custom.dialogBackdrop, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="dialog-modal" style={{ background: theme.palette.custom.dialogBg, borderRadius: 10, padding: 28, minWidth: 320, maxWidth: 400, boxShadow: '0 4px 24px 0 ' + theme.palette.custom.boxShadow }}>
        <h3 style={{ marginTop: 0, color: dialogColors[type] }}>{title}</h3>
        <div style={{ margin: '18px 0', color: theme.palette.custom.dialogMessage, fontSize: 16 }}>{message}</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          {onConfirm && (
            <button className="primary-btn" style={{ minWidth: 80 }} onClick={onConfirm}>{confirmText}</button>
          )}
          <button className="secondary-btn" style={{ minWidth: 80 }} onClick={onClose}>{onConfirm ? cancelText : 'Close'}</button>
        </div>
      </div>
    </div>
  );
}

const AdminBlog = () => {
  const theme = useTheme();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(initialForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [expandedRows, setExpandedRows] = useState({});
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [dialog, setDialog] = useState({ open: false, title: '', message: '', type: 'info', onConfirm: null });
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searchField, setSearchField] = useState('title');
  const suggestionTimeout = useRef(null);
  const PAGE_SIZE = 6;
  const formRef = useRef(null);

  // Fetch paginated articles, now supports generic search
  const fetchArticles = async (query = '', opts = { reset: false }) => {
    if (opts.reset) {
      setArticles([]);
      setHasMore(true);
    }
    setLoading(opts.reset);
    setLoadingMore(!opts.reset);
    setError('');
    try {
      const skip = opts.reset ? 0 : articles.length;
      const params = new URLSearchParams({
        skip: skip.toString(),
        limit: PAGE_SIZE.toString(),
      });
      if (query.trim()) {
        params.append('searchField', searchField);
        params.append('searchQuery', query.trim());
      }
      const { data, ok } = await api.get(`/articles?${params.toString()}`);
      if (!ok) throw new Error();
      const articlesData = data.articles ? data : { articles: data, total: data.length };
      setArticles(prev => opts.reset ? articlesData.articles : [...prev, ...articlesData.articles]);
      setHasMore(articles.length + articlesData.articles.length < articlesData.total);
    } catch {
      setError('Failed to load articles.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Fetch on mount and when search changes
  useEffect(() => {
    fetchArticles(search, { reset: true });
    // eslint-disable-next-line
  }, [search, searchField]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const webpFile = await convertToWebP(file);
      setImageFile(webpFile);
      setImagePreview(URL.createObjectURL(webpFile));
    } catch {
      alert('Failed to convert image to WebP.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const handleEdit = (article) => {
    setEditingId(article._id);
    setForm({
      title: article.title,
      content: article.content,
      image: article.image || '',
      author: article.author || '',
      tags: Array.isArray(article.tags) ? article.tags.join(', ') : article.tags || '',
    });
    setImageFile(null);
    // Use correct preview URL for local images
    let previewUrl = '';
    if (article.image) {
      previewUrl = article.image.startsWith('http')
        ? article.image
        : getImageUrl(article.image);
    }
    setImagePreview(previewUrl);
    // Scroll to the form after state updates
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(initialForm);
    setImageFile(null);
    setImagePreview('');
  };

  const closeDialog = () => setDialog((d) => ({ ...d, open: false }));

  const handleDelete = async (id) => {
    setDialog({
      open: true,
      title: 'Delete Article',
      message: 'Are you sure you want to delete this article?',
      type: 'warning',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        closeDialog();
        try {
          const { ok } = await api.del(`/articles/${id}`);
          if (!ok) throw new Error();
          setArticles((prev) => prev.filter((a) => a._id !== id));
          setDialog({
            open: true,
            title: 'Deleted',
            message: 'Article deleted successfully.',
            type: 'success',
            onConfirm: null
          });
        } catch {
          setDialog({
            open: true,
            title: 'Error',
            message: 'Failed to delete.',
            type: 'error',
            onConfirm: null
          });
        }
      }
    });
  };

  const validateForm = () => {
    const errors = {};
    if (!form.title.trim()) errors.title = 'Title is required';
    if (!form.author.trim()) errors.author = 'Author is required';
    if (!form.content.trim()) errors.content = 'Content is required';
    // Optionally require image on create
    if (!editingId && !imageFile && !form.image) errors.image = 'Image is required';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('title', form.title);
      data.append('content', form.content);
      data.append('author', form.author);
      data.append('tags', form.tags);
      if (imageFile) {
        data.append('image', imageFile);
      } else if (form.image) {
        data.append('image', form.image);
      }
      // Attach JWT token for admin-protected endpoints
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      let res;
      if (editingId) {
        res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/articles/${editingId}`, {
          method: 'PUT',
          body: data,
          headers,
        });
      } else {
        res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/articles`, {
          method: 'POST',
          body: data,
          headers,
        });
      }
      if (!res.ok) throw new Error('Failed to save article.');
      const article = await res.json();
      if (editingId) {
        setArticles((prev) => prev.map((a) => (a._id === editingId ? article : a)));
      } else {
        setArticles((prev) => [article, ...prev]);
      }
      handleCancel();
      setDialog({
        open: true,
        title: editingId ? 'Updated' : 'Created',
        message: `Article ${editingId ? 'updated' : 'created'} successfully!`,
        type: 'success',
        onConfirm: null
      });
    } catch {
      setDialog({
        open: true,
        title: 'Error',
        message: 'Failed to save article.',
        type: 'error',
        onConfirm: null
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleContent = (id) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  function handleSearchChange(e) {
    const value = e.target.value;
    setSearch(value);
    fetchArticles(value, { reset: true });
    // Debounced suggestion fetch
    if (suggestionTimeout.current) clearTimeout(suggestionTimeout.current);
    if (value.trim().length > 0) {
      suggestionTimeout.current = setTimeout(async () => {
        try {
          const { data, ok } = await api.get(`/articles/suggestions?query=${encodeURIComponent(value)}&field=${searchField}`);
          setSuggestions(ok ? data : []);
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
    fetchArticles(s, { reset: true });
  }

  return (
    <>
      <Helmet>
        <title>Admin Blog | JC's Closet</title>
        <meta name="description" content="Admin panel for managing blog posts at JC's Closet." />
      </Helmet>
      <div className="admin-dashboard">
        <h1>Blog</h1>
        <div className="dashboard-summary">
          <div className="summary-card orders" style={{ flex: 2 }} ref={formRef}>
            <h3>{editingId ? 'Edit Article' : 'Add New Article'}</h3>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <input
                name="title"
                className="input"
                placeholder="Title"
                value={form.title}
                onChange={handleChange}
                required
                style={formErrors.title ? { borderColor: theme.palette.custom.dialogError } : {}}
              />
              {formErrors.title && <div className="error-text" style={{ color: theme.palette.custom.dialogError }}>{formErrors.title}</div>}
              <input
                name="author"
                className="input"
                placeholder="Author"
                value={form.author}
                onChange={handleChange}
                required
                style={formErrors.author ? { borderColor: theme.palette.custom.dialogError } : {}}
              />
              {formErrors.author && <div className="error-text" style={{ color: theme.palette.custom.dialogError }}>{formErrors.author}</div>}
              <input
                name="tags"
                className="input"
                placeholder="Tags (comma separated)"
                value={form.tags}
                onChange={handleChange}
              />
              <textarea
                name="content"
                className="input"
                placeholder="Content"
                value={form.content}
                onChange={handleChange}
                required
                rows={5}
                style={formErrors.content ? { borderColor: theme.palette.custom.dialogError } : {}}
              />
              {formErrors.content && <div className="error-text" style={{ color: theme.palette.custom.dialogError }}>{formErrors.content}</div>}
              <label className="upload-label">
                Upload Image
                <input type="file" accept="image/*" hidden onChange={handleImageChange} />
              </label>
              {formErrors.image && <div className="error-text" style={{ color: theme.palette.custom.dialogError }}>{formErrors.image}</div>}
              {imagePreview && (
                <span className="file-chip">
                  <img src={getImageUrl(imagePreview)} alt="preview" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4, marginRight: 6 }} loading="lazy" />
                  <button type="button" onClick={handleRemoveImage}>&times;</button>
                </span>
              )}
              <div style={{ display: 'flex', gap: 12, margin: '16px 0' }}>
                <button type="submit" className="primary-btn" disabled={submitting || loading}>
                  {(submitting || loading) ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <span className="spinner" style={{ width: 18, height: 18, borderWidth: 3 }}></span> Saving...
                    </span>
                  ) : editingId ? 'Update' : 'Create'}
                </button>
                {editingId && (
                  <button type="button" className="secondary-btn" onClick={handleCancel} disabled={submitting || loading}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
        <div className="latest-orders">
          <h3>Articles</h3>
          <div className="search-bar-container" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, position: 'relative', marginBottom: 18 }}>
            <select
              value={searchField}
              onChange={e => setSearchField(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${theme.palette.custom.inputBorder}` , fontSize: 15 }}
            >
              <option value="title">Title</option>
              <option value="author">Author</option>
              <option value="tags">Tags</option>
            </select>
            <input
              type="text"
              placeholder={`🔍 Search by ${searchField.charAt(0).toUpperCase() + searchField.slice(1)}`}
              value={search}
              onChange={handleSearchChange}
              className="search-bar-input"
              style={{
                padding: '10px 16px',
                borderRadius: 24,
                border: `1.5px solid ${theme.palette.custom.inputBorder}`,
                minWidth: 120,
                maxWidth: 220,
                fontSize: 16,
                background: theme.palette.custom.inputBg,
                boxShadow: `0 1px 4px ${theme.palette.custom.boxShadow}`,
                outline: 'none',
                transition: 'border 0.2s, box-shadow 0.2s',
                width: '100%',
              }}
              onFocus={e => e.target.style.border = `1.5px solid ${theme.palette.custom.primaryBorder}`}
              onBlur={e => e.target.style.border = `1.5px solid ${theme.palette.custom.inputBorder}`}
            />
            {/* Suggestions dropdown */}
            {suggestions.length > 0 && (
              <div style={{
                position: 'absolute',
                top: 44,
                right: 0,
                left: 0,
                background: theme.palette.custom.dialogBg,
                border: `1px solid ${theme.palette.custom.boxShadow}`,
                borderRadius: 8,
                boxShadow: `0 2px 12px ${theme.palette.custom.boxShadow}`,
                zIndex: 1000,
                maxHeight: 220,
                overflowY: 'auto',
                marginTop: 2,
              }}>
                {suggestions.map((s, i) => (
                  <div
                    key={i}
                    style={{ padding: '10px 16px', cursor: 'pointer', fontSize: 15, color: theme.palette.custom.dialogTitleDefault, borderBottom: i !== suggestions.length - 1 ? `1px solid ${theme.palette.custom.suggestionBorder}` : 'none', background: theme.palette.custom.dialogBg }}
                    onMouseDown={() => handleSuggestionClick(s)}
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="orders-list" style={{ borderRadius: 8, overflow: 'hidden', background: theme.palette.custom.dialogBg, boxShadow: `0 2px 12px ${theme.palette.custom.boxShadow}` }}>
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}>
                <span className="spinner" style={{ width: 24, height: 24, borderWidth: 3 }}></span>
              </div>
            )}
            {error && (
              <div style={{ color: theme.palette.custom.dialogError, padding: 16, textAlign: 'center' }}>
                {error}
              </div>
            )}
            {!loading && !error && articles.length === 0 && (
              <div style={{ color: theme.palette.custom.noArticlesText, padding: 16, textAlign: 'center' }}>
                No articles found.
              </div>
            )}
            {articles.map((article, index) => (
              <div key={article._id} style={{ borderBottom: index !== articles.length - 1 ? `1px solid ${theme.palette.custom.boxShadow}` : 'none' }}>
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h4 style={{ margin: 0, fontSize: 18, color: theme.palette.custom.articleTitle }}>{article.title}</h4>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="primary-btn" style={{ padding: '8px 12px', fontSize: 14 }} onClick={() => handleEdit(article)}>Edit</button>
                      <button className="secondary-btn" style={{ padding: '8px 12px', fontSize: 14 }} onClick={() => handleDelete(article._id)}>Delete</button>
                    </div>
                  </div>
                  <div style={{ color: theme.palette.custom.noArticlesText, fontSize: 14 }}>
                    <span style={{ marginRight: 12 }}><strong>Author:</strong> {article.author}</span>
                    <span><strong>Tags:</strong> {Array.isArray(article.tags) ? article.tags.join(', ') : article.tags}</span>
                  </div>
                  <div style={{ color: theme.palette.custom.dialogMessage, fontSize: 15, lineHeight: 1.6 }}>
                    {article.content.length > 100 ? `${article.content.substring(0, 100)}...` : article.content}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ color: theme.palette.custom.dateText, fontSize: 13 }}>
                      {format(new Date(article.createdAt), 'MMM dd, yyyy')}
                    </div>
                    <button
                      onClick={() => handleToggleContent(article._id)}
                      style={{
                        padding: '8px 12px',
                        fontSize: 14,
                        borderRadius: 8,
                        border: `1px solid ${theme.palette.custom.primaryBorder}`,
                        background: expandedRows[article._id] ? theme.palette.custom.expandedBtnBg : theme.palette.custom.dialogBg,
                        color: theme.palette.custom.primaryBorder,
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                      }}
                    >
                      {expandedRows[article._id] ? 'Collapse' : 'View'} Content
                    </button>
                  </div>
                  {expandedRows[article._id] && (
                    <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: theme.palette.custom.expandedContentBg, border: `1px solid ${theme.palette.custom.boxShadow}` }}>
                      <h5 style={{ margin: 0, fontSize: 16, color: theme.palette.custom.articleTitle }}>Full Content</h5>
                      <div style={{ color: theme.palette.custom.dialogMessage, fontSize: 15, lineHeight: 1.6, marginTop: 8 }}>
                        {article.content}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loadingMore && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}>
                <span className="spinner" style={{ width: 24, height: 24, borderWidth: 3 }}></span>
              </div>
            )}
            {!loadingMore && hasMore && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}>
                <button
                  onClick={() => fetchArticles(search, { reset: false })}
                  className="primary-btn"
                  style={{ padding: '10px 16px', fontSize: 14 }}
                >
                  Load More
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Dialog
        open={dialog.open}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        onClose={closeDialog}
        onConfirm={dialog.onConfirm}
        confirmText={dialog.confirmText}
        cancelText={dialog.cancelText}
      />
    </>
  );
};

export default AdminBlog;
