import type { Restaurant } from '../../types';
import { RestaurantCard } from './RestaurantCard';
import { SkeletonCard } from '../../components/ui/SkeletonCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';

interface RestaurantListProps {
  restaurants: Restaurant[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onCardClick: (id: string) => void;
}

export function RestaurantList({ restaurants, isLoading, error, onRetry, onCardClick }: RestaurantListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <p className="text-gray-600">{error}</p>
        <Button variant="primary" onClick={onRetry}>Retry</Button>
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <EmptyState
        title="No restaurants available"
        message="There are no restaurants to display right now. Please try again later."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {restaurants.map(restaurant => (
        <RestaurantCard key={restaurant.id} restaurant={restaurant} onClick={onCardClick} />
      ))}
    </div>
  );
}
