import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { PaymentForm } from '../../features/checkout/PaymentForm';

describe('PaymentForm Component', () => {
  it('renders card number, expiry, and CVV fields', () => {
    render(
      <BrowserRouter>
        <PaymentForm onSubmit={() => {}} onBack={() => {}} />
      </BrowserRouter>
    );
    expect(screen.getByLabelText(/card number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/expir/i)).toBeInTheDocument();
  });
});
