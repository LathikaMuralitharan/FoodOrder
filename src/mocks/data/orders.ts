import type { Order } from '../../types';

export const mockOrders: Order[] = [
  {
    id: 'o1',
    userId: 'u1',
    restaurantId: 'r1',
    restaurantName: 'Pizza Palace',
    items: [
      { menuItemId: 'm1', name: 'Margherita Pizza', price: 12.99, quantity: 2 },
      { menuItemId: 'm4', name: 'Caesar Salad', price: 8.99, quantity: 1 },
    ],
    pickupInfo: { name: 'Jane Doe', phone: '5551234567' },
    subtotal: 34.97,
    discount: 0,
    total: 34.97,
    status: 'Completed',
    createdAt: '2024-11-01T12:00:00Z',
    estimatedPrepTimeMinutes: 20,
  },
  {
    id: 'o2',
    userId: 'u1',
    restaurantId: 'r3',
    restaurantName: 'Taco Fiesta',
    items: [
      { menuItemId: 'm20', name: 'Beef Tacos', price: 10.99, quantity: 1 },
    ],
    pickupInfo: { name: 'Jane Doe', phone: '5551234567' },
    subtotal: 10.99,
    discount: 0,
    total: 10.99,
    status: 'Ready for Pickup',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    estimatedPrepTimeMinutes: 15,
  },
  {
    id: 'o3',
    userId: 'u2',
    restaurantId: 'r2',
    restaurantName: 'Dragon Wok',
    items: [
      { menuItemId: 'm10', name: 'Kung Pao Chicken', price: 13.99, quantity: 1 },
      { menuItemId: 'm12', name: 'Spring Rolls', price: 6.99, quantity: 2 },
    ],
    pickupInfo: { name: 'John Smith', phone: '5559876543' },
    subtotal: 27.97,
    discount: 0,
    total: 27.97,
    status: 'Placed',
    createdAt: new Date().toISOString(),
    estimatedPrepTimeMinutes: 25,
  },
];
