import { useState, useMemo } from 'react';
import type { MenuItem } from '../../types';
import { useMenu } from './useMenu';
import { CategoryNav } from './CategoryNav';
import { MenuItemCard } from './MenuItemCard';
import { MenuItemDetail } from './MenuItemDetail';
import { useCart } from '../cart/useCart';
import { useDebounce } from '../../hooks/useDebounce';
import { SkeletonCard } from '../../components/ui/SkeletonCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';

interface MenuPageProps {
  restaurantId: string;
  restaurantName: string;
  isRestaurantOpen?: boolean;
  onAddToCartProp?: (item: MenuItem, quantity: number, restaurantName: string) => void;
}

export function MenuPage({
  restaurantId,
  restaurantName,
  isRestaurantOpen = true,
  onAddToCartProp,
}: MenuPageProps) {
  const { menuItems, isLoading, error } = useMenu(restaurantId);
  const cart = useCart();

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [detailItem, setDetailItem] = useState<MenuItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Multi-restaurant cart conflict state
  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const [pendingItem, setPendingItem] = useState<{ item: MenuItem; quantity: number } | null>(null);

  // Success toast state
  const [addedMessage, setAddedMessage] = useState<string | null>(null);

  const categories = useMemo(() => {
    const list: string[] = [];
    for (const item of menuItems) {
      if (!list.includes(item.category)) {
        list.push(item.category);
      }
    }
    return list;
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    if (!debouncedSearch.trim()) return menuItems;
    const term = debouncedSearch.toLowerCase();
    return menuItems.filter(
      (item) =>
        item.name.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term)
    );
  }, [menuItems, debouncedSearch]);

  const groupedItems = useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    for (const item of filteredItems) {
      if (!map.has(item.category)) {
        map.set(item.category, []);
      }
      map.get(item.category)!.push(item);
    }
    return map;
  }, [filteredItems]);

  const executeAddToCart = (item: MenuItem, quantity: number) => {
    if (onAddToCartProp) {
      onAddToCartProp(item, quantity, restaurantName);
    } else {
      cart.dispatch({
        type: 'ADD_ITEM',
        payload: { item, restaurantId, restaurantName, quantity },
      });
    }
    setAddedMessage(`Added ${quantity > 1 ? `${quantity}x ` : ''}"${item.name}" to cart`);
    setTimeout(() => setAddedMessage(null), 3000);
  };

  const handleAddToCart = (item: MenuItem, quantity = 1) => {
    if (!isRestaurantOpen || !item.isAvailable) return;

    // Check for multi-restaurant conflict
    if (cart.items.length > 0 && cart.restaurantId && cart.restaurantId !== restaurantId) {
      setPendingItem({ item, quantity });
      setConflictModalOpen(true);
      return;
    }

    executeAddToCart(item, quantity);
  };

  const confirmSwitchRestaurant = () => {
    if (!pendingItem) return;
    cart.dispatch({ type: 'CLEAR_CART' });
    executeAddToCart(pendingItem.item, pendingItem.quantity);
    setPendingItem(null);
    setConflictModalOpen(false);
  };

  const handleOpenDetail = (item: MenuItem) => {
    setDetailItem(item);
    setIsDetailOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-full animate-pulse rounded-xl bg-gray-200" />
        <div className="h-8 w-64 animate-pulse rounded-full bg-gray-200" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12">
        <EmptyState
          title="Could not load menu"
          message={error}
          actionLabel="Try Again"
          onAction={() => window.location.reload()}
        />
      </div>
    );
  }

  if (menuItems.length === 0) {
    return (
      <div className="py-12">
        <EmptyState
          title="Menu not available"
          message="This restaurant has not listed any menu items yet."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative">
        <input
          type="search"
          placeholder="Search food, drinks, or ingredients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search menu items"
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pl-11 text-sm shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <svg
          className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            aria-label="Clear search"
            className="absolute right-3.5 top-3.5 text-xs font-semibold text-gray-400 hover:text-gray-600"
          >
            Clear
          </button>
        )}
      </div>

      {/* Added to cart toast */}
      {addedMessage && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white shadow-xl animate-fade-in">
          <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>{addedMessage}</span>
        </div>
      )}

      {/* Category Navigation */}
      <CategoryNav categories={categories} />

      {/* Empty Search Result */}
      {filteredItems.length === 0 ? (
        <EmptyState
          title="No menu items match your search"
          message={`No items matched "${searchTerm}". Try a different keyword.`}
          actionLabel="Clear Search"
          onAction={() => setSearchTerm('')}
        />
      ) : (
        /* Categorized Menu Sections */
        <div className="space-y-12">
          {categories.map((category) => {
            const items = groupedItems.get(category);
            if (!items || items.length === 0) return null;

            const categorySlug = `category-${category.toLowerCase().replace(/\s+/g, '-')}`;

            return (
              <section
                key={category}
                id={categorySlug}
                className="scroll-mt-32 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <h2 className="text-xl font-bold text-gray-900">{category}</h2>
                  <span className="text-xs text-gray-500 font-medium">
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      isRestaurantOpen={isRestaurantOpen}
                      onViewDetail={handleOpenDetail}
                      onAddToCart={(it) => handleAddToCart(it, 1)}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Item Detail Modal */}
      <MenuItemDetail
        item={detailItem}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setDetailItem(null);
        }}
        isRestaurantOpen={isRestaurantOpen}
        onAddToCart={handleAddToCart}
      />

      {/* Multi-Restaurant Conflict Modal */}
      <Modal
        isOpen={conflictModalOpen}
        onClose={() => {
          setConflictModalOpen(false);
          setPendingItem(null);
        }}
        title="Start order from new restaurant?"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Your cart already has items from <strong className="text-gray-900">{cart.restaurantName}</strong>. 
            FoodOrder is for self-pickup from a single location at a time.
          </p>
          <p className="text-sm text-gray-600">
            Would you like to clear your current cart and start a new order with <strong className="text-gray-900">{restaurantName}</strong>?
          </p>
          <div className="flex items-center justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setConflictModalOpen(false);
                setPendingItem(null);
              }}
            >
              Keep Current Cart
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={confirmSwitchRestaurant}
            >
              Clear Cart & Add Item
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
