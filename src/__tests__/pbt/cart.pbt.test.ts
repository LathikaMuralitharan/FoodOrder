import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { cartReducer, initialCartState } from '../../features/cart/cartReducer';
import {
  menuItemArbitrary,
  availableMenuItemArbitrary,
  cartArbitrary,
} from './arbitraries';

describe('Cart PBT', () => {
  // P1: Price >= 0 for all generated items
  it('P1: price is always >= 0 for any generated MenuItem', () => {
    fc.assert(
      fc.property(menuItemArbitrary, (item) => {
        expect(item.price).toBeGreaterThanOrEqual(0);
      }),
      { numRuns: 100 }
    );
  });

  // P3: Quantity 1-99 after add
  it('P3: all quantities are 1-99 after ADD_ITEM', () => {
    fc.assert(
      fc.property(availableMenuItemArbitrary, (item) => {
        const state = cartReducer(initialCartState, {
          type: 'ADD_ITEM',
          payload: { item, restaurantId: 'r1', restaurantName: 'Test' },
        });
        return state.items.every(ci => ci.quantity >= 1 && ci.quantity <= 99);
      }),
      { numRuns: 100 }
    );
  });

  // P5: Addition count invariant
  it('P5: adding N distinct items yields N items in cart', () => {
    fc.assert(
      fc.property(
        fc.array(availableMenuItemArbitrary, { minLength: 1, maxLength: 15 }),
        (items) => {
          const unique = Array.from(new Map(items.map(i => [i.id, i])).values());
          let state = cartReducer(initialCartState, { type: 'CLEAR_CART' });
          for (const item of unique) {
            state = cartReducer(state, {
              type: 'ADD_ITEM',
              payload: { item, restaurantId: 'r1', restaurantName: 'Test' },
            });
          }
          return state.items.length === unique.length;
        }
      ),
      { numRuns: 100 }
    );
  });

  // P7: Cart subtotal = sum of (price x quantity)
  it('P7: subtotal equals sum of price x quantity for all items', () => {
    fc.assert(
      fc.property(cartArbitrary, (cart) => {
        const expected = cart.items.reduce((s, ci) => s + ci.item.price * ci.quantity, 0);
        expect(Math.abs(cart.subtotal - expected)).toBeLessThan(0.01);
      }),
      { numRuns: 100 }
    );
  });

  // P8: total = subtotal when discount = 0
  it('P8: total equals subtotal when discount is 0', () => {
    fc.assert(
      fc.property(cartArbitrary, (cart) => {
        expect(Math.abs(cart.total - cart.subtotal)).toBeLessThan(0.01);
      }),
      { numRuns: 100 }
    );
  });

  // P9/P10: Remove item leaves item absent
  it('P9/P10: item absent after REMOVE_ITEM regardless of quantity', () => {
    fc.assert(
      fc.property(
        cartArbitrary.filter(c => c.items.length > 0),
        (cart) => {
          const target = cart.items[0];
          const newState = cartReducer(cart, {
            type: 'REMOVE_ITEM',
            payload: { itemId: target.item.id },
          });
          return !newState.items.some(ci => ci.item.id === target.item.id);
        }
      ),
      { numRuns: 100 }
    );
  });

  // P11: qty=0 removes item
  it('P11: UPDATE_QUANTITY to 0 removes item', () => {
    fc.assert(
      fc.property(
        cartArbitrary.filter(c => c.items.length > 0),
        (cart) => {
          const target = cart.items[0];
          const newState = cartReducer(cart, {
            type: 'UPDATE_QUANTITY',
            payload: { itemId: target.item.id, quantity: 0 },
          });
          return !newState.items.some(ci => ci.item.id === target.item.id);
        }
      ),
      { numRuns: 100 }
    );
  });

  // P20: Unavailable item rejected
  it('P20: ADD_ITEM for unavailable item leaves cart unchanged', () => {
    fc.assert(
      fc.property(
        menuItemArbitrary.map(i => ({ ...i, isAvailable: false })),
        cartArbitrary,
        (item, cart) => {
          const newState = cartReducer(cart, {
            type: 'ADD_ITEM',
            payload: { item, restaurantId: 'r1', restaurantName: 'Test' },
          });
          return newState.items.length === cart.items.length &&
            newState.subtotal === cart.subtotal;
        }
      ),
      { numRuns: 100 }
    );
  });

  // P21: Empty cart total = 0
  it('P21: empty cart has subtotal 0 and total 0', () => {
    fc.assert(
      fc.property(cartArbitrary, (cart) => {
        if (cart.items.length === 0) {
          expect(cart.subtotal).toBe(0);
          expect(cart.total).toBe(0);
        }
      }),
      { numRuns: 100 }
    );
  });
});
