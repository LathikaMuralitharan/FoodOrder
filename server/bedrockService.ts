import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
import { mockRestaurants } from './data/restaurantsData';
import { mockMenus } from './data/menusData';

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

export const SYSTEM_PROMPT = `You are the friendly, helpful AI Food Assistant for the FoodOrder self-pickup platform.
Your role is to help customers explore restaurants, recommend available dishes based on their taste, budget, or dietary restrictions (allergens), and answer questions about prep times, prices, and pickup info.

STRICT GROUNDING RULES:
1. ONLY recommend dishes that are currently available ("Available: YES") and from restaurants that are "OPEN".
2. If a user asks for a dish that is marked "SOLD OUT" (e.g. Truffle Pizza, Cannoli, Dumplings) or from a closed restaurant (e.g. Thai Garden), politely explain that it is currently unavailable or closed.
3. ALWAYS state the exact price, allergens, and restaurant name as shown in the catalog. NEVER invent dishes, prices, or ingredients.
4. Keep responses concise, warm, helpful, and formatted with bullet points for dish recommendations.
5. Remind users that all orders on FoodOrder are for self-pickup at the restaurant.

${buildMenuKnowledge()}`;

// --- Grounded Mock / Demo Fallback --------------------------------------------
export function generateMockResponse(userMessage: string): string {
  const query = userMessage.toLowerCase();

  // Allergen checks
  if (query.includes('gluten') || query.includes('celiac')) {
    return (
      `Here are great gluten-free options available for pickup:\n\n` +
      `• **Caesar Salad** at Pizza Palace - $8.99 (contains dairy, fish)\n` +
      `• **Guacamole with Chips** at Taco Fiesta - $6.99 (allergen-free)\n` +
      `• **Lamb Biryani** at Curry House - $16.99 (allergen-free)\n` +
      `• **French Fries** at Burger Joint - $3.99 (allergen-free)\n\n` +
      `All orders are prepared for self-pickup.`
    );
  }

  if (query.includes('vegan') || query.includes('vegetarian')) {
    return (
      `Here are delicious vegetarian options currently available:\n\n` +
      `• **Margherita Pizza** at Pizza Palace - $12.99 (contains gluten, dairy)\n` +
      `• **Guacamole with Chips** at Taco Fiesta - $6.99 (vegan, allergen-free)\n` +
      `• **Spring Rolls** at Dragon Wok - $6.99 (contains gluten, soy)\n` +
      `• **Samosa** at Curry House - $5.99 (contains gluten)\n\n` +
      `Ready for self-pickup at your selected restaurant!`
    );
  }

  if (query.includes('pizza') || query.includes('italian')) {
    return (
      `**Pizza Palace** is open for self-pickup (prep time ~20 mins, min order $15.00):\n\n` +
      `• **Margherita Pizza** ($12.99) - Classic tomato and fresh mozzarella\n` +
      `• **Pepperoni Pizza** ($14.99) - Pepperoni and melted cheese\n` +
      `• **Garlic Bread** ($5.99) - Toasted with garlic butter\n` +
      `• **Tiramisu** ($6.99) - Coffee-soaked ladyfingers & mascarpone\n\n` +
      `*(Note: Truffle Pizza is currently sold out).*`
    );
  }

  if (query.includes('taco') || query.includes('mexican')) {
    return (
      `**Taco Fiesta** is open (rating 4.7, fastest prep time ~15 mins, min order $10.00):\n\n` +
      `• **Beef Tacos** ($10.99) - Three soft tacos with cilantro and fresh onion\n` +
      `• **Chicken Quesadilla** ($9.49) - Grilled chicken and seasoned cheese\n` +
      `• **Guacamole** ($6.99) - Fresh avocado dip with crisp tortilla chips\n` +
      `• **Nachos** ($7.49) - Tortilla chips with melted cheese & jalapenos\n` +
      `• **Churros** ($4.99) - Crispy fried dough dusted with cinnamon sugar`
    );
  }

  if (query.includes('fast') || query.includes('quick') || query.includes('time')) {
    return (
      `Here are the fastest self-pickup restaurants currently open:\n\n` +
      `1. **Burger Joint** - ~10 mins prep (Min order: $8.00)\n` +
      `2. **Taco Fiesta** - ~15 mins prep (Min order: $10.00)\n` +
      `3. **Pizza Palace** - ~20 mins prep (Min order: $15.00)\n\n` +
      `Order ahead and pick up fresh when ready!`
    );
  }

  if (query.includes('burger') || query.includes('american')) {
    return (
      `**Burger Joint** is open for self-pickup (prep time only 10 mins!):\n\n` +
      `• **Classic Cheeseburger** ($9.99) - Juicy beef patty with cheese and pickles\n` +
      `• **Chicken Nuggets** ($6.49) - Crispy breaded chicken pieces\n` +
      `• **French Fries** ($3.99) - Golden salted fries\n` +
      `• **Onion Rings** ($4.99) - Battered crispy fried onions`
    );
  }

  if (query.includes('curry') || query.includes('indian')) {
    return (
      `**Curry House** is open for self-pickup (prep time ~30 mins, min order $18.00):\n\n` +
      `• **Butter Chicken** ($14.99) - Creamy tomato curry (contains dairy)\n` +
      `• **Lamb Biryani** ($16.99) - Fragrant spiced basmati rice with tender lamb\n` +
      `• **Samosa** ($5.99) - Crispy fried pastry with spiced potatoes\n` +
      `• **Naan Bread** ($2.99) - Freshly baked traditional flatbread`
    );
  }

  return (
    `Welcome to FoodOrder! We have 5 open restaurants ready for self-pickup:\n\n` +
    `• **Pizza Palace** (Italian, 4.5 ★) - Margherita & Pepperoni pizzas\n` +
    `• **Dragon Wok** (Chinese, 4.2 ★) - Kung Pao Chicken, Sweet & Sour Pork\n` +
    `• **Taco Fiesta** (Mexican, 4.7 ★) - Beef Tacos, Quesadillas & Guacamole\n` +
    `• **Curry House** (Indian, 4.3 ★) - Butter Chicken & Lamb Biryani\n` +
    `• **Burger Joint** (American, 4.0 ★) - Cheeseburgers & Fries\n\n` +
    `Ask me for recommendations by cuisine, dietary preference, prep time, or budget!`
  );
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
