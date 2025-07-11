import { useParams, Link as RouterLink } from 'react-router-dom';
import { Box, Paper, Typography, Link, CircularProgress, Button, Chip, Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import { Share as ShareIcon, ContentCopy as ContentCopyIcon, Check as CheckIcon } from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';
import { useTheme } from '@mui/material/styles';

function BlogPost() {
  const { id } = useParams();
  const theme = useTheme();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shared, setShared] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchArticle() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/articles/${id}`);
        if (!res.ok) throw new Error('Failed to load article');
        const data = await res.json();
        setArticle(data);
      } catch {
        setError('Could not load this blog post.');
      } finally {
        setLoading(false);
      }
    }
    fetchArticle();
  }, [id]);

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.content.slice(0, 120) + (article.content.length > 120 ? '...' : ''),
          url: shareUrl,
        });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {}
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  if (error) return <Typography color="error" sx={{ mt: 8, textAlign: 'center' }}>{error}</Typography>;
  if (!article) return null;

  // Compute Open Graph image URL
  const ogImage = article.image
    ? (article.image.startsWith('http') ? article.image : `${window.location.origin}/api/articles/uploads/${article.image}`)
    : undefined;

  return (
    <>
      <Helmet>
        <title>{article.title} | JC's Closet Blog</title>
        <meta name="description" content="Read this blog post from JC's Closet. Discover fashion, fragrance, and lifestyle tips." />
        {ogImage && <meta property="og:image" content={ogImage} />}
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.content.slice(0, 120) + (article.content.length > 120 ? '...' : '')} />
        {ogImage && <meta name="twitter:card" content="summary_large_image" />}
        {ogImage && <meta name="twitter:image" content={ogImage} />}
      </Helmet>
      <Box sx={{ width: '100%', minHeight: '100vh', display: 'flex', justifyContent: 'center', background: `linear-gradient(90deg, ${theme.palette.grey.f8fafc} 0%, ${theme.palette.grey.e0e7ef} 100%)`, p: { xs: 1, sm: 3 } }}>
        <Paper elevation={4} sx={{  width: '100%', p: { xs: 2, sm: 5 }, mt: 5, borderRadius: 4, boxShadow: theme.palette.grey._boxShadowBlog8 }}>
          <Button component={RouterLink} to="/blog" variant="outlined" size="small" sx={{ mb: 3, fontWeight: 500, borderRadius: 2, textTransform: 'none' }}>&larr; Back to Blog</Button>
          {article.image && (
            <Box sx={{ mb: 3, borderRadius: 3, overflow: 'hidden', boxShadow: theme.palette.grey._boxShadowBlog16 }}>
              <img
                src={article.image.startsWith('http') ? article.image : `/api/articles/uploads/${article.image}`}
                alt={article.title}
                style={{ width: '100%', maxHeight: 380, objectFit: 'cover', display: 'block' }}
              />
            </Box>
          )}
          <Typography variant="h2" sx={{ fontSize: { xs: '2rem', sm: '2.7rem' }, fontWeight: 700, mb: 1, letterSpacing: -1, lineHeight: 1.15 }}>
            {article.title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', mr: 1, fontSize: '1.05rem' }}>
              {article.author || 'JC'} &bull; {article.createdAt ? new Date(article.createdAt).toLocaleDateString() : ''}
            </Typography>
            {Array.isArray(article.tags) && article.tags.length > 0 && (
              <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                {article.tags.map((tag, idx) => (
                  <Chip key={idx} label={tag} size="small" color="primary" variant="outlined" sx={{ fontWeight: 500 }} />
                ))}
              </Stack>
            )}
            <Button
              onClick={handleShare}
              startIcon={shared ? <CheckIcon color="success" /> : copied ? <CheckIcon color="success" /> : <ShareIcon />}
              size="small"
              variant="text"
              sx={{ ml: 1, minWidth: 0, px: 1, fontWeight: 500, textTransform: 'none' }}
              aria-label="Share this post"
            >
              {shared ? 'Shared!' : copied ? 'Link Copied!' : 'Share'}
            </Button>
          </Box>
          <Typography variant="body1" sx={{
            whiteSpace: 'pre-wrap',
            fontSize: { xs: '1.08rem', sm: '1.18rem' },
            lineHeight: 1.85,
            color: 'text.primary',
            letterSpacing: 0.01,
            mt: 2,
            mb: 1,
            wordBreak: 'break-word',
          }}>
            {article.content}
          </Typography>
        </Paper>
      </Box>
    </>
  );
}

export default BlogPost;
