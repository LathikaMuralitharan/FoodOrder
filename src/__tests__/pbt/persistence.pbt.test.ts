import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { storageUtils } from '../../utils/storageUtils';
import { cartArbitrary } from './arbitraries';

describe('Persistence PBT', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // P23: localStorage round-trip invariant
  it('P23: saveCart -> loadCart produces identical cart state', () => {
    fc.assert(
      fc.property(cartArbitrary, (cart) => {
        storageUtils.saveCart(cart);
        const loaded = storageUtils.loadCart();
        expect(loaded).not.toBeNull();
        expect(loaded!.items.length).toBe(cart.items.length);
        for (let i = 0; i < cart.items.length; i++) {
          expect(loaded!.items[i].item.id).toBe(cart.items[i].item.id);
          expect(loaded!.items[i].item.price).toBe(cart.items[i].item.price);
          expect(loaded!.items[i].quantity).toBe(cart.items[i].quantity);
        }
      }),
      { numRuns: 100 }
    );
  });
});
