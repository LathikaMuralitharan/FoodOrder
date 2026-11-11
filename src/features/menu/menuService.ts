import axiosClient from '../../api/axiosClient';
import type { MenuItem, ApiResponse } from '../../types';

export const menuService = {
  async getMenu(restaurantId: string): Promise<MenuItem[]> {
    const response = await axiosClient.get<ApiResponse<MenuItem[]>>(`/restaurants/${restaurantId}/menu`);
    return response.data.data;
  },
};
