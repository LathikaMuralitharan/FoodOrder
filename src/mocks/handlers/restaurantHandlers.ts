import { http, HttpResponse } from 'msw';
import { mockRestaurants } from '../data/restaurants';
import type { Restaurant, ApiResponse } from '../../types';

export const restaurantHandlers = [
  http.get('/api/v1/restaurants', ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search')?.toLowerCase() ?? '';
    const cuisineType = url.searchParams.get('cuisineType') ?? '';
    const minRating = url.searchParams.get('minRating');
    const maxPrepTime = url.searchParams.get('maxPrepTime');
    const showClosed = url.searchParams.get('showClosed') === 'true';

    let filtered = [...mockRestaurants];

    if (search) {
      filtered = filtered.filter(r => r.name.toLowerCase().includes(search));
    }
    if (cuisineType) {
      filtered = filtered.filter(r => r.cuisineType === cuisineType);
    }
    if (minRating) {
      filtered = filtered.filter(r => r.rating >= parseFloat(minRating));
    }
    if (maxPrepTime) {
      filtered = filtered.filter(r => r.estimatedPrepTimeMinutes <= parseInt(maxPrepTime));
    }
    if (!showClosed) {
      filtered = filtered.filter(r => r.isOpen);
    }

    return HttpResponse.json<ApiResponse<Restaurant[]>>({ data: filtered }, { status: 200 });
  }),

  http.get('/api/v1/restaurants/:id', ({ params }) => {
    const restaurant = mockRestaurants.find(r => r.id === params.id);
    if (!restaurant) {
      return HttpResponse.json({ error: 'Restaurant not found.' }, { status: 404 });
    }
    return HttpResponse.json<ApiResponse<Restaurant>>({ data: restaurant }, { status: 200 });
  }),
];
