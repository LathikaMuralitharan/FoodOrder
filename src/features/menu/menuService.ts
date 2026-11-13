
import axiosClient from '../../api/axiosClient';
import type { MenuItem } from '../../types';

export const menuService = {
  async getMenu(restaurantId: string): Promise<MenuItem[]> {
    const response = await axiosClient.get<unknown>(
      `/restaurants/${restaurantId}/menu`
    );

    const result = response.data as {
      data?: unknown;
    };

    if (!Array.isArray(result?.data)) {
      throw new Error('Invalid menu data received from the server.');
    }

    return result.data as MenuItem[];
  },
};

