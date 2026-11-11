import type { CartItem, PickupInfo, MockPaymentInfo } from '../../types';
import { formatUtils } from '../../utils/formatUtils';

interface CheckoutOrderSummaryProps {
  restaurantName?: string | null;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  pickupInfo?: PickupInfo | null;
  paymentInfo?: MockPaymentInfo | null;
  onEditContact?: () => void;
  onEditPayment?: () => void;
}

export function CheckoutOrderSummary({
  restaurantName,
  items,
  subtotal,
  discount,
  total,
  pickupInfo,
  paymentInfo,
  onEditContact,
  onEditPayment,
}: CheckoutOrderSummaryProps) {
  const maskedCard = paymentInfo?.cardNumber
    ? `•••• ${paymentInfo.cardNumber.slice(-4)}`
    : 'Card on file';

  return (
    <div className="space-y-6">
      {/* Pickup Details Card */}
      {pickupInfo && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Pickup Details</h3>
            {onEditContact && (
              <button
                type="button"
                onClick={onEditContact}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Edit
              </button>
            )}
          </div>
          <div className="mt-3 space-y-1 text-sm text-gray-600">
            <p>
              <span className="font-medium text-gray-800">Pickup Name:</span> {pickupInfo.name}
            </p>
            <p>
              <span className="font-medium text-gray-800">Phone for updates:</span> {pickupInfo.phone}
            </p>
            <p className="text-xs text-indigo-700 bg-indigo-50 rounded px-2 py-1 mt-2 inline-block">
              Self-Pickup from: <span className="font-semibold">{restaurantName || 'Restaurant'}</span>
            </p>
          </div>
        </div>
      )}

      {/* Payment Method Card */}
      {paymentInfo && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Payment Method</h3>
            {onEditPayment && (
              <button
                type="button"
                onClick={onEditPayment}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Edit
              </button>
            )}
          </div>
          <div className="mt-3 flex items-center gap-3 text-sm text-gray-600">
            <div className="flex h-7 w-10 items-center justify-center rounded bg-gray-100 font-bold text-gray-700 text-xs">
              CARD
            </div>
            <div>
              <p className="font-medium text-gray-800">{maskedCard}</p>
              <p className="text-xs text-gray-400">Expires {paymentInfo.expiry}</p>
            </div>
          </div>
        </div>
      )}

      {/* Ordered Items Breakdown */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-3">
          Order Items ({items.reduce((s, c) => s + c.quantity, 0)})
        </h3>

        <div className="divide-y divide-gray-100">
          {items.map((cartItem) => {
            const linePrice = cartItem.item.price * cartItem.quantity;
            return (
              <div
                key={cartItem.item.id}
                className="flex items-center justify-between py-3 text-sm"
              >
                <div className="flex-1 pr-4">
                  <p className="font-medium text-gray-900">{cartItem.item.name}</p>
                  <p className="text-xs text-gray-500">
                    {cartItem.quantity} × {formatUtils.formatCurrency(cartItem.item.price)}
                  </p>
                </div>
                <span className="font-semibold text-gray-900">
                  {formatUtils.formatCurrency(linePrice)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Pricing Summary */}
        <div className="space-y-2 border-t border-gray-100 pt-4 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>{formatUtils.formatCurrency(subtotal)}</span>
          </div>

          <div className="flex justify-between text-gray-600">
            <span>Pickup Fee</span>
            <span className="font-medium text-green-600">Free (Self-Pickup)</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-green-600 font-medium">
              <span>Discount</span>
              <span>−{formatUtils.formatCurrency(discount)}</span>
            </div>
          )}

          <div className="flex justify-between border-t border-gray-100 pt-3 text-base font-bold text-gray-900">
            <span>Total</span>
            <span className="text-indigo-600">{formatUtils.formatCurrency(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
