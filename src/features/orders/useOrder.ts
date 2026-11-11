import { useState } from 'react';
import { orderService } from './orderService';
import { usePolling } from '../../hooks/usePolling';
import type { Order } from '../../types';

export function useOrder(orderId: string) {
  const [order, setOrder] = useState<Order | null>(null);

  const fetchOrder = async () => {
    const data = await orderService.getOrder(orderId);
    setOrder(data);
    return data;
  };

  const isActive = order ? (order.status !== 'Completed' && order.status !== 'Cancelled') : true;
  const { error, isLoading } = usePolling(fetchOrder, 5000, isActive);

  return { order, setOrder, refresh: fetchOrder, isLoading, error };
}
