import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
import { mockRestaurants } from './data/restaurantsData.js';
import { mockMenus } from './data/menusData.js';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  message: string;
  history?: ChatMessage[];
  clientIp?: string;
}

export interface ChatResponseData {
  reply: string;
  isMock: boolean;
  provider: string;
  model: string;
  region?: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
  fallbackReason?: string;
  timestamp: string;
}

export interface ChatResult {
  status: number;
  data: ChatResponseData | { error: string };
}

// --- Rate Limiting (In-Memory Sliding Window) ---------------------------------
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = parseInt(process.env.BEDROCK_RATE_LIMIT_PER_MINUTE || '20', 10);

export function checkRateLimit(clientIp: string) {
  const now = Date.now();
  const entry = rateLimitMap.get(clientIp) || [];
  const recent = entry.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds: Math.ceil((recent[0] + RATE_LIMIT_WINDOW_MS - now) / 1000),
    };
  }

  recent.push(now);
  rateLimitMap.set(clientIp, recent);
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - recent.length };
}

// --- Ground Truth Menu Knowledge ----------------------------------------------
export function buildMenuKnowledge(): string {
  const lines: string[] = ['CURRENT RESTAURANT & MENU CATALOG (GROUND TRUTH):'];

  for (const r of mockRestaurants) {
    lines.push(`\nRESTAURANT: "${r.name}" (ID: ${r.id})`);
    lines.push(`- Cuisine: ${r.cuisineType}`);
    lines.push(`- Rating: ${r.rating} / 5.0`);
    lines.push(`- Status: ${r.isOpen ? 'OPEN for self-pickup' : 'CLOSED'}`);
    lines.push(`- Prep time: ${r.estimatedPrepTimeMinutes} minutes`);
    lines.push(`- Minimum Order: $${r.minimumOrderAmount.toFixed(2)}`);

    const items = mockMenus[r.id] || [];
    lines.push(`- Menu Items (${items.length} items):`);
    for (const item of items) {
      const allergenStr = item.allergens && item.allergens.length > 0 ? item.allergens.join(', ') : 'none';
      lines.push(
        `  * "${item.name}" ($${item.price.toFixed(2)}) - Category: ${item.category} | Available: ${
          item.isAvailable ? 'YES' : 'NO (SOLD OUT)'
        } | Allergens: [${allergenStr}] | Description: ${item.description}`
      );
    }
  }

  return lines.join('\n');
}


export const SYSTEM_PROMPT = `You are the intelligent, friendly AI Food Assistant for FoodOrder, a self-pickup food ordering platform.

YOUR RESPONSIBILITIES:
Help customers find restaurants, explore menus, compare dishes, understand prices, check availability, and choose food based on their preferences.

IMPORTANT RESPONSE RULES:

1. ALWAYS use the restaurant and menu catalog below as your only source of truth.
2. Never invent restaurant names, menu items, ingredients, prices, allergens, ratings, or preparation times.
3. Recommend dishes only when the restaurant is OPEN and the dish is AVAILABLE: YES.
4. Never recommend SOLD OUT dishes as orderable. Explain their unavailable status when relevant.
5. Never recommend dishes from CLOSED restaurants as currently orderable.
6. Answer the exact question first. Do not provide an unrelated full menu when the customer asks a specific yes/no or price question.
7. When recommending dishes, include their exact names, prices, restaurant names, and listed allergens.
8. All orders are for self-pickup. Never claim that delivery is available.

ORDER MINIMUM CALCULATIONS:
9. Always check the restaurant's minimum order amount when a customer asks whether they can order a specific quantity or dish.
10. Compare the total item price with the restaurant's minimum order amount.
11. If the total is below the minimum, calculate and clearly state the exact additional amount needed.
12. If the total meets or exceeds the minimum, clearly say that it meets the minimum.
13. Do not invent taxes, service charges, discounts, or additional fees.

DIETARY AND ALLERGEN RULES:
14. Use the listed allergens to filter dishes when customers mention allergies.
15. An empty allergen list means no allergens are listed in this catalog. It does NOT guarantee that a dish is allergen-free.
16. Never assume a dish is vegan or vegetarian based only on its name or description.
17. If vegetarian or vegan status cannot be confirmed from the catalog, explain that the ingredients need confirmation from the restaurant.
18. Do not claim that a dish is gluten-free merely because gluten is not listed. Explain that the catalog does not certify gluten-free preparation.
19. Never guarantee that food is safe for someone with a serious allergy. Mention possible cross-contact and advise checking with the restaurant.

RECOMMENDATION RULES:
20. Apply all customer requirements together. For example, if they request vegetarian food under $10, do not recommend dishes that fail either condition.
21. When customers specify a budget, compare the individual dish price against that budget.
22. When customers ask for the fastest restaurant, compare preparation times only among OPEN restaurants.
23. When customers ask about a particular restaurant, answer about that restaurant rather than listing unrelated restaurants.
24. If no dish matches their requirements, say so honestly and offer the closest suitable alternatives.

RESPONSE STYLE:
25. Be friendly, natural, concise, and helpful.
26. Use bullet points for multiple dishes.
27. Show prices with two decimal places.
28. Clearly distinguish available dishes from sold-out dishes.
29. If information is missing, say so rather than guessing.

EXAMPLES OF GOOD ANSWERS:

Customer: Can I order one Margherita Pizza from Pizza Palace?
Assistant: One Margherita Pizza costs $12.99. Pizza Palace has a minimum order of $15.00, so you need another $2.01 in items to meet the minimum.

Customer: Is Truffle Pizza available?
Assistant: Truffle Pizza at Pizza Palace is currently sold out.

Customer: Is Thai Garden open?
Assistant: Thai Garden is currently closed, so its dishes are not available for pickup right now.

Remember: FoodOrder is a self-pickup platform.

${buildMenuKnowledge()}`;


// --- Grounded Mock / Demo Fallback --------------------------------------------

export function generateMockResponse(userMessage: string): string {
  const query = userMessage.toLowerCase();

  const money = (amount: number) => `$${amount.toFixed(2)}`;

  const openRestaurants = mockRestaurants.filter((restaurant) => restaurant.isOpen);

  // Find a restaurant mentioned by the customer.
  const selectedRestaurant = mockRestaurants.find((restaurant) =>
    query.includes(restaurant.name.toLowerCase())
  );

  // Check whether the customer asks about restaurant availability.
  if (
    selectedRestaurant &&
    (query.includes('open') || query.includes('closed'))
  ) {
    return selectedRestaurant.isOpen
      ? `${selectedRestaurant.name} is currently open for self-pickup. Estimated preparation time: ${selectedRestaurant.estimatedPrepTimeMinutes} minutes. Minimum order: ${money(selectedRestaurant.minimumOrderAmount)}.`
      : `${selectedRestaurant.name} is currently closed and is not available for pickup.`;
  }

  // Find a specific menu item mentioned by the customer.
  const allItems = mockRestaurants.flatMap((restaurant) =>
    (mockMenus[restaurant.id] || []).map((item) => ({
      ...item,
      restaurant,
    }))
  );

  const selectedItem = allItems.find((entry) =>
    query.includes(entry.name.toLowerCase())
  );

  // Answer questions about a specific menu item.
  if (selectedItem) {
    const { restaurant, isAvailable, price, name, allergens } = selectedItem;

    if (!restaurant.isOpen) {
      return `${restaurant.name} is currently closed. ${name} is therefore unavailable for pickup right now.`;
    }

    if (!isAvailable) {
      return `${name} at ${restaurant.name} is currently sold out.`;
    }

    const allergenText =
      allergens.length > 0
        ? allergens.join(', ')
        : 'No allergens are listed in our catalog.';

    const minimumDifference = Math.max(
      0,
      restaurant.minimumOrderAmount - price
    );

    if (
      query.includes('order') ||
      query.includes('buy') ||
      query.includes('purchase') ||
      query.includes('minimum')
    ) {
      if (minimumDifference > 0) {
        return `One ${name} costs ${money(price)} at ${restaurant.name}. The minimum order is ${money(restaurant.minimumOrderAmount)}. You need another ${money(minimumDifference)} in items to meet the minimum order. Allergens listed: ${allergenText}. All orders are for self-pickup.`;
      }

      return `Yes! One ${name} costs ${money(price)} at ${restaurant.name}, which meets its minimum order of ${money(restaurant.minimumOrderAmount)}. Allergens listed: ${allergenText}. All orders are for self-pickup.`;
    }

    return `${name} is available at ${restaurant.name} for ${money(price)}. Allergens listed: ${allergenText}. Minimum order: ${money(restaurant.minimumOrderAmount)}.`;
  }

  // Find restaurants by cuisine.
  const cuisineRestaurant = openRestaurants.find((restaurant) =>
    query.includes(restaurant.cuisineType.toLowerCase())
  );

  const restaurantForMenu = selectedRestaurant || cuisineRestaurant;

  if (restaurantForMenu) {
    const items = (mockMenus[restaurantForMenu.id] || []).filter(
      (item) => item.isAvailable
    );

    const menuText = items
      .map(
        (item) =>
          `• **${item.name}** - ${money(item.price)} (Allergens: ${
            item.allergens.length > 0
              ? item.allergens.join(', ')
              : 'None listed'
          })`
      )
      .join('\n');

    return `**${restaurantForMenu.name}** (${restaurantForMenu.cuisineType}) is open for self-pickup.\nPreparation time: ${restaurantForMenu.estimatedPrepTimeMinutes} minutes.\nMinimum order: ${money(restaurantForMenu.minimumOrderAmount)}.\n\nAvailable menu items:\n${menuText}`;
  }

  // Fastest open restaurants.
  if (
    query.includes('fast') ||
    query.includes('quick') ||
    query.includes('preparation time')
  ) {
    const fastest = [...openRestaurants].sort(
      (a, b) => a.estimatedPrepTimeMinutes - b.estimatedPrepTimeMinutes
    );

    return `Here are the fastest open restaurants for self-pickup:\n\n${fastest
      .map(
        (restaurant) =>
          `• **${restaurant.name}** - ${restaurant.estimatedPrepTimeMinutes} minutes (Minimum order: ${money(restaurant.minimumOrderAmount)})`
      )
      .join('\n')}`;
  }

  // Budget-based recommendations.
  const budgetMatch = query.match(
    /(?:under|below|within|budget(?: of)?|less than)\s*\$?\s*(\d+(?:\.\d{1,2})?)/
  );

  if (budgetMatch) {
    const budget = Number(budgetMatch[1]);

    const matches = allItems.filter(
      ({ restaurant, price, isAvailable }) =>
        restaurant.isOpen && isAvailable && price <= budget
    );

    if (matches.length === 0) {
      return `Sorry, there are no currently available menu items priced at or below ${money(budget)} in our open restaurants.`;
    }

    return `Here are available items within your ${money(budget)} budget:\n\n${matches
      .map(
        ({ restaurant, name, price }) =>
          `• **${name}** - ${money(price)} at ${restaurant.name}`
      )
      .join('\n')}`;
  }

  // Allergen-based filtering.
  if (
    query.includes('gluten') ||
    query.includes('celiac') ||
    query.includes('allerg')
  ) {
    const matches = allItems.filter(
      ({ restaurant, allergens, isAvailable }) =>
        restaurant.isOpen &&
        isAvailable &&
        !allergens.some((allergen) =>
          query.includes(allergen.toLowerCase())
        )
    );

    return `Here are available items that do not list the specified allergens in our catalog:\n\n${matches
      .map(
        ({ restaurant, name, price, allergens }) =>
          `• **${name}** - ${money(price)} at ${restaurant.name} (Listed allergens: ${
            allergens.length ? allergens.join(', ') : 'None listed'
          })`
      )
      .join('\n')}\n\nPlease confirm ingredients and cross-contact risks with the restaurant. This is not a guarantee of allergen safety.`;
  }

  // General restaurant listing.
  return `Welcome to FoodOrder! Here are our currently open restaurants:\n\n${openRestaurants
    .map(
      (restaurant) =>
        `• **${restaurant.name}** - ${restaurant.cuisineType}, Rating: ${restaurant.rating}/5, Preparation: ${restaurant.estimatedPrepTimeMinutes} minutes, Minimum order: ${money(restaurant.minimumOrderAmount)}`
    )
    .join('\n')}\n\nYou can ask me about a restaurant, a specific dish, prices, preparation times, or available menu items. All orders are for self-pickup.`;
}

// --- Bedrock Converse API Client ----------------------------------------------
function getBedrockClient(): BedrockRuntimeClient | null {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION || 'us-east-1';

  if (!accessKeyId || !secretAccessKey || accessKeyId === 'your_aws_access_key_id_here') {
    return null;
  }

  return new BedrockRuntimeClient({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
      ...(process.env.AWS_SESSION_TOKEN ? { sessionToken: process.env.AWS_SESSION_TOKEN } : {}),
    },
  });
}

// --- Main Chat Handler --------------------------------------------------------
export async function handleChat({ message, history = [], clientIp = '127.0.0.1' }: ChatRequest): Promise<ChatResult> {
  // Input validation
  if (!message || typeof message !== 'string') {
    return { status: 400, data: { error: 'Message is required and must be a string.' } };
  }

  const trimmed = message.trim();
  if (trimmed.length === 0) {
    return { status: 400, data: { error: 'Message cannot be empty.' } };
  }

  if (trimmed.length > 500) {
    return { status: 400, data: { error: 'Message exceeds maximum length of 500 characters.' } };
  }

  // Rate limiting
  const rateResult = checkRateLimit(clientIp);
  if (!rateResult.allowed) {
    return {
      status: 429,
      data: {
        error: `Rate limit exceeded. Please wait ${rateResult.resetInSeconds} seconds before sending another message.`,
      },
    };
  }

  const client = getBedrockClient();
  const modelId = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-haiku-20240307-v1:0';
  const region = process.env.AWS_REGION || 'us-east-1';

  // If AWS credentials are not configured, use the safe mock/demo fallback
  if (!client) {
    const mockReply = generateMockResponse(trimmed);
    return {
      status: 200,
      data: {
        reply: mockReply,
        isMock: true,
        provider: 'Mock / Demo Assistant (Grounded Catalog)',
        model: 'grounded-mock-fallback',
        timestamp: new Date().toISOString(),
      },
    };
  }

  // Live Amazon Bedrock Converse API invocation
  try {
    const messages: Array<{ role: 'user' | 'assistant'; content: Array<{ text: string }> }> = [];

    const recentHistory = Array.isArray(history) ? history.slice(-6) : [];
    for (const h of recentHistory) {
      if (h.role === 'user' || h.role === 'assistant') {
        messages.push({
          role: h.role,
          content: [{ text: String(h.content).slice(0, 500) }],
        });
      }
    }

    messages.push({
      role: 'user',
      content: [{ text: trimmed }],
    });

    const command = new ConverseCommand({
      modelId,
      system: [{ text: SYSTEM_PROMPT }],
      messages,
      inferenceConfig: {
        maxTokens: 512,
        temperature: 0.3,
        topP: 0.9,
      },
    });

    const response = await client.send(command);
    const outputText = response.output?.message?.content?.[0]?.text || 'No response generated.';

    return {
      status: 200,
      data: {
        reply: outputText,
        isMock: false,
        provider: 'Amazon Bedrock (Converse API)',
        model: modelId,
        region,
        usage: {
          inputTokens: response.usage?.inputTokens || 0,
          outputTokens: response.usage?.outputTokens || 0,
        },
        timestamp: new Date().toISOString(),
      },
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('Amazon Bedrock invocation error:', errorMessage);

    const fallbackReply = generateMockResponse(trimmed);
    return {
      status: 200,
      data: {
        reply: fallbackReply,
        isMock: true,
        provider: 'Mock / Demo Fallback (Bedrock Service Unavailable)',
        model: 'grounded-mock-fallback',
        fallbackReason: errorMessage,
        timestamp: new Date().toISOString(),
      },
    };
  }
}
