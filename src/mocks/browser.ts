
import { setupWorker } from 'msw/browser';
import { authHandlers } from './handlers/authHandlers';
import { restaurantHandlers } from './handlers/restaurantHandlers';
import { menuHandlers } from './handlers/menuHandlers';
import { orderHandlers } from './handlers/orderHandlers';

export const worker = setupWorker(
  ...authHandlers,
  ...restaurantHandlers,
  ...menuHandlers,
  ...orderHandlers,
);

