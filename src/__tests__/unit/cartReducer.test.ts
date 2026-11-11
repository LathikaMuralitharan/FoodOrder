import { describe, it, expect } from 'vitest';
import { cartReducer, initialCartState, recomputeTotals } from '../../features/cart/cartReducer';
import type { MenuItem, CartState } from '../../types';

const makeItem = (id: string, price: number, available = true): MenuItem => ({
  id, restaurantId: 'r1', name: `Item ${id}`, description: '', price,
  imageUrl: '', category: 'Mains', allergens: [], isAvailable: available,
});

const makeCart = (items: { item: MenuItem; quantity: number }[]): CartState => ({
  items, restaurantId: 'r1', restaurantName: 'Test', discount: 0,
  subtotal: items.reduce((s, ci) => s + ci.item.price * ci.quantity, 0),
  total: items.reduce((s, ci) => s + ci.item.price * ci.quantity, 0),
});

describe('cartReducer ADD_ITEM', () => {
  it('adds new item with quantity 1', () => {
    const item = makeItem('m1', 10);
    const state = cartReducer(initialCartState, {
      type: 'ADD_ITEM', payload: { item, restaurantId: 'r1', restaurantName: 'Test' },
    });
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(1);
    expect(state.subtotal).toBe(10);
    expect(state.total).toBe(10);
  });

  it('increments quantity for existing item', () => {
    const item = makeItem('m1', 10);
    let state = cartReducer(initialCartState, {
      type: 'ADD_ITEM', payload: { item, restaurantId: 'r1', restaurantName: 'Test' },
    });
    state = cartReducer(state, {
      type: 'ADD_ITEM', payload: { item, restaurantId: 'r1', restaurantName: 'Test' },
    });
    expect(state.items[0].quantity).toBe(2);
    expect(state.subtotal).toBe(20);
  });

  it('caps quantity at 99', () => {
    const item = makeItem('m1', 10);
    let state = makeCart([{ item, quantity: 99 }]);
    state = cartReducer(state, {
      type: 'ADD_ITEM', payload: { item, restaurantId: 'r1', restaurantName: 'Test' },
    });
    expect(state.items[0].quantity).toBe(99);
  });

  it('rejects unavailable item', () => {
    const item = makeItem('m1', 10, false);
    const state = cartReducer(initialCartState, {
      type: 'ADD_ITEM', payload: { item, restaurantId: 'r1', restaurantName: 'Test' },
    });
    expect(state.items).toHaveLength(0);
    expect(state.subtotal).toBe(0);
  });
});

describe('cartReducer REMOVE_ITEM', () => {
  it('removes item completely', () => {
    const item = makeItem('m1', 10);
    const state = makeCart([{ item, quantity: 3 }]);
    const newState = cartReducer(state, { type: 'REMOVE_ITEM', payload: { itemId: 'm1' } });
    expect(newState.items).toHaveLength(0);
    expect(newState.subtotal).toBe(0);
  });
});

describe('cartReducer UPDATE_QUANTITY', () => {
  it('updates to valid quantity', () => {
    const item = makeItem('m1', 10);
    const state = makeCart([{ item, quantity: 1 }]);
    const newState = cartReducer(state, { type: 'UPDATE_QUANTITY', payload: { itemId: 'm1', quantity: 5 } });
    expect(newState.items[0].quantity).toBe(5);
    expect(newState.subtotal).toBe(50);
  });

  it('removes item when quantity is 0', () => {
    const item = makeItem('m1', 10);
    const state = makeCart([{ item, quantity: 3 }]);
    const newState = cartReducer(state, { type: 'UPDATE_QUANTITY', payload: { itemId: 'm1', quantity: 0 } });
    expect(newState.items).toHaveLength(0);
  });

  it('clamps to 99', () => {
    const item = makeItem('m1', 10);
    const state = makeCart([{ item, quantity: 1 }]);
    const newState = cartReducer(state, { type: 'UPDATE_QUANTITY', payload: { itemId: 'm1', quantity: 100 } });
    expect(newState.items[0].quantity).toBe(99);
  });

  it('clamps to 1', () => {
    const item = makeItem('m1', 10);
    const state = makeCart([{ item, quantity: 5 }]);
    const newState = cartReducer(state, { type: 'UPDATE_QUANTITY', payload: { itemId: 'm1', quantity: -1 } });
    expect(newState.items[0].quantity).toBe(1);
  });
});

describe('cartReducer APPLY_DISCOUNT', () => {
  it('applies valid discount', () => {
    const item = makeItem('m1', 100);
    const state = makeCart([{ item, quantity: 1 }]);
    const newState = cartReducer(state, { type: 'APPLY_DISCOUNT', payload: { discount: 20 } });
    expect(newState.discount).toBe(20);
    expect(newState.total).toBe(80);
  });

  it('total never goes below 0', () => {
    const item = makeItem('m1', 10);
    const state = makeCart([{ item, quantity: 1 }]);
    const newState = cartReducer(state, { type: 'APPLY_DISCOUNT', payload: { discount: 50 } });
    expect(newState.total).toBe(0);
  });
});

describe('cartReducer CLEAR_CART', () => {
  it('resets to empty state', () => {
    const item = makeItem('m1', 10);
    const state = makeCart([{ item, quantity: 3 }]);
    const newState = cartReducer(state, { type: 'CLEAR_CART' });
    expect(newState.items).toHaveLength(0);
    expect(newState.subtotal).toBe(0);
    expect(newState.total).toBe(0);
    expect(newState.restaurantId).toBeNull();
  });
});

describe('cartReducer RESTORE_CART', () => {
  it('restores and recomputes totals', () => {
    const item = makeItem('m1', 10);
    const saved: CartState = {
      items: [{ item, quantity: 2 }], restaurantId: 'r1', restaurantName: 'Test',
      discount: 5, subtotal: 0, total: 0,
    };
    const newState = cartReducer(initialCartState, { type: 'RESTORE_CART', payload: saved });
    expect(newState.subtotal).toBe(20);
    expect(newState.total).toBe(15);
  });
});

describe('recomputeTotals', () => {
  it('subtotal = sum of price * quantity', () => {
    const i1 = makeItem('m1', 10);
    const i2 = makeItem('m2', 5);
    const state = recomputeTotals({
      items: [{ item: i1, quantity: 2 }, { item: i2, quantity: 3 }],
      restaurantId: 'r1', restaurantName: 'Test', discount: 0, subtotal: 0, total: 0,
    });
    expect(state.subtotal).toBe(35);
    expect(state.total).toBe(35);
  });

  it('total = subtotal - discount, no delivery fee', () => {
    const item = makeItem('m1', 50);
    const state = recomputeTotals({
      items: [{ item, quantity: 1 }], restaurantId: null, restaurantName: null, discount: 10, subtotal: 0, total: 0,
    });
    expect(state.subtotal).toBe(50);
    expect(state.total).toBe(40);
  });
});

