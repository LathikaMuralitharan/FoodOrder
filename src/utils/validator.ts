import type { ValidationResult, RegisterFormValues, LoginFormValues, PickupInfo } from '../types';

export const validator = {
  validateName(name: string): ValidationResult {
    if (!name || name.trim().length < 2 || name.trim().length > 100) {
      return { isValid: false, error: 'Name must be between 2 and 100 characters.' };
    }
    return { isValid: true, error: null };
  },

  validateEmail(email: string): ValidationResult {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || email.length > 254 || !emailRegex.test(email)) {
      return { isValid: false, error: 'Please enter a valid email address.' };
    }
    return { isValid: true, error: null };
  },

  validatePassword(password: string): ValidationResult {
    if (!password || password.length < 8 || password.length > 128) {
      return { isValid: false, error: 'Password must be between 8 and 128 characters.' };
    }
    return { isValid: true, error: null };
  },

  validatePhone(phone: string): ValidationResult {
    const phoneRegex = /^\d{10}$/;
    if (!phone || !phoneRegex.test(phone)) {
      return { isValid: false, error: 'Phone number must be exactly 10 digits.' };
    }
    return { isValid: true, error: null };
  },

  validatePickupInfo(info: PickupInfo): Record<keyof PickupInfo, ValidationResult> {
    const nameResult: ValidationResult =
      !info.name || info.name.trim().length < 1 || info.name.trim().length > 100
        ? { isValid: false, error: 'Name is required.' }
        : { isValid: true, error: null };
    const phoneResult = validator.validatePhone(info.phone);
    return { name: nameResult, phone: phoneResult };
  },

  validateCardNumber(cardNumber: string): ValidationResult {
    const cleaned = cardNumber.replace(/\s/g, '');
    const cardRegex = /^\d{13,19}$/;
    if (!cleaned || !cardRegex.test(cleaned)) {
      return { isValid: false, error: 'Card number must be 13-19 digits.' };
    }
    return { isValid: true, error: null };
  },

  validateExpiry(expiry: string): ValidationResult {
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expiry || !expiryRegex.test(expiry)) {
      return { isValid: false, error: 'Please enter a valid expiry date (MM/YY).' };
    }
    const [month, year] = expiry.split('/');
    const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1, 1);
    const now = new Date();
    const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    if (expiryDate < firstOfThisMonth) {
      return { isValid: false, error: 'Please enter a valid expiry date (MM/YY).' };
    }
    return { isValid: true, error: null };
  },

  validateCvv(cvv: string): ValidationResult {
    const cvvRegex = /^\d{3,4}$/;
    if (!cvv || !cvvRegex.test(cvv)) {
      return { isValid: false, error: 'CVV must be 3 or 4 digits.' };
    }
    return { isValid: true, error: null };
  },

  validateQuantity(quantity: number): ValidationResult {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      return { isValid: false, error: 'Quantity must be between 1 and 99.' };
    }
    return { isValid: true, error: null };
  },

  validateRegistrationForm(values: RegisterFormValues): Record<keyof RegisterFormValues, ValidationResult> {
    return {
      name: validator.validateName(values.name),
      email: validator.validateEmail(values.email),
      password: validator.validatePassword(values.password),
      phone: validator.validatePhone(values.phone),
    };
  },

  validateLoginForm(values: LoginFormValues): Record<keyof LoginFormValues, ValidationResult> {
    const emailResult: ValidationResult = !values.email
      ? { isValid: false, error: 'Email is required.' }
      : validator.validateEmail(values.email);
    const passwordResult: ValidationResult = !values.password
      ? { isValid: false, error: 'Password is required.' }
      : { isValid: true, error: null };
    return { email: emailResult, password: passwordResult };
  },
};
