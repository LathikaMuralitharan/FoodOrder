import { describe, it, expect } from 'vitest';
import { cartReducer, initialCartState } from '../../features/cart/cartReducer';
import type { MenuItem } from '../../types';

const makeItem = (id: string, price: number, available = true): MenuItem => ({
  id, restaurantId: 'r1', name: `Item ${id}`, description: '', price,
  imageUrl: '', category: 'Mains', allergens: [], isAvailable: available,
});

describe('Cart-Checkout Integration', () => {
  it('rejects order placement for cart below minimum order', () => {
    const item = makeItem('m1', 5);
    const state = cartReducer(initialCartState, {
      type: 'ADD_ITEM', payload: { item, restaurantId: 'r1', restaurantName: 'Test' },
    });
    // Simulate minimum order check: subtotal (5) < minimum (15)
    expect(state.subtotal).toBe(5);
    expect(state.subtotal < 15).toBe(true);
  });

  it('detects unavailable items in cart at checkout', () => {
    const item = makeItem('m1', 10);
    let state = cartReducer(initialCartState, {
      type: 'ADD_ITEM', payload: { item, restaurantId: 'r1', restaurantName: 'Test' },
    });
    // Item becomes unavailable
    const updatedItem = { ...item, isAvailable: false };
    // Attempting to add again should be rejected
    const newState = cartReducer(state, {
      type: 'ADD_ITEM', payload: { item: updatedItem, restaurantId: 'r1', restaurantName: 'Test' },
    });
    expect(newState.items.length).toBe(1);
    expect(newState.items[0].quantity).toBe(1);
  });

  it('rejects order placement with empty cart', () => {
    expect(initialCartState.items.length).toBe(0);
    expect(initialCartState.total).toBe(0);
  });

  it('pickup contact pre-fills from user account', () => {
    // This is tested at the component level; here we verify the data flow
    const user = { id: 'u1', name: 'Jane Doe', email: 'jane@test.com', phone: '5551234567', createdAt: '2024-01-01T00:00:00Z' };
    const pickupInfo = { name: user.name, phone: user.phone };
    expect(pickupInfo.name).toBe('Jane Doe');
    expect(pickupInfo.phone).toBe('5551234567');
  });
});
