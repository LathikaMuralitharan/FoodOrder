import { useCartContext } from './CartContext';


export function useCart() {
  const { items, restaurantId, restaurantName, discount, subtotal, total, dispatch } = useCartContext();
  const itemCount = items.reduce((sum, ci) => sum + ci.quantity, 0);
  return { items, restaurantId, restaurantName, discount, subtotal, total, itemCount, dispatch };
}
