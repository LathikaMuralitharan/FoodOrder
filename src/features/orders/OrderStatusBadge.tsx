import type { OrderStatus } from '../../types';
import { Badge } from '../../components/ui/Badge';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const colorMap: Record<OrderStatus, 'blue' | 'indigo' | 'yellow' | 'purple' | 'green' | 'red'> = {
    'Placed': 'blue',
    'Confirmed': 'indigo',
    'Preparing': 'yellow',
    'Ready for Pickup': 'purple',
    'Completed': 'green',
    'Cancelled': 'red',
  };

  return (
    <span aria-label={`Order status: ${status}`}>
      <Badge color={colorMap[status] || 'gray'}>{status}</Badge>
    </span>
  );
}
