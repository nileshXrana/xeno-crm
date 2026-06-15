# Xeno CRM — AI-Native Mini CRM

A full-stack AI-Native Mini CRM built with **Next.js 16**, **TypeScript**, **Tailwind CSS v4**, **shadcn/ui**, and **MongoDB Atlas** via Mongoose.

## 🚀 Architecture

### Two-Service Simulation (within one repo)

| Route Group | Purpose |
|---|---|
| `/api/crm/...` | CRM logic: customers, campaigns, audience segmentation, AI message generation |
| `/api/channel/...` | Stubbed external messaging provider (simulates WhatsApp) |

### Callback-Driven Delivery Loop

```
User clicks "Send Campaign"
       ↓
POST /api/crm/campaign/send
  → Saves Campaign (SENDING)
  → Inserts CommunicationMessage per customer (PENDING)
  → For each message: POST /api/channel/send
       ↓
POST /api/channel/send (Channel Stub)
  → Updates message: SENT
  → Waits 1 second
  → Calculates: 80% DELIVERED | 10% FAILED | 10% no callback
  → POST /api/crm/webhooks/delivery
       ↓
POST /api/crm/webhooks/delivery (Receipt Webhook)
  → Updates CommunicationMessage: DELIVERED or FAILED
```

## 🛠️ Tech Stack

- **Framework**: Next.js 16.2.9 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Database**: MongoDB Atlas via Mongoose
- **AI**: Google Gemini 1.5 Flash (with graceful fallback)

## 📦 Database Schema

### Customer
```typescript
{ name, email, phone, totalSpends, visits, lastVisitDate }
```

### Order
```typescript
{ customerId (ref: Customer), amount, date }
```

### Campaign
```typescript
{ name, audienceRules (JSON), size, status: DRAFT|SENDING|SENT, generatedMessage }
```

### CommunicationMessage
```typescript
{ campaignId, customerId, status: PENDING|SENT|DELIVERED|FAILED, channel, messageText }
```

## ⚙️ Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/xeno-crm
GEMINI_API_KEY=your-gemini-api-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Seed demo data
Start the dev server and visit:
```
http://localhost:3000/api/seed
```
This inserts 20 realistic customers and 50 random orders.

### 4. Run development server
```bash
npm run dev
```

## 🌐 API Routes

### CRM Routes
| Method | Route | Description |
|---|---|---|
| `GET` | `/api/seed` | Seed 20 customers + 50 orders |
| `GET` | `/api/crm/customers` | List all customers |
| `POST` | `/api/crm/audience` | Check audience size for given rules |
| `POST` | `/api/crm/generate-message` | Generate AI WhatsApp message via Gemini |
| `POST` | `/api/crm/campaign/send` | Create and send a campaign |
| `GET` | `/api/crm/campaign/stats` | Get delivery statistics |
| `POST` | `/api/crm/webhooks/delivery` | Receive delivery receipt callback |

### Channel Routes
| Method | Route | Description |
|---|---|---|
| `POST` | `/api/channel/send` | Stubbed channel provider (simulates WhatsApp) |

## 🖥️ Pages

| Route | Description |
|---|---|
| `/` | Dashboard with stats and quick actions |
| `/customers` | Customer list with search and revenue summary |
| `/campaigns` | 3-step campaign wizard (audience → AI message → launch) |
| `/analytics` | Delivery analytics with expandable campaign rows |

## 🤖 AI Message Generation

When a valid Gemini API key is configured, the `/api/crm/generate-message` endpoint uses **Gemini 1.5 Flash** to generate personalized WhatsApp messages based on:
- Campaign intent (entered by marketer)
- Audience criteria (rules)
- Number of targeted customers

If no API key is set, a high-quality stub message is returned so the demo always works.

## 📊 Audience Builder

The audience builder supports:
- **Fields**: `totalSpends`, `visits`, `lastVisitDate`
- **Operators**: `>`, `>=`, `<`, `<=`, `==`
- **Logic**: AND / OR combinators between rules

## 🔍 Tracing the Async Loop

Watch the terminal output when launching a campaign. You'll see:

```
[DISPATCH] Sending message <id> to channel stub for customer: Aarav Sharma
[CHANNEL STUB] 📨 Received message for Aarav Sharma...
[CHANNEL STUB] ✅ Message <id> marked as SENT.
[CHANNEL STUB] ⏳ Simulating 1-second delivery delay...
[CHANNEL STUB] 📬 Outcome: DELIVERED
[CHANNEL STUB] 🔁 Calling CRM receipt webhook...
[WEBHOOK] ✅ Message <id> updated to status: DELIVERED
```
