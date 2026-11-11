import { http, HttpResponse } from 'msw';

/**
 * Browser-safe mock response generator.
 * Duplicates the keyword-matching logic from server/bedrockService.ts
 * WITHOUT importing any server-side module (no process.env, no AWS SDK).
 */
function generateMockResponse(userMessage: string): string {
  const q = userMessage.toLowerCase();

  if (q.includes('gluten') || q.includes('celiac')) {
    return (
      'Here are great gluten-free options available for pickup:\n\n' +
      '• **Caesar Salad** at Pizza Palace - $8.99 (contains dairy, fish)\n' +
      '• **Guacamole with Chips** at Taco Fiesta - $6.99 (allergen-free)\n' +
      '• **Lamb Biryani** at Curry House - $16.99 (allergen-free)\n' +
      '• **French Fries** at Burger Joint - $3.99 (allergen-free)\n\n' +
      'All orders are prepared for self-pickup.'
    );
  }

  if (q.includes('vegan') || q.includes('vegetarian')) {
    return (
      'Here are delicious vegetarian options currently available:\n\n' +
      '• **Margherita Pizza** at Pizza Palace - $12.99 (contains gluten, dairy)\n' +
      '• **Guacamole with Chips** at Taco Fiesta - $6.99 (vegan, allergen-free)\n' +
      '• **Spring Rolls** at Dragon Wok - $6.99 (contains gluten, soy)\n' +
      '• **Samosa** at Curry House - $5.99 (contains gluten)\n\n' +
      'Ready for self-pickup at your selected restaurant!'
    );
  }

  if (q.includes('pizza') || q.includes('italian')) {
    return (
      '**Pizza Palace** is open for self-pickup (prep time ~20 mins, min order $15.00):\n\n' +
      '• **Margherita Pizza** ($12.99) - Classic tomato and fresh mozzarella\n' +
      '• **Pepperoni Pizza** ($14.99) - Pepperoni and melted cheese\n' +
      '• **Garlic Bread** ($5.99) - Toasted with garlic butter\n' +
      '• **Tiramisu** ($6.99) - Coffee-soaked ladyfingers & mascarpone\n\n' +
      '*(Note: Truffle Pizza is currently sold out).*'
    );
  }

  if (q.includes('taco') || q.includes('mexican')) {
    return (
      '**Taco Fiesta** is open (rating 4.7, fastest prep time ~15 mins, min order $10.00):\n\n' +
      '• **Beef Tacos** ($10.99) - Three soft tacos with cilantro and fresh onion\n' +
      '• **Chicken Quesadilla** ($9.49) - Grilled chicken and seasoned cheese\n' +
      '• **Guacamole** ($6.99) - Fresh avocado dip with crisp tortilla chips\n' +
      '• **Nachos** ($7.49) - Tortilla chips with melted cheese & jalapenos\n' +
      '• **Churros** ($4.99) - Crispy fried dough dusted with cinnamon sugar'
    );
  }

  if (q.includes('fast') || q.includes('quick') || q.includes('time')) {
    return (
      'Here are the fastest self-pickup restaurants currently open:\n\n' +
      '1. **Burger Joint** - ~10 mins prep (Min order: $8.00)\n' +
      '2. **Taco Fiesta** - ~15 mins prep (Min order: $10.00)\n' +
      '3. **Pizza Palace** - ~20 mins prep (Min order: $15.00)\n\n' +
      'Order ahead and pick up fresh when ready!'
    );
  }

  if (q.includes('burger') || q.includes('american')) {
    return (
      '**Burger Joint** is open for self-pickup (prep time only 10 mins!):\n\n' +
      '• **Classic Cheeseburger** ($9.99) - Juicy beef patty with cheese and pickles\n' +
      '• **Chicken Nuggets** ($6.49) - Crispy breaded chicken pieces\n' +
      '• **French Fries** ($3.99) - Golden salted fries\n' +
      '• **Onion Rings** ($4.99) - Battered crispy fried onions'
    );
  }

  if (q.includes('curry') || q.includes('indian')) {
    return (
      '**Curry House** is open for self-pickup (prep time ~30 mins, min order $18.00):\n\n' +
      '• **Butter Chicken** ($14.99) - Creamy tomato curry (contains dairy)\n' +
      '• **Lamb Biryani** ($16.99) - Fragrant spiced basmati rice with tender lamb\n' +
      '• **Samosa** ($5.99) - Crispy fried pastry with spiced potatoes\n' +
      '• **Naan Bread** ($2.99) - Freshly baked traditional flatbread'
    );
  }

  return (
    'Welcome to FoodOrder! We have 5 open restaurants ready for self-pickup:\n\n' +
    '• **Pizza Palace** (Italian, 4.5 ★) - Margherita & Pepperoni pizzas\n' +
    '• **Dragon Wok** (Chinese, 4.2 ★) - Kung Pao Chicken, Sweet & Sour Pork\n' +
    '• **Taco Fiesta** (Mexican, 4.7 ★) - Beef Tacos, Quesadillas & Guacamole\n' +
    '• **Curry House** (Indian, 4.3 ★) - Butter Chicken & Lamb Biryani\n' +
    '• **Burger Joint** (American, 4.0 ★) - Cheeseburgers & Fries\n\n' +
    'Ask me for recommendations by cuisine, dietary preference, prep time, or budget!'
  );
}

export const bedrockHandlers = [
  http.post('/api/v1/bedrock/chat', async ({ request }) => {
    const body = (await request.json()) as { message?: string; history?: unknown[] };
    const trimmed = (body.message || '').trim();

    if (!trimmed) {
      return HttpResponse.json({ error: 'Message cannot be empty.' }, { status: 400 });
    }

    if (trimmed.length > 500) {
      return HttpResponse.json(
        { error: 'Message exceeds maximum length of 500 characters.' },
        { status: 400 }
      );
    }

    const reply = generateMockResponse(trimmed);
    return HttpResponse.json({
      reply,
      isMock: true,
      provider: 'Mock / Demo Assistant (Automated Test)',
      model: 'grounded-mock-fallback',
      timestamp: new Date().toISOString(),
    });
  }),
];
