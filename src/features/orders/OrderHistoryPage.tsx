import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { OrderStatus } from '../../types';
import { useOrderHistory } from './useOrderHistory';
import { OrderStatusBadge } from './OrderStatusBadge';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { SkeletonCard } from '../../components/ui/SkeletonCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatUtils } from '../../utils/formatUtils';

const ALL_STATUSES: (OrderStatus | 'All')[] = [
  'All',
  'Placed',
  'Confirmed',
  'Preparing',
  'Ready for Pickup',
  'Completed',
  'Cancelled',
];

export function OrderHistoryPage() {
  const navigate = useNavigate();
  const { orders, isLoading, error, refresh } = useOrderHistory();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'All'>('All');

  const filteredOrders = useMemo(() => {
    if (selectedStatus === 'All') return orders;
    return orders.filter((o) => o.status === selectedStatus);
  }, [orders, selectedStatus]);

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="mx-auto max-w-4xl space-y-4">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-200" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <div className="py-16">
          <EmptyState
            title="Failed to load orders"
            message={error}
            actionLabel="Try Again"
            onAction={refresh}
          />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order History</h1>
            <p className="mt-1 text-sm text-gray-500">
              View and track all your self-pickup food orders
            </p>
          </div>

          {/* Status Filter Dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="status-filter" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Filter:
            </label>
            <select
              id="status-filter"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as OrderStatus | 'All')}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {ALL_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status === 'All' ? 'All Statuses' : status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Empty States */}
        {orders.length === 0 ? (
          <div className="py-16">
            <EmptyState
              title="No orders yet"
              message="You haven't placed any self-pickup orders yet. Browse our restaurants to pick up your next meal!"
              actionLabel="Browse Restaurants"
              onAction={() => navigate('/')}
            />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-12">
            <EmptyState
              title="No matching orders"
              message={`You don't have any orders with status "${selectedStatus}".`}
              actionLabel="Show All Orders"
              onAction={() => setSelectedStatus('All')}
            />
          </div>
        ) : (
          /* Order List */
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const totalItems = order.items.reduce((sum, it) => sum + it.quantity, 0);

              return (
                <div
                  key={order.id}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/orders/${order.id}`);
                    }
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-3">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {order.restaurantName}
                      </h2>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">
                        ID: {order.id} &nbsp;•&nbsp; {formatUtils.formatDate(order.createdAt)}
                      </p>
                    </div>

                    <div>
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                    <div className="text-gray-600">
                      <span className="font-medium text-gray-800">{totalItems}</span> {totalItems === 1 ? 'item' : 'items'}
                      <span className="mx-2 text-gray-300">•</span>
                      <span className="text-xs text-gray-500">
                        {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-base font-bold text-gray-900">
                        {formatUtils.formatCurrency(order.total)}
                      </span>
                      <span className="text-xs font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                        Details →
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
