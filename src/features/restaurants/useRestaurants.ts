import { useState, useEffect, useCallback, useMemo } from 'react';
import { restaurantService } from './restaurantService';
import type { Restaurant, FilterState } from '../../types';

const defaultFilters: FilterState = {
  search: '',
  cuisineType: null,
  minRating: null,
  maxPrepTime: null,
  showClosed: false,
};

export function useRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  const fetchRestaurants = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await restaurantService.getRestaurants();
      setRestaurants(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load restaurants.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  const retry = useCallback(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const filteredRestaurants = useMemo(() => {
    let filtered = [...restaurants];

    if (filters.search) {
      filtered = filtered.filter(r => r.name.toLowerCase().includes(filters.search.toLowerCase()));
    }
    if (filters.cuisineType) {
      filtered = filtered.filter(r => r.cuisineType === filters.cuisineType);
    }
    if (filters.minRating !== null) {
      filtered = filtered.filter(r => r.rating >= filters.minRating!);
    }
    if (filters.maxPrepTime !== null) {
      filtered = filtered.filter(r => r.estimatedPrepTimeMinutes <= filters.maxPrepTime!);
    }
    if (!filters.showClosed) {
      filtered = filtered.filter(r => r.isOpen);
    }

    return filtered;
  }, [restaurants, filters]);

  return {
    restaurants: filteredRestaurants,
    allRestaurants: restaurants,
    isLoading,
    error,
    filters,
    setFilters,
    clearFilters,
    retry,
  };
}
