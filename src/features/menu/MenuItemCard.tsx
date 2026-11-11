import type { MenuItem } from '../../types';
import { formatUtils } from '../../utils/formatUtils';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

interface MenuItemCardProps {
  item: MenuItem;
  isRestaurantOpen?: boolean;
  onViewDetail: (item: MenuItem) => void;
  onAddToCart: (item: MenuItem) => void;
}

export function MenuItemCard({
  item,
  isRestaurantOpen = true,
  onViewDetail,
  onAddToCart,
}: MenuItemCardProps) {
  const isAvailable = item.isAvailable && isRestaurantOpen;

  return (
    <article
      className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md ${
        !item.isAvailable ? 'opacity-60' : ''
      }`}
    >
      <div
        className="cursor-pointer"
        onClick={() => onViewDetail(item)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onViewDetail(item);
          }
        }}
      >
        <div className="relative h-44 w-full overflow-hidden bg-gray-100">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              // fallback image if broken link
              (e.currentTarget as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
            }}
          />
          {!item.isAvailable && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="rounded bg-black/75 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                Sold Out
              </span>
            </div>
          )}
          {item.allergens && item.allergens.length > 0 && (
            <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
              <Badge color="yellow">Allergens</Badge>
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-semibold text-gray-900 group-hover:text-indigo-600">
              {item.name}
            </h3>
            <span className="font-bold text-gray-900">
              {formatUtils.formatCurrency(item.price)}
            </span>
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-gray-500">
            {item.description}
          </p>
        </div>
      </div>

      <div className="border-t border-gray-100 p-4 pt-3">
        <Button
          type="button"
          variant="primary"
          disabled={!isAvailable}
          onClick={() => onAddToCart(item)}
          className="w-full text-sm"
        >
          {!isRestaurantOpen
            ? 'Restaurant Closed'
            : !item.isAvailable
            ? 'Unavailable'
            : 'Add to Cart'}
        </Button>
      </div>
    </article>
  );
}
