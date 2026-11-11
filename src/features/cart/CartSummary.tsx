import { Button } from '../../components/ui/Button';
import { formatUtils } from '../../utils/formatUtils';

interface CartSummaryProps {
  subtotal: number;
  discount?: number;
  total: number;
  onCheckout: () => void;
  isCheckoutDisabled: boolean;
}

export function CartSummary({ subtotal, discount, total, onCheckout, isCheckoutDisabled }: CartSummaryProps) {
  return (
    <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex justify-between text-gray-700">
        <span>Subtotal</span>
        <span>{formatUtils.formatCurrency(subtotal)}</span>
      </div>
      {discount !== undefined && discount > 0 && (
        <div className="flex justify-between text-green-600">
          <span>Discount</span>
          <span>-{formatUtils.formatCurrency(discount)}</span>
        </div>
      )}
      <div className="flex justify-between border-t border-gray-200 pt-3 text-lg font-bold text-gray-900">
        <span>Total</span>
        <span>{formatUtils.formatCurrency(total)}</span>
      </div>
      <Button onClick={onCheckout} disabled={isCheckoutDisabled} className="w-full">
        Proceed to Checkout
      </Button>
    </div>
  );
}
