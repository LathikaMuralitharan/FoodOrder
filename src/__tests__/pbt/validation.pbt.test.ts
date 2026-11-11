import { describe, it } from 'vitest';
import fc from 'fast-check';
import { validator } from '../../utils/validator';
import { pickupInfoArbitrary, invalidPhonePickupInfoArbitrary } from './arbitraries';

describe('Validation PBT', () => {
  // P16: Valid pickup info accepted
  it('P16: validator accepts valid PickupInfo', () => {
    fc.assert(
      fc.property(pickupInfoArbitrary, (info) => {
        const result = validator.validatePickupInfo(info);
        return result.name.isValid && result.phone.isValid;
      }),
      { numRuns: 100 }
    );
  });

  // P17: Invalid phone rejected
  it('P17: validator rejects PickupInfo with invalid phone', () => {
    fc.assert(
      fc.property(invalidPhonePickupInfoArbitrary, (info) => {
        const result = validator.validatePickupInfo(info);
        return !result.phone.isValid;
      }),
      { numRuns: 100 }
    );
  });

  // P18: Empty name rejected
  it('P18: validator rejects PickupInfo with empty name', () => {
    fc.assert(
      fc.property(pickupInfoArbitrary, (info) => {
        const result = validator.validatePickupInfo({ ...info, name: '' });
        return !result.name.isValid;
      }),
      { numRuns: 100 }
    );
  });
});
