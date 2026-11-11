import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './features/auth/AuthContext'
import { CartProvider } from './features/cart/CartContext'
import './index.css'
import App from './App.tsx'

async function startApp() {
  // Start MSW worker in development
  if (import.meta.env.DEV) {
    try {
      const { worker } = await import('./mocks/browser');
      await worker.start({
        onUnhandledRequest: 'bypass',
        serviceWorker: { url: '/mockServiceWorker.js' },
      });
    } catch (error) {
      console.error('[MSW] Failed to start Mock Service Worker in development:', error);
      const rootEl = document.getElementById('root');
      if (rootEl) {
        rootEl.innerHTML = `
          <div style="font-family: system-ui, sans-serif; padding: 2rem; max-width: 600px; margin: 2rem auto; border: 1px solid #fecaca; background: #fef2f2; border-radius: 8px; color: #991b1b;">
            <h2 style="margin-top: 0; font-size: 1.25rem; font-weight: 700;">Development Setup Error: MSW Service Worker</h2>
            <p style="font-size: 0.875rem; line-height: 1.5;">Failed to initialize Mock Service Worker. Ensure <code>public/mockServiceWorker.js</code> is present.</p>
            <pre style="background: #ffffff; padding: 0.75rem; border-radius: 4px; overflow-x: auto; font-size: 0.75rem; border: 1px solid #fee2e2;">${error instanceof Error ? error.stack || error.message : String(error)}</pre>
          </div>
        `;
      }
      return;
    }
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </StrictMode>,
  );
}

startApp().catch((err) => {
  console.error('[App] Fatal startup error:', err);
});
