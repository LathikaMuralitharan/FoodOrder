import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { orderService } from '../../features/orders/orderService';
import { orderStatusArbitrary } from './arbitraries';
import type { OrderStatus } from '../../types';

const validTransitions = new Map<OrderStatus, OrderStatus[]>([
  ['Placed', ['Confirmed', 'Cancelled']],
  ['Confirmed', ['Preparing', 'Cancelled']],
  ['Preparing', ['Ready for Pickup']],
  ['Ready for Pickup', ['Completed']],
  ['Completed', []],
  ['Cancelled', []],
]);

describe('Order PBT', () => {
  // P15: Status transitions — valid only
  it('P15: isValidStatusTransition matches the defined valid transition set', () => {
    fc.assert(
      fc.property(orderStatusArbitrary, orderStatusArbitrary, (from, to) => {
        const expected = validTransitions.get(from)?.includes(to) ?? false;
        expect(orderService.isValidStatusTransition(from, to)).toBe(expected);
      }),
      { numRuns: 100 }
    );
  });
});
