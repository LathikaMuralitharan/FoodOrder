import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { CartItem } from './CartItem';
import { CartSummary } from './CartSummary';
import { EmptyState } from '../../components/ui/EmptyState';
import { useCart } from './useCart';

export function CartPage() {
  const navigate = useNavigate();
  const { items, subtotal, discount, total, dispatch } = useCart();

  if (items.length === 0) {
    return (
      <PageWrapper>
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Your Cart</h1>
        <EmptyState
          title="Your cart is empty"
          message="Browse restaurants to start adding items to your cart."
          actionLabel="Browse Restaurants"
          onAction={() => navigate('/')}
        />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Your Cart</h1>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            {items.map(item => (
              <CartItem
                key={item.item.id}
                item={item}
                onUpdateQuantity={(id, qty) => dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId: id, quantity: qty } })}
                onRemove={(id) => dispatch({ type: 'REMOVE_ITEM', payload: { itemId: id } })}
              />
            ))}
          </div>
        </div>
        <div>
          <CartSummary
            subtotal={subtotal}
            discount={discount}
            total={total}
            onCheckout={() => navigate('/checkout')}
            isCheckoutDisabled={items.length === 0}
          />
        </div>
      </div>
    </PageWrapper>
  );
}
