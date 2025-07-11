import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import * as api from '../utils/api';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardMedia, 
  CardContent, 
  CircularProgress, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  IconButton, 
  Stack, 
  Button, 
  TextField, 
  Chip 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { addToCart } from '../utils/cart';

const CATEGORY_OPTIONS = [
  'all', 'men', 'women', 'luxury', 'arab', 'designer', 'affordable'
];

// iPhone 6 optimized styles - smaller dimensions and simplified animations
const STYLES = {
  container: { 
	minHeight: '80vh', 
	py: 3, // Reduced padding
	background: 'linear-gradient(90deg, #f8fafc 0%, #e0e7ef 100%)' 
  },
  searchField: { 
	width: { xs: '90%', sm: 320 }, // Smaller on mobile
	maxWidth: 320,
	background: '#fff', 
	borderRadius: 2 
  },
  categoryBox: {
	display: 'flex',
	mb: 2,
	gap: 0.5, // Reduced gap
	overflowX: 'auto',
	scrollbarWidth: 'none',
	'&::-webkit-scrollbar': { display: 'none' },
	px: 1,
	width: '100%',
	minHeight: 36, // Reduced height
  },
  categoryItem: {
	px: 1.5, // Reduced padding
	pb: 0.5,
	fontWeight: 600, // Reduced font weight
	cursor: 'pointer',
	fontSize: { xs: 12, sm: 14 }, // Smaller font
	transition: 'border 0.2s, color 0.2s',
	minWidth: 50, // Reduced min width
	textAlign: 'center',
	whiteSpace: 'nowrap',
  },
  // iPhone 6 optimized card - smaller and simpler
  cardBase: {
	width: { xs: 140, sm: 160 }, // Smaller on iPhone 6
	minWidth: { xs: 140, sm: 160 },
	maxWidth: { xs: 140, sm: 160 },
	borderRadius: 2, // Reduced border radius
	boxShadow: 2, // Reduced shadow
	transition: 'transform 0.15s', // Simplified transition
	background: 'rgba(255,255,255,0.95)',
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'stretch',
	height: 'auto',
  },
  cardMedia: {
	objectFit: 'cover', 
	borderRadius: 1, 
	mb: 0.5, 
	width: '98%', 
	height: { xs: 120, sm: 140 }, // Smaller images
	position: 'relative', 
	margin: '0 auto'
  },
  cardContent: {
	p: 0.75, // Reduced padding
	flex: 1, 
	display: 'flex', 
	flexDirection: 'column', 
	justifyContent: 'space-between'
  },
  descriptionText: {
	minHeight: 24, // Reduced height
	maxHeight: 24, 
	overflow: 'hidden', 
	textOverflow: 'ellipsis', 
	fontSize: { xs: 11, sm: 12 } // Smaller font
  },
  categoryChip: {
	fontSize: { xs: 9, sm: 10 }, // Smaller font
	background: '#e0e7ef',
	height: 18 // Smaller chip
  },
  modalPaper: {
	maxWidth: { xs: '98vw', md: 700 }, // Smaller modal
	width: '100%',
	m: { xs: 1, md: 2 },
	borderRadius: { xs: 2, md: 3 },
	height: { xs: '96vh', md: 'auto' },
	maxHeight: { xs: '96vh', md: '90vh' },
	display: 'flex',
	flexDirection: 'column',
	background: 'rgba(255,255,255,0.98)',
  },
  modalContent: {
	p: { xs: 1.5, md: 3 },
	width: '100%',
	minHeight: { xs: 'auto', md: 300 },
	maxHeight: { xs: 'calc(96vh - 80px)', md: '80vh' },
	overflowY: 'auto',
	display: 'flex',
	flexDirection: { xs: 'column', md: 'row' },
	gap: { xs: 2, md: 3 },
	alignItems: { xs: 'center', md: 'flex-start' },
  }
};

// Simplified promo calculation without caching for better iPhone 6 performance
const calculatePromo = (perfume) => {
  const now = new Date();
  let result = {
	promoActive: false,
	promoLabel: '',
	displayPrice: perfume.price
  };
  
  if (
	perfume.promoEnabled &&
	perfume.promoValue &&
	perfume.promoStart &&
	perfume.promoEnd &&
	new Date(perfume.promoStart) <= now &&
	new Date(perfume.promoEnd) >= now
  ) {
	result.promoActive = true;
	if (perfume.promoType === 'discount') {
	  result.displayPrice = Math.round(perfume.price * (1 - perfume.promoValue / 100));
	  result.promoLabel = `-${perfume.promoValue}% off`;
	} else if (perfume.promoType === 'price') {
	  result.displayPrice = perfume.promoValue;
	  result.promoLabel = 'Promo Price';
	}
  }
  
  return result;
};

// Simplified perfume card without framer-motion for better iPhone 6 performance
const PerfumeCard = React.memo(({ perfume, onOpenModal }) => {
  const mainImg = perfume.images && perfume.images[perfume.mainImageIndex || 0];
  const { promoActive, promoLabel, displayPrice } = calculatePromo(perfume);
  const isInStock = perfume.stock > 0;

  const handleClick = useCallback(() => {
	if (isInStock) onOpenModal(perfume);
  }, [isInStock, onOpenModal, perfume]);

  const cardStyle = useMemo(() => ({
	...STYLES.cardBase,
	cursor: isInStock ? 'pointer' : 'not-allowed',
	opacity: isInStock ? 1 : 0.6,
	'&:hover': isInStock ? { 
	  transform: 'translateY(-2px)', // Simplified hover effect
	  boxShadow: 3 
	} : {},
  }), [isInStock]);

  return (
	<Grid item xs={6} sm={4} md={3} lg={2.4} xl={2} sx={{ display: 'flex', justifyContent: 'center' }}>
	  <Card sx={cardStyle} onClick={handleClick}>
		{mainImg && (
		  <CardMedia
			component="img"
			loading="lazy"
			image={mainImg}
			alt={perfume.name}
			sx={STYLES.cardMedia}
		  />
		)}
		<CardContent sx={STYLES.cardContent}>
		  <Typography 
			variant="subtitle2" 
			fontWeight={600} 
			mb={0.25} 
			noWrap
			sx={{ fontSize: { xs: 12, sm: 14 } }}
		  >
			{perfume.name}
		  </Typography>
		  <Typography 
			variant="body2" 
			color="text.secondary" 
			mb={0.5} 
			sx={STYLES.descriptionText}
		  >
			{perfume.description}
		  </Typography>
		  
		  {perfume.categories && perfume.categories.length > 0 && (
			<Stack direction="row" spacing={0.25} mb={0.5} flexWrap="wrap">
			  {perfume.categories.slice(0, 1).map(cat => ( // Only show 1 category on mobile
				<Chip 
				  key={cat} 
				  label={cat.charAt(0).toUpperCase() + cat.slice(1)} 
				  size="small" 
				  sx={STYLES.categoryChip}
				/>
			  ))}
			</Stack>
		  )}
		  
		  <Stack direction="row" alignItems="center" spacing={0.25} mb={0.5} flexWrap="wrap">
			{promoActive ? (
			  <>
				<Typography 
				  variant="subtitle2" 
				  color="primary.main" 
				  fontWeight={600}
				  sx={{ fontSize: { xs: 11, sm: 13 } }}
				>
				  ₦{displayPrice && displayPrice.toLocaleString()}
				</Typography>
				<Typography 
				  variant="caption" 
				  color="text.secondary" 
				  sx={{ 
					textDecoration: 'line-through',
					fontSize: { xs: 9, sm: 11 }
				  }}
				>
				  ₦{perfume.price && perfume.price.toLocaleString()}
				</Typography>
			  </>
			) : (
			  <Typography 
				variant="subtitle2" 
				color="primary.main" 
				fontWeight={600}
				sx={{ fontSize: { xs: 11, sm: 13 } }}
			  >
				₦{perfume.price && perfume.price.toLocaleString()}
			  </Typography>
			)}
		  </Stack>
		  
		  <Typography 
			variant="caption" 
			color={isInStock ? 'success.main' : 'error.main'} 
			fontWeight={500}
			sx={{ fontSize: { xs: 9, sm: 10 } }}
		  >
			{isInStock ? `Stock: ${perfume.stock}` : 'Out of Stock'}
		  </Typography>
		</CardContent>
	  </Card>
	</Grid>
  );
});

PerfumeCard.displayName = 'PerfumeCard';

const Perfumes = () => {
  const [perfumes, setPerfumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [errorDialog, setErrorDialog] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const searchTimeoutRef = useRef(null);
  const lastFetchRef = useRef(0);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  useEffect(() => {
	if (searchTimeoutRef.current) {
	  clearTimeout(searchTimeoutRef.current);
	}
	searchTimeoutRef.current = setTimeout(() => {
	  setDebouncedSearch(search);
	}, 500); // Increased debounce for slower devices
	
	return () => {
	  if (searchTimeoutRef.current) {
		clearTimeout(searchTimeoutRef.current);
	  }
	};
  }, [search]);

  // Reduced fetch frequency for iPhone 6
  const fetchPerfumes = useCallback(async (pageNum, append) => {
	if (pageNum === undefined) pageNum = 1;
	if (append === undefined) append = false;
	
	const now = Date.now();
	if (now - lastFetchRef.current < 1000) return; // Increased delay
	lastFetchRef.current = now;

	setLoading(true);
	try {
	  const res = await api.get('/perfumes?page=' + pageNum + '&limit=12'); // Reduced limit
	  const data = res.data || [];
	  setPerfumes(function(prev) {
		return append ? prev.concat(data) : data;
	  });
	  setHasMore(data.length === 12);
	  setCurrentPage(pageNum);
	} catch (error) {
	  setErrorDialog('Network error: Unable to load perfumes. Please check your connection and try again.');
	} finally {
	  setLoading(false);
	}
  }, []);

  useEffect(() => {
	fetchPerfumes(1, false);
  }, [fetchPerfumes]);

  const handleOpenModal = useCallback((perfume) => {
	setSelected(perfume);
	setQuantity(1);
	setSelectedImageIndex(perfume.mainImageIndex || 0);
	setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
	setModalOpen(false);
	setSelected(null);
	setSelectedImageIndex(0);
  }, []);

  const handleQuantityChange = useCallback((val) => {
	setQuantity(function(prev) {
	  if (!selected || !selected.stock) return 1;
	  const next = prev + val;
	  return Math.max(1, Math.min(next, selected.stock));
	});
  }, [selected]);

  const handleAddToCart = useCallback(() => {
	if (!selected) return;
	addToCart({
	  _id: selected._id,
	  name: selected.name,
	  price: selected.price,
	  description: selected.description,
	  images: selected.images,
	  quantity: quantity,
	  mainImageIndex: selectedImageIndex,
	  stock: selected.stock
	});
	
	// Dispatch cart update event
	if (window.dispatchEvent) {
	  window.dispatchEvent(new Event('cart-updated'));
	}
	setModalOpen(false);
  }, [selected, quantity, selectedImageIndex]);

  const handleLoadMore = useCallback(() => {
	fetchPerfumes(currentPage + 1, true);
  }, [currentPage, fetchPerfumes]);

  const handleSearchChange = useCallback((e) => {
	setSearch(e.target.value);
  }, []);

  const handleCloseError = useCallback(() => {
	setErrorDialog(null);
  }, []);

  // Simplified filtering for better performance
  const filteredPerfumes = useMemo(() => {
	const searchTerm = debouncedSearch.trim().toLowerCase();
	
	return perfumes.filter(function(p) {
	  // Category filter
	  if (categoryFilter !== 'all' && (!p.categories || p.categories.indexOf(categoryFilter) === -1)) {
		return false;
	  }
	  
	  // Search filter
	  if (searchTerm) {
		const nameMatch = p.name && p.name.toLowerCase().indexOf(searchTerm) !== -1;
		const descMatch = p.description && p.description.toLowerCase().indexOf(searchTerm) !== -1;
		if (!nameMatch && !descMatch) {
		  return false;
		}
	  }
	  
	  return true;
	});
  }, [perfumes, categoryFilter, debouncedSearch]);

  const selectedPromo = useMemo(() => {
	return selected ? calculatePromo(selected) : null;
  }, [selected]);

  const handleCategoryClick = useCallback((cat) => {
	setCategoryFilter(cat);
  }, []);

  // Simplified category rendering
  const categoryItems = CATEGORY_OPTIONS.map(function(cat) {
	const isActive = categoryFilter === cat;
	const categoryStyle = {
	  ...STYLES.categoryItem,
	  borderBottom: isActive ? '2px solid #1976d2' : '2px solid transparent',
	  color: isActive ? 'primary.main' : 'text.primary',
	};

	return (
	  <Box
		key={cat}
		sx={categoryStyle}
		onClick={() => handleCategoryClick(cat)}
	  >
		{cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
	  </Box>
	);
  });

  return (
	<Box sx={STYLES.container}>
	  <Typography 
		variant="h5" 
		fontWeight={600} 
		textAlign="center" 
		mb={2}
		sx={{ fontSize: { xs: 20, sm: 24 } }}
	  >
		Perfumes Collection
	  </Typography>
	  
	  {/* Search bar */}
	  <Box display="flex" justifyContent="center" mb={2}>
		<TextField
		  value={search}
		  onChange={handleSearchChange}
		  placeholder="Search perfumes..."
		  variant="outlined"
		  size="small"
		  sx={STYLES.searchField}
		  inputProps={{ style: { fontSize: 14 } }}
		/>
	  </Box>
	  
	  {/* Category row */}
	  <Box sx={STYLES.categoryBox}>
		{categoryItems}
	  </Box>
	  
	  {loading && currentPage === 1 ? (
		<Box display="flex" minHeight={100} justifyContent="center" alignItems="center">
		  <CircularProgress size={32} />
		</Box>
	  ) : (
		<Grid container spacing={1.5} justifyContent="center" sx={{ px: 1 }}>
		  {filteredPerfumes.length === 0 ? (
			<Typography 
			  variant="h6" 
			  color="text.secondary" 
			  textAlign="center" 
			  width="100%"
			  sx={{ fontSize: { xs: 16, sm: 20 } }}
			>
			  No perfumes found.
			</Typography>
		  ) : (
			filteredPerfumes.map(function(perfume) {
			  return (
				<PerfumeCard
				  key={perfume._id}
				  perfume={perfume}
				  onOpenModal={handleOpenModal}
				/>
			  );
			})
		  )}
		</Grid>
	  )}
	  
	  {/* Load More button */}
	  {!loading && hasMore && (
		<Box display="flex" justifyContent="center" mt={3}>
		  <Button
			variant="outlined"
			color="primary"
			onClick={handleLoadMore}
			sx={{ 
			  fontWeight: 500, 
			  px: 3, 
			  py: 1, 
			  borderRadius: 2,
			  fontSize: { xs: 14, sm: 16 }
			}}
		  >
			Load More
		  </Button>
		</Box>
	  )}
	  
	  {/* Modal for perfume details */}
	  {modalOpen && selected && (
		<Dialog
		  open={modalOpen}
		  onClose={handleCloseModal}
		  maxWidth="md"
		  fullWidth
		  PaperProps={{ sx: STYLES.modalPaper }}
		>
		  <DialogTitle sx={{ 
			display: 'flex', 
			justifyContent: 'space-between', 
			alignItems: 'center', 
			fontSize: { xs: 18, md: 24 }, 
			pr: 1,
			pb: 1
		  }}>
			{selected.name}
			<IconButton 
			  onClick={handleCloseModal} 
			  sx={{ 
				color: 'black', 
				backgroundColor: 'white', 
				'&:hover': { backgroundColor: '#f0f0f0' },
				ml: 1
			  }} 
			  size="small"
			>
			  <CloseIcon />
			</IconButton>
		  </DialogTitle>
		  <DialogContent sx={STYLES.modalContent}>
			<Box flexShrink={0} sx={{ 
			  display: 'flex', 
			  flexDirection: 'column', 
			  alignItems: 'center', 
			  minWidth: { md: 200 } 
			}}>
			  {selected.images && selected.images[selectedImageIndex] && (
				<img
				  src={selected.images[selectedImageIndex]}
				  alt={selected.name}
				  loading="lazy"
				  style={{ 
					width: '100%', 
					maxWidth: 180, 
					height: 200, 
					objectFit: 'cover', 
					borderRadius: 8, 
					boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
				  }}
				/>
			  )}
			  <Stack direction="row" spacing={0.5} mt={1.5} justifyContent="center" flexWrap="wrap">
				{selected.images && selected.images.map(function(img, idx) {
				  return (
					<Box 
					  key={idx}
					  sx={{ 
						border: idx === selectedImageIndex ? '2px solid #1976d2' : '1px solid #eee', 
						borderRadius: 1, 
						p: 0.25, 
						cursor: 'pointer', 
						transition: 'border 0.2s' 
					  }} 
					  onClick={() => setSelectedImageIndex(idx)}
					>
					  <img 
						src={img} 
						alt={selected.name + '-' + idx} 
						loading="lazy" 
						style={{ 
						  width: 36, 
						  height: 36, 
						  objectFit: 'cover', 
						  borderRadius: 4, 
						  opacity: idx === selectedImageIndex ? 1 : 0.7, 
						  transition: 'opacity 0.2s' 
						}} 
					  />
					</Box>
				  );
				})}
			  </Stack>
			</Box>
			
			<Box flex={1} minWidth={0} sx={{ mt: { xs: 2, md: 0 } }}>
			  <Typography variant="subtitle2" fontWeight={600} mb={0.5}>Description</Typography>
			  <Typography variant="body2" mb={1.5} sx={{ fontSize: { xs: 13, sm: 14 } }}>
				{selected.description}
			  </Typography>
			  
			  <Typography variant="subtitle2" fontWeight={600}>Price</Typography>
			  {selectedPromo && selectedPromo.promoActive ? (
				<Stack direction="row" alignItems="center" spacing={1} mb={1} flexWrap="wrap">
				  <Typography variant="h6" color="primary.main" sx={{ fontSize: { xs: 16, sm: 20 } }}>
					₦{selectedPromo.displayPrice && selectedPromo.displayPrice.toLocaleString()}
				  </Typography>
				  <Typography 
					variant="body2" 
					color="text.secondary" 
					sx={{ 
					  textDecoration: 'line-through',
					  fontSize: { xs: 12, sm: 14 }
					}}
				  >
					₦{selected.price && selected.price.toLocaleString()}
				  </Typography>
				  <Typography variant="caption" color="error.main" sx={{ fontSize: { xs: 10, sm: 12 } }}>
					{selectedPromo.promoLabel}
				  </Typography>
				</Stack>
			  ) : (
				<Typography variant="h6" color="primary.main" mb={1.5} sx={{ fontSize: { xs: 16, sm: 20 } }}>
				  ₦{selected.price && selected.price.toLocaleString()}
				</Typography>
			  )}
			  
			  <Typography 
				variant="body2" 
				color={selected.stock > 0 ? 'success.main' : 'error.main'} 
				fontWeight={500} 
				mb={1.5}
				sx={{ fontSize: { xs: 12, sm: 14 } }}
			  >
				{selected.stock > 0 ? 'In Stock: ' + selected.stock : 'Out of Stock'}
			  </Typography>
			  
			  <Box display="flex" alignItems="center" gap={1.5} mb={1.5} flexWrap="wrap">
				<Typography fontWeight={500} sx={{ fontSize: { xs: 13, sm: 15 } }}>Quantity:</Typography>
				<Button 
				  variant="outlined" 
				  size="small" 
				  onClick={() => handleQuantityChange(-1)} 
				  disabled={quantity <= 1} 
				  sx={{ minWidth: 32, fontSize: 18, px: 0 }}
				>
				  -
				</Button>
				<TextField 
				  value={quantity} 
				  size="small" 
				  inputProps={{ 
					style: { textAlign: 'center', width: 32, fontSize: 14 },
					readOnly: true
				  }} 
				  sx={{ width: 50 }} 
				/>
				<Button 
				  variant="outlined" 
				  size="small" 
				  onClick={() => handleQuantityChange(1)} 
				  disabled={quantity >= (selected.stock || 1)} 
				  sx={{ minWidth: 32, fontSize: 18, px: 0 }}
				>
				  +
				</Button>
			  </Box>
			  
			  <Typography 
				variant="subtitle1" 
				fontWeight={600} 
				mb={2} 
				color="primary.main"
				sx={{ fontSize: { xs: 14, sm: 16 } }}
			  >
				Total: ₦{((selectedPromo && selectedPromo.promoActive ? selectedPromo.displayPrice : selected.price) * quantity).toLocaleString()}
			  </Typography>
			  
			  <Button
				variant="contained"
				color="primary"
				startIcon={<ShoppingCartIcon />}
				fullWidth
				sx={{ 
				  fontWeight: 600, 
				  py: 1, 
				  fontSize: { xs: 14, sm: 16 }, 
				  boxShadow: 2, 
				  borderRadius: 2 
				}}
				onClick={handleAddToCart}
				disabled={selected.stock === 0 || quantity > selected.stock}
			  >
				{selected.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
			  </Button>
			</Box>
		  </DialogContent>
		</Dialog>
	  )}
	  
	  {/* Error Dialog */}
	  <Dialog open={!!errorDialog} onClose={handleCloseError}>
		<DialogTitle sx={{ fontSize: { xs: 16, sm: 20 } }}>Error</DialogTitle>
		<DialogContent>
		  <Typography sx={{ fontSize: { xs: 13, sm: 14 } }}>{errorDialog}</Typography>
		</DialogContent>
		<Box display="flex" justifyContent="flex-end" p={2}>
		  <Button 
			onClick={handleCloseError} 
			color="primary" 
			variant="contained"
			sx={{ fontSize: { xs: 13, sm: 14 } }}
		  >
			Close
		  </Button>
		</Box>
	  </Dialog>
	</Box>
  );
};

export default Perfumes;