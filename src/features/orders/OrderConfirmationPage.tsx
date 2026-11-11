import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Order } from '../../types';
import { orderService } from './orderService';
import { useCart } from '../cart/useCart';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Badge } from '../../components/ui/Badge';
import { formatUtils } from '../../utils/formatUtils';

export function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const { dispatch: cartDispatch } = useCart();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Clear cart once checkout is successfully confirmed
    cartDispatch({ type: 'CLEAR_CART' });
  }, [cartDispatch]);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    setIsLoading(true);

    orderService
      .getOrder(id)
      .then((data) => {
        if (isMounted) setOrder(data);
      })
      .catch((err) => {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to retrieve order confirmation details.'
          );
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center py-24">
          <Spinner size="lg" />
          <p className="mt-4 text-sm text-gray-500">Retrieving order confirmation...</p>
        </div>
      </PageWrapper>
    );
  }

  if (error || !order) {
    return (
      <PageWrapper>
        <div className="py-16">
          <EmptyState
            title="Order confirmation not found"
            message={error || 'Could not locate the requested order.'}
            actionLabel="View All Orders"
            onAction={() => window.location.assign('/orders')}
          />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="mx-auto max-w-2xl space-y-8 py-4">
        {/* Success Header */}
        <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Order Confirmed!</h1>
          <p className="mt-1 text-sm text-green-800">
            Thank you! Your order has been placed with <strong>{order.restaurantName}</strong>.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm border border-green-100">
            <span>Order ID:</span>
            <span className="font-mono text-indigo-600">{order.id}</span>
          </div>
        </div>

        {/* Self-Pickup Notification Card */}
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Self-Pickup Information</h2>
              <p className="mt-1 text-xs text-gray-600">
                This is a self-pickup order. Head to <strong>{order.restaurantName}</strong> once the order is ready.
              </p>
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-700">
                <div>
                  <span className="text-gray-500">Contact: </span>
                  <span className="font-medium">{order.pickupInfo.name} ({order.pickupInfo.phone})</span>
                </div>
                <div>
                  <span className="text-gray-500">Estimated Prep Time: </span>
                  <span className="font-medium text-indigo-700">
                    {formatUtils.formatPrepTime(order.estimatedPrepTimeMinutes)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Details Breakdown */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="font-bold text-gray-900">Order Summary</h2>
            <Badge color="blue">{order.status}</Badge>
          </div>

          <div className="divide-y divide-gray-100">
            {order.items.map((item) => (
              <div key={item.menuItemId} className="flex justify-between py-3 text-sm">
                <div>
                  <span className="font-medium text-gray-900">{item.name}</span>
                  <span className="ml-2 text-xs text-gray-500">× {item.quantity}</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {formatUtils.formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-1.5 border-t border-gray-100 pt-4 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatUtils.formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Pickup Fee</span>
              <span className="text-green-600 font-medium">Free</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600 font-medium">
                <span>Discount</span>
                <span>−{formatUtils.formatCurrency(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-gray-100 pt-3 text-base font-bold text-gray-900">
              <span>Total Paid</span>
              <span className="text-indigo-600">{formatUtils.formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            to={`/orders/${order.id}`}
            className="w-full sm:flex-1 rounded-lg bg-indigo-600 py-3 text-center text-sm font-semibold text-white shadow hover:bg-indigo-700 transition"
          >
            Track Order Status
          </Link>
          <Link
            to="/orders"
            className="w-full sm:flex-1 rounded-lg border border-gray-300 bg-white py-3 text-center text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition"
          >
            Order History
          </Link>
          <Link
            to="/"
            className="w-full sm:w-auto px-4 py-3 text-center text-sm font-medium text-gray-500 hover:text-gray-900 transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </PageWrapper>
  );
}
