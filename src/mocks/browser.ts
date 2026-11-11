import { setupWorker } from 'msw/browser';
import { authHandlers } from './handlers/authHandlers';
import { restaurantHandlers } from './handlers/restaurantHandlers';
import { menuHandlers } from './handlers/menuHandlers';
import { orderHandlers } from './handlers/orderHandlers';
import { bedrockHandlers } from './handlers/bedrockHandlers';

export const worker = setupWorker(
  ...authHandlers,
  ...restaurantHandlers,
  ...menuHandlers,
  ...orderHandlers,
  ...bedrockHandlers,
);
