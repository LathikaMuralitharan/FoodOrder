import type { CartState } from '../types';

const CART_KEY = 'foodorder_cart';
const AUTH_KEY = 'auth_token';

export const storageUtils = {
  saveCart(cart: CartState): void {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      // Storage quota exceeded — fail silently
    }
  },

  loadCart(): CartState | null {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as CartState;
      if (!Array.isArray(parsed.items)) return null;
      return parsed;
    } catch {
      return null; // corrupt JSON
    }
  },

  clearCart(): void {
    localStorage.removeItem(CART_KEY);
  },

  saveToken(token: string): void {
    localStorage.setItem(AUTH_KEY, token);
  },

  loadToken(): string | null {
    return localStorage.getItem(AUTH_KEY);
  },

  clearToken(): void {
    localStorage.removeItem(AUTH_KEY);
  },
};
