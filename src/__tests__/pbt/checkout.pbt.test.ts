import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { cartReducer } from '../../features/cart/cartReducer';
import { cartArbitrary } from './arbitraries';

describe('Checkout PBT', () => {
  // P12: Discount bounded (D <= S), total = S - D
  it('P12: applying valid discount results in total = subtotal - discount, never negative', () => {
    fc.assert(
      fc.property(
        cartArbitrary.filter(c => c.items.length > 0),
        (cart) => {
          const discount = cart.subtotal * 0.5;
          const newState = cartReducer(cart, {
            type: 'APPLY_DISCOUNT',
            payload: { discount },
          });
          expect(newState.total).toBeGreaterThanOrEqual(0);
          expect(Math.abs(newState.total - (cart.subtotal - discount))).toBeLessThan(0.01);
        }
      ),
      { numRuns: 100 }
    );
  });

  // P12b: Over-discount clamps total to 0
  it('P12b: discount exceeding subtotal results in total = 0', () => {
    fc.assert(
      fc.property(
        cartArbitrary.filter(c => c.items.length > 0),
        (cart) => {
          const newState = cartReducer(cart, {
            type: 'APPLY_DISCOUNT',
            payload: { discount: cart.subtotal + 100 },
          });
          expect(newState.total).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  // P22: Empty cart has total 0 (checkout should reject)
  it('P22: empty cart always has total 0', () => {
    fc.assert(
      fc.property(cartArbitrary, (cart) => {
        if (cart.items.length === 0) {
          expect(cart.total).toBe(0);
        }
      }),
      { numRuns: 100 }
    );
  });
});
