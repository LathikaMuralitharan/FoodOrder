
import axiosClient from '../../api/axiosClient';
import type { Restaurant, ApiResponse } from '../../types';

export const restaurantService = {
  async getRestaurants(): Promise<Restaurant[]> {
    const response = await axiosClient.get<ApiResponse<Restaurant[]>>(
      '/restaurants'
    );
    return response.data.data;
  },

  async getRestaurantById(id: string): Promise<Restaurant> {
    const restaurants = await this.getRestaurants();

    const restaurant = restaurants.find((item) => item.id === id);

    if (!restaurant) {
      throw new Error('Restaurant not found');
    }

    return restaurant;
  },
};

