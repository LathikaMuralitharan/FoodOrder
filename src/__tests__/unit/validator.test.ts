import { describe, it, expect } from 'vitest';
import { validator } from '../../utils/validator';

describe('validator.validateName', () => {
  it('accepts valid name (2 chars)', () => {
    expect(validator.validateName('Jo').isValid).toBe(true);
  });
  it('accepts 100 chars', () => {
    expect(validator.validateName('a'.repeat(100)).isValid).toBe(true);
  });
  it('rejects empty', () => {
    expect(validator.validateName('').isValid).toBe(false);
  });
  it('rejects 1 char', () => {
    expect(validator.validateName('a').isValid).toBe(false);
  });
  it('rejects 101 chars', () => {
    expect(validator.validateName('a'.repeat(101)).isValid).toBe(false);
  });
});

describe('validator.validateEmail', () => {
  it('accepts valid email', () => {
    expect(validator.validateEmail('a@b.c').isValid).toBe(true);
  });
  it('rejects missing @', () => {
    expect(validator.validateEmail('abc').isValid).toBe(false);
  });
  it('rejects missing TLD', () => {
    expect(validator.validateEmail('a@b').isValid).toBe(false);
  });
  it('accepts 254 chars', () => {
    const email = 'a'.repeat(250) + '@b.c';
    expect(validator.validateEmail(email).isValid).toBe(true);
  });
  it('rejects empty', () => {
    expect(validator.validateEmail('').isValid).toBe(false);
  });
});

describe('validator.validatePassword', () => {
  it('accepts 8 chars', () => {
    expect(validator.validatePassword('12345678').isValid).toBe(true);
  });
  it('accepts 128 chars', () => {
    expect(validator.validatePassword('a'.repeat(128)).isValid).toBe(true);
  });
  it('rejects 7 chars', () => {
    expect(validator.validatePassword('1234567').isValid).toBe(false);
  });
  it('rejects 129 chars', () => {
    expect(validator.validatePassword('a'.repeat(129)).isValid).toBe(false);
  });
  it('rejects empty', () => {
    expect(validator.validatePassword('').isValid).toBe(false);
  });
});

describe('validator.validatePhone', () => {
  it('accepts 10 digits', () => {
    expect(validator.validatePhone('1234567890').isValid).toBe(true);
  });
  it('rejects 9 digits', () => {
    expect(validator.validatePhone('123456789').isValid).toBe(false);
  });
  it('rejects 11 digits', () => {
    expect(validator.validatePhone('12345678901').isValid).toBe(false);
  });
  it('rejects alpha chars', () => {
    expect(validator.validatePhone('123456789a').isValid).toBe(false);
  });
  it('rejects empty', () => {
    expect(validator.validatePhone('').isValid).toBe(false);
  });
});

describe('validator.validateCardNumber', () => {
  it('accepts 13 digits', () => {
    expect(validator.validateCardNumber('1234567890123').isValid).toBe(true);
  });
  it('accepts 19 digits', () => {
    expect(validator.validateCardNumber('1'.repeat(19)).isValid).toBe(true);
  });
  it('rejects 12 digits', () => {
    expect(validator.validateCardNumber('1'.repeat(12)).isValid).toBe(false);
  });
  it('rejects 20 digits', () => {
    expect(validator.validateCardNumber('1'.repeat(20)).isValid).toBe(false);
  });
  it('rejects alpha', () => {
    expect(validator.validateCardNumber('1234567890abc').isValid).toBe(false);
  });
});

describe('validator.validateCvv', () => {
  it('accepts 3 digits', () => {
    expect(validator.validateCvv('123').isValid).toBe(true);
  });
  it('accepts 4 digits', () => {
    expect(validator.validateCvv('1234').isValid).toBe(true);
  });
  it('rejects 2 digits', () => {
    expect(validator.validateCvv('12').isValid).toBe(false);
  });
  it('rejects 5 digits', () => {
    expect(validator.validateCvv('12345').isValid).toBe(false);
  });
});

describe('validator.validateQuantity', () => {
  it('accepts 1', () => {
    expect(validator.validateQuantity(1).isValid).toBe(true);
  });
  it('accepts 99', () => {
    expect(validator.validateQuantity(99).isValid).toBe(true);
  });
  it('rejects 0', () => {
    expect(validator.validateQuantity(0).isValid).toBe(false);
  });
  it('rejects 100', () => {
    expect(validator.validateQuantity(100).isValid).toBe(false);
  });
  it('rejects 1.5', () => {
    expect(validator.validateQuantity(1.5).isValid).toBe(false);
  });
});

describe('validator.validatePickupInfo', () => {
  it('accepts valid info', () => {
    const result = validator.validatePickupInfo({ name: 'Jane', phone: '5551234567' });
    expect(result.name.isValid).toBe(true);
    expect(result.phone.isValid).toBe(true);
  });
  it('rejects invalid phone', () => {
    const result = validator.validatePickupInfo({ name: 'Jane', phone: '123' });
    expect(result.phone.isValid).toBe(false);
  });
  it('rejects empty name', () => {
    const result = validator.validatePickupInfo({ name: '', phone: '5551234567' });
    expect(result.name.isValid).toBe(false);
  });
  it('accepts name at 100 chars', () => {
    const result = validator.validatePickupInfo({ name: 'a'.repeat(100), phone: '5551234567' });
    expect(result.name.isValid).toBe(true);
  });
  it('rejects name at 101 chars', () => {
    const result = validator.validatePickupInfo({ name: 'a'.repeat(101), phone: '5551234567' });
    expect(result.name.isValid).toBe(false);
  });
});
