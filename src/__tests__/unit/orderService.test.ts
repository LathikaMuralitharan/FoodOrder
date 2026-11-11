import { describe, it, expect } from 'vitest';
import { orderService } from '../../features/orders/orderService';
import type { OrderStatus } from '../../types';

describe('orderService.isValidStatusTransition', () => {
  const validTransitions: [OrderStatus, OrderStatus][] = [
    ['Placed', 'Confirmed'],
    ['Confirmed', 'Preparing'],
    ['Preparing', 'Ready for Pickup'],
    ['Ready for Pickup', 'Completed'],
    ['Placed', 'Cancelled'],
    ['Confirmed', 'Cancelled'],
  ];

  it.each(validTransitions)('accepts %s -> %s', (from, to) => {
    expect(orderService.isValidStatusTransition(from, to)).toBe(true);
  });

  const invalidForwardSkips: [OrderStatus, OrderStatus][] = [
    ['Placed', 'Preparing'],
    ['Placed', 'Ready for Pickup'],
    ['Confirmed', 'Completed'],
    ['Confirmed', 'Ready for Pickup'],
    ['Preparing', 'Completed'],
  ];

  it.each(invalidForwardSkips)('rejects forward skip %s -> %s', (from, to) => {
    expect(orderService.isValidStatusTransition(from, to)).toBe(false);
  });

  const backwardTransitions: [OrderStatus, OrderStatus][] = [
    ['Confirmed', 'Placed'],
    ['Completed', 'Placed'],
    ['Ready for Pickup', 'Preparing'],
    ['Preparing', 'Confirmed'],
  ];

  it.each(backwardTransitions)('rejects backward %s -> %s', (from, to) => {
    expect(orderService.isValidStatusTransition(from, to)).toBe(false);
  });

  const invalidCancels: [OrderStatus, OrderStatus][] = [
    ['Preparing', 'Cancelled'],
    ['Ready for Pickup', 'Cancelled'],
    ['Completed', 'Cancelled'],
  ];

  it.each(invalidCancels)('rejects cancel from %s', (from, to) => {
    expect(orderService.isValidStatusTransition(from, to)).toBe(false);
  });

  it('rejects self-transition Placed -> Placed', () => {
    expect(orderService.isValidStatusTransition('Placed', 'Placed')).toBe(false);
  });

  it('rejects self-transition Completed -> Completed', () => {
    expect(orderService.isValidStatusTransition('Completed', 'Completed')).toBe(false);
  });

  it('rejects from Cancelled', () => {
    expect(orderService.isValidStatusTransition('Cancelled', 'Placed')).toBe(false);
    expect(orderService.isValidStatusTransition('Cancelled', 'Confirmed')).toBe(false);
  });
});
