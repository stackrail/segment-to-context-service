# StackRail - Event-Driven Backend + Next.js Dashboard

A minimal, production-ready event ingestion system with real-time persona generation and a responsive Next.js dashboard.

## 🏗️ Project Structure

```
.
├── src/                              # Node.js Express Backend
│   ├── api/
│   │   ├── routes/                  # Express routes (health, events, context)
│   │   └── controllers/             # Request handlers
│   ├── services/                    # Business logic (persona generation)
│   ├── workers/                     # Event processing workers
│   ├── db/
│   │   ├── index.js                # PostgreSQL connection pool
│   │   └── queries/                # Data access layer
│   ├── utils/                       # Pub/Sub abstraction, message broker
│   ├── config/                      # Environment config
│   └── index.js                     # Express server entry point
├── frontend/                         # Next.js Frontend Dashboard
│   ├── app/
│   │   ├── page.tsx                 # Dashboard (live events)
│   │   ├── context/page.tsx         # Persona viewer
│   │   └── layout.tsx               # Root layout
│   ├── components/                  # Reusable UI components
│   ├── lib/                         # API client utilities
│   └── package.json
├── package.json                      # Backend dependencies
├── .env                             # Backend environment variables
└── README.md                        # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### 1. Backend Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Configure .env with your PostgreSQL credentials
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=postgres
# DB_PASSWORD=postgres
# DB_NAME=segment_db

# Create PostgreSQL database and tables
psql segment_db < schema.sql

# Start backend (development with --watch)
npm run dev
```

Backend runs on: `http://localhost:3000`

**Available Endpoints:**

- `GET /health` - Health check
- `POST /events` - Ingest events
- `GET /context?tenant_id=...&user_id=...` - Fetch user persona

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Development server
npm run dev
```

Frontend runs on: `http://localhost:3000` (or next available port, typically 3001)

## 📊 Architecture Overview

### Event Flow

```
Client
  │
  ├─► POST /events (submit event)
  │
  ├─► Express Controller (validate, extract fields)
  │
  ├─► Message Broker (mock Pub/Sub)
  │
  ├─► Event Worker:
  │   ├─ insertEvent(db) → Store in PostgreSQL
  │   ├─ getLastEvents(db, 50) → Aggregate recent events
  │   ├─ generatePersona(events) → Analyze actions
  │   └─ upsertUserContext(db) → Store or update persona
  │
  └─► Response 202 Accepted
```

### Database Schema

```sql
-- Events table (idempotent via UNIQUE constraint)
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  event_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  payload JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(event_id, tenant_id)
);

-- User contexts (personas)
CREATE TABLE user_contexts (
  id SERIAL PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  persona TEXT NOT NULL,
  confidence FLOAT,
  signals TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, user_id)
);
```

## 🔌 API Reference

### POST /events

**Ingest an event**

```bash
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": "evt_123456",
    "tenant_id": "tenant_456",
    "user_id": "user_789",
    "payload": {
      "action": "purchase",
      "amount": 99.99
    }
  }'
```

**Response: 202 Accepted**

```json
{
  "message": "Event accepted for processing",
  "event_id": "evt_123456"
}
```

### GET /context

**Fetch user persona**

```bash
curl "http://localhost:3000/context?tenant_id=tenant_456&user_id=user_789"
```

**Response: 200 OK**

```json
{
  "data": {
    "tenant_id": "tenant_456",
    "user_id": "user_789",
    "persona": "High-intent buyer",
    "confidence": 0.9,
    "signals": ["purchase", "click"],
    "updated_at": "2026-04-24T12:34:56Z"
  }
}
```

**Response: 404 Not Found**

```json
{
  "error": "User context not found"
}
```

### GET /health

**Health check**

```bash
curl http://localhost:3000/health
```

**Response: 200 OK**

```json
{
  "status": "ok",
  "timestamp": "2026-04-24T12:34:56Z"
}
```

## 🎨 Frontend Features

### Dashboard (/)

- **Live Event Stream**: Real-time display of incoming events
- **Polling Control**: Start/stop event polling
- **Mock Events**: Auto-generates sample events for demo
- **Event Details**: Shows event_id, tenant_id, user_id, action type, timestamp

### Persona Viewer (/context)

- **User Search**: Find personas by tenant_id and user_id
- **Confidence Visualization**: Progress bar showing AI confidence
- **Behavioral Signals**: Display extracted user action patterns
- **Error Handling**: User-friendly error and loading states

## 🔧 Backend Features

### Message Broker Abstraction

- **Mock Pub/Sub**: Console-based event publishing for local dev
- **Pub/Sub Ready**: Structure supports swapping for Google Cloud Pub/Sub
- **Decoupled**: Business logic independent of infrastructure

### Event Processing Worker

1. **Idempotency**: Duplicate events rejected via unique constraint
2. **Aggregation**: Fetches last 50 events per user
3. **Persona Generation**: Analyzes actions to assign persona
4. **Context Storage**: Upserts user context in database

### Persona Generation Rules (Mock)

```javascript
if actions include "purchase": "High-intent buyer" (0.9 confidence)
else if actions include "click": "Engaged user" (0.7 confidence)
else: "Casual user" (0.5 confidence)
```

## 📝 Key Design Decisions

✅ **Thick Backend, Thin Frontend**

- All business logic in Node.js backend
- Frontend focuses on presentation and user interaction

✅ **No External Dependencies (Backend)**

- Express.js + PostgreSQL only
- No ORM (raw SQL with parameterized queries)
- No migration tools

✅ **Minimal Frontend Stack**

- Next.js + Tailwind CSS (no UI libraries)
- Lightweight, assessment-focused demo

✅ **Idempotency Built-In**

- UNIQUE constraint prevents duplicate event processing
- Crucial for production event systems

✅ **Multi-Tenant Ready**

- All queries include tenant_id
- No cross-tenant data leakage

## 🚢 Production Readiness

### Current Implementation

- ✅ Error handling with try/catch
- ✅ Parameterized SQL queries (SQL injection prevention)
- ✅ Graceful server shutdown
- ✅ Non-fatal error handling in workers
- ✅ Responsive UI with loading states

### Production Considerations (Future)

- [ ] Authentication/Authorization
- [ ] Rate limiting
- [ ] Request validation middleware
- [ ] Comprehensive logging
- [ ] CI/CD pipeline
- [ ] Real Pub/Sub integration (GCP/AWS)
- [ ] Distributed tracing
- [ ] Real LLM integration
- [ ] WebSocket for real-time events
- [ ] Database indexing strategy

## 🐛 Troubleshooting

### Backend Issues

**Connection refused on DB**

```bash
# Check PostgreSQL is running
psql segment_db
# If not running, start it:
# macOS: brew services start postgresql
# Linux: sudo systemctl start postgresql
```

**Port 3000 already in use**

```bash
# Find and kill process
lsof -i :3000
kill -9 <PID>

# Or run on different port:
PORT=3001 npm run dev
```

### Frontend Issues

**API calls failing (CORS)**

- Ensure backend is running on `http://localhost:3000`
- Check `NEXT_PUBLIC_API_BASE_URL` in `frontend/.env.local`

**Frontend not loading**

```bash
cd frontend
rm -rf .next node_modules
npm install
npm run dev
```

## 📖 Testing

### Manual Testing

**1. Create an event:**

```bash
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": "test_001",
    "tenant_id": "t1",
    "user_id": "u1",
    "payload": {"action": "purchase"}
  }'
```

**2. View persona:**

```bash
curl "http://localhost:3000/context?tenant_id=t1&user_id=u1"
```

**3. Dashboard:**

- Open `http://localhost:3001` (or 3000 if frontend on different port)
- See live event stream (uses mock data)
- Navigate to Persona Viewer
- Search for t1 + u1
- Should display "High-intent buyer" persona

## 📚 Documentation

- [Backend README](./README.md)
- [Frontend README](./frontend/README.md)

## 📄 License

ISC

## 👤 Author

StackRail Team

![Node.js](https://img.shields.io/badge/Node.js-18.x-green?style=for-the-badge&logo=node.js)
![Express](https://img.shields.io/badge/Express.js-Backend-black?style=for-the-badge&logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue?style=for-the-badge&logo=postgresql)
![Architecture](https://img.shields.io/badge/Architecture-Event--Driven-purple?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Production--Ready-success?style=for-the-badge)

---

## 🧠 Overview

The **Segment-to-Context Service** is an event-driven backend system that ingests user behavior events, processes them asynchronously, and generates structured user personas from aggregated behavioral data.

It demonstrates production-grade backend engineering concepts including:

- Event-driven architecture
- Pub/Sub decoupling
- Worker-based async processing
- Multi-tenant data isolation
- Event aggregation pipelines
- Context generation layer (persona-ready output)

---

## 🚀 System Architecture

Client → Express API (/events)
↓
Pub/Sub Topic (events)
↓
Worker Consumer
↓
PostgreSQL (events table)
↓
Aggregation (last 50 events)
↓
Persona Generator
↓
user_contexts table
↓
Context API (/context)

---

## 📦 Features

### ⚡ Event Ingestion

- `/events` endpoint for high-throughput ingestion
- Accepts behavioral events (clicks, views, actions)
- Designed for scalable event intake

### 🔁 Idempotent Processing

Prevents duplicate event processing using:

```sql
UNIQUE(event_id, tenant_id)
⚙️ Async Worker Pipeline
Worker performs:

Event persistence

Event aggregation (last 50 events per user)

Signal extraction from behavior

Persona generation

Context upsert

🏢 Multi-Tenant Isolation
Every request scoped by tenant_id

Ensures full data separation between tenants

📡 Context API
Retrieve generated user intelligence:

GET /context?tenant_id=tenant_1&user_id=user_1
🗄️ Database Schema
Events Table
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  event_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  payload JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(event_id, tenant_id)
);
User Context Table
CREATE TABLE user_contexts (
  id SERIAL PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  persona TEXT NOT NULL,
  confidence FLOAT,
  signals JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, user_id)
);
🔄 Processing Flow
Client sends event → /events

Event published to Pub/Sub (mocked locally)

Worker consumes event asynchronously

Event stored in PostgreSQL

Last 50 events fetched per user

Behavioral signals extracted

Persona generated

Context stored in user_contexts

🧠 Design Highlights
✔ Event-Driven Architecture
Decouples ingestion from processing for scalability and resilience.

✔ Idempotency
Ensures safe retries using database constraints.

✔ Eventual Consistency
Context is derived asynchronously from raw events.

✔ Horizontal Scalability
API scales independently

Workers scale via queue depth (Pub/Sub model)

⚠️ Current Limitations
LLM integration is mocked (no production AI API yet)

No authentication layer (JWT not implemented)

No caching layer (Redis not included)

Basic analytics pipeline only

🚀 Future Improvements
Integrate Vertex AI / Gemini for persona generation

Add Redis caching for hot contexts

Stream events into BigQuery for analytics

Add authentication per tenant (JWT-based)

Add dead-letter queue for failed events

🧪 Example Event Payload
{
  "event_id": "evt_123",
  "tenant_id": "tenant_1",
  "user_id": "user_1",
  "payload": {
    "action": "click"
  }
}
🧪 Running Tests
npm install
NODE_ENV=test npm test
👨‍💻 Author
Built as a backend engineering system design project demonstrating:

Distributed systems thinking

Event-driven architecture

Async worker pipelines

Data modeling for analytics

Production-ready Node.js design patterns
```
