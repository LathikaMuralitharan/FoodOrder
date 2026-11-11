import { http, HttpResponse } from 'msw';
import { mockOrders } from '../data/orders';
import { mockRestaurants } from '../data/restaurants';
import { mockMenus } from '../data/menus';
import type { Order, ApiResponse, OrderStatus, PickupInfo } from '../../types';

function getUserIdFromToken(request: Request): string | null {
  const auth = request.headers.get('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

const statusProgression: OrderStatus[] = ['Placed', 'Confirmed', 'Preparing', 'Ready for Pickup', 'Completed'];

function getProgressedStatus(createdAt: string): OrderStatus {
  const elapsed = Date.now() - new Date(createdAt).getTime();
  const stepMs = 10 * 1000; // 10 seconds per step for demo
  const stepIndex = Math.floor(elapsed / stepMs);
  if (stepIndex >= statusProgression.length) return 'Completed';
  return statusProgression[stepIndex];
}

export const orderHandlers = [
  http.post('/api/v1/orders', async ({ request }) => {
    const userId = getUserIdFromToken(request);
    if (!userId) {
      return HttpResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await request.json() as {
      restaurantId: string;
      items: { menuItemId: string; quantity: number }[];
      pickupInfo: PickupInfo;
      payment: { cardNumber: string; expiry: string; cvv: string };
      discount: number;
    };

    // Validate empty cart
    if (!body.items || body.items.length === 0) {
      return HttpResponse.json({ error: 'Your cart is empty.' }, { status: 400 });
    }

    // Get restaurant
    const restaurant = mockRestaurants.find(r => r.id === body.restaurantId);
    if (!restaurant) {
      return HttpResponse.json({ error: 'Restaurant not found.' }, { status: 404 });
    }

    // Check if restaurant is open
    if (!restaurant.isOpen) {
      return HttpResponse.json({ error: 'This restaurant is currently closed.' }, { status: 400 });
    }

    // Build order items and validate availability
    const orderItems = [];
    let subtotal = 0;
    for (const cartItem of body.items) {
      const menu = mockMenus[body.restaurantId] ?? [];
      const menuItem = menu.find(m => m.id === cartItem.menuItemId);
      if (!menuItem) {
        return HttpResponse.json({ error: `Menu item not found: ${cartItem.menuItemId}` }, { status: 422 });
      }
      if (!menuItem.isAvailable) {
        return HttpResponse.json({ error: `Menu item '${menuItem.name}' is currently unavailable.` }, { status: 422 });
      }
      orderItems.push({
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: cartItem.quantity,
      });
      subtotal += menuItem.price * cartItem.quantity;
    }

    // Check minimum order amount
    if (subtotal < restaurant.minimumOrderAmount) {
      return HttpResponse.json(
        { error: `Cart subtotal of $${subtotal.toFixed(2)} does not meet the minimum order amount of $${restaurant.minimumOrderAmount.toFixed(2)}.` },
        { status: 400 }
      );
    }

    const discount = Math.max(body.discount ?? 0, 0);
    const total = Math.max(subtotal - discount, 0);

    const newOrder: Order = {
      id: `o${Date.now()}`,
      userId,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      items: orderItems,
      pickupInfo: body.pickupInfo,
      subtotal,
      discount,
      total,
      status: 'Placed',
      createdAt: new Date().toISOString(),
      estimatedPrepTimeMinutes: restaurant.estimatedPrepTimeMinutes,
    };

    mockOrders.push(newOrder);

    return HttpResponse.json<ApiResponse<Order>>({ data: newOrder }, { status: 201 });
  }),

  http.get('/api/v1/orders', ({ request }) => {
    const userId = getUserIdFromToken(request);
    if (!userId) {
      return HttpResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    // Update statuses based on elapsed time
    const orders = mockOrders
      .filter(o => o.userId === userId)
      .map(o => {
        if (o.status !== 'Cancelled' && o.status !== 'Completed') {
          return { ...o, status: getProgressedStatus(o.createdAt) };
        }
        return o;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return HttpResponse.json<ApiResponse<Order[]>>({ data: orders }, { status: 200 });
  }),

  http.get('/api/v1/orders/:id', ({ request, params }) => {
    const userId = getUserIdFromToken(request);
    if (!userId) {
      return HttpResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const order = mockOrders.find(o => o.id === params.id);
    if (!order) {
      return HttpResponse.json({ error: 'Order not found.' }, { status: 404 });
    }
    if (order.userId !== userId) {
      return HttpResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    // Progress status
    let progressedOrder = order;
    if (order.status !== 'Cancelled' && order.status !== 'Completed') {
      progressedOrder = { ...order, status: getProgressedStatus(order.createdAt) };
    }

    return HttpResponse.json<ApiResponse<Order>>({ data: progressedOrder }, { status: 200 });
  }),

  http.patch('/api/v1/orders/:id/cancel', ({ request, params }) => {
    const userId = getUserIdFromToken(request);
    if (!userId) {
      return HttpResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const order = mockOrders.find(o => o.id === params.id);
    if (!order) {
      return HttpResponse.json({ error: 'Order not found.' }, { status: 404 });
    }
    if (order.userId !== userId) {
      return HttpResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    if (order.status !== 'Placed' && order.status !== 'Confirmed') {
      return HttpResponse.json(
        { error: `Cannot cancel an order that is already ${order.status}.` },
        { status: 409 }
      );
    }

    order.status = 'Cancelled';
    return HttpResponse.json<ApiResponse<Order>>({ data: order }, { status: 200 });
  }),
];
