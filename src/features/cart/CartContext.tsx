import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import { cartReducer, initialCartState, type CartAction } from './cartReducer';
import { storageUtils } from '../../utils/storageUtils';
import type { CartState } from '../../types';

interface CartContextValue extends CartState {
  dispatch: React.Dispatch<CartAction>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);

  useEffect(() => {
    const saved = storageUtils.loadCart();
    if (saved) {
      dispatch({ type: 'RESTORE_CART', payload: saved });
    }
  }, []);

  useEffect(() => {
    storageUtils.saveCart(state);
  }, [state]);

  return (
    <CartContext.Provider value={{ ...state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
}
