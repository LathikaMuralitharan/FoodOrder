import type { CartState, CartItem, MenuItem } from '../../types';

export type CartAction =
  | { type: 'ADD_ITEM'; payload: { item: MenuItem; restaurantId: string; restaurantName: string; quantity?: number } }
  | { type: 'REMOVE_ITEM'; payload: { itemId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { itemId: string; quantity: number } }
  | { type: 'APPLY_DISCOUNT'; payload: { discount: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'RESTORE_CART'; payload: CartState };

export const initialCartState: CartState = {
  items: [],
  restaurantId: null,
  restaurantName: null,
  discount: 0,
  subtotal: 0,
  total: 0,
};

export function recomputeTotals(state: CartState): CartState {
  const subtotal = state.items.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0);
  const discount = state.discount ?? 0;
  const total = Math.max(subtotal - discount, 0);
  return { ...state, subtotal, total };
}

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { item, restaurantId, restaurantName, quantity = 1 } = action.payload;
      if (!item.isAvailable) return state;
      const addQty = Math.min(Math.max(quantity, 1), 99);
      const existing = state.items.find(ci => ci.item.id === item.id);
      let updatedItems: CartItem[];
      if (existing) {
        updatedItems = state.items.map(ci =>
          ci.item.id === item.id
            ? { ...ci, quantity: Math.min(ci.quantity + addQty, 99) }
            : ci
        );
      } else {
        updatedItems = [...state.items, { item, quantity: addQty }];
      }
      return recomputeTotals({ ...state, items: updatedItems, restaurantId, restaurantName });
    }
    case 'REMOVE_ITEM': {
      const updatedItems = state.items.filter(ci => ci.item.id !== action.payload.itemId);
      return recomputeTotals({ ...state, items: updatedItems });
    }
    case 'UPDATE_QUANTITY': {
      const { itemId, quantity } = action.payload;
      if (quantity === 0) {
        const updatedItems = state.items.filter(ci => ci.item.id !== itemId);
        return recomputeTotals({ ...state, items: updatedItems });
      }
      const clampedQty = Math.min(Math.max(Math.floor(quantity), 1), 99);
      const updatedItems = state.items.map(ci =>
        ci.item.id === itemId ? { ...ci, quantity: clampedQty } : ci
      );
      return recomputeTotals({ ...state, items: updatedItems });
    }
    case 'APPLY_DISCOUNT': {
      const discount = Math.max(action.payload.discount, 0);
      return recomputeTotals({ ...state, discount });
    }
    case 'CLEAR_CART':
      return { items: [], restaurantId: null, restaurantName: null, discount: 0, subtotal: 0, total: 0 };
    case 'RESTORE_CART':
      return recomputeTotals(action.payload);
    default:
      return state;
  }
}
