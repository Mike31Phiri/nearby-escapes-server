# Nearby Escapes Server 🌍

<p align="center">
  <img src="https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80" alt="Nearby Escapes" width="100%" style="border-radius: 8px; max-height: 280px; object-fit: cover;" />
</p>

<p align="center">
  <strong>The high-performance hospitality, adventure experience, and travel booking engine for Nearby Escapes.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-11.0-E0234E?logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/Prisma-7.5-2D3748?logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Redis-BullMQ-DC382D?logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/Elasticsearch-9.5-005571?logo=elasticsearch&logoColor=white" alt="Elasticsearch" />
  <img src="https://img.shields.io/badge/Payments-DPO_Group-008080" alt="DPO Payments" />
</p>

---

## 📌 Architecture Overview

Nearby Escapes uses a relational **Business-to-Inventory** architecture. Instead of treating listings as generic single records, the platform separates the **Business / Brand** (`Property`) from its **Bookable Inventory Units** (`Stay[]`, `Experience[]`, `Transport[]`).

```
Property (Business Brand: e.g. "Zambezi River Sun Lodge")
  │
  ├── Stays (Rooms / Chalets / Units)
  │     ├── "Deluxe River Suite"    (K1,800/night, maxGuests: 2)
  │     ├── "Family Safari Tent"     (K2,400/night, maxGuests: 4)
  │     └── "Executive Chalet"       (K3,200/night, maxGuests: 2)
  │
  ├── Experiences (Tours / Activities)
  │     ├── "Sunset Catamaran Cruise" (K450/person, Slots: 10:00, 15:30)
  │     └── "White Water Rafting"     (K850/person, Slots: 08:30)
  │
  └── Transport (Shuttles / Routes)
        └── "Livingstone Airport Transfer" (K250/seat, 4x4 Van)
```

- **Property Level**: Owns shared brand data, geo-coordinates, verified host ownership, photos (`PropertyImage`), amenities (`PropertyAmenity`), and house rules (`PropertyRule`).
- **Unit Level**: Houses exact capacities, pricing, seasonal rates, cancellation policies, and time slots with **zero nullable type columns**.

---

## ⚡ Key Platform Systems

### 1. 10-Minute Hold Race Condition System
To eliminate booking race conditions, inventory is locked the moment a guest clicks **"Book"**, rather than when they complete payment:
- **Instant Temporary Lock**: Initiating `POST /api/bookings` sets a 10-minute hold (`expiresAt = NOW + 10m`, status: `PENDING`).
- **Availability Calendar Blocking**: All other users querying `GET /api/availability/...` see the held dates or experience time slots as `status: 'held'`, `available: false`.
- **Zero-Latency Automatic Release**: Holds are evaluated dynamically (`expiresAt > NOW()`). If 10 minutes elapse without payment, the dates/slots are instantly unlocked with zero cron delays.
- **Early Release**: If a customer navigates away or cancels, `POST /api/bookings/:id/release` frees the dates immediately.
- **Payment Guard**: `DpoService` verifies the hold has not expired before generating payment tokens.

### 2. Host Check-In & Automated Funds Release
Nearby Escapes acts as an escrow platform, releasing funds to hosts only upon verified guest arrival:
- **Host Action**: The host clicks **"Check In"** via `POST /api/bookings/:id/check-in` (or `/api/host/bookings/:id/check-in`).
- **Automated Payout**:
  - Calculates platform fee: **15% commission**.
  - Calculates host payout: **85% net amount**.
  - Generates a `Payout` record linked to the booking with `status: 'PROCESSING'`.
  - Dispatches notifications to both the host (payout released) and the guest (check-in confirmation).
- **Booking Status**: Transitioned to `CHECKED_IN`, with `checkedInAt` timestamp recorded.

### 3. Host Check-Out & Immediate Inventory Reopening
- **Host Action**: The host clicks **"Check Out"** via `POST /api/bookings/:id/check-out`.
- **Immediate Reopening**:
  - Sets `status: 'COMPLETED'` and records `checkedOutAt`.
  - If a guest checks out earlier than scheduled, the effective `checkOut` date is adjusted to the actual checkout time.
  - Completed bookings are automatically excluded from availability blocks, making the room/unit **immediately bookable** for new guests.

### 4. Host Settings & Operational Defaults
Hosts can configure their operational preferences via `PATCH /api/hosts/me/settings`:
- `defaultCheckInTime` (e.g. `"14:00"`, `"15:00"`)
- `defaultCheckOutTime` (e.g. `"10:00"`, `"11:00"`)
- `businessName`
- `payoutMethod` (`"BANK_TRANSFER"` or `"MOBILE_MONEY"`)
- `payoutAccount` (Bank account or mobile money phone number)
- **Automatic Inheritance**: Newly added `Stay` units automatically inherit the host's default check-in and check-out times.

### 5. High-Speed Read Store & Search
- **Elasticsearch 9.5 Index**: Full-text searching, geospatial queries, and price filtering.
- **Database Fallback**: Transparently falls back to PostgreSQL relational queries if Elasticsearch is syncing or offline.
- **Async Synchronization**: Queue-driven updates using **BullMQ** and Redis.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [NestJS 11](https://nestjs.com/) (TypeScript) |
| **ORM & Database** | [Prisma 7.5](https://www.prisma.io/) with [PostgreSQL 16](https://www.postgresql.org/) |
| **Search Engine** | [Elasticsearch 9.5](https://www.elastic.co/) |
| **Cache & Queues** | [Redis 6+](https://redis.io/) & [BullMQ](https://bullmq.io/) |
| **Payment Gateway** | [DPO Group (Direct Pay Online)](https://www.dpogroup.com/) |
| **Object Storage** | AWS S3 / Cloudflare R2 (`@aws-sdk/client-s3`) |
| **API Documentation**| [Swagger / OpenAPI](https://swagger.io/) |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v20+
- **PostgreSQL**: v15+ (listening on `localhost:5432`)
- **Redis**: v6+ (listening on `localhost:6379`)
- **Elasticsearch**: v8+ or v9+ (optional in dev, fallback active)

### 2. Installation
```bash
git clone https://github.com/Mike31Phiri/nearby-escapes-server.git
cd nearby-escapes-server
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:

```env
# Application
PORT=3000
NODE_ENV=development
API_PREFIX=api

# PostgreSQL Database (Prisma v7)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nearby_escapes?schema=public"

# JWT Authentication
JWT_SECRET="super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Redis & Queues
REDIS_HOST="127.0.0.1"
REDIS_PORT=6379

# Elasticsearch
ELASTICSEARCH_NODE="http://localhost:9200"

# Eskrow Payment Gateway
# TODO: fill these in once you receive the Eskrow API credentials
ESKROW_API_KEY="your-eskrow-api-key"
ESKROW_SECRET_KEY="your-eskrow-secret-key"
ESKROW_WEBHOOK_SECRET="your-eskrow-webhook-secret"
# APP_URL is used to construct the webhook callback URL sent to Eskrow
APP_URL="http://localhost:3001"


# AWS / Cloudflare R2 Storage
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="auto"
AWS_S3_BUCKET="nearby-escapes"
```

### 4. Database Setup & Seeding
```bash
# Push schema to PostgreSQL and generate Prisma Client
npx prisma db push
npx prisma generate

# Seed initial platform administrator
npm run seed:admin

# Seed comprehensive platform policies
npm run seed:policies
```

### 5. Running the Application
```bash
# Development (with hot-reload)
npm run start:dev

# Production build
npm run build
npm run start:prod
```

The server will start at: `http://localhost:3000/api`  
Interactive Swagger documentation: `http://localhost:3000/api/docs`

---

## 📡 API Reference Overview

### Authentication & Users (`/api/auth`, `/api/users`)
- `POST /api/auth/register` — Register guest account
- `POST /api/auth/login` — Authenticate and receive JWT
- `GET /api/auth/me` — Current user profile
- `POST /api/hosts` — Upgrade guest account to host

### Properties & Inventory (`/api/properties`)
- `GET /api/properties` — Search properties with filters (stays, experiences, transport)
- `GET /api/properties/:id` — Full property details with all child units
- `POST /api/properties` — Create business property (`STAY`, `EXPERIENCE`, or `TRANSPORT`)
- `POST /api/properties/:id/stays` — Add room/chalet unit to a STAY property
- `POST /api/properties/:id/experiences` — Add activity unit to an EXPERIENCE property
- `POST /api/properties/:id/transport` — Add route unit to a TRANSPORT property

### Availability & 10-Minute Holds (`/api/availability`)
- `GET /api/availability/stays/:stayId?year=YYYY&month=M` — Stay calendar availability (returns `available`, `status: 'available' | 'held' | 'booked'`, `holdExpiresAt`)
- `GET /api/availability/experiences/:experienceId?date=YYYY-MM-DD` — Time slots & remaining spots
- `GET /api/availability/transport/:transportId?date=YYYY-MM-DD` — Seat capacity availability

### Bookings & Operations (`/api/bookings`)
- `POST /api/bookings` — Create booking with **10-minute hold**
- `GET /api/bookings` — User's bookings
- `GET /api/bookings/:id` — Single booking details & remaining hold seconds
- `POST /api/bookings/:id/release` — Cancel hold early if leaving checkout
- `POST /api/bookings/:id/cancel` — Cancel confirmed booking (applies cancellation policy & refund calculations)
- `POST /api/bookings/:id/check-in` — Host check-in (**triggers 85% funds release**)
- `POST /api/bookings/:id/check-out` — Host check-out (**reopens inventory immediately**)

### Host Dashboard & Settings (`/api/host`, `/api/hosts`)
- `GET /api/host/dashboard` — Stats, metrics, upcoming arrivals, revenue
- `GET /api/host/earnings` — Monthly earnings & payouts breakdown
- `GET /api/host/settings` — Get host usual check-in/out times & payout info
- `PATCH /api/host/settings` — Update usual check-in/out times & payout preferences

### Payments (`/api/payments`)
- `POST /api/payments/create-token` — Create DPO payment token (checks hold expiry)
- `POST /api/payments/verify` — Verify transaction & confirm booking
- `POST /api/payments/callback` — Webhook handler for DPO payment notification

### Policies & Governance (`/api/policies`)
- `GET /api/policies/type/:type` — Current active policy (Privacy Policy, Terms of Service, Cancellation)
- `GET /api/policies/type/:type/versions` — Version history of a policy
- `POST /api/policies` — Admin create/update policy version

---

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Run 10-minute hold verification suite
node scratch/test-hold-end-to-end.js

# Run check-in, funds release & inventory reopening suite
node scratch/test-checkin-checkout.js
```

---

## 📄 License
This project is proprietary software for **Nearby Escapes Travel Agency**. All rights reserved.
