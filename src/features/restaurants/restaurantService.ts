import axiosClient from '../../api/axiosClient';
import type { Restaurant, ApiResponse } from '../../types';

export const restaurantService = {
  async getRestaurants(): Promise<Restaurant[]> {
    const response = await axiosClient.get<ApiResponse<Restaurant[]>>('/restaurants');
    return response.data.data;
  },

  async getRestaurantById(id: string): Promise<Restaurant> {
    const response = await axiosClient.get<ApiResponse<Restaurant>>(`/restaurants/${id}`);
    return response.data.data;
  },
};
