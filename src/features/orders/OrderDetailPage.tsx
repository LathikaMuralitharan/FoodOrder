import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { OrderStatus } from '../../types';
import { useOrder } from './useOrder';
import { orderService } from './orderService';
import { OrderStatusBadge } from './OrderStatusBadge';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { formatUtils } from '../../utils/formatUtils';

const PROGRESS_STEPS: OrderStatus[] = [
  'Placed',
  'Confirmed',
  'Preparing',
  'Ready for Pickup',
  'Completed',
];

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { order, setOrder, isLoading, error } = useOrder(id || '');

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  if (isLoading && !order) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center py-24">
          <Spinner size="lg" />
          <p className="mt-4 text-sm text-gray-500">Loading order details...</p>
        </div>
      </PageWrapper>
    );
  }

  if (error && !order) {
    return (
      <PageWrapper>
        <div className="py-16">
          <EmptyState
            title="Order not found"
            message={error || 'Could not find the requested order.'}
            actionLabel="Back to Order History"
            onAction={() => window.location.assign('/orders')}
          />
        </div>
      </PageWrapper>
    );
  }

  if (!order) return null;

  const isCancelled = order.status === 'Cancelled';
  const canCancel = order.status === 'Placed' || order.status === 'Confirmed';
  const currentStepIndex = PROGRESS_STEPS.indexOf(order.status);

  const handleConfirmCancel = async () => {
    setIsCancelling(true);
    setCancelError(null);
    try {
      const updated = await orderService.cancelOrder(order.id);
      setOrder(updated);
      setIsCancelModalOpen(false);
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : err instanceof Error
          ? err.message
          : 'Failed to cancel order.';
      setCancelError(message || 'Unable to cancel order at this stage.');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <PageWrapper>
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            to="/orders"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Back to Orders
          </Link>
        </div>

        {/* Order Header Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Order Details
                </span>
                {!isCancelled && order.status !== 'Completed' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                    Live Tracking
                  </span>
                )}
              </div>
              <h1 className="mt-1 text-2xl font-bold text-gray-900">{order.restaurantName}</h1>
              <p className="text-xs text-gray-400 font-mono mt-0.5">ID: {order.id}</p>
            </div>

            <div className="flex items-center gap-3">
              <OrderStatusBadge status={order.status} />
              {canCancel && (
                <Button
                  type="button"
                  variant="danger"
                  className="text-xs py-1.5 px-3"
                  onClick={() => setIsCancelModalOpen(true)}
                >
                  Cancel Order
                </Button>
              )}
            </div>
          </div>

          <div className="mt-4 border-t border-gray-100 pt-3 text-xs text-gray-500">
            Placed on {formatUtils.formatDate(order.createdAt)}
          </div>
        </div>

        {/* Status Stepper / Progression */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-6">Order Status Progression</h2>

          {isCancelled ? (
            <div className="rounded-lg bg-red-50 p-4 border border-red-200 text-red-800 text-sm">
              <p className="font-semibold">This order was cancelled</p>
              <p className="mt-0.5 text-xs text-red-700">
                You will not be charged. Please place a new order if you would like to eat!
              </p>
            </div>
          ) : (
            <div className="relative">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 text-center">
                {PROGRESS_STEPS.map((step, idx) => {
                  const isCurrent = order.status === step;
                  const isCompleted = currentStepIndex >= idx;

                  return (
                    <div key={step} className="flex flex-col items-center">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                          isCurrent
                            ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                            : isCompleted
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {isCompleted && !isCurrent ? '✓' : idx + 1}
                      </div>
                      <span
                        className={`mt-2 text-xs font-medium ${
                          isCurrent
                            ? 'font-bold text-indigo-600'
                            : isCompleted
                            ? 'text-gray-900'
                            : 'text-gray-400'
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Self-Pickup Notification Advice Banner */}
        {!isCancelled && (
          <div className={`rounded-xl p-5 border ${
            order.status === 'Ready for Pickup'
              ? 'bg-purple-50 border-purple-200 text-purple-900'
              : order.status === 'Preparing'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : order.status === 'Completed'
              ? 'bg-green-50 border-green-200 text-green-900'
              : 'bg-blue-50 border-blue-200 text-blue-900'
          }`}>
            <div className="flex items-start gap-3">
              <span className="text-xl">
                {order.status === 'Ready for Pickup' ? '🎉' : order.status === 'Preparing' ? '👨‍🍳' : order.status === 'Completed' ? '✅' : '⏳'}
              </span>
              <div>
                <p className="font-semibold text-sm">
                  {order.status === 'Ready for Pickup' && 'Your food is ready for self-pickup!'}
                  {order.status === 'Preparing' && 'The kitchen is preparing your order'}
                  {order.status === 'Completed' && 'Order completed — Thank you!'}
                  {(order.status === 'Placed' || order.status === 'Confirmed') && 'Order confirmed — Waiting for preparation'}
                </p>
                <p className="mt-1 text-xs">
                  {order.status === 'Ready for Pickup' && `Please go to ${order.restaurantName} to pick up your food. Have your Order ID ready.`}
                  {order.status === 'Preparing' && `Estimated kitchen prep time: ${formatUtils.formatPrepTime(order.estimatedPrepTimeMinutes)}.`}
                  {order.status === 'Completed' && 'Hope you enjoyed your meal!'}
                  {(order.status === 'Placed' || order.status === 'Confirmed') && `The restaurant has received your order. Prep time: ~${order.estimatedPrepTimeMinutes} min.`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Pickup Contact Information Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-3">
            Self-Pickup Contact
          </h2>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <p className="text-xs text-gray-400">Customer Name</p>
              <p className="font-medium text-gray-800">{order.pickupInfo.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Notification Phone</p>
              <p className="font-medium text-gray-800">{order.pickupInfo.phone}</p>
            </div>
          </div>
        </div>

        {/* Ordered Items Breakdown */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-3">
            Items Ordered ({order.items.reduce((s, it) => s + it.quantity, 0)})
          </h2>

          <div className="divide-y divide-gray-100">
            {order.items.map((it) => (
              <div key={it.menuItemId} className="flex justify-between py-3 text-sm">
                <div>
                  <span className="font-medium text-gray-900">{it.name}</span>
                  <span className="ml-2 text-xs text-gray-500">× {it.quantity}</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {formatUtils.formatCurrency(it.price * it.quantity)}
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
              <span>Self-Pickup Fee</span>
              <span className="text-green-600 font-medium">Free</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600 font-medium">
                <span>Discount</span>
                <span>−{formatUtils.formatCurrency(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-gray-100 pt-3 text-base font-bold text-gray-900">
              <span>Total</span>
              <span className="text-indigo-600">{formatUtils.formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Cancellation Confirmation Modal */}
        <Modal
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          title="Cancel this order?"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to cancel your order with <strong>{order.restaurantName}</strong>?
              This action cannot be undone.
            </p>

            {cancelError && (
              <div className="rounded-lg bg-red-50 p-3 text-xs text-red-800 border border-red-200">
                {cancelError}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                disabled={isCancelling}
                onClick={() => setIsCancelModalOpen(false)}
              >
                Keep Order
              </Button>
              <Button
                type="button"
                variant="danger"
                isLoading={isCancelling}
                disabled={isCancelling}
                onClick={handleConfirmCancel}
              >
                Yes, Cancel Order
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </PageWrapper>
  );
}
