import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PickupInfo, MockPaymentInfo, Restaurant } from '../../types';
import { useCart } from '../cart/useCart';
import { orderService } from '../orders/orderService';
import { restaurantService } from '../restaurants/restaurantService';
import { PickupContactForm } from './PickupContactForm';
import { PaymentForm } from './PaymentForm';
import { CheckoutOrderSummary } from './CheckoutOrderSummary';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { formatUtils } from '../../utils/formatUtils';

type CheckoutStep = 'contact' | 'payment' | 'review';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, restaurantId, restaurantName, subtotal, discount, total } = useCart();

  const [currentStep, setCurrentStep] = useState<CheckoutStep>('contact');
  const [pickupInfo, setPickupInfo] = useState<PickupInfo | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<MockPaymentInfo | null>(null);

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Load restaurant to check minimum order amount and open status
  useEffect(() => {
    if (!restaurantId) return;
    restaurantService
      .getRestaurantById(restaurantId)
      .then((data) => setRestaurant(data))
      .catch(() => {});
  }, [restaurantId]);

  if (items.length === 0 || !restaurantId) {
    return (
      <PageWrapper>
        <div className="py-16">
          <EmptyState
            title="Your cart is empty"
            message="Add items to your cart before proceeding to checkout."
            actionLabel="Browse Restaurants"
            onAction={() => navigate('/')}
          />
        </div>
      </PageWrapper>
    );
  }

  const handleContactSubmit = (info: PickupInfo) => {
    setPickupInfo(info);
    setCurrentStep('payment');
  };

  const handlePaymentSubmit = (payment: MockPaymentInfo) => {
    setPaymentInfo(payment);
    setCurrentStep('review');
  };

  const handlePlaceOrder = async () => {
    if (!pickupInfo || !paymentInfo) {
      setSubmitError('Missing contact or payment information.');
      return;
    }

    if (restaurant && !restaurant.isOpen) {
      setSubmitError('This restaurant is currently closed. Orders cannot be placed.');
      return;
    }

    if (restaurant && subtotal < restaurant.minimumOrderAmount) {
      setSubmitError(
        `Minimum order amount for this restaurant is ${formatUtils.formatCurrency(
          restaurant.minimumOrderAmount
        )}. Please add more items.`
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const order = await orderService.placeOrder({
        restaurantId,
        items: items.map((cartItem) => ({
          menuItemId: cartItem.item.id,
          quantity: cartItem.quantity,
        })),
        pickupInfo,
        payment: paymentInfo,
        discount,
      });

      navigate(`/orders/${order.id}/confirmation`);
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : err instanceof Error
          ? err.message
          : 'Failed to place order. Please check your connection and try again.';
      setSubmitError(message || 'An unexpected error occurred while placing your order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageWrapper>
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Self-Pickup Checkout</h1>
          <p className="mt-1 text-sm text-gray-500">
            Ordering from <strong className="text-gray-800">{restaurantName}</strong>
          </p>
        </div>

        {/* Step Indicator */}
        <nav aria-label="Checkout Progress">
          <ol className="flex items-center justify-between border-b border-gray-200 pb-4 text-sm font-medium">
            <li className={`flex items-center gap-2 ${currentStep === 'contact' ? 'text-indigo-600 font-bold' : 'text-gray-500'}`}>
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                currentStep === 'contact' ? 'bg-indigo-600 text-white' : pickupInfo ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {pickupInfo ? '✓' : '1'}
              </span>
              <span>Pickup Contact</span>
            </li>

            <span className="text-gray-300">───</span>

            <li className={`flex items-center gap-2 ${currentStep === 'payment' ? 'text-indigo-600 font-bold' : 'text-gray-500'}`}>
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                currentStep === 'payment' ? 'bg-indigo-600 text-white' : paymentInfo ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {paymentInfo ? '✓' : '2'}
              </span>
              <span>Payment</span>
            </li>

            <span className="text-gray-300">───</span>

            <li className={`flex items-center gap-2 ${currentStep === 'review' ? 'text-indigo-600 font-bold' : 'text-gray-500'}`}>
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                currentStep === 'review' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                3
              </span>
              <span>Review & Place</span>
            </li>
          </ol>
        </nav>

        {/* Submission Error Banner */}
        {submitError && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-start gap-3">
            <svg className="h-5 w-5 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-semibold">Unable to place order</p>
              <p>{submitError}</p>
            </div>
          </div>
        )}

        {/* Step 1: Contact */}
        {currentStep === 'contact' && (
          <PickupContactForm
            initialValues={pickupInfo || undefined}
            onSubmit={handleContactSubmit}
            onBack={() => navigate('/cart')}
          />
        )}

        {/* Step 2: Payment */}
        {currentStep === 'payment' && (
          <PaymentForm
            initialValues={paymentInfo || undefined}
            onSubmit={handlePaymentSubmit}
            onBack={() => setCurrentStep('contact')}
          />
        )}

        {/* Step 3: Review */}
        {currentStep === 'review' && (
          <div className="space-y-6">
            <CheckoutOrderSummary
              restaurantName={restaurantName}
              items={items}
              subtotal={subtotal}
              discount={discount}
              total={total}
              pickupInfo={pickupInfo}
              paymentInfo={paymentInfo}
              onEditContact={() => setCurrentStep('contact')}
              onEditPayment={() => setCurrentStep('payment')}
            />

            <div className="flex items-center justify-between gap-4">
              <Button
                type="button"
                variant="secondary"
                disabled={isSubmitting}
                onClick={() => setCurrentStep('payment')}
              >
                Back to Payment
              </Button>
              <Button
                type="button"
                variant="primary"
                isLoading={isSubmitting}
                disabled={isSubmitting}
                onClick={handlePlaceOrder}
                className="font-bold px-8 text-base shadow-lg"
              >
                Place Self-Pickup Order • {formatUtils.formatCurrency(total)}
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
