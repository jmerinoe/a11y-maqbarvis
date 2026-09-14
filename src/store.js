// store.js — in-memory state with lightweight pub/sub

const state = {
  route: 'home',
  language: 'es',
  moderatorMode: false,
  cart: [],
  filters: { sizes: [], colors: [] },
  searchQuery: '',
};

const listeners = new Set();

export function getState() {
  return state;
}

export function setState(patch) {
  Object.assign(state, patch);
  listeners.forEach((fn) => fn(state));
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function notify() {
  listeners.forEach((fn) => fn(state));
}

// --- Cart helpers ---

export function addToCart(productId, size, color) {
  const existing = state.cart.find(
    (item) => item.productId === productId && item.size === size && item.color === color
  );
  if (existing) {
    existing.quantity += 1;
  } else {
    state.cart.push({ productId, size, color, quantity: 1 });
  }
  notify();
}

export function updateCartQuantity(index, quantity) {
  if (quantity <= 0) {
    state.cart.splice(index, 1);
  } else {
    state.cart[index].quantity = quantity;
  }
  notify();
}

export function removeFromCart(index) {
  state.cart.splice(index, 1);
  notify();
}

export function clearCart() {
  state.cart = [];
  notify();
}
