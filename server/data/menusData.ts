export interface MenuItemInfo {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isAvailable: boolean;
  allergens: string[];
}

export const mockMenus: Record<string, MenuItemInfo[]> = {
  r1: [
    { id: 'm1', restaurantId: 'r1', name: 'Margherita Pizza', description: 'Classic tomato and mozzarella', price: 12.99, category: 'Pizzas', isAvailable: true, allergens: ['gluten', 'dairy'] },
    { id: 'm2', restaurantId: 'r1', name: 'Pepperoni Pizza', description: 'Pepperoni and cheese', price: 14.99, category: 'Pizzas', isAvailable: true, allergens: ['gluten', 'dairy'] },
    { id: 'm3', restaurantId: 'r1', name: 'Truffle Pizza', description: 'Truffle oil and mushrooms', price: 18.99, category: 'Pizzas', isAvailable: false, allergens: ['gluten', 'dairy'] },
    { id: 'm4', restaurantId: 'r1', name: 'Caesar Salad', description: 'Romaine, croutons, parmesan', price: 8.99, category: 'Starters', isAvailable: true, allergens: ['dairy', 'fish'] },
    { id: 'm5', restaurantId: 'r1', name: 'Garlic Bread', description: 'Toasted with garlic butter', price: 5.99, category: 'Starters', isAvailable: true, allergens: ['gluten', 'dairy'] },
    { id: 'm6', restaurantId: 'r1', name: 'Tiramisu', description: 'Coffee-soaked ladyfingers and mascarpone', price: 6.99, category: 'Desserts', isAvailable: true, allergens: ['dairy', 'eggs'] },
    { id: 'm7', restaurantId: 'r1', name: 'Cannoli', description: 'Crispy shell with sweet filling', price: 5.49, category: 'Desserts', isAvailable: false, allergens: ['gluten', 'dairy'] },
  ],
  r2: [
    { id: 'm10', restaurantId: 'r2', name: 'Kung Pao Chicken', description: 'Spicy stir-fried chicken with peanuts', price: 13.99, category: 'Mains', isAvailable: true, allergens: ['peanuts', 'soy'] },
    { id: 'm11', restaurantId: 'r2', name: 'Sweet and Sour Pork', description: 'Battered pork with tangy sauce', price: 12.49, category: 'Mains', isAvailable: true, allergens: ['gluten', 'soy'] },
    { id: 'm12', restaurantId: 'r2', name: 'Spring Rolls', description: 'Crispy vegetable rolls', price: 6.99, category: 'Starters', isAvailable: true, allergens: ['gluten', 'soy'] },
    { id: 'm13', restaurantId: 'r2', name: 'Dumplings', description: 'Steamed pork dumplings', price: 7.99, category: 'Starters', isAvailable: false, allergens: ['gluten', 'soy'] },
    { id: 'm14', restaurantId: 'r2', name: 'Fried Rice', description: 'Egg fried rice with vegetables', price: 9.99, category: 'Mains', isAvailable: true, allergens: ['eggs', 'soy'] },
    { id: 'm15', restaurantId: 'r2', name: 'Mango Pudding', description: 'Sweet mango dessert', price: 4.99, category: 'Desserts', isAvailable: true, allergens: ['dairy'] },
  ],
  r3: [
    { id: 'm20', restaurantId: 'r3', name: 'Beef Tacos', description: 'Three soft tacos with cilantro and onion', price: 10.99, category: 'Mains', isAvailable: true, allergens: ['gluten'] },
    { id: 'm21', restaurantId: 'r3', name: 'Chicken Quesadilla', description: 'Grilled chicken and cheese', price: 9.49, category: 'Mains', isAvailable: true, allergens: ['gluten', 'dairy'] },
    { id: 'm22', restaurantId: 'r3', name: 'Guacamole', description: 'Fresh avocado dip with chips', price: 6.99, category: 'Starters', isAvailable: true, allergens: [] },
    { id: 'm23', restaurantId: 'r3', name: 'Nachos', description: 'Tortilla chips with cheese and jalapenos', price: 7.49, category: 'Starters', isAvailable: true, allergens: ['gluten', 'dairy'] },
    { id: 'm24', restaurantId: 'r3', name: 'Churros', description: 'Fried dough with cinnamon sugar', price: 4.99, category: 'Desserts', isAvailable: true, allergens: ['gluten'] },
    { id: 'm25', restaurantId: 'r3', name: 'Fish Ceviche', description: 'Raw fish marinated in citrus', price: 11.99, category: 'Starters', isAvailable: false, allergens: ['fish'] },
  ],
  r4: [
    { id: 'm30', restaurantId: 'r4', name: 'Butter Chicken', description: 'Creamy tomato curry', price: 14.99, category: 'Mains', isAvailable: true, allergens: ['dairy'] },
    { id: 'm31', restaurantId: 'r4', name: 'Lamb Biryani', description: 'Fragrant rice with spiced lamb', price: 16.99, category: 'Mains', isAvailable: true, allergens: [] },
    { id: 'm32', restaurantId: 'r4', name: 'Samosa', description: 'Fried pastry with spiced potatoes', price: 5.99, category: 'Starters', isAvailable: true, allergens: ['gluten'] },
    { id: 'm33', restaurantId: 'r4', name: 'Naan Bread', description: 'Traditional flatbread', price: 2.99, category: 'Starters', isAvailable: true, allergens: ['gluten', 'dairy'] },
    { id: 'm34', restaurantId: 'r4', name: 'Gulab Jamun', description: 'Sweet milk dumplings in syrup', price: 5.49, category: 'Desserts', isAvailable: false, allergens: ['dairy'] },
  ],
  r5: [
    { id: 'm40', restaurantId: 'r5', name: 'Classic Cheeseburger', description: 'Beef patty with cheese and pickles', price: 9.99, category: 'Mains', isAvailable: true, allergens: ['gluten', 'dairy'] },
    { id: 'm41', restaurantId: 'r5', name: 'French Fries', description: 'Crispy salted fries', price: 3.99, category: 'Sides', isAvailable: true, allergens: [] },
    { id: 'm42', restaurantId: 'r5', name: 'Chicken Nuggets', description: 'Breaded chicken pieces', price: 6.49, category: 'Mains', isAvailable: true, allergens: ['gluten'] },
    { id: 'm43', restaurantId: 'r5', name: 'Onion Rings', description: 'Battered fried onions', price: 4.99, category: 'Sides', isAvailable: true, allergens: ['gluten'] },
    { id: 'm44', restaurantId: 'r5', name: 'Milkshake', description: 'Vanilla milkshake', price: 4.99, category: 'Desserts', isAvailable: true, allergens: ['dairy'] },
  ],
  r6: [
    { id: 'm50', restaurantId: 'r6', name: 'Pad Thai', description: 'Stir-fried rice noodles with tofu', price: 11.99, category: 'Mains', isAvailable: true, allergens: ['peanuts', 'soy'] },
    { id: 'm51', restaurantId: 'r6', name: 'Green Curry', description: 'Spicy coconut curry with bamboo shoots', price: 13.49, category: 'Mains', isAvailable: true, allergens: [] },
    { id: 'm52', restaurantId: 'r6', name: 'Tom Yum Soup', description: 'Hot and sour soup with mushrooms', price: 6.99, category: 'Starters', isAvailable: true, allergens: [] },
    { id: 'm53', restaurantId: 'r6', name: 'Mango Sticky Rice', description: 'Sweet sticky rice with coconut milk', price: 5.99, category: 'Desserts', isAvailable: true, allergens: [] },
  ],
};
