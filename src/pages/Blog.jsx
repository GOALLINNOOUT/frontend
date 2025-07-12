// Ensure BACKEND_URL does not end with /api and always points to backend root
const BACKEND_URL = (import.meta.env.VITE_API_BASE_URL || 'https://jcserver.onrender.com').replace(/\/?api\/?$/, '');
const getImageUrl = (imgPath) => {
  if (!imgPath) return imgPath;
  if (/^https?:\/\//.test(imgPath)) return imgPath;
  if (imgPath.startsWith('/api/articles/uploads/')) {
    return BACKEND_URL + imgPath.replace('/api', '');
  }
  if (imgPath.startsWith('/uploads/')) {
    return BACKEND_URL + imgPath;
  }
  return imgPath;
};
import { Box, Paper, Typography, Link, useTheme, CircularProgress, Card, CardMedia, CardContent, CardActionArea, Stack, Chip, TextField, InputAdornment, IconButton, ToggleButtonGroup, ToggleButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';

function Blog() {
  const theme = useTheme();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [searchFocus, setSearchFocus] = useState(false);
  const [searchField, setSearchField] = useState('title');
  const [suggestions, setSuggestions] = useState([]);
  const suggestionTimeout = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const PAGE_SIZE = 6;

  // Helper: filter latest posts (created in last 3 days)
  const now = new Date();
  const filteredArticles = articles.filter(a => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    if (searchField === 'title') {
      return a.title && a.title.toLowerCase().includes(q);
    } else if (searchField === 'author') {
      return a.author && a.author.toLowerCase().includes(q);
    } else {
      return Array.isArray(a.tags) && a.tags.some(tag => tag.toLowerCase().includes(q));
    }
  });
  const latestPosts = filteredArticles.filter(a => {
    if (!a.createdAt) return false;
    const created = new Date(a.createdAt);
    return (now - created) / (1000 * 60 * 60 * 24) <= 3;
  });
  const allOtherPosts = filteredArticles.filter(a => !latestPosts.includes(a));

  // Fetch paginated articles, now supports backend searchField/searchQuery
  const fetchArticles = async (opts = { reset: false }) => {
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
        skip,
        limit: PAGE_SIZE,
      });
      if (search.trim()) {
        params.append('searchField', searchField);
        params.append('searchQuery', search.trim());
      }
      const api = await import('../utils/api');
      const res = await api.get(`/articles?${params.toString()}`);
      if (res.ok) {
        setArticles(articles => opts.reset ? res.data : [...articles, ...res.data]);
        setHasMore(res.data.length === PAGE_SIZE);
        setTotal(total => opts.reset ? res.data.length : total + res.data.length);
      } else {
        throw new Error('Failed to load articles');
      }
    } catch (err) {
      setError('Could not load blog posts.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchArticles({ reset: true });
    // eslint-disable-next-line
  }, []);

  // Reset and refetch on search, searchField change
  useEffect(() => {
    fetchArticles({ reset: true });
    // eslint-disable-next-line
  }, [search, searchField]);

  // Suggestions logic
  function handleSearchChange(e) {
    const value = e.target.value;
    setSearch(value);
    // Debounced suggestion fetch
    if (suggestionTimeout.current) clearTimeout(suggestionTimeout.current);
    if (value.trim().length > 0) {
      suggestionTimeout.current = setTimeout(async () => {
        try {
          const res = await fetch(`/api/articles/suggestions?query=${encodeURIComponent(value)}&field=${searchField}`);
          const data = await res.json();
          setSuggestions(data || []);
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
    fetchArticles({ reset: true });
  }

  return (
    <>
      <Helmet>
        <title>Blog | JC's Closet</title>
        <meta name="description" content="Read the latest news, tips, and trends from JC's Closet blog. Stay inspired and informed." />
      </Helmet>
      <Box
        sx={{
          width: '100vw',
          minHeight: '100vh',
          m: 0,
          p: { xs: '1.2rem 0', sm: '2rem 0' },
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(120deg, #181C22 0%, #232A3B 100%)'
            : 'linear-gradient(120deg, #f8fafc 0%, #e0e7ef 100%)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          minWidth: '100vw',
        }}
      >
        <Paper
          elevation={4}
          sx={{
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(120deg, #232A3B 60%, #181C22 100%)'
              : 'linear-gradient(120deg, #fff 60%, #f8fafc 100%)',
            borderRadius: 4,
            width: '100%',
            m: 0,
            p: { xs: '1.5rem 0.5rem', sm: '3rem 2.5rem' },
            color: theme.palette.text.primary,
            fontFamily: theme.typography.fontFamily,
            boxShadow: theme.palette.grey._boxShadowBlog16,
            border: `1.5px solid ${theme.palette.mode === 'dark' ? theme.palette.grey.e0e7ef : theme.palette.grey.e0e7ef}`,
            transition: 'background 0.3s, box-shadow 0.3s',
          }}
        >
          <Typography variant="h2" sx={{ fontSize: { xs: '2.2rem', sm: '2.9rem' }, fontWeight: 800, mb: 1, letterSpacing: -1, color: 'primary.main', textShadow: theme.palette.mode === 'dark' ? '0 2px 8px #181C22' : '0 2px 8px #e0e7ef' }}>
            JC's Closet Blog
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: theme.palette.text.secondary, fontSize: { xs: '1.08rem', sm: '1.18rem' }, fontWeight: 500, lineHeight: 1.7 }}>
            Stay inspired with our latest news, style tips, and fragrance trends. Our blog covers everything from seasonal must-haves to expert advice and behind-the-scenes stories.
          </Typography>
          {/* Search Feature */}
          <Box sx={{ width: '100%', mb: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <select
              value={searchField}
              onChange={e => setSearchField(e.target.value)}
              style={{
                padding: '10px 16px',
                borderRadius: 10,
                border: `1.5px solid ${theme.palette.grey.e0e7ef}`,
                fontSize: 16,
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(120deg, #181C22 0%, #232A3B 100%)'
                  : 'linear-gradient(120deg, #f8fafc 0%, #e0e7ef 100%)',
                color: theme.palette.primary.main,
                fontWeight: 700,
                outline: 'none',
                boxShadow: theme.palette.mode === 'dark' ? '0 2px 8px #181C22' : '0 2px 8px #e0e7ef',
                transition: 'background 0.2s',
              }}
            >
              <option value="title">Title</option>
              <option value="author">Author</option>
              <option value="tags">Tags</option>
            </select>
            <Box sx={{ position: 'relative', width: { xs: '100%', sm: 380 } }}>
              <TextField
                value={search}
                onChange={handleSearchChange}
                onFocus={() => setSearchFocus(true)}
                onBlur={() => setSearchFocus(false)}
                placeholder={`Search by ${searchField.charAt(0).toUpperCase() + searchField.slice(1)}...`}
                variant="outlined"
                size="medium"
                sx={{
                  width: '100%',
                  background: searchFocus ? theme.palette.grey._f5faff : theme.palette.grey._f8fafc,
                  borderRadius: 3,
                  boxShadow: searchFocus ? theme.palette.grey._boxShadowBlog12 : 'none',
                  border: `1.5px solid ${searchFocus ? theme.palette.primary.main : theme.palette.grey.e0e7ef}`,
                  transition: 'box-shadow 0.18s, border 0.18s',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                  },
                  fontWeight: 600,
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconButton tabIndex={-1} edge="start" disabled>
                        <SearchIcon color={searchFocus ? 'primary' : 'action'} />
                      </IconButton>
                    </InputAdornment>
                  ),
                  'aria-label': `search blog posts by ${searchField}`,
                }}
              />
              {/* Suggestions dropdown */}
              {suggestions.length > 0 && searchFocus && (
                <Box sx={{
                  position: 'absolute',
                  top: 48,
                  left: 0,
                  right: 0,
                  background: theme.palette.grey._fff,
                  border: `1.5px solid ${theme.palette.grey.e0e7ef}`,
                  borderRadius: 3,
                  boxShadow: `0 4px 24px ${theme.palette.grey.e0e7ef}`,
                  zIndex: 1000,
                  maxHeight: 260,
                  overflowY: 'auto',
                  mt: 0.5,
                  transition: 'background 0.2s, box-shadow 0.2s',
                }}>
                  {suggestions.map((s, i) => (
                    <Box
                      key={i}
                      sx={{ p: '12px 18px', cursor: 'pointer', fontSize: 16, color: theme.palette.grey._222, borderBottom: i !== suggestions.length - 1 ? `1px solid ${theme.palette.grey.f1f5f9}` : 'none', background: theme.palette.grey._fff, fontWeight: 600, '&:hover': { background: theme.palette.mode === 'dark' ? theme.palette.grey._f8fafc : theme.palette.grey._f5faff } }}
                      onMouseDown={() => handleSuggestionClick(s)}
                    >
                      {s}
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
          {/* Latest Posts Section */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h3" sx={{ fontSize: { xs: '1.3rem', sm: '1.6rem' }, fontWeight: 700, color: 'primary.main', mb: 2, letterSpacing: -0.5, textShadow: theme.palette.mode === 'dark' ? '0 1px 4px #181C22' : '0 1px 4px #e0e7ef' }}>
              Latest Posts
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>
            ) : error ? (
              <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
            ) : latestPosts.length === 0 ? (
              <Typography sx={{ color: 'text.secondary', mb: 2 }}>No recent blog posts found.</Typography>
            ) : (
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} flexWrap="wrap" useFlexGap sx={{ width: '100%' }}>
                {latestPosts.map(article => (
                  <Card
                    key={article._id}
                    sx={{
                      flex: '1 1 320px',
                      minWidth: 0,
                      maxWidth: 370,
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: theme.palette.grey._boxShadowBlog16,
                      borderRadius: 4,
                      border: `1.5px solid ${theme.palette.grey.e0e7ef}`,
                      transition: 'transform 0.18s, box-shadow 0.18s, border 0.18s',
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.03)',
                        boxShadow: theme.palette.grey._boxShadowBlog8,
                        border: `1.5px solid ${theme.palette.primary.main}`,
                      },
                      background: theme.palette.mode === 'dark'
                        ? 'linear-gradient(120deg, #232A3B 60%, #181C22 100%)'
                        : 'linear-gradient(120deg, #fff 60%, #f8fafc 100%)',
                    }}
                  >
                    {article.image && (
                      <CardMedia
                        component="img"
                        image={getImageUrl(article.image)}
                        alt={article.title}
                        loading="lazy"
                        sx={{ width: '100%', height: 180, objectFit: 'cover', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
                      />
                    )}
                    <CardActionArea
                      component={Link}
                      href={"/blog/" + article._id}
                      sx={{ flex: 1, alignItems: 'flex-start', textAlign: 'left', p: 0 }}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="h4" sx={{ fontSize: '1.22rem', fontWeight: 700, mb: 0.5, color: 'text.primary', letterSpacing: -0.5 }}>
                          {article.title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                          <Typography variant="body2" sx={{ color: 'text.secondary', mr: 1, fontWeight: 500 }}>
                            {article.author || 'JC'} &bull; {article.createdAt ? new Date(article.createdAt).toLocaleDateString() : ''}
                          </Typography>
                          {Array.isArray(article.tags) && article.tags.length > 0 && (
                            <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                              {article.tags.map((tag, idx) => (
                                <Chip key={idx} label={tag} size="small" color="primary" variant="outlined" sx={{ fontWeight: 600, letterSpacing: 0.2 }} />
                              ))}
                            </Stack>
                          )}
                        </Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '1.05rem', minHeight: 48, fontWeight: 500 }}>
                          {article.content.length > 120 ? article.content.slice(0, 120) + '...' : article.content}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                ))}
              </Stack>
            )}
          </Box>
          {/* All Posts Section */}
          <Box sx={{ mt: 7 }}>
            <Typography variant="h3" sx={{ fontSize: { xs: '1.15rem', sm: '1.38rem' }, fontWeight: 700, color: 'primary.main', mb: 2, letterSpacing: -0.5, textShadow: theme.palette.mode === 'dark' ? '0 1px 4px #181C22' : '0 1px 4px #e0e7ef' }}>
              All Posts
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>
            ) : error ? (
              <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
            ) : articles.length === 0 ? (
              <Typography sx={{ color: 'text.secondary', mb: 2 }}>No blog posts found.</Typography>
            ) : (
              <>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} flexWrap="wrap" useFlexGap sx={{ width: '100%' }}>
                  {allOtherPosts.map(article => (
                    <Card
                      key={article._id}
                      sx={{
                        flex: '1 1 320px',
                        minWidth: 0,
                        maxWidth: 370,
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: theme.palette.grey._boxShadowBlog16,
                        borderRadius: 4,
                        border: `1.5px solid ${theme.palette.grey.e0e7ef}`,
                        transition: 'transform 0.18s, box-shadow 0.18s, border 0.18s',
                        '&:hover': {
                          transform: 'translateY(-8px) scale(1.03)',
                          boxShadow: theme.palette.grey._boxShadowBlog8,
                          border: `1.5px solid ${theme.palette.primary.main}`,
                        },
                        background: theme.palette.mode === 'dark'
                          ? 'linear-gradient(120deg, #232A3B 60%, #181C22 100%)'
                          : 'linear-gradient(120deg, #fff 60%, #f8fafc 100%)',
                    }}
                    >
                      {article.image && (
                        <CardMedia
                          component="img"
                          image={getImageUrl(article.image)}
                          alt={article.title}
                          loading="lazy"
                          sx={{ width: '100%', height: 180, objectFit: 'cover', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
                        />
                      )}
                      <CardActionArea
                        component={Link}
                        href={"/blog/" + article._id}
                        sx={{ flex: 1, alignItems: 'flex-start', textAlign: 'left', p: 0 }}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <Typography variant="h4" sx={{ fontSize: '1.22rem', fontWeight: 700, mb: 0.5, color: 'text.primary', letterSpacing: -0.5 }}>
                            {article.title}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                            <Typography variant="body2" sx={{ color: 'text.secondary', mr: 1, fontWeight: 500 }}>
                              {article.author || 'JC'} &bull; {article.createdAt ? new Date(article.createdAt).toLocaleDateString() : ''}
                            </Typography>
                            {Array.isArray(article.tags) && article.tags.length > 0 && (
                              <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                                {article.tags.map((tag, idx) => (
                                  <Chip key={idx} label={tag} size="small" color="primary" variant="outlined" sx={{ fontWeight: 600, letterSpacing: 0.2 }} />
                                ))}
                              </Stack>
                            )}
                          </Box>
                          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '1.05rem', minHeight: 48, fontWeight: 500 }}>
                            {article.content.length > 120 ? article.content.slice(0, 120) + '...' : article.content}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  ))}
                </Stack>
                {hasMore && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <button
                      onClick={() => fetchArticles({ reset: false })}
                      disabled={loadingMore}
                      style={{
                        padding: '12px 36px',
                        fontSize: 17,
                        fontWeight: 700,
                        borderRadius: 10,
                        border: 'none',
                        background: loadingMore ? theme.palette.grey.e0e7ef : theme.palette.grey._1976d2,
                        color: loadingMore ? theme.palette.grey._888 : theme.palette.grey._fff,
                        cursor: loadingMore ? 'not-allowed' : 'pointer',
                        boxShadow: theme.palette.grey._boxShadowBlog16,
                        transition: 'background 0.18s',
                        letterSpacing: 0.5,
                      }}
                    >
                      {loadingMore ? 'Loading...' : 'Load More'}
                    </button>
                  </Box>
                )}
              </>
            )}
          </Box>
          <Typography variant="body1" sx={{ mt: 5, fontSize: { xs: '1.05rem', sm: '1.18rem' }, fontWeight: 500, color: 'text.secondary', textAlign: 'center' }}>
            Have a topic you'd like us to cover?{' '}
            <Link href="/contact" underline="always" color="primary" sx={{ fontWeight: 700 }}>
              Contact us
            </Link>{' '}
            with your suggestions!
          </Typography>
        </Paper>
      </Box>
    </>
  );
}

export default Blog;
