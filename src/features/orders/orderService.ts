import axiosClient from '../../api/axiosClient';
import type { Order, ApiResponse, OrderStatus, PickupInfo } from '../../types';

interface PlaceOrderPayload {
  restaurantId: string;
  items: { menuItemId: string; quantity: number }[];
  pickupInfo: PickupInfo;
  payment: { cardNumber: string; expiry: string; cvv: string };
  discount: number;
}

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  'Placed': ['Confirmed', 'Cancelled'],
  'Confirmed': ['Preparing', 'Cancelled'],
  'Preparing': ['Ready for Pickup'],
  'Ready for Pickup': ['Completed'],
  'Completed': [],
  'Cancelled': [],
};

export const orderService = {
  async placeOrder(payload: PlaceOrderPayload): Promise<Order> {
    const response = await axiosClient.post<ApiResponse<Order>>('/orders', payload);
    return response.data.data;
  },

  async getOrder(id: string): Promise<Order> {
    const response = await axiosClient.get<ApiResponse<Order>>(`/orders/${id}`);
    return response.data.data;
  },

  async getOrders(): Promise<Order[]> {
    const response = await axiosClient.get<ApiResponse<Order[]>>('/orders');
    return response.data.data;
  },

  async cancelOrder(id: string): Promise<Order> {
    const response = await axiosClient.patch<ApiResponse<Order>>(`/orders/${id}/cancel`);
    return response.data.data;
  },

  isValidStatusTransition(from: OrderStatus, to: OrderStatus): boolean {
    return VALID_TRANSITIONS[from]?.includes(to) ?? false;
  },
};
