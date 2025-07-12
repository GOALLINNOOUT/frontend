import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, TextField, IconButton, Paper, useMediaQuery, CircularProgress, Fade } from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@mui/material/styles';
import { Helmet } from 'react-helmet-async';
import { get } from '../utils/api';

// Replace with your actual Cohere API key
const COHERE_API_KEY = 'NS32G7UwwRpuz5tqIHFQI0PaKIn4PjREwelxKAm4';
const COHERE_API_URL = 'https://api.cohere.ai/v1/generate';

function StyleGuide() {
  const [style, setStyle] = useState('');
  const [occasion, setOccasion] = useState('');
  const [perfumes, setPerfumes] = useState([]);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: '⚠️ Notice: This Style & Perfume AI is currently in production/testing phase. Please be aware that recommendations may not be fully accurate at this time. For actual purchases, please contact our customer service or visit our store directly.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const chatEndRef = useRef(null);
  const isFirstRender = useRef(true);

  // Fetch perfumes on component mount
  useEffect(() => {
    const fetchPerfumes = async () => {
      try {
        const res = await get('/ai-recommendations/perfumes');
        if (res.ok) {
          setPerfumes(res.data);
        } else {
          setError('Failed to load perfume collection');
        }
      } catch (error) {
        console.error('Error fetching perfumes:', error);
        setError('Failed to load perfume collection');
      }
    };
    fetchPerfumes();
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  // Function to call Cohere API
  const callCohereAPI = async (prompt) => {
    try {
      // Format perfumes data for the prompt
      const perfumeContext = perfumes.map(p => 
        `${p.name}: ${p.description} (Categories: ${p.categories}) - $${p.price}`
      ).join('\n');

      const fullPrompt = `You are a luxury perfume and style consultant at JC's Closet. Your task is to recommend ONLY from the following perfumes in our current collection:

${perfumeContext}

IMPORTANT RULES:
- ONLY recommend perfumes from the list above
- Use EXACT perfume names when listing recommendations
- Use the perfume's description to explain why it matches the style/occasion
- Show the price separately after each recommendation
- DO NOT make up or suggest perfumes that aren't in the list
- DO NOT modify the prices or descriptions

Your response should begin with:
"You asked for: [repeat their exact request]"

Then provide your recommendations in this format:
1. Style Analysis: Brief analysis of their described style (1-2 sentences)
2. Occasion Assessment: How well the style fits the occasion (1-2 sentences)
3. Perfume Recommendations (choose 2-3 from our collection above):

   * [Exact Perfume Name]
     Why it matches (use description for context)
     Price: $[Exact Price]

   * [Exact Perfume Name]
     Why it matches (use description for context)
     Price: $[Exact Price]

4. Styling Tip: One practical tip to enhance the overall look

Keep your response friendly and concise, around 150-200 words.

Response:`;

      const response = await fetch(COHERE_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${COHERE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'command-light',
          prompt: fullPrompt,
          max_tokens: 300,
          temperature: 0.7,
          k: 0,
          stop_sequences: [],
          return_likelihoods: 'NONE'
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.generations[0].text.trim();
    } catch (error) {
      console.error('Cohere API Error:', error);
      throw error;
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    setError('');
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setError('');
    if (!input.trim()) return;

    // Parse input for style and occasion
    let parsedStyle = style;
    let parsedOccasion = occasion;
    
    if (!style || !occasion) {
      // Try to extract from input (very basic split)
      const parts = input.split(' for ');
      if (parts.length === 2) {
        parsedStyle = parts[0].trim();
        parsedOccasion = parts[1].trim();
      } else {
        // Let AI parse the input naturally
        parsedStyle = input.trim();
        parsedOccasion = input.trim();
      }
    }

    setMessages((msgs) => [
      ...msgs,
      { sender: 'user', text: input }
    ]);
    setInput('');
    setLoading(true);

    try {
      const aiResponse = await callCohereAPI(input);
      
      setMessages((msgs) => [
        ...msgs,
        { sender: 'ai', text: aiResponse }
      ]);
      
      setStyle(parsedStyle);
      setOccasion(parsedOccasion);
      
    } catch (error) {
      setMessages((msgs) => [
        ...msgs,
        { sender: 'ai', text: 'Sorry, I encountered an error while generating your recommendation. Please try again.' }
      ]);
      setError('API Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Style Guide | JC's Closet</title>
        <meta name="description" content="Get personalized style and perfume recommendations with JC's Closet Style Guide AI." />
      </Helmet>
      {/* Futuristic animated background */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: -1,
          pointerEvents: 'none',
          background: theme.palette.mode === 'dark'
            ? `radial-gradient(ellipse at 60% 40%, ${theme.palette.primary.dark} 0%, transparent 70%),\nradial-gradient(ellipse at 30% 80%, ${theme.palette.secondary.dark} 0%, transparent 80%)`
            : `radial-gradient(ellipse at 60% 40%, ${theme.palette.primary.light} 0%, transparent 70%),\nradial-gradient(ellipse at 30% 80%, ${theme.palette.secondary.light} 0%, transparent 80%)`,
          '&:before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: theme.palette.mode === 'dark'
              ? `repeating-linear-gradient(135deg, rgba(255,255,255,0.03) 0 2px, transparent 2px 40px)`
              : `repeating-linear-gradient(135deg, rgba(0,0,0,0.04) 0 2px, transparent 2px 40px)`,
            opacity: 0.7,
            zIndex: 1,
            pointerEvents: 'none',
          },
          animation: 'bgMove 18s linear infinite',
        }}
      />
      {/* Keyframes for background movement */}
      <style>{`
        @keyframes bgMove {
          0% { background-position: 0 0, 0 0; }
          100% { background-position: 100vw 100vh, 100vw 0; }
        }
      `}</style>
      <main style={{ width: '100vw', minHeight: '100vh', background: 'transparent', overflowX: 'hidden', position: 'relative', zIndex: 1 }}>
        <Box sx={{ width: '100%', maxWidth: 1400, mx: 'auto', px: { xs: 1, md: 3 }, py: { xs: 2, md: 4 } }}>
          <Box
            sx={{
              maxWidth: 600,
              mx: 'auto',
              minHeight: { xs: '60vh', sm: '100vh' },
              display: 'flex',
              flexDirection: 'column',
              background: theme.palette.mode === 'dark'
                ? 'rgba(20,24,40,0.98)'
                : 'rgba(255,255,255,0.96)',
              borderRadius: 6,
              boxShadow: theme.palette.mode === 'dark'
                ? `0 0 32px 4px ${theme.palette.primary.main}33, 0 2px 32px 0 ${theme.palette.secondary.main}22`
                : `0 0 32px 4px ${theme.palette.primary.light}22, 0 2px 32px 0 ${theme.palette.secondary.light}11`,
              p: { xs: 0, sm: 2 },
              mt: { xs: 0, sm: 4 },
              overflow: 'hidden',
              backdropFilter: 'blur(18px) saturate(1.3)',
              border: theme.palette.mode === 'dark'
                ? `1.5px solid ${theme.palette.primary.main}55`
                : `1.5px solid ${theme.palette.primary.light}33`,
              position: 'relative',
              zIndex: 2,
            }}
            component={motion.main}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Box sx={{ p: { xs: 2, sm: 3 }, pb: 0 }}>
              <Typography variant="h4" fontWeight={700} gutterBottom sx={{
                color: theme.palette.mode === 'dark' ? '#fff' : theme.palette.primary.dark,
                letterSpacing: 1.5,
                textShadow: theme.palette.mode === 'dark'
                  ? `0 0 12px #000, 0 0 2px #000`
                  : `0 0 8px ${theme.palette.primary.light}33, 0 0 2px #0002`,
              }}>
                Style & Perfume <span style={{ color: theme.palette.secondary.main, textShadow: theme.palette.mode === 'dark' ? `0 0 8px ${theme.palette.secondary.main}99` : `0 0 8px ${theme.palette.secondary.light}33` }}>AI</span>
              </Typography>
              <Typography variant="body2" sx={{
                color: theme.palette.mode === 'dark' ? '#f5f5f5' : theme.palette.grey[700],
                fontWeight: 500,
                letterSpacing: 0.5,
                mb: 1,
                textShadow: theme.palette.mode === 'dark' ? '0 0 8px #000' : '0 0 2px #fff2',
              }}>
                Get instant, AI-powered recommendations for your next event. Just describe your style and occasion!
              </Typography>
            </Box>
            <Paper
              elevation={0}
              sx={{
                flex: 1,
                background: theme.palette.mode === 'dark'
                  ? 'rgba(30,34,60,0.99)'
                  : 'rgba(255,255,255,0.98)',
                overflowY: 'auto',
                px: { xs: 1, sm: 3 },
                py: 1,
                mb: 0,
                minHeight: 200,
                maxHeight: isMobile ? 300 : 340,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                boxShadow: theme.palette.mode === 'dark'
                  ? `0 0 16px 2px ${theme.palette.secondary.main}22`
                  : `0 0 16px 2px ${theme.palette.secondary.light}11`,
                border: theme.palette.mode === 'dark'
                  ? `1px solid ${theme.palette.secondary.main}33`
                  : `1px solid ${theme.palette.secondary.light}22`,
                backdropFilter: 'blur(8px)',
              }}
            >
              <AnimatePresence initial={false}>
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '85%',
                      marginBottom: 8,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Box
                      sx={{
                        bgcolor: msg.sender === 'user'
                          ? (theme.palette.mode === 'dark'
                              ? `linear-gradient(90deg, ${theme.palette.primary.main} 60%, ${theme.palette.secondary.main} 100%)`
                              : `linear-gradient(90deg, ${theme.palette.primary.light} 60%, ${theme.palette.secondary.light} 100%)`)
                          : (theme.palette.mode === 'dark'
                              ? 'rgba(255,255,255,0.13)'
                              : 'rgba(0,0,0,0.04)'),
                        color: msg.sender === 'user'
                          ? (theme.palette.mode === 'dark' ? '#fff' : theme.palette.primary.dark)
                          : (theme.palette.mode === 'dark' ? '#f5f5f5' : theme.palette.text.primary),
                        px: 2,
                        py: 1.2,
                        borderRadius: 3,
                        boxShadow: msg.sender === 'user'
                          ? (theme.palette.mode === 'dark'
                              ? `0 0 8px 2px ${theme.palette.primary.main}55`
                              : `0 0 8px 2px ${theme.palette.primary.light}33`)
                          : (theme.palette.mode === 'dark'
                              ? `0 0 4px 1px ${theme.palette.secondary.main}22`
                              : `0 0 4px 1px ${theme.palette.secondary.light}11`),
                        fontSize: '1.08rem',
                        mb: 0.5,
                        border: msg.sender === 'user'
                          ? (theme.palette.mode === 'dark'
                              ? `1.5px solid ${theme.palette.primary.main}88`
                              : `1.5px solid ${theme.palette.primary.light}44`)
                          : (theme.palette.mode === 'dark'
                              ? `1px solid ${theme.palette.secondary.main}33`
                              : `1px solid ${theme.palette.secondary.light}22`),
                        fontFamily: 'Orbitron, Roboto, monospace',
                        letterSpacing: 0.2,
                        transition: 'all 0.2s',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {msg.text}
                    </Box>
                  </motion.div>
                ))}
              </AnimatePresence>
              {loading && (
                <Fade in={loading} unmountOnExit>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <CircularProgress size={22} sx={{ color: theme.palette.mode === 'dark' ? theme.palette.secondary.main : theme.palette.secondary.light }} />
                    <Typography variant="body2" color={theme.palette.mode === 'dark' ? '#fff' : 'text.secondary'}>Thinking...</Typography>
                  </Box>
                </Fade>
              )}
              <div ref={chatEndRef} />
            </Paper>
            <Box
              component={motion.form}
              onSubmit={handleSend}
              initial={false}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: { xs: 1, sm: 3 },
                pb: 1,
                pt: 1,
                background: 'transparent',
                borderTop: theme.palette.mode === 'dark'
                  ? `1.5px solid ${theme.palette.secondary.main}55`
                  : `1.5px solid ${theme.palette.secondary.light}33`,
                position: 'relative',
                zIndex: 2,
              }}
            >
              <Paper
                elevation={2}
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 6,
                  boxShadow: theme.palette.mode === 'dark'
                    ? `0 0 12px 2px ${theme.palette.primary.main}33`
                    : `0 0 12px 2px ${theme.palette.primary.light}22`,
                  bgcolor: theme.palette.mode === 'dark'
                    ? 'rgba(40,44,70,0.85)'
                    : 'rgba(255,255,255,0.95)',
                  px: 1.5,
                  py: 0.5,
                  transition: 'box-shadow 0.2s',
                  border: theme.palette.mode === 'dark'
                    ? `1.5px solid ${theme.palette.primary.main}55`
                    : `1.5px solid ${theme.palette.primary.light}33`,
                  '&:focus-within': {
                    boxShadow: theme.palette.mode === 'dark'
                      ? `0 0 16px 2px ${theme.palette.secondary.main}77`
                      : `0 0 16px 2px ${theme.palette.secondary.light}44`,
                  },
                }}
              >
                <TextField
                  value={input}
                  onChange={handleInputChange}
                  placeholder="e.g., 'casual chic for a coffee date' or 'formal attire for a wedding'"
                  variant="standard"
                  size="small"
                  fullWidth
                  InputProps={{
                    disableUnderline: true,
                    style: {
                      fontSize: '1.08rem',
                      padding: 0,
                      background: 'none',
                      color: theme.palette.mode === 'dark' ? '#fff' : theme.palette.text.primary,
                      fontFamily: 'Orbitron, Roboto, monospace',
                      letterSpacing: 0.2,
                      caretColor: theme.palette.mode === 'dark' ? '#fff' : theme.palette.primary.dark,
                    },
                  }}
                  sx={{
                    borderRadius: 6,
                    bgcolor: 'transparent',
                    mx: 0.5,
                    flex: 1,
                    input: {
                      color: theme.palette.mode === 'dark' ? '#fff' : theme.palette.text.primary,
                      '::placeholder': {
                        color: theme.palette.mode === 'dark' ? '#bbb' : theme.palette.grey[600],
                        opacity: 1,
                      },
                    },
                  }}
                  disabled={loading}
                />
                <IconButton
                  type="submit"
                  color="primary"
                  disabled={loading || !input.trim()}
                  sx={{
                    bgcolor: theme.palette.mode === 'dark'
                      ? `linear-gradient(90deg, ${theme.palette.primary.main} 60%, ${theme.palette.secondary.main} 100%)`
                      : `linear-gradient(90deg, ${theme.palette.primary.light} 60%, ${theme.palette.secondary.light} 100%)`,
                    color: theme.palette.mode === 'dark' ? '#fff' : theme.palette.primary.dark,
                    borderRadius: 2,
                    ml: 1,
                    boxShadow: theme.palette.mode === 'dark'
                      ? `0 0 12px 2px ${theme.palette.secondary.main}55`
                      : `0 0 12px 2px ${theme.palette.secondary.light}33`,
                    transition: 'transform 0.15s, box-shadow 0.2s',
                    '&:hover': {
                      bgcolor: theme.palette.mode === 'dark'
                        ? `linear-gradient(90deg, ${theme.palette.secondary.main} 60%, ${theme.palette.primary.main} 100%)`
                        : `linear-gradient(90deg, ${theme.palette.secondary.light} 60%, ${theme.palette.primary.light} 100%)`,
                      transform: 'scale(1.08)',
                      boxShadow: theme.palette.mode === 'dark'
                        ? `0 0 24px 4px ${theme.palette.primary.main}99`
                        : `0 0 24px 4px ${theme.palette.primary.light}44`,
                    },
                    '&:active': { transform: 'scale(0.97)' },
                  }}
                  aria-label="Send"
                >
                  <SendIcon fontSize="medium" />
                </IconButton>
              </Paper>
            </Box>
            {error && (
              <Fade in={!!error} unmountOnExit>
                <Box sx={{ px: { xs: 2, sm: 3 }, pb: 1 }}>
                  <Typography color="error" variant="body2" sx={{ fontFamily: 'Orbitron, monospace' }}>{error}</Typography>
                </Box>
              </Fade>
            )}
          </Box>
        </Box>
      </main>
    </>
  );
}

export default StyleGuide;