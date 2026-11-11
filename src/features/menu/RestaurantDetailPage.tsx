import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Restaurant } from '../../types';
import { restaurantService } from '../restaurants/restaurantService';
import { MenuPage } from './MenuPage';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Spinner } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatUtils } from '../../utils/formatUtils';
import type { MenuItem } from '../../types';

interface RestaurantDetailPageProps {
  onAddToCart?: (item: MenuItem, quantity: number, restaurantName: string) => void;
}

export function RestaurantDetailPage({ onAddToCart }: RestaurantDetailPageProps) {
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    restaurantService
      .getRestaurantById(id)
      .then((data) => {
        if (isMounted) setRestaurant(data);
      })
      .catch((err) => {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to load restaurant details.'
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
          <p className="mt-4 text-sm text-gray-500">Loading restaurant...</p>
        </div>
      </PageWrapper>
    );
  }

  if (error || !restaurant) {
    return (
      <PageWrapper>
        <div className="py-16">
          <EmptyState
            title="Restaurant not found"
            message={error || 'We could not find the restaurant you were looking for.'}
            actionLabel="Back to Restaurants"
            onAction={() => window.history.back()}
          />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Back Link */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            <svg
              className="h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
              />
            </svg>
            Back to Restaurants
          </Link>
        </div>

        {/* Restaurant Header Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-sm">
          <div className="relative h-48 sm:h-64 w-full bg-gray-100">
            <img
              src={restaurant.imageUrl}
              alt={restaurant.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white sm:bottom-6 sm:left-6 sm:right-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge color="indigo">{restaurant.cuisineType}</Badge>
                <Badge color={restaurant.isOpen ? 'green' : 'red'}>
                  {restaurant.isOpen ? 'Open for Pickup' : 'Closed'}
                </Badge>
              </div>
              <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                {restaurant.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-200">
                <span className="flex items-center gap-1">
                  <span className="text-yellow-400">★</span>
                  <span className="font-semibold text-white">
                    {restaurant.rating.toFixed(1)}
                  </span>
                </span>
                <span>•</span>
                <span>Pickup Prep: {formatUtils.formatPrepTime(restaurant.estimatedPrepTimeMinutes)}</span>
                <span>•</span>
                <span>Min Order: {formatUtils.formatCurrency(restaurant.minimumOrderAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Closed Restaurant Alert Banner */}
        {!restaurant.isOpen && (
          <div
            role="alert"
            className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900"
          >
            <svg
              className="h-5 w-5 shrink-0 text-amber-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
            <div className="text-sm">
              <p className="font-semibold">Restaurant is currently closed</p>
              <p className="text-amber-800">
                You can browse the menu items below, but ordering is temporarily disabled until the restaurant reopens.
              </p>
            </div>
          </div>
        )}

        {/* Menu Section */}
        <MenuPage
          restaurantId={restaurant.id}
          restaurantName={restaurant.name}
          isRestaurantOpen={restaurant.isOpen}
          onAddToCartProp={onAddToCart}
        />
      </div>
    </PageWrapper>
  );
}
