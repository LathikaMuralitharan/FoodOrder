import fc from 'fast-check';
import type { MenuItem, CartItem, CartState, Restaurant, OrderStatus, PickupInfo } from '../../types';

export const menuItemArbitrary: fc.Arbitrary<MenuItem> = fc.record({
  id: fc.uuid(),
  restaurantId: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  description: fc.string({ maxLength: 200 }),
  price: fc.float({ min: Math.fround(0), max: Math.fround(999.99), noNaN: true }),
  imageUrl: fc.constant('/images/item.jpg'),
  category: fc.constantFrom('Starters', 'Mains', 'Desserts', 'Drinks'),
  allergens: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 5 }),
  isAvailable: fc.boolean(),
});

export const availableMenuItemArbitrary: fc.Arbitrary<MenuItem> = menuItemArbitrary.map(item => ({
  ...item, isAvailable: true,
}));

export const cartItemArbitrary: fc.Arbitrary<CartItem> = fc.record({
  item: availableMenuItemArbitrary,
  quantity: fc.integer({ min: 1, max: 99 }),
});

export const cartArbitrary: fc.Arbitrary<CartState> = fc
  .array(cartItemArbitrary, { minLength: 0, maxLength: 20 })
  .map(items => {
    const deduped = Array.from(new Map(items.map(ci => [ci.item.id, ci])).values());
    const subtotal = deduped.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0);
    return {
      items: deduped,
      restaurantId: null,
      restaurantName: null,
      discount: 0,
      subtotal,
      total: subtotal,
    };
  });

export const restaurantArbitrary: fc.Arbitrary<Restaurant> = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length >= 1),
  cuisineType: fc.constantFrom('Italian', 'Chinese', 'Mexican', 'Indian', 'American', 'Thai'),
  rating: fc.float({ min: Math.fround(0), max: Math.fround(5), noNaN: true }),
  estimatedPrepTimeMinutes: fc.integer({ min: 5, max: 60 }),
  minimumOrderAmount: fc.float({ min: Math.fround(0), max: Math.fround(50), noNaN: true }),
  isOpen: fc.boolean(),
  imageUrl: fc.constant('/images/restaurant.jpg'),
});

export const orderStatusArbitrary: fc.Arbitrary<OrderStatus> = fc.constantFrom(
  'Placed', 'Confirmed', 'Preparing', 'Ready for Pickup', 'Completed', 'Cancelled'
);

export const pickupInfoArbitrary: fc.Arbitrary<PickupInfo> = fc.record({
  name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length >= 1),
  phone: fc.array(fc.constantFrom('0','1','2','3','4','5','6','7','8','9'), { minLength: 10, maxLength: 10 }).map(arr => arr.join('')),
});

export const invalidPhonePickupInfoArbitrary: fc.Arbitrary<PickupInfo> = pickupInfoArbitrary.chain(info =>
  fc.oneof(
    fc.array(fc.constantFrom('0','1','2','3','4','5','6','7','8','9'), { minLength: 1, maxLength: 9 }).map(arr => arr.join('')),
    fc.array(fc.constantFrom('0','1','2','3','4','5','6','7','8','9'), { minLength: 11, maxLength: 15 }).map(arr => arr.join('')),
    fc.string({ minLength: 10, maxLength: 10 }).filter(s => /\D/.test(s)),
  ).map(phone => ({ ...info, phone }))
);

export const discountArbitraryFor = (subtotal: number): fc.Arbitrary<number> =>
  fc.float({ min: Math.fround(0), max: Math.fround(subtotal), noNaN: true });
