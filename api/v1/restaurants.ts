
import type { VercelRequest, VercelResponse } from '@vercel/node';

const restaurants = [
  {
    id: 'r1',
    name: 'Pizza Palace',
    cuisineType: 'Italian',
    rating: 4.5,
    estimatedPrepTimeMinutes: 20,
    minimumOrderAmount: 15,
    isOpen: true,
    imageUrl: '/images/pizza-palace.jpg',
  },
  {
    id: 'r2',
    name: 'Dragon Wok',
    cuisineType: 'Chinese',
    rating: 4.2,
    estimatedPrepTimeMinutes: 25,
    minimumOrderAmount: 12,
    isOpen: true,
    imageUrl: '/images/dragon-wok.jpg',
  },
  {
    id: 'r3',
    name: 'Taco Fiesta',
    cuisineType: 'Mexican',
    rating: 4.7,
    estimatedPrepTimeMinutes: 15,
    minimumOrderAmount: 10,
    isOpen: true,
    imageUrl: '/images/taco-fiesta.jpg',
  },
  {
    id: 'r4',
    name: 'Curry House',
    cuisineType: 'Indian',
    rating: 4.3,
    estimatedPrepTimeMinutes: 30,
    minimumOrderAmount: 18,
    isOpen: true,
    imageUrl: '/images/curry-house.jpg',
  },
  {
    id: 'r5',
    name: 'Burger Joint',
    cuisineType: 'American',
    rating: 4.0,
    estimatedPrepTimeMinutes: 10,
    minimumOrderAmount: 8,
    isOpen: true,
    imageUrl: '/images/burger-joint.jpg',
  },
  {
    id: 'r6',
    name: 'Thai Garden',
    cuisineType: 'Thai',
    rating: 4.6,
    estimatedPrepTimeMinutes: 35,
    minimumOrderAmount: 14,
    isOpen: false,
    imageUrl: '/images/thai-garden.jpg',
  },
];

export default function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const search = String(req.query.search ?? '').toLowerCase();
  const cuisineType = String(req.query.cuisineType ?? '');
  const minRating = Number(req.query.minRating);
  const maxPrepTime = Number(req.query.maxPrepTime);
  const showClosed = req.query.showClosed === 'true';

  const filtered = restaurants.filter((restaurant) => {
    if (search && !restaurant.name.toLowerCase().includes(search)) return false;
    if (cuisineType && restaurant.cuisineType !== cuisineType) return false;
    if (req.query.minRating && restaurant.rating < minRating) return false;
    if (req.query.maxPrepTime && restaurant.estimatedPrepTimeMinutes > maxPrepTime) return false;
    if (!showClosed && !restaurant.isOpen) return false;
    return true;
  });

  return res.status(200).json({
    data: filtered,
    message: 'Restaurants loaded successfully',
  });
}
