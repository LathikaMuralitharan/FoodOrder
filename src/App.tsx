import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Spinner } from './components/ui/Spinner';
import { AIAssistant } from './components/ai/AIAssistant';
import { useCart } from './features/cart/useCart';
import type { MenuItem } from './types';

// Lazy-loaded page components for route-level code splitting
const HomePage = lazy(() => import('./features/restaurants/HomePage').then((m) => ({ default: m.HomePage })));
const RestaurantDetailPage = lazy(() => import('./features/menu/RestaurantDetailPage').then((m) => ({ default: m.RestaurantDetailPage })));
const LoginPage = lazy(() => import('./features/auth/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./features/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const CartPage = lazy(() => import('./features/cart/CartPage').then((m) => ({ default: m.CartPage })));
const CheckoutPage = lazy(() => import('./features/checkout/CheckoutPage').then((m) => ({ default: m.CheckoutPage })));
const OrderDetailPage = lazy(() => import('./features/orders/OrderDetailPage').then((m) => ({ default: m.OrderDetailPage })));
const OrderHistoryPage = lazy(() => import('./features/orders/OrderHistoryPage').then((m) => ({ default: m.OrderHistoryPage })));
const OrderConfirmationPage = lazy(() => import('./features/orders/OrderConfirmationPage').then((m) => ({ default: m.OrderConfirmationPage })));
const NotFoundPage = lazy(() => import('./components/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

function PageSpinner() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}

// --- App with Router -----------------------------------------------------------

export default function App() {
  const { dispatch: cartDispatch, restaurantId: cartRestaurantId } = useCart();

  const handleAddToCart = (item: MenuItem, _quantity: number, restaurantName: string) => {
    // Multi-restaurant conflict: if cart has items from a different restaurant, clear it first
    if (cartRestaurantId !== null && cartRestaurantId !== item.restaurantId) {
      cartDispatch({ type: 'CLEAR_CART' });
    }
    cartDispatch({
      type: 'ADD_ITEM',
      payload: {
        item,
        restaurantId: item.restaurantId,
        restaurantName,
      },
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/60 text-slate-900">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<PageSpinner />}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/restaurants/:id" element={<RestaurantDetailPage onAddToCart={handleAddToCart} />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/orders" element={<OrderHistoryPage />} />
              <Route path="/orders/:id" element={<OrderDetailPage />} />
              <Route path="/orders/:id/confirmation" element={<OrderConfirmationPage />} />
            </Route>

            {/* 404 fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
      <AIAssistant />
      <Footer />
    </div>
  );
}
