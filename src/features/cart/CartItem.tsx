import type { CartItem as CartItemType } from '../../types';
import { formatUtils } from '../../utils/formatUtils';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-200 py-3">
      <div className="flex-1">
        <p className="font-medium text-gray-900">{item.item.name}</p>
        <p className="text-sm text-gray-500">{formatUtils.formatCurrency(item.item.price)} each</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onUpdateQuantity(item.item.id, Math.max(0, item.quantity - 1))}
          className="h-8 w-8 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
          aria-label={`Decrease ${item.item.name} quantity`}
        >-</button>
        <span className="w-8 text-center font-medium" aria-label={`${item.item.name} quantity`}>{item.quantity}</span>
        <button
          onClick={() => onUpdateQuantity(item.item.id, Math.min(99, item.quantity + 1))}
          className="h-8 w-8 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
          aria-label={`Increase ${item.item.name} quantity`}
        >+</button>
      </div>
      <div className="w-20 text-right font-medium text-gray-900">
        {formatUtils.formatCurrency(item.item.price * item.quantity)}
      </div>
      <button
        onClick={() => onRemove(item.item.id)}
        className="text-red-500 hover:text-red-700"
        aria-label={`Remove ${item.item.name} from cart`}
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V3a1 1 0 011-1h4a1 1 0 011 1v4" />
        </svg>
      </button>
    </div>
  );
}
