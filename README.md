# FoodOrder — Self-Pickup Food Ordering Platform with Amazon Bedrock AI

A modern, responsive food ordering web application designed specifically for **self-pickup**. Customers can browse local restaurants, filter by cuisine and prep time, view detailed menus, customize their cart, complete simulated checkout, and interact with an **AI Food Assistant powered by Amazon Bedrock** for grounded menu recommendations.

---

## Features

- **Restaurant Discovery & Filtering**: Search and filter restaurants by cuisine type, minimum rating, maximum prep time, and open/closed status.
- **Interactive Menu Browsing**: Categorized dishes with real pricing, descriptions, allergen tags, and availability status.
- **Cart & Order Management**: Full shopping cart persistence via `localStorage`, quantity controls, and order conflict safeguards.
- **Simulated Checkout & Payment**: Multi-step checkout with pickup contact details, test card auto-fill, and immediate order placement.
- **Real-Time Order Tracking**: Order status progression (`Placed` → `Confirmed` → `Preparing` → `Ready for Pickup` → `Completed`) and cancellation handling.
- **Amazon Bedrock AI Food Assistant**:
  - Uses the Bedrock **Converse API** (`anthropic.claude-3-haiku-20240307-v1:0`).
  - **Strictly grounded** in restaurant menu catalog data (never invents prices, dishes, or ingredients).
  - In-memory sliding window rate limiting (20 req/min) and input validation.
  - Automatic, labeled fallback to a grounded demo assistant if AWS credentials are not configured.
- **Enterprise-Grade Testing**: 144 automated tests spanning Unit, Component, Integration, Property-Based (PBT with `fast-check`), and Full Customer Journey E2E tests.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Tailwind CSS, React Router v6 |
| **Build & Bundler** | Vite 5 (ESM, Code-splitting into 25 lazy chunks) |
| **API & Mocking** | Mock Service Worker (MSW v2) with Service Worker registration |
| **AI Integration** | Amazon Bedrock Runtime Client (`@aws-sdk/client-bedrock-runtime`) |
| **Server Architecture** | Server-side Vite Plugin Middleware (`POST /api/v1/bedrock/chat`) |
| **Testing** | Vitest, React Testing Library, fast-check (Property-Based Testing) |

---

## Project Structure

```
food-order/
├── server/                        # Server-side Bedrock integration
│   ├── bedrockService.ts          # Bedrock Converse API client, rate limiting, grounding
│   ├── viteBedrockPlugin.ts       # Vite middleware plugin (/api/v1/bedrock/chat)
│   └── data/                      # Server-side catalog knowledge (restaurants & menus)
├── src/
│   ├── components/                # Reusable UI & layout (Navbar, Footer, Modal, Button)
│   │   └── ai/                    # AIAssistant floating chat drawer component
│   ├── features/
│   │   ├── auth/                  # Authentication context, login, register
│   │   ├── cart/                  # Cart reducer, cart page, cart hook
│   │   ├── checkout/              # Checkout flow & simulated payment form
│   │   ├── menu/                  # Restaurant detail & menu page
│   │   ├── orders/                # Order history, order tracking, order service
│   │   └── restaurants/           # Homepage, search bar, filter panel, restaurant cards
│   ├── mocks/                     # MSW mock data and HTTP handlers
│   ├── services/                  # Frontend API service wrappers
│   ├── utils/                     # Validators, JWT decoder, storage utilities
│   └── __tests__/                 # 18 test files (Unit, PBT, Component, E2E)
├── public/                        # Static assets (images, mockServiceWorker.js)
├── .env.example                   # Template for AWS credentials
└── vite.config.ts                 # Vite configuration with Bedrock middleware & external boundaries
```

---

## Quick Start

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

> In development mode, Mock Service Worker (MSW) will automatically start in your browser to intercept mock API requests.

---

## Amazon Bedrock AI Assistant Setup

The AI Food Assistant works out of the box in **Demo Mode** using grounded mock responses even without an AWS account.

To connect live Amazon Bedrock:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your AWS credentials in `.env`:
   ```env
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_access_key_here
   AWS_SECRET_ACCESS_KEY=your_secret_key_here
   BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0
   BEDROCK_RATE_LIMIT_PER_MINUTE=20
   ```

3. Ensure your IAM user or role has the least-privilege `bedrock:InvokeModel` permission:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": "bedrock:InvokeModel",
         "Resource": "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-haiku-20240307-v1:0"
       }
     ]
   }
   ```

4. Enable Model Access for **Anthropic Claude 3 Haiku** in the **AWS Console** under **Amazon Bedrock → Model access** in your chosen region (`us-east-1`).

5. Restart the development server (`npm run dev`). The AI assistant badge will switch from **Demo Mode** to **Amazon Bedrock (Claude 3 Haiku)**.

---

## Security & Architecture Principles

- **Zero Client-Side Credentials**: `@aws-sdk/client-bedrock-runtime` and AWS credentials are only imported and accessed on the server side (`server/`).
- **Build Boundary Guard**: `vite.config.ts` enforces `rollupOptions.external` to block any accidental server code leaks into the client JavaScript bundle.
- **Input Sanitization**: User messages are validated (max 500 characters, non-empty) with in-memory sliding-window rate limiting.
- **Secret Protection**: `.gitignore` strictly excludes `.env`, `.env.*` (except `.env.example`), private keys, and credential stores.

---

## Testing & Quality Assurance

Run the complete automated test suite (144 tests across 18 test files):
```bash
npm run test:run
```

Run test suite in watch mode:
```bash
npm run test
```

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

---

## License

MIT License. Designed and built for portfolio and demonstration purposes.
