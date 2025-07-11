// Utility functions for managing the shopping cart in localStorage

const CART_KEY = 'jc_closet_cart';

// Get all items in the cart
export function getCart() {
  const cart = localStorage.getItem(CART_KEY);
  return cart ? JSON.parse(cart) : [];
}

// Add an item to the cart
export function addToCart(item) {
  const cart = getCart();
  const existing = cart.find((i) => i._id === item._id);
  if (existing) {
    existing.quantity += item.quantity || 1;
  } else {
    cart.push({ ...item, quantity: item.quantity || 1 });
  }
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// Remove an item from the cart by its ID
export function removeFromCart(itemId) {
  const cart = getCart().filter((item) => item._id !== itemId);
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// Update an item's quantity or other properties in the cart
export function updateCartItem(itemId, updates) {
  const cart = getCart().map((item) =>
    item._id === itemId ? { ...item, ...updates } : item
  );
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// Clear the entire cart
export function clearCart() {
  localStorage.removeItem(CART_KEY);
}

// Get the total price of items in the cart
export function getCartTotal() {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Set the entire cart (for bulk updates)
export function setCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}
