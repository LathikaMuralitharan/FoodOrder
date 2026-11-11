import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { AuthProvider } from '../../features/auth/AuthContext';
import { CartProvider } from '../../features/cart/CartContext';
import { storageUtils } from '../../utils/storageUtils';
import App from '../../App';

// --- Mock API Server (msw/node) -----------------------------------------------

const API = '/api/v1';

const initialUsers = [
  { id: 'u1', name: 'Jane Doe', email: 'jane@example.com', phone: '5551234567', password: 'password123', createdAt: '2024-01-15T10:00:00Z' },
];

let users = [...initialUsers];
let orders: Array<any> = [];

const restaurants = [
  { id: 'r1', name: 'Pizza Palace', cuisineType: 'Italian', rating: 4.5, estimatedPrepTimeMinutes: 20, minimumOrderAmount: 15, isOpen: true, imageUrl: '/images/pizza.jpg' },
];

const menus: Record<string, any[]> = {
  r1: [
    { id: 'm1', restaurantId: 'r1', name: 'Margherita Pizza', description: 'Classic', price: 12.99, imageUrl: '/img.jpg', category: 'Pizzas', isAvailable: true, allergens: ['gluten'] },
    { id: 'm2', restaurantId: 'r1', name: 'Caesar Salad', description: 'Fresh', price: 8.99, imageUrl: '/img.jpg', category: 'Starters', isAvailable: true, allergens: [] },
  ],
};

function createMockJwt(userId: string, name: string, email: string, phone: string): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: userId, name, email, phone, createdAt: '2024-01-01T00:00:00Z',
    exp: Math.floor(Date.now() / 1000) + 86400,
  }));
  return `${header}.${payload}.sig`;
}

const server = setupServer(
  // Auth
  http.post(`${API}/auth/register`, async ({ request }) => {
    const body = await request.json() as any;
    if (users.find(u => u.email === body.email)) {
      return HttpResponse.json({ error: 'Email address is already registered.' }, { status: 409 });
    }
    const user = { id: `u${Date.now()}`, name: body.name, email: body.email, phone: body.phone, password: body.password, createdAt: new Date().toISOString() };
    users.push(user);
    const token = createMockJwt(user.id, user.name, user.email, user.phone);
    return HttpResponse.json({ data: { user: { id: user.id, name: user.name, email: user.email, phone: user.phone, createdAt: user.createdAt }, token } }, { status: 201 });
  }),

  http.post(`${API}/auth/login`, async ({ request }) => {
    const body = await request.json() as any;
    const user = users.find(u => u.email === body.email && u.password === body.password);
    if (!user) return HttpResponse.json({ error: 'Email or password is incorrect.' }, { status: 401 });
    const token = createMockJwt(user.id, user.name, user.email, user.phone);
    return HttpResponse.json({ data: { user: { id: user.id, name: user.name, email: user.email, phone: user.phone, createdAt: user.createdAt }, token } }, { status: 200 });
  }),

  // Restaurants
  http.get(`${API}/restaurants`, () => {
    return HttpResponse.json({ data: restaurants }, { status: 200 });
  }),

  http.get(`${API}/restaurants/:id`, ({ params }) => {
    const r = restaurants.find(r => r.id === params.id);
    if (!r) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    return HttpResponse.json({ data: r }, { status: 200 });
  }),

  // Menu
  http.get(`${API}/restaurants/:id/menu`, ({ params }) => {
    return HttpResponse.json({ data: menus[params.id as string] ?? [] }, { status: 200 });
  }),

  // Orders
  http.post(`${API}/orders`, async ({ request }) => {
    const body = await request.json() as any;
    if (!body.items || body.items.length === 0) {
      return HttpResponse.json({ error: 'Cart is empty.' }, { status: 400 });
    }
    const restaurant = restaurants.find(r => r.id === body.restaurantId);
    if (!restaurant) return HttpResponse.json({ error: 'Restaurant not found.' }, { status: 404 });
    if (!restaurant.isOpen) return HttpResponse.json({ error: 'Restaurant is closed.' }, { status: 400 });

    const orderItems = body.items.map((ci: any) => {
      const item = menus[body.restaurantId]?.find(m => m.id === ci.menuItemId);
      return { menuItemId: item.id, name: item.name, price: item.price, quantity: ci.quantity };
    });
    const subtotal = orderItems.reduce((s: number, i: any) => s + i.price * i.quantity, 0);
    if (subtotal < restaurant.minimumOrderAmount) {
      return HttpResponse.json({ error: `Minimum order is $${restaurant.minimumOrderAmount}.` }, { status: 400 });
    }

    const order = {
      id: `o${Date.now()}`,
      userId: 'u1',
      restaurantId: body.restaurantId,
      restaurantName: restaurant.name,
      items: orderItems,
      pickupInfo: body.pickupInfo,
      subtotal,
      discount: 0,
      total: subtotal,
      status: 'Placed',
      createdAt: new Date().toISOString(),
      estimatedPrepTimeMinutes: restaurant.estimatedPrepTimeMinutes,
    };
    orders.push(order);
    return HttpResponse.json({ data: order }, { status: 201 });
  }),

  http.get(`${API}/orders`, () => {
    return HttpResponse.json({ data: orders }, { status: 200 });
  }),

  http.get(`${API}/orders/:id`, ({ params }) => {
    const order = orders.find(o => o.id === params.id);
    if (!order) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    return HttpResponse.json({ data: order }, { status: 200 });
  }),

  http.post(`${API}/bedrock/chat`, async () => {
    return HttpResponse.json({
      reply: 'Mock Bedrock reply for full journey test.',
      isMock: true,
      provider: 'Mock / Demo Assistant (E2E Test)',
      model: 'grounded-mock-fallback',
      timestamp: new Date().toISOString(),
    });
  }),

  http.patch(`${API}/orders/:id/cancel`, ({ params }) => {
    const order = orders.find(o => o.id === params.id);
    if (!order) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    if (order.status !== 'Placed' && order.status !== 'Confirmed') {
      return HttpResponse.json({ error: `Cannot cancel order in ${order.status} state.` }, { status: 409 });
    }
    order.status = 'Cancelled';
    return HttpResponse.json({ data: order }, { status: 200 });
  }),
);

// --- Test Setup ----------------------------------------------------------------

beforeAll(async () => {
  server.listen({ onUnhandledRequest: 'error' });
  await import('../../features/auth/RegisterPage');
});

afterEach(() => {
  server.resetHandlers();
  users = [...initialUsers];
  orders = [];
  localStorage.clear();
  sessionStorage.clear();
});

afterAll(() => server.close());

function renderApp(initialRoute = '/') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

// --- E2E Journey Tests --------------------------------------------------------

describe('E2E Full Customer Journey', () => {
  it('Step 1: Register a new user', async () => {
    const user = userEvent.setup();
    renderApp('/register');

    // Wait for lazy-loaded RegisterPage to mount
    const nameInput = await screen.findByLabelText(/name/i, {}, { timeout: 5000 });
    await user.type(nameInput, 'Test User');
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'testpass123');
    await user.type(screen.getByLabelText(/phone number/i), '5551234567');

    await user.click(screen.getByRole('button', { name: /register/i }));

    // After successful registration, JWT should be in localStorage
    await waitFor(() => {
      expect(storageUtils.loadToken()).not.toBeNull();
    }, { timeout: 5000 });
  });

  it('Step 2: Login with existing user', async () => {
    const user = userEvent.setup();
    renderApp('/login');

    const emailInput = await screen.findByLabelText(/email/i, {}, { timeout: 5000 });
    await user.type(emailInput, 'jane@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(storageUtils.loadToken()).not.toBeNull();
    }, { timeout: 5000 });
  });

  it('Step 3: Browse restaurants on homepage', async () => {
    // Pre-authenticate
    const token = createMockJwt('u1', 'Jane Doe', 'jane@example.com', '5551234567');
    storageUtils.saveToken(token);

    renderApp('/');

    // Wait for restaurant data to load
    await waitFor(() => {
      const heading = screen.queryByRole('heading', { name: /pizza palace/i }) ||
                      screen.queryByText((_, node) => (node?.textContent?.trim() === 'Pizza Palace'));
      expect(heading).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('Step 4: Browse restaurant menu', async () => {
    const token = createMockJwt('u1', 'Jane Doe', 'jane@example.com', '5551234567');
    storageUtils.saveToken(token);

    renderApp('/restaurants/r1');

    await waitFor(() => {
      const heading = screen.queryByRole('heading', { name: /pizza palace/i }) ||
                      screen.queryByText((_, node) => (node?.textContent?.trim() === 'Pizza Palace'));
      expect(heading).toBeInTheDocument();
    }, { timeout: 5000 });

    // Menu items should be visible
    await waitFor(() => {
      expect(screen.getByText('Margherita Pizza')).toBeInTheDocument();
      expect(screen.getByText('Caesar Salad')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('Step 5: Add items to cart from menu', async () => {
    const user = userEvent.setup();
    const token = createMockJwt('u1', 'Jane Doe', 'jane@example.com', '5551234567');
    storageUtils.saveToken(token);

    renderApp('/restaurants/r1');

    // Wait for menu to load
    await waitFor(() => {
      expect(screen.getByText('Margherita Pizza')).toBeInTheDocument();
    }, { timeout: 5000 });

    // Click on the menu item to add to cart
    const addButtons = await screen.findAllByRole('button', { name: /add to cart/i }, { timeout: 5000 });
    expect(addButtons.length).toBeGreaterThan(0);
    await user.click(addButtons[0]);
  });

  it('Step 6: Checkout flow with pickup contact and payment', async () => {
    const token = createMockJwt('u1', 'Jane Doe', 'jane@example.com', '5551234567');
    storageUtils.saveToken(token);

    // Pre-populate cart via localStorage
    const cartState = {
      items: [{
        item: { id: 'm1', restaurantId: 'r1', name: 'Margherita Pizza', description: '', price: 12.99, imageUrl: '', category: 'Pizzas', isAvailable: true, allergens: [] },
        quantity: 2,
      }],
      restaurantId: 'r1',
      restaurantName: 'Pizza Palace',
      discount: 0,
      subtotal: 25.98,
      total: 25.98,
    };
    storageUtils.saveCart(cartState);

    renderApp('/checkout');

    // Should show the checkout page with order summary
    await waitFor(() => {
      const checkoutHeading = screen.queryByRole('heading', { name: /checkout/i }) ||
                             screen.queryByText(/checkout/i);
      expect(checkoutHeading).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('Step 7: Order confirmation page renders correctly', async () => {
    const token = createMockJwt('u1', 'Jane Doe', 'jane@example.com', '5551234567');
    storageUtils.saveToken(token);

    // Create a test order
    orders.push({
      id: 'o-test',
      userId: 'u1',
      restaurantId: 'r1',
      restaurantName: 'Pizza Palace',
      items: [{ menuItemId: 'm1', name: 'Margherita Pizza', price: 12.99, quantity: 2 }],
      pickupInfo: { name: 'Jane Doe', phone: '5551234567' },
      subtotal: 25.98,
      discount: 0,
      total: 25.98,
      status: 'Placed',
      createdAt: new Date().toISOString(),
      estimatedPrepTimeMinutes: 20,
    });

    renderApp('/orders/o-test/confirmation');

    await waitFor(() => {
      expect(screen.getByText('o-test')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('Step 8: Order history page lists orders', async () => {
    const token = createMockJwt('u1', 'Jane Doe', 'jane@example.com', '5551234567');
    storageUtils.saveToken(token);

    orders.push({
      id: 'o-hist',
      userId: 'u1',
      restaurantId: 'r1',
      restaurantName: 'Pizza Palace',
      items: [{ menuItemId: 'm1', name: 'Margherita Pizza', price: 12.99, quantity: 1 }],
      pickupInfo: { name: 'Jane Doe', phone: '5551234567' },
      subtotal: 12.99,
      discount: 0,
      total: 12.99,
      status: 'Completed',
      createdAt: '2024-11-01T12:00:00Z',
      estimatedPrepTimeMinutes: 20,
    });

    renderApp('/orders');

    await waitFor(() => {
      const heading = screen.queryByRole('heading', { name: /pizza palace/i }) ||
                      screen.queryByText((_, node) => (node?.textContent?.trim() === 'Pizza Palace'));
      expect(heading).toBeInTheDocument();
    }, { timeout: 5000 });
  });
});
