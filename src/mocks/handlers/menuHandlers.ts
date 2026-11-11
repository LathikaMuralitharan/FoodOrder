import { http, HttpResponse } from 'msw';
import { mockMenus } from '../data/menus';
import { mockRestaurants } from '../data/restaurants';
import type { MenuItem, ApiResponse } from '../../types';

export const menuHandlers = [
  http.get('/api/v1/restaurants/:id/menu', ({ params }) => {
    const restaurant = mockRestaurants.find(r => r.id === params.id);
    if (!restaurant) {
      return HttpResponse.json({ error: 'Restaurant not found.' }, { status: 404 });
    }
    const menu = mockMenus[params.id as string] ?? [];
    return HttpResponse.json<ApiResponse<MenuItem[]>>({ data: menu }, { status: 200 });
  }),
];
