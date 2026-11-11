import { useState, useEffect } from 'react';
import type { MenuItem } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatUtils } from '../../utils/formatUtils';

interface MenuItemDetailProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  isRestaurantOpen?: boolean;
  onAddToCart: (item: MenuItem, quantity: number) => void;
}

export function MenuItemDetail({
  item,
  isOpen,
  onClose,
  isRestaurantOpen = true,
  onAddToCart,
}: MenuItemDetailProps) {
  const [quantity, setQuantity] = useState(1);

  // Reset quantity to 1 when opened with a new item
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
    }
  }, [isOpen, item]);

  if (!item) return null;

  const isAvailable = item.isAvailable && isRestaurantOpen;

  const handleDecrement = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncrement = () => {
    setQuantity((prev) => Math.min(99, prev + 1));
  };

  const handleQuantityInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) {
      setQuantity(1);
    } else {
      setQuantity(Math.min(Math.max(val, 1), 99));
    }
  };

  const handleAdd = () => {
    if (!isAvailable) return;
    onAddToCart(item, quantity);
    onClose();
  };

  const lineTotal = item.price * quantity;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={item.name}>
      <div className="space-y-5">
        <div className="relative h-56 w-full overflow-hidden rounded-lg bg-gray-100">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
            }}
          />
          {!item.isAvailable && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="rounded bg-black/80 px-4 py-1.5 text-sm font-semibold uppercase tracking-wider text-white">
                Item Unavailable
              </span>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-gray-900">
              {formatUtils.formatCurrency(item.price)}
            </span>
            <Badge color={item.isAvailable ? 'green' : 'red'}>
              {item.isAvailable ? 'In Stock' : 'Sold Out'}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">
            {item.description}
          </p>
        </div>

        {item.allergens && item.allergens.length > 0 && (
          <div className="rounded-lg bg-amber-50 p-3 border border-amber-200">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-800">
              Allergen Information
            </h4>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {item.allergens.map((allergen) => (
                <Badge key={allergen} color="yellow">
                  {allergen}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Quantity Stepper */}
        <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
          <span className="text-sm font-medium text-gray-700">Quantity</span>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleDecrement}
              disabled={quantity <= 1 || !isAvailable}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <input
              type="number"
              min={1}
              max={99}
              value={quantity}
              disabled={!isAvailable}
              onChange={handleQuantityInput}
              className="w-12 text-center text-sm font-semibold text-gray-900 focus:outline-none disabled:bg-transparent"
              aria-label="Item quantity"
            />
            <button
              type="button"
              onClick={handleIncrement}
              disabled={quantity >= 99 || !isAvailable}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={!isAvailable}
            onClick={handleAdd}
            className="flex-1 font-semibold"
          >
            {!isRestaurantOpen
              ? 'Restaurant Closed'
              : !item.isAvailable
              ? 'Unavailable'
              : `Add • ${formatUtils.formatCurrency(lineTotal)}`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
