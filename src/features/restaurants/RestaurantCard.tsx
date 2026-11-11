import { useState } from 'react';
import type { Restaurant } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { formatUtils } from '../../utils/formatUtils';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick: (id: string) => void;
}

const CUISINE_THEMES: Record<string, { icon: string; gradient: string }> = {
  Italian: { icon: '🍕', gradient: 'from-amber-500 to-rose-600' },
  Chinese: { icon: '🥢', gradient: 'from-red-600 to-orange-500' },
  Mexican: { icon: '🌮', gradient: 'from-emerald-600 to-teal-700' },
  Indian: { icon: '🍛', gradient: 'from-orange-500 to-amber-600' },
  American: { icon: '🍔', gradient: 'from-indigo-600 to-blue-600' },
  Thai: { icon: '🍜', gradient: 'from-rose-500 to-pink-600' },
};

export function RestaurantCard({ restaurant, onClick }: RestaurantCardProps) {
  const [imgError, setImgError] = useState(false);
  const theme = CUISINE_THEMES[restaurant.cuisineType] || { icon: '🍽️', gradient: 'from-gray-700 to-gray-900' };

  return (
    <article
      onClick={() => onClick(restaurant.id)}
      className={`group flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer ${
        !restaurant.isOpen ? 'opacity-70' : ''
      }`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(restaurant.id);
        }
      }}
    >
      {/* Consistent 16:10 Aspect-Ratio Image Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
        {!imgError ? (
          <img
            src={restaurant.imageUrl}
            alt={restaurant.name}
            className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
              !restaurant.isOpen ? 'grayscale' : ''
            }`}
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={`flex h-full w-full flex-col items-center justify-center bg-gradient-to-br ${theme.gradient} text-white`}>
            <span className="text-4xl">{theme.icon}</span>
            <span className="mt-1 text-xs font-semibold uppercase tracking-wider text-white/90">
              {restaurant.cuisineType}
            </span>
          </div>
        )}

        {/* Floating status badge */}
        <div className="absolute top-3 right-3">
          <Badge color={restaurant.isOpen ? 'green' : 'red'}>
            {restaurant.isOpen ? 'Open' : 'Closed'}
          </Badge>
        </div>

        {/* Cuisine pill */}
        <div className="absolute bottom-3 left-3">
          <span className="rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-xs">
            {restaurant.cuisineType}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
              {restaurant.name}
            </h3>
            <div
              className="flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200"
              aria-label={`Rating: ${restaurant.rating.toFixed(1)} / 5.0`}
            >
              <span className="text-amber-500" aria-hidden="true">★</span>
              <span>{restaurant.rating.toFixed(1)}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-gray-100 pt-3 text-xs text-gray-600">
          <div className="flex items-center gap-1.5">
            <svg className="h-4 w-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Prep: <strong>{formatUtils.formatPrepTime(restaurant.estimatedPrepTimeMinutes)}</strong></span>
          </div>
          <div className="flex items-center justify-end gap-1.5">
            <span className="text-gray-400">Min order:</span>
            <strong>{formatUtils.formatCurrency(restaurant.minimumOrderAmount)}</strong>
          </div>
        </div>
      </div>
    </article>
  );
}
