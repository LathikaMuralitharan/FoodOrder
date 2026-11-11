import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { SearchBar } from './SearchBar';
import { FilterPanel } from './FilterPanel';
import { RestaurantList } from './RestaurantList';
import { useRestaurants } from './useRestaurants';

export function HomePage() {
  const navigate = useNavigate();
  const { restaurants, allRestaurants, isLoading, error, filters, setFilters, clearFilters, retry } = useRestaurants();

  const cuisines = [...new Set(allRestaurants.map(r => r.cuisineType))].sort();

  const handleCardClick = (id: string) => {
    navigate(`/restaurants/${id}`);
  };

  const hasActiveFilters = filters.search || filters.cuisineType || filters.minRating !== null || filters.maxPrepTime !== null || filters.showClosed;

  return (
    <PageWrapper>
      <div className="space-y-6 sm:space-y-8">
        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-900 px-6 py-8 text-white shadow-md sm:px-10 sm:py-10">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
              🛍️ Fast Self-Pickup
            </span>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              Browse Restaurants
            </h1>
            <p className="mt-2 text-base text-indigo-100 sm:text-lg">
              Order ahead from curated neighborhood kitchens and pick up fresh when ready.
            </p>
          </div>
          {/* Subtle decorative circles */}
          <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute right-40 -top-20 h-48 w-48 rounded-full bg-amber-400/10 blur-xl pointer-events-none" />
        </div>

        {/* Search & Filters */}
        <div className="space-y-4">
          <SearchBar
            value={filters.search}
            onChange={(search) => setFilters({ ...filters, search })}
          />

          <FilterPanel
            filters={filters}
            cuisines={cuisines}
            onChange={setFilters}
            onClear={clearFilters}
          />
        </div>

        {/* Results Counter / Header */}
        <div className="flex items-center justify-between px-1">
          <p className="text-sm font-medium text-gray-500">
            Showing <strong className="text-gray-900">{restaurants.length}</strong> {restaurants.length === 1 ? 'restaurant' : 'restaurants'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Reset all filters
            </button>
          )}
        </div>

        {restaurants.length === 0 && !isLoading && !error && hasActiveFilters ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-2xl">
              🔍
            </div>
            <h3 className="text-base font-semibold text-gray-900">No restaurants match your filters</h3>
            <p className="max-w-sm text-sm text-gray-500">
              Try adjusting your search query, clearing specific filters, or including closed locations.
            </p>
            <button
              onClick={clearFilters}
              className="mt-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-2xs hover:bg-indigo-700 transition"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <RestaurantList
            restaurants={restaurants}
            isLoading={isLoading}
            error={error}
            onRetry={retry}
            onCardClick={handleCardClick}
          />
        )}
      </div>
    </PageWrapper>
  );
}
