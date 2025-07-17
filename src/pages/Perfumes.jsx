import React, { useState, useEffect, useRef } from "react";
import { FixedSizeGrid as Grid } from "react-window";
import { useNavigate } from 'react-router-dom';
import { addToCart as addToCartUtil } from '../utils/cart';
import { getPerfumePromo } from '../utils/perfumePromo';
import * as api from '../utils/api';
import { Helmet } from 'react-helmet-async';
import { AuthContext } from '../components/AuthContext';
import { useTheme } from '@mui/material/styles';

const categories = ["all", "men", "women", "luxury", "arab", "designer", "affordable"];

// Ensure BACKEND_URL does not end with /api and always points to backend root
const BACKEND_URL = (import.meta.env.VITE_API_BASE_URL || 'https://jcserver.onrender.com').replace(/\/?api\/?$/, '');
const getImageUrl = (imgPath) => {
  if (!imgPath) return imgPath;
  // If already absolute URL, return as is
  if (/^https?:\/\//.test(imgPath)) return imgPath;
  // If starts with /api/perfumes/uploads/ or /perfumes/uploads/, strip /api/perfumes or /perfumes and prefix backend
  if (imgPath.startsWith('/api/perfumes/uploads/')) {
    return BACKEND_URL + imgPath.replace('/api/perfumes', '');
  }
  if (imgPath.startsWith('/perfumes/uploads/')) {
    return BACKEND_URL + imgPath.replace('/perfumes', '');
  }
  // If starts with /api/uploads/, strip /api and prefix backend
  if (imgPath.startsWith('/api/uploads/')) {
    return BACKEND_URL + imgPath.replace('/api', '');
  }
  // If starts with /uploads/, always prefix with backend root
  if (imgPath.startsWith('/uploads/')) {
    return BACKEND_URL + imgPath;
  }
  return imgPath;
};

const PerfumeImage = React.memo(({ src, alt, className, style, modal }) => {
  const theme = useTheme();
  const [loaded, setLoaded] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const imageRef = useRef(null);
  const observedElement = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '100px 0px', // Increased margin to start loading earlier
        threshold: 0.1
      }
    );

    if (imageRef.current) {
      observedElement.current = imageRef.current;
      observer.observe(imageRef.current);
    }

    return () => {
      if (observedElement.current) {
        observer.unobserve(observedElement.current);
      }
    };
  }, []);

  // Preload image when shouldLoad becomes true
  useEffect(() => {
    if (shouldLoad && src) {
      const img = new Image();
      img.src = getImageUrl(src);
    }
  }, [shouldLoad, src]);

  // Use modal-specific style if modal prop is true
  const imageStyle = modal
    ? {
        width: 260,
        height: 260,
        display: 'block',
        margin: '0 auto 20px auto',
        objectFit: 'cover',
        borderRadius: 8,
        boxShadow: `0 2px 12px ${theme.palette.grey.e0e7ef}99`,
        maxWidth: '90vw',
        maxHeight: '40vh',
        opacity: loaded ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out',
        transform: loaded ? 'translateY(0)' : 'translateY(10px)',
        willChange: 'opacity, transform',
        ...style,
      }
    : {
        width: '100%',
        height: '120px',
        objectFit: 'cover',
        borderRadius: 4,
        opacity: loaded ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out',
        transform: loaded ? 'translateY(0)' : 'translateY(10px)',
        willChange: 'opacity, transform',
        ...style,
      };

  const containerStyle = {
    position: 'relative',
    width: modal ? 260 : '100%',
    height: modal ? 260 : '120px',
    margin: modal ? '0 auto 20px auto' : undefined,
    background: theme.palette.grey.e0e7ef,
    borderRadius: modal ? 8 : 4,
    overflow: 'hidden',
    ...style
  };

  return (
    <div ref={imageRef} style={containerStyle}>
      {!loaded && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: theme.palette.grey.e0e7ef,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: modal ? 8 : 4,
        }}>
          <span style={{ color: theme.palette.grey._888, fontSize: 18 }}>🖼️</span>
        </div>
      )}
      {shouldLoad && (
        <img
          src={getImageUrl(src)}
          alt={alt}
          className={className}
          loading="lazy"
          decoding="async"
          style={imageStyle}
          onLoad={() => {
            requestAnimationFrame(() => {
              setLoaded(true);
            });
          }}
          onError={() => {
            console.warn('Failed to load image:', src);
            setLoaded(true);
          }}
        />
      )}
    </div>
  );
});

// Add display name for debugging
PerfumeImage.displayName = 'PerfumeImage';

const PerfumeCollection = () => {
  const [perfumes, setPerfumes] = useState([]);
  const [currentCategory, setCurrentCategory] = useState("all");
  const [currentSearch, setCurrentSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedPerfume, setSelectedPerfume] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showCartMsg, setShowCartMsg] = useState(false);
  const [cartMsg, setCartMsg] = useState("");
  const [error, setError] = useState(""); // <-- Add error state
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();
  const searchTimeout = useRef(null);
  const suggestionTimeout = useRef(null);
  const gridRef = useRef();
  const { user } = React.useContext(AuthContext);
  const theme = useTheme();

  // Dynamically set body background to match theme gradient
  useEffect(() => {
    document.body.style.background = theme.custom.gradientBackground;
    return () => {
      document.body.style.background = '';
    };
  }, [theme.custom.gradientBackground]);

  // Track last search/category to know when to reset perfumes
  const lastQuery = useRef({ search: '', category: '' });

  useEffect(() => {
    // If search or category changed, reset perfumes and page
    if (
      lastQuery.current.search !== currentSearch ||
      lastQuery.current.category !== currentCategory
    ) {
      setPerfumes([]);
      setCurrentPage(1);
      lastQuery.current = { search: currentSearch, category: currentCategory };
      loadPerfumes(false, currentSearch, currentCategory);
    } else {
      // Otherwise, append next page
      loadPerfumes(true, currentSearch, currentCategory);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, currentSearch, currentCategory]);

  const ITEMS_PER_PAGE = 6; 
  const MAX_PAGES = 20; 

  const fetchPerfumes = async (page = 1, search = "", category = "all") => {
    try {
      // Send search, category, and limit as query params
      const params = new URLSearchParams({ page, search, category, limit: ITEMS_PER_PAGE });
      const res = await api.get(`/perfumes?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch perfumes');
      
      return res.data;
    } catch {
      setError("Unable to load perfumes. Please check your internet connection and try again.");
      return { data: [], hasMore: false };
    }
  };

  // Only keep up to 3 pages of perfumes in memory to avoid slowdowns
  const loadPerfumes = async (append = false, search = currentSearch, category = currentCategory) => {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const result = await fetchPerfumes(currentPage, search, category);
      setPerfumes((prev) => {
        if (!append) {
          // New search/category: replace
          return result.data;
        } else {
          // Infinite scroll: append new unique perfumes
          const existingIds = new Set(prev.map(p => p._id));
          const newPerfumes = result.data.filter(p => !existingIds.has(p._id));
          return [...prev, ...newPerfumes];
        }
      });
      setHasMore(result.hasMore && currentPage < MAX_PAGES);
    } catch {
      setError("Unable to load perfumes. Please check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    setCurrentCategory(category);
    setCurrentPage(1); // Reset to first page on category change
  };

  // --- Suggestion fetch logic ---
  const handleSearchChange = (e) => {
    const value = e.target.value.toLowerCase().trim();
    
    // Clear any existing timeouts
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    if (suggestionTimeout.current) {
      clearTimeout(suggestionTimeout.current);
    }

    // Update the search input immediately
    setCurrentSearch(value);

    // Debounced search (delay actual search to prevent too many API calls)
    searchTimeout.current = setTimeout(() => {
      setCurrentPage(1); // Reset to first page
      setPerfumes([]); // Clear existing results
      loadPerfumes(false, value, currentCategory);
    }, 500);

    // Debounced suggestions with shorter delay
    if (value.length > 0) {
      suggestionTimeout.current = setTimeout(async () => {
        try {
          const res = await api.get(`/perfumes/suggestions?query=${encodeURIComponent(value)}`);
          setSuggestions(res.data?.slice(0, 5) || []); // Limit suggestions to 5
        } catch {
          setSuggestions([]);
        }
      }, 200);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (s) => {
    setCurrentSearch(s);
    setSuggestions([]);
    setCurrentPage(1);
  };

  // Infinite scroll with proper cleanup and debouncing
  useEffect(() => {
    if (!hasMore || loading) return;
    
    let scrollTimeout;
    const handleScroll = () => {
      if (scrollTimeout) {
        window.cancelAnimationFrame(scrollTimeout);
      }
      
      scrollTimeout = window.requestAnimationFrame(() => {
        const scrollY = window.scrollY || window.pageYOffset;
        const viewportHeight = window.innerHeight;
        const fullHeight = document.documentElement.scrollHeight;
        
        if (fullHeight - (scrollY + viewportHeight) < 700) {
          if (!loading && hasMore && currentPage < MAX_PAGES) {
            setCurrentPage((prev) => prev + 1);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) {
        window.cancelAnimationFrame(scrollTimeout);
      }
    };
  }, [hasMore, loading, currentPage, MAX_PAGES]);

  const openModal = React.useCallback((perfumeId) => {
    const perfume = perfumes.find((p) => p._id === perfumeId);
    if (!perfume) return;
    setSelectedPerfume(perfume);
    setQuantity(1);
    // Increment view count in backend
    api.post(`/perfumes/${perfumeId}/view`);
  }, [perfumes]);

  const closeModal = () => {
    setSelectedPerfume(null);
    setQuantity(1);
  };

  const changeQuantity = (change) => {
    if (!selectedPerfume) return;
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= selectedPerfume.stock) {
      setQuantity(newQuantity);
    }
  };

  // Utility to get sessionId from localStorage (do not generate if missing)
  function getSessionId() {
    return localStorage.getItem('sessionId') || null;
  }

  const addToCart = (goToCart = false) => {
    if (!selectedPerfume || selectedPerfume.stock === 0) return;
    if (user && (user.status === 'suspended' || user.status === 'blacklisted')) {
      setError('Your account is suspended. You cannot add items to cart.');
      return;
    }
    const mainImage = selectedPerfume.images[selectedPerfume.mainImageIndex || 0];
    const { promoActive, displayPrice, promoLabel } = getPerfumePromo(selectedPerfume);
    addToCartUtil({
      _id: selectedPerfume._id,
      name: selectedPerfume.name,
      price: selectedPerfume.price,
      quantity,
      image: mainImage,
      images: selectedPerfume.images, // Add all images for cart modal gallery
      mainImageIndex: selectedPerfume.mainImageIndex || 0,
      categories: selectedPerfume.categories,
      promoActive,
      promoLabel,
      promoPrice: promoActive ? displayPrice : undefined,
      stock: selectedPerfume.stock, // Add stock to cart item for cart page display
    });
    // Log add-to-cart action to backend for analytics
    const sessionId = getSessionId();
    if (sessionId) {
      api.post('/v1/cart-actions', {
        sessionId,
        productId: selectedPerfume._id,
        action: 'add',
        quantity
      });
    }
    window.dispatchEvent(new Event('cart-updated'));
    closeModal();
    if (goToCart) navigate('/cart');
    else {
      setCartMsg(`Added ${quantity} x ${selectedPerfume.name} to cart!`);
      setShowCartMsg(true);
      setTimeout(() => setShowCartMsg(false), 4000);
    }
  };

  // Responsive columns and card width for 100% width grid
  const [containerWidth, setContainerWidth] = useState(window.innerWidth);
  // Memoize getColumnCount to prevent unnecessary rerenders
  const getColumnCount = React.useCallback(() => {
    if (containerWidth < 600) return 2;
    if (containerWidth < 900) return 3;
    if (containerWidth < 1200) return 4;
    return 5;
  }, [containerWidth]);
  const [columnCount, setColumnCount] = useState(getColumnCount());
  // Handle window resizing with proper cleanup
  useEffect(() => {
    let resizeTimeout;
    
    const handleResize = () => {
      if (resizeTimeout) {
        window.cancelAnimationFrame(resizeTimeout);
      }
      
      resizeTimeout = window.requestAnimationFrame(() => {
        setContainerWidth(gridRef.current ? gridRef.current.offsetWidth : window.innerWidth);
      });
    };

    window.addEventListener('resize', handleResize, { passive: true });
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeout) {
        window.cancelAnimationFrame(resizeTimeout);
      }
    };
  }, []);
  // Update column count when container width changes
  useEffect(() => {
    setColumnCount(getColumnCount());
  }, [containerWidth, getColumnCount]);
  const CARD_GAP = 16;
  const CARD_WIDTH = Math.floor((containerWidth - CARD_GAP * (columnCount + 1)) / columnCount);
  const CARD_HEIGHT = 320;
  const gridWidth = containerWidth;
  const rowCount = Math.ceil(perfumes.length / columnCount);

  // For modal promo support
  let modalPromo = { promoActive: false, promoLabel: '', displayPrice: 0 };
  if (selectedPerfume) {
    modalPromo = getPerfumePromo(selectedPerfume);
  }

  // For modal image gallery
  const [modalImageIndex, setModalImageIndex] = useState(0);
  useEffect(() => {
    if (selectedPerfume?._id) {
      setModalImageIndex(selectedPerfume.mainImageIndex || 0);
    }
  }, [selectedPerfume?._id]);

  return (
    <>
      <Helmet>
        <title>Perfumes | JC's Closet</title>
        <meta name="description" content="Shop the latest and classic perfumes at JC's Closet. Find your signature scent from our curated collection." />
      </Helmet>
      {/* Remove static theme variable style block. Use only global theme CSS vars. */}
      <style>{`
        body {
          font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
          background: var(--color-bg, #f6f8fa);
          color: var(--color-text, #1C2A4D);
          min-height: 100vh;
          padding: 0;
        }
        .container {
          max-width: 1240px;
          margin: 0 auto;
          padding: 24px 8px 48px 8px;
        }
        .header {
          text-align: center;
          margin-bottom: 32px;
        }
        .title {
          font-size: 2.2rem;
          font-weight: 800;
          letter-spacing: -1px;
          color: var(--color-primary, #4A90E2);
          margin-bottom: 10px;
          text-shadow: 0 2px 12px var(--color-primary, #4A90E2)33;
        }
        .search-container {
          display: flex;
          justify-content: center;
          margin-bottom: 18px;
        }
        .search-input {
          width: 100%;
          max-width: 340px;
          padding: 12px 16px 12px 44px;
          border: none;
          border-radius: 14px;
          font-size: 1rem;
          background: var(--color-input-bg, #f7faff);
          box-shadow: 0 2px 8px var(--color-paper, #fff)99;
          color: var(--color-text, #1C2A4D);
          outline: none;
          transition: box-shadow 0.2s, border 0.2s;
          border: 1.5px solid var(--color-input-border, #C9D6DF);
        }
        .search-input:focus {
          box-shadow: 0 0 0 2px var(--color-primary, #4A90E2);
        }
        .categories {
          display: flex;
          gap: 8px;
          margin-bottom: 18px;
          overflow-x: auto;
          overflow-y: hidden;
          padding: 0 8px 4px 8px;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
          white-space: nowrap;
          max-width: 100vw;
        }
        .categories::-webkit-scrollbar { display: none; }
        .category-item {
          min-width: 60px;
          flex: 0 0 auto;
          padding: 8px 18px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          text-align: center;
          border-radius: 8px;
          background: var(--color-input-bg, #f7faff);
          color: var(--color-text-secondary, #4A4A4A);
          border: 1.5px solid transparent;
          transition: all 0.18s;
          white-space: nowrap;
        }
        .category-item.active {
          color: var(--color-primary, #4A90E2);
          background: var(--color-paper, #fff);
          border-color: var(--color-primary, #4A90E2);
          box-shadow: 0 2px 8px var(--color-primary, #4A90E2)33;
        }
        @media (max-width: 600px) {
          .categories {
            padding: 0 2vw 4px 2vw;
            gap: 6px;
          }
          .category-item {
            min-width: 48px;
            font-size: 0.95rem;
            padding: 8px 10px;
          }
        }
        .perfumes-grid {
          display: block;
          gap: 0;
          margin-bottom: 32px;
          padding: 0 8px;
        }
        .perfume-card {
          margin: 10px;
          background: var(--color-paper, #fff);
          border-radius: 14px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.10);
          padding: 14px 12px 10px 12px;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
          opacity: 1;
          border: 1.5px solid var(--color-input-border, #C9D6DF);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .perfume-card:hover {
          transform: translateY(-4px) scale(1.03);
          box-shadow: 0 8px 32px rgba(0,0,0,0.18);
          border-color: var(--color-primary, #4A90E2);
        }
        .perfume-card.out-of-stock {
          opacity: 0.55;
          filter: grayscale(0.2);
        }
        .perfume-image {
          width: 100%;
          height: 140px;
          object-fit: cover;
          border-radius: 8px;
          margin-bottom: 10px;
          box-shadow: 0 2px 8px #0001;
        }
        .perfume-name {
          font-size: 1.08rem;
          font-weight: 700;
          margin-bottom: 2px;
          color: var(--color-text, #1C2A4D);
          letter-spacing: -0.5px;
        }
        .perfume-description {
          font-size: 0.98rem;
          color: var(--color-text-secondary, #4A4A4A);
          margin-bottom: 8px;
          height: 28px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .perfume-category {
          display: inline-block;
          background: var(--color-input-bg, #f7faff);
          font-size: 0.85rem;
          padding: 2px 10px;
          border-radius: 8px;
          margin-bottom: 8px;
          color: var(--color-primary, #4A90E2);
          font-weight: 600;
        }
        .perfume-price {
          font-size: 1.08rem;
          font-weight: 700;
          color: var(--color-primary, #4A90E2);
          margin-bottom: 4px;
        }
        .perfume-stock {
          font-size: 0.85rem;
          font-weight: 600;
        }
        .stock-available { color: var(--color-accent, #43a047); }
        .stock-out { color: var(--color-btn-bg2, #e53935); }
        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 120px;
        }
        .spinner {
          width: 36px;
          height: 36px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid var(--color-primary, #4A90E2);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .load-more {
          display: flex;
          justify-content: center;
          margin-top: 32px;
        }
        .load-more-btn {
          padding: 12px 36px;
          background: var(--color-primary, #4A90E2);
          color: var(--color-primary-contrast, #fff);
          border: none;
          border-radius: 14px;
          cursor: pointer;
          font-size: 1.1rem;
          font-weight: 700;
          box-shadow: 0 4px 24px rgba(0,0,0,0.10);
          transition: background 0.18s, color 0.18s, box-shadow 0.18s;
        }
        .load-more-btn:hover {
          background: #1251a3;
          color: #fff;
          box-shadow: 0 8px 32px rgba(0,0,0,0.18);
        }
        .no-results {
          text-align: center;
          color: var(--color-btn-bg2, #e53935);
          font-size: 1.2rem;
          margin: 48px 0;
          font-weight: 700;
        }
        /* Modal styles */
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 16px;
          backdrop-filter: blur(4px);
        }
        .modal {
          position: relative;
          top: 65px;
          background: var(--color-input-bg, #f7faff);
          border-radius: 24px;
          max-width: 520px;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 8px 32px rgba(0,0,0,0.18);
          border: 1.5px solid var(--color-input-border, #C9D6DF);
          backdrop-filter: blur(12px) saturate(1.2);
        }
        .modal-header {
          padding: 20px 24px 12px 24px;
          border-bottom: 1.5px solid var(--color-input-border, #C9D6DF);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .modal-title {
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--color-primary, #4A90E2);
        }
        .close-btn {
          background: none;
          border: none;
          font-size: 2rem;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 6px;
          color: var(--color-text-secondary, #4A4A4A);
          transition: background 0.18s;
        }
        .close-btn:hover {
          background: #e0e7ef55;
        }
        .modal-content {
          padding: 24px 24px 18px 24px;
        }
        .modal-image {
          display: block;
          margin: 0 auto 20px auto;
          width: 260px;
          height: 260px;
          max-width: 90vw;
          max-height: 40vh;
          object-fit: cover;
          border-radius: 14px;
          box-shadow: 0 2px 16px var(--color-primary, #4A90E2)33;
        }
        .modal-price {
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--color-primary, #4A90E2);
          margin: 12px 0 8px 0;
        }
        .quantity-controls {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 18px 0 12px 0;
        }
        .quantity-btn {
          background: var(--color-paper, #fff);
          border: 2px solid var(--color-primary, #4A90E2);
          color: var(--color-primary, #4A90E2);
          width: 36px;
          height: 36px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1.3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          transition: background 0.18s, color 0.18s;
        }
        .quantity-btn:disabled {
          opacity: 0.5;
        }
        .quantity-input {
          width: 54px;
          text-align: center;
          padding: 6px;
          border: 1.5px solid var(--color-input-border, #C9D6DF);
          border-radius: 8px;
          font-size: 1.1rem;
          background: var(--color-input-bg, #f7faff);
          color: var(--color-text, #1C2A4D);
        }
        .add-to-cart-btn {
          width: 100%;
          padding: 14px;
          background: var(--color-primary, #4A90E2);
          color: var(--color-primary-contrast, #fff);
          border: none;
          border-radius: 14px;
          font-size: 1.1rem;
          font-weight: 800;
          cursor: pointer;
          margin-top: 18px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.10);
          transition: background 0.18s, color 0.18s, box-shadow 0.18s;
        }
        .add-to-cart-btn:disabled {
          background: var(--color-btn-bg2, #e53935);
          color: #fff;
        }
        .add-to-cart-btn.alt {
          background: #fff;
          color: var(--color-primary, #4A90E2);
          border: 2px solid var(--color-primary, #4A90E2);
          margin-top: 10px;
        }
        .add-to-cart-btn.alt:hover {
          background: var(--color-primary, #4A90E2);
          color: #fff;
        }
        @media (max-width: 900px) {
          .perfume-card { width: 95vw; max-width: 360px; }
          .modal { max-width: 98vw; }
        }
        @media (max-width: 600px) {
          .perfume-card { width: 99vw; max-width: 99vw; }
          .modal { max-width: 100vw; }
        }
        .suggestions-dropdown {
          position: absolute;
          top: 44px;
          left: 0;
          right: 0;
          background: var(--color-paper, #fff);
          border: 1.5px solid var(--color-input-border, #C9D6DF);
          box-shadow: 0 2px 12px var(--color-primary, #4A90E2)33;
          z-index: 1000;
          max-height: 220px;
          overflow-y: auto;
          margin-top: 2px;
          border-radius: 8px;
        }
        .suggestion-item {
          padding: 12px 18px;
          cursor: pointer;
          font-size: 1rem;
          color: var(--color-text, #1C2A4D);
          border-bottom: 1px solid var(--color-input-border, #C9D6DF);
          background: var(--color-paper, #fff);
          transition: background 0.15s;
        }
        .suggestion-item:last-child { border-bottom: none; }
        .suggestion-item:hover {
          background: var(--color-input-bg, #f7faff);
        }
      `}</style>

      <div className="container">
        <div className="header">
          <h1 className="title">Perfumes Collection</h1>

          <div className="search-container">
            <div style={{ position: 'relative', width: '90%', maxWidth: 320 }}>
              <input
                type="text"
                className="search-input"
                placeholder="Search perfumes..."
                onChange={handleSearchChange}
                style={{
                  paddingLeft: 38,
                  boxShadow: `0 2px 8px ${theme.palette.grey.e0e7ef}99`,
                  background: `${theme.palette.grey.f8fafc} 0%, ${theme.palette.grey.e0e7ef} 100%)`,
                  border: `1.5px solid ${theme.palette.grey._e3eaf5 || '#e3eaf5'}`,
                  borderRadius: 12,
                  fontSize: 15,
                  transition: 'border 0.2s, box-shadow 0.2s',
                }}
                onFocus={e => e.target.style.border = '2px solid #1976d2'}
                onBlur={e => e.target.style.border = '1.5px solid #e3eaf5'}
                value={currentSearch}
                autoComplete="off"
              />
              <svg
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 18,
                  height: 18,
                  color: '#b0b8c9',
                  pointerEvents: 'none',
                }}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="16.5" y1="16.5" x2="21" y2="21" />
              </svg>
              {/* Suggestions dropdown */}
              {suggestions.length > 0 && (
                <div className="suggestions-dropdown">
                  {suggestions.map((s, i) => (
                    <div
                      key={i}
                      className="suggestion-item"
                      onMouseDown={() => handleSuggestionClick(s)}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="categories">
            {categories.map((cat) => (
              <div
                key={cat}
                className={`category-item ${cat === currentCategory ? "active" : ""}`}
                onClick={() => handleCategoryClick(cat)}
              >
                {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="no-results" style={{ color: '#f44336', fontWeight: 600 }}>
            {error}
          </div>
        )}

        {/* Skeleton loading for perfumes grid */}
        {loading && perfumes.length === 0 && (
          <div className="perfumes-grid" style={{ padding: 0, marginBottom: 24, width: '100%' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
              {Array.from({ length: columnCount * 2 }).map((_, i) => (
                <div
                  key={i}
                  className="perfume-card"
                  style={{
                    width: CARD_WIDTH,
                    height: CARD_HEIGHT,
                    margin: CARD_GAP / 2,
                    background: theme.palette.mode === 'dark' ? theme.palette.grey[900] : '#f3f4f6',
                    border: `1.5px solid ${theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#e0e7ef'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    opacity: 0.7
                  }}
                  aria-hidden="true"
                >
                  <div style={{ width: '100%', height: 140, background: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#e0e7ef', borderRadius: 8, marginBottom: 10, animation: 'pulse 1.2s infinite' }} />
                  <div style={{ height: 18, width: '70%', background: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#e0e7ef', borderRadius: 6, margin: '8px 0', animation: 'pulse 1.2s infinite' }} />
                  <div style={{ height: 14, width: '90%', background: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#e0e7ef', borderRadius: 6, margin: '6px 0', animation: 'pulse 1.2s infinite' }} />
                  <div style={{ height: 16, width: '40%', background: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#e0e7ef', borderRadius: 6, margin: '6px 0', animation: 'pulse 1.2s infinite' }} />
                  <div style={{ height: 18, width: '50%', background: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#e0e7ef', borderRadius: 6, margin: '6px 0', animation: 'pulse 1.2s infinite' }} />
                </div>
              ))}
            </div>
            <style>{`
              @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
              }
            `}</style>
          </div>
        )}
        {/* End skeleton loading */}

        {!loading && !error && perfumes.length === 0 && (
          <div className="no-results">No perfumes found.</div>
        )}

        <div className="perfumes-grid" ref={gridRef} style={{ padding: 0, marginBottom: 24, width: '100%' }}>
          {/* Memoize grid item renderer to prevent unnecessary rerenders */}
          {React.useMemo(() => (
            <>
              <Grid
                columnCount={columnCount}
                columnWidth={CARD_WIDTH + CARD_GAP}
                height={Math.min(3, rowCount) * (CARD_HEIGHT + CARD_GAP) + 10}
                rowCount={rowCount}
                rowHeight={CARD_HEIGHT + CARD_GAP}
                width={gridWidth}
              >
                {React.memo(({ columnIndex, rowIndex, style }) => {
                  const idx = rowIndex * columnCount + columnIndex;
                  if (idx >= perfumes.length) return null;
                  const perfume = perfumes[idx];
                  const isInStock = perfume.stock > 0;
                  const mainImage = perfume.images[perfume.mainImageIndex || 0];
                  const { promoActive, promoLabel, displayPrice } = getPerfumePromo(perfume);
                  return (
                    <div
                      key={perfume._id}
                      className={`perfume-card ${isInStock ? '' : 'out-of-stock'}`}
                      style={{ ...style, width: CARD_WIDTH, height: CARD_HEIGHT, margin: CARD_GAP / 2 }}
                      onClick={isInStock ? () => openModal(perfume._id) : undefined}
                      role={isInStock ? 'button' : undefined}
                      tabIndex={isInStock ? 0 : undefined}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && isInStock) openModal(perfume._id);
                      }}
                    >
                      <PerfumeImage src={mainImage} alt={perfume.name} className="perfume-image" />
                      <div className="perfume-name">{perfume.name}</div>
                      <div className="perfume-description">{perfume.description}</div>
                      {perfume.categories.length > 0 && (
                        <div className="perfume-category">
                          {perfume.categories[0].charAt(0).toUpperCase() + perfume.categories[0].slice(1)}
                        </div>
                      )}
                      <div className="perfume-price">
                        {promoActive ? (
                          <>
                            <span style={{ color: 'var(--jc-sale)', fontWeight: 700 }}>₦{displayPrice.toLocaleString()}</span>
                            <span style={{ textDecoration: 'line-through', color: 'var(--jc-text-secondary)', marginLeft: 6, fontSize: 11 }}>
                              ₦{perfume.price.toLocaleString()}
                            </span>
                            {promoLabel && (
                              <span style={{ marginLeft: 8, color: 'var(--jc-success)', fontSize: 10, fontWeight: 600 }}>{promoLabel}</span>
                            )}
                          </>
                        ) : (
                          <>₦{perfume.price.toLocaleString()}</>
                        )}
                      </div>
                      <div className={`perfume-stock ${isInStock ? 'stock-available' : 'stock-out'}`}>
                        {isInStock ? `Stock: ${perfume.stock}` : 'Out of Stock'}
                      </div>
                      {/* Add to Cart button for grid cards */}
                      {isInStock && (
                        <button
                          className="add-to-cart-btn"
                          style={{ marginTop: 10, fontSize: 15, padding: '10px 0', fontWeight: 700 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            // Add perfume directly to cart without opening modal
                            if (user && (user.status === 'suspended' || user.status === 'blacklisted')) {
                              setError('Your account is suspended. You cannot add items to cart.');
                              return;
                            }
                            const mainImage = perfume.images[perfume.mainImageIndex || 0];
                            const { promoActive, displayPrice, promoLabel } = getPerfumePromo(perfume);
                            addToCartUtil({
                              _id: perfume._id,
                              name: perfume.name,
                              price: perfume.price,
                              quantity: 1,
                              image: mainImage,
                              images: perfume.images,
                              mainImageIndex: perfume.mainImageIndex || 0,
                              categories: perfume.categories,
                              promoActive,
                              promoLabel,
                              promoPrice: promoActive ? displayPrice : undefined,
                              stock: perfume.stock,
                            });
                            // Log add-to-cart action to backend for analytics
                            const sessionId = localStorage.getItem('sessionId') || null;
                            if (sessionId) {
                              api.post('/v1/cart-actions', {
                                sessionId,
                                productId: perfume._id,
                                action: 'add',
                                quantity: 1
                              });
                            }
                            window.dispatchEvent(new Event('cart-updated'));
                            setCartMsg(`Added 1 x ${perfume.name} to cart!`);
                            setShowCartMsg(true);
                            setTimeout(() => setShowCartMsg(false), 4000);
                          }}
                          aria-label={`Add ${perfume.name} to cart`}
                        >
                          Add to Cart 🛒
                        </button>
                      )}
                    </div>
                  );
                })}
              </Grid>
              {/* Infinite scroll: show skeletons at bottom only when loading and perfumes already exist */}
              {loading && perfumes.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center', marginTop: 16 }}>
                  {Array.from({ length: columnCount }).map((_, i) => (
                    <div
                      key={i}
                      className="perfume-card"
                      style={{
                        width: CARD_WIDTH,
                        height: CARD_HEIGHT,
                        margin: CARD_GAP / 2,
                        background: theme.palette.mode === 'dark' ? theme.palette.grey[900] : '#f3f4f6',
                        border: `1.5px solid ${theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#e0e7ef'}`,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        opacity: 0.7
                      }}
                      aria-hidden="true"
                    >
                      <div style={{ width: '100%', height: 140, background: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#e0e7ef', borderRadius: 8, marginBottom: 10, animation: 'pulse 1.2s infinite' }} />
                      <div style={{ height: 18, width: '70%', background: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#e0e7ef', borderRadius: 6, margin: '8px 0', animation: 'pulse 1.2s infinite' }} />
                      <div style={{ height: 14, width: '90%', background: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#e0e7ef', borderRadius: 6, margin: '6px 0', animation: 'pulse 1.2s infinite' }} />
                      <div style={{ height: 16, width: '40%', background: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#e0e7ef', borderRadius: 6, margin: '6px 0', animation: 'pulse 1.2s infinite' }} />
                      <div style={{ height: 18, width: '50%', background: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#e0e7ef', borderRadius: 6, margin: '6px 0', animation: 'pulse 1.2s infinite' }} />
                    </div>
                  ))}
                </div>
              )}
            </>
          ), [perfumes, columnCount, CARD_WIDTH, CARD_GAP, CARD_HEIGHT, rowCount, gridWidth, loading, theme.palette, openModal])}
          {/* Show end-of-list message if no more products to load and at least one product exists */}
          {!hasMore && perfumes.length > 0 && !loading && (
            <div style={{ textAlign: 'center', color: '#888', fontWeight: 600, margin: '32px 0 0 0', fontSize: '1.1rem' }}>
              You have reached the end of the collection.
            </div>
          )}
        </div>

        {/* Infinite scroll: no Load More button */}
        {/* {hasMore && currentSearch === "" && currentCategory === "all" && !loading && currentPage < MAX_PAGES && (
          <div className="load-more">
            <button className="load-more-btn" onClick={loadMore}>
              Load More
            </button>
          </div>
        )} */}
      </div>

      {/* Modal */}
      {selectedPerfume && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
            <div className="modal-header">
              <h2 className="modal-title" id="modalTitle">
                {selectedPerfume.name}
              </h2>
              <button className="close-btn" onClick={closeModal} aria-label="Close modal">
                &times;
              </button>
            </div>
            <div className="modal-content">
              <PerfumeImage
                src={selectedPerfume.images[modalImageIndex]}
                alt={selectedPerfume.name}
                className="modal-image"
                modal={true}
              />
              {/* Thumbnails gallery */}
              {selectedPerfume.images.length > 1 && (
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', margin: '12px 0' }}>
                  {selectedPerfume.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={getImageUrl(img)}
                      alt={`Thumbnail ${idx + 1}`}
                      style={{
                        width: 48,
                        height: 48,
                        objectFit: 'cover',
                        borderRadius: 6,
                        border: idx === modalImageIndex ? `2px solid ${theme.palette.primary.main}` : '1px solid #eee',
                        cursor: 'pointer',
                        opacity: idx === modalImageIndex ? 1 : 0.7,
                        boxShadow: idx === modalImageIndex ? `0 2px 8px ${theme.palette.primary.main}33` : 'none',
                        transition: 'border 0.2s, opacity 0.2s',
                      }}
                      onClick={() => setModalImageIndex(idx)}
                    />
                  ))}
                </div>
              )}
              <p>
                <strong>Description:</strong> {selectedPerfume.description}
              </p>
              <div className="modal-price">
                {modalPromo.promoActive ? (
                  <>
                    <span style={{ color: 'var(--jc-sale)', fontWeight: 700 }}>₦{modalPromo.displayPrice.toLocaleString()}</span>
                    <span style={{ textDecoration: 'line-through', color: 'var(--jc-text-secondary)', marginLeft: 8, fontSize: 15 }}>
                      ₦{selectedPerfume.price.toLocaleString()}</span>
                    {modalPromo.promoLabel && (
                      <span style={{ marginLeft: 10, color: 'var(--jc-success)', fontSize: 13, fontWeight: 600 }}>{modalPromo.promoLabel}</span>
                    )}
                  </>
                ) : (
                  <>₦{selectedPerfume.price.toLocaleString()}</>
                )}
              </div>
              <p className={`perfume-stock ${selectedPerfume.stock > 0 ? "stock-available" : "stock-out"}`}>
                {selectedPerfume.stock > 0
                  ? `In Stock: ${selectedPerfume.stock}`
                  : "Out of Stock"}
              </p>

              <div className="quantity-controls">
                <span>Quantity:</span>
                <button
                  className="quantity-btn"
                  onClick={() => changeQuantity(-1)}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <input
                  type="number"
                  className="quantity-input"
                  value={quantity}
                  readOnly
                  aria-live="polite"
                />
                <button
                  className="quantity-btn"
                  onClick={() => changeQuantity(1)}
                  disabled={quantity >= selectedPerfume.stock}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <div>
                <strong>Total: ₦{((modalPromo.promoActive ? modalPromo.displayPrice : selectedPerfume.price) * quantity).toLocaleString()}</strong>
              </div>

              <button
                className="add-to-cart-btn"
                onClick={() => addToCart(false)}
                disabled={selectedPerfume.stock === 0}
              >
                {selectedPerfume.stock === 0 ? "Out of Stock" : "Add to Cart 🛒"}
              </button>
              <button
                className="add-to-cart-btn alt"
                style={{ marginTop: 8 }}
                onClick={() => addToCart(true)}
                disabled={selectedPerfume.stock === 0}
              >
                {selectedPerfume.stock === 0 ? "Out of Stock" : "Buy Now & Go to Cart"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating cart message */}
      {showCartMsg && (
        <div
          className="cart-toast"
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            left: '50%',
            bottom: 28,
            transform: 'translateX(-50%)',
            zIndex: 3000,
            minWidth: 220,
            maxWidth: '90vw',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 4px 24px #000b'
              : '0 4px 24px #0002',
            background: theme.palette.mode === 'dark'
              ? theme.palette.grey[900]
              : theme.palette.primary.main,
            color: theme.palette.mode === 'dark'
              ? theme.palette.primary.light
              : theme.palette.primary.contrastText,
            borderRadius: 16,
            padding: '14px 28px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            fontSize: 17,
            fontWeight: 700,
            letterSpacing: '-0.5px',
            animation: 'cart-toast-fadein 0.3s',
          }}
        >
          <span style={{ fontSize: 22, marginRight: 8, lineHeight: 1 }} aria-hidden="true">🛒</span>
          <span style={{ flex: 1 }}>{cartMsg}</span>
          <button
            style={{
              background: 'none',
              border: 'none',
              color: theme.palette.mode === 'dark'
                ? theme.palette.primary.light
                : theme.palette.primary.contrastText,
              fontSize: 24,
              marginLeft: 8,
              cursor: 'pointer',
              fontWeight: 800,
              lineHeight: 1,
              borderRadius: 8,
              padding: 2,
              transition: 'background 0.18s',
            }}
            onClick={() => setShowCartMsg(false)}
            aria-label="Close notification"
            tabIndex={0}
          >
            ×
          </button>
          <style>{`
            @keyframes cart-toast-fadein {
              from { opacity: 0; transform: translateY(30px) scale(0.98); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
            .cart-toast {
              transition: background 0.2s, color 0.2s;
            }
          `}</style>
        </div>
      )}
    </>
  );
};

export default PerfumeCollection;
