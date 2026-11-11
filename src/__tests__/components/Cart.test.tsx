import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from '../../features/cart/CartContext';
import { CartSummary } from '../../features/cart/CartSummary';

describe('Cart Component', () => {
  it('shows total and no delivery fee', () => {
    render(
      <BrowserRouter>
        <CartProvider>
          <CartSummary subtotal={25.98} total={25.98} onCheckout={() => {}} isCheckoutDisabled={false} />
        </CartProvider>
      </BrowserRouter>
    );
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.queryByText(/delivery/i)).toBeNull();
  });

  it('shows discount when discount > 0', () => {
    render(
      <BrowserRouter>
        <CartProvider>
          <CartSummary subtotal={50} discount={10} total={40} onCheckout={() => {}} isCheckoutDisabled={false} />
        </CartProvider>
      </BrowserRouter>
    );
    expect(screen.getByText(/discount/i)).toBeInTheDocument();
  });

  it('hides discount when discount is 0', () => {
    render(
      <BrowserRouter>
        <CartProvider>
          <CartSummary subtotal={25.98} total={25.98} onCheckout={() => {}} isCheckoutDisabled={false} />
        </CartProvider>
      </BrowserRouter>
    );
    expect(screen.queryByText(/discount/i)).toBeNull();
  });
});
