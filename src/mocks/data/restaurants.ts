import type { Restaurant } from '../../types';

export const mockRestaurants: Restaurant[] = [
  { id: 'r1', name: 'Pizza Palace', cuisineType: 'Italian', rating: 4.5, estimatedPrepTimeMinutes: 20, minimumOrderAmount: 15.00, isOpen: true, imageUrl: '/images/pizza-palace.jpg' },
  { id: 'r2', name: 'Dragon Wok', cuisineType: 'Chinese', rating: 4.2, estimatedPrepTimeMinutes: 25, minimumOrderAmount: 12.00, isOpen: true, imageUrl: '/images/dragon-wok.jpg' },
  { id: 'r3', name: 'Taco Fiesta', cuisineType: 'Mexican', rating: 4.7, estimatedPrepTimeMinutes: 15, minimumOrderAmount: 10.00, isOpen: true, imageUrl: '/images/taco-fiesta.jpg' },
  { id: 'r4', name: 'Curry House', cuisineType: 'Indian', rating: 4.3, estimatedPrepTimeMinutes: 30, minimumOrderAmount: 18.00, isOpen: true, imageUrl: '/images/curry-house.jpg' },
  { id: 'r5', name: 'Burger Joint', cuisineType: 'American', rating: 4.0, estimatedPrepTimeMinutes: 10, minimumOrderAmount: 8.00, isOpen: true, imageUrl: '/images/burger-joint.jpg' },
  { id: 'r6', name: 'Thai Garden', cuisineType: 'Thai', rating: 4.6, estimatedPrepTimeMinutes: 35, minimumOrderAmount: 14.00, isOpen: false, imageUrl: '/images/thai-garden.jpg' },
];
