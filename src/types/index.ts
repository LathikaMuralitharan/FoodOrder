// --- Validation --------------------------------------------------------------

export interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

// --- Auth / Forms -------------------------------------------------------------

export interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string; // ISO 8601
}

// --- Restaurant ---------------------------------------------------------------

export interface Restaurant {
  id: string;
  name: string;
  cuisineType: string;
  rating: number; // 0.0–5.0
  estimatedPrepTimeMinutes: number;
  minimumOrderAmount: number;
  isOpen: boolean;
  imageUrl: string;
}

// --- Menu --------------------------------------------------------------------

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number; // >= 0
  imageUrl: string;
  category: string;
  isAvailable: boolean;
  allergens: string[];
}

// --- Cart --------------------------------------------------------------------

export interface CartItem {
  item: MenuItem;
  quantity: number; // 1–99
}

export interface CartState {
  items: CartItem[];
  restaurantId: string | null;
  restaurantName: string | null;
  discount: number;
  subtotal: number;
  total: number;
}

// --- Orders ------------------------------------------------------------------

export type OrderStatus =
  | 'Placed'
  | 'Confirmed'
  | 'Preparing'
  | 'Ready for Pickup'
  | 'Completed'
  | 'Cancelled';

/** Contact info for self-pickup (no delivery address). */
export interface PickupInfo {
  name: string;
  phone: string;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  restaurantId: string;
  restaurantName: string;
  items: OrderItem[];
  pickupInfo: PickupInfo;
  subtotal: number;
  discount: number;
  total: number;
  status: OrderStatus;
  createdAt: string; // ISO 8601
  estimatedPrepTimeMinutes: number;
}

// --- Payment (mock) -----------------------------------------------------------

export interface MockPaymentInfo {
  cardNumber: string;
  expiry: string;
  cvv: string;
}

// --- API helpers --------------------------------------------------------------

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  statusCode?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// --- Filtering ---------------------------------------------------------------

export interface FilterState {
  search: string;
  cuisineType: string | null;
  minRating: number | null;
  maxPrepTime: number | null;
  showClosed: boolean;
}
