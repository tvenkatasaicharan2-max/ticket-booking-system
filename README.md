# 🎫 TicketSphere — Ticket Booking System

A full-stack ticket booking platform for **movies and concerts** with real-time seat maps, automatic seat hold TTL, FIFO waitlist with cascading time-limited offers, and QR code email delivery.

🌐 **Live Application:** [https://ticket-booking-system-zeta-five.vercel.app/](https://ticket-booking-system-zeta-five.vercel.app/)

---

## Assignment Requirements Coverage

| # | Requirement | Status |
|---|---|---|
| 1 | Visual seat map with real-time available / held / booked status | ✅ |
| 2 | Customer can register, login, browse and filter events | ✅ |
| 3 | Seat hold with configurable TTL (default 10 min) | ✅ |
| 4 | Held seats shown as unavailable to all other customers instantly | ✅ |
| 5 | Auto-release of abandoned holds via cron scheduler | ✅ |
| 6 | Seat map updates in real-time on release (no refresh needed) | ✅ |
| 7 | Concurrency protection — simultaneous holds for same seat both cannot succeed | ✅ |
| 8 | Confirmed booking → QR code ticket via email | ✅ |
| 9 | Waitlist per seat category (FIFO queue) for sold-out events | ✅ |
| 10 | On cancellation → seat immediately offered to next waitlisted customer | ✅ |
| 11 | Time-limited waitlist offer with auto-cascade to next person | ✅ |
| 12 | Customer can view booking history and cancel bookings | ✅ |
| 13 | Organiser can view revenue and booking summary per event | ✅ |
| 14 | Admin creates and manages venues with seat layout and categories | ✅ |
| 15 | Role-based auth: customer / organiser / admin | ✅ |
| 16 | Real-time seat status updates via Socket.IO | ✅ |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite, Vanilla CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| Real-time | Socket.IO (WebSocket) |
| Seat Hold TTL | node-cron (every 60 s) |
| Email | Brevo API (HTTP, sends to any email worldwide) |
| QR Code | qrcode npm package + api.qrserver.com (email) |
| Hosting | Vercel (frontend) + Railway (backend) + MongoDB Atlas |

---

## Live Deployment

| Service | URL |
|---|---|
| 🌐 Frontend (Vercel) | https://ticket-booking-system-zeta-five.vercel.app/ |
| ⚙️ Backend (Railway) | https://ticket-booking-system-production-d01d.up.railway.app |
| 🏥 Health Check | https://ticket-booking-system-production-d01d.up.railway.app/api/health |

---

## Setup Guide

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (free M0 cluster)
- Brevo account (free tier — 300 emails/day, sends to any email worldwide)

### 1. Clone & Install

```bash
git clone https://github.com/tvenkatasaicharan2-max/ticket-booking-system.git
cd ticket-booking-system

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Configure Environment Variables

```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your values
```

**`backend/.env`**:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/ticketdb?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

# Seat Hold TTL (minutes)
SEAT_HOLD_TTL_MINUTES=10

# Waitlist Offer TTL (minutes)
WAITLIST_OFFER_TTL_MINUTES=15

# Email — Brevo (sign up at brevo.com, free, sends to any email)
# Steps: Settings → API Keys → Generate | Then: Senders & IPs → verify your email
BREVO_API_KEY=your_brevo_api_key_here
EMAIL_FROM_ADDRESS=your@gmail.com
```

**`frontend/.env`** (or set on Vercel for production):

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Seed an Admin Account

Admin accounts cannot self-register. Insert via MongoDB shell or Atlas UI:

```js
use ticketdb
db.users.insertOne({
  name: "Admin",
  email: "admin@ticketsphere.com",
  password: "<bcrypt_hash>",   // bcrypt.hashSync("yourpassword", 12)
  role: "admin",
  createdAt: new Date()
})
```

### 4. Run Locally

```bash
# Terminal 1 — Backend (http://localhost:5000)
cd backend && node server.js

# Terminal 2 — Frontend (http://localhost:5173)
cd frontend && npm run dev
```

---

## API Documentation

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register as customer or organiser |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/me` | Bearer | Get current user profile |

### Admin

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/venues` | Bearer | List all venues |
| POST | `/api/admin/venues` | Admin | Create venue with seat layout |
| PUT | `/api/admin/venues/:id` | Admin | Update venue |
| DELETE | `/api/admin/venues/:id` | Admin | Delete venue |
| GET | `/api/admin/users` | Admin | List all registered users |

### Events

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/events` | — | Browse events (filter: `type`, `search`) |
| GET | `/api/events/:id` | — | Event detail |
| GET | `/api/events/:id/seatmap` | — | Live seat map for an event |
| POST | `/api/events` | Organiser | Create event |
| GET | `/api/events/organiser/mine` | Organiser | My events |
| GET | `/api/events/:id/summary` | Organiser | Revenue + booking summary |
| DELETE | `/api/events/:id` | Organiser | Cancel event |

### Bookings

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/bookings/hold` | Customer | Hold seats (starts TTL timer) |
| POST | `/api/bookings/confirm` | Customer | Confirm booking, receive QR email |
| GET | `/api/bookings/my` | Customer | Booking history |
| POST | `/api/bookings/:id/cancel` | Customer | Cancel a booking |

### Waitlist

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/waitlist/join` | Customer | Join waitlist for a seat category |
| GET | `/api/waitlist/accept/:token` | Public | Accept seat offer via token link |
| GET | `/api/waitlist/position` | Customer | Check queue position |

### Health

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | — | Server health check |
| GET | `/api/health/email-test?to=x@y.com` | — | Test email delivery |

---

## Database Schema

### `users`
```
_id, name, email, password (bcrypt hash), role (customer|organiser|admin), createdAt
```

### `venues`
```
_id, name, address, createdBy (ref: User),
seats: [{ seatNumber, row, col, category (Premium|Standard) }]
```

### `events`
```
_id, title, type (movie|concert), description, bannerUrl,
organiser (ref: User), venue (ref: Venue), showDateTime,
priceMap: { Premium: Number, Standard: Number },
status (active|cancelled)
```

### `seatinventories`
```
_id, event (ref: Event),
seats: [{
  seatId, seatNumber, row, col, category,
  status (available|held|booked),
  heldBy (ref: User), heldAt, holdExpiresAt,
  bookedBy (ref: User)
}]
```

### `bookings`
```
_id, event (ref: Event), customer (ref: User),
seats: [{ seatId, seatNumber, row, col, category, price }],
totalAmount, status (confirmed|cancelled),
bookingRef (unique 8-char uppercase), qrCodeDataUrl,
createdAt, cancelledAt
```

### `waitlists`
```
_id, event (ref: Event), category (Premium|Standard),
entries: [{
  customer (ref: User), joinedAt,
  status (waiting|offered|completed|expired),
  offerSentAt, offerExpiresAt, offerToken, offeredSeatId
}]
Unique index: { event, category }
```

---

## Seat Hold & TTL Mechanism

When a customer selects seats and clicks **Hold Seats**, the backend:

1. Reads the `SeatInventory` document for the event
2. Validates every requested seat has `status = 'available'`
3. If any seat is `held` or `booked`, the **entire request is rejected** (HTTP 409) — no partial holds
4. On success, sets each seat to `status = 'held'`, records `heldBy`, `heldAt`, and `holdExpiresAt = now + SEAT_HOLD_TTL_MINUTES`
5. Saves and immediately emits a `seat-update` event via Socket.IO — seats turn amber on all connected clients in real time

A `node-cron` job fires every 60 seconds. It queries for seats where `status = 'held'` AND `holdExpiresAt < now`, resets them to `available`, and re-broadcasts via Socket.IO — seats turn green without any page refresh.

---

## Concurrency Prevention

MongoDB's **document-level atomic writes** serve as the concurrency gate:

1. A hold request reads the inventory document and checks all seats are `available`
2. Marks them `held` and saves atomically with `Document.save()`
3. If two concurrent requests race for the same seat, one saves first — the second then finds the seat already `held` and returns HTTP 409

Because MongoDB's WiredTiger engine serializes concurrent writes to the same document, and all seat statuses for a given event live in **one `SeatInventory` document**, exactly one request wins. No distributed locks or multi-document transactions are needed.

---

## Waitlist Auto-Assignment Flow

1. **Join** — Customer posts `/api/waitlist/join` with `eventId` and `category`. A FIFO entry is appended with `status = 'waiting'`. Duplicate joins are rejected (HTTP 409).

2. **Trigger** — When a booking is cancelled, `cancelBooking` releases the seat and immediately calls `processWaitlist(eventId, category)`.

3. **Process** — Finds the next `'waiting'` entry (by `joinedAt` ascending), locates an available seat of that category, atomically holds it for `WAITLIST_OFFER_TTL_MINUTES`, and marks the entry `'offered'` with a UUID `offerToken`.

4. **Email** — Offer email sent with a time-limited claim link: `{CLIENT_URL}/waitlist/accept?token=<offerToken>`.

5. **Accept** — Customer clicks the link. Backend validates the token, confirms the hold hasn't expired, creates a `Booking`, marks the seat `'booked'`, sends QR confirmation email.

6. **Cascade** — Cron scheduler detects expired `'offered'` entries, releases the held seat back to `'available'` (broadcasts via Socket.IO), marks the entry `'expired'`, and calls `processWaitlist` again for the next person in queue.

---

## QR Code & Email Delivery

- On `POST /api/bookings/confirm`, `qrcode.toDataURL(bookingRef)` generates a base64 PNG encoding the booking reference
- The data URL is stored in the `Booking` document for **in-app QR display** on the My Tickets page
- Emails are sent via the **Brevo API** (HTTP-based, works on cloud platforms that block SMTP)
- The QR image in emails uses `api.qrserver.com` (a public URL) since Gmail blocks base64 `data:` images
- Email is sent **asynchronously** (`.catch(console.error)`) so it never blocks the API response

---

## Deployment

### Backend on Railway

1. Connect GitHub repo → Railway, set **Root Directory** to `backend`
2. Add all env vars from `.env.example` in Variables tab (`PORT` is auto-injected by Railway)
3. Start command: `node server.js`
4. Generate public domain under **Settings → Networking**

### Frontend on Vercel

1. Import GitHub repo → Vercel, set **Root Directory** to `frontend`
2. Framework: **Vite** (auto-detected), Build: `npm run build`, Output: `dist`
3. Add env vars:
   - `VITE_API_URL` = `https://<your-railway-domain>/api`
   - `VITE_SOCKET_URL` = `https://<your-railway-domain>`
4. After deploying, update `CLIENT_URL` in Railway to your Vercel URL and redeploy

---

## System Design Write-up

### TicketSphere — Architecture & Core Mechanisms

**Overview**

TicketSphere is a three-tier web application: a React + Vite single-page application hosted on Vercel, a Node.js/Express + Socket.IO REST API hosted on Railway, and MongoDB Atlas as the primary data store. The three central engineering problems are preventing double-booking under concurrent load, auto-releasing abandoned seat holds without user intervention, and running a fair, automatic waitlist with cascading time-limited offers when seats become available.

**Seat Hold & TTL Mechanism**

When a customer selects seats and clicks "Hold Seats," the system places a temporary, time-bounded reservation. The backend reads the `SeatInventory` document for that event — one document per event containing all seat statuses as a subdocument array — validates every requested seat has `status = 'available'`, and if valid, atomically transitions them to `status = 'held'` with a `holdExpiresAt` timestamp set to `now + SEAT_HOLD_TTL_MINUTES` (default 10 minutes, configurable via environment variable). The hold is all-or-nothing: if any single seat is unavailable, the entire request is rejected with HTTP 409 so customers never end up with a partial group.

After saving, Socket.IO immediately emits a `seat-update` event to all clients subscribed to the event's room (`io.to('event:<id>').emit('seat-update', deltaPayload)`). Every connected browser re-renders the affected seats as amber in real time, giving all users live visibility without any polling or refresh.

A `node-cron` background job runs every 60 seconds. It queries `SeatInventory` documents for held seats whose `holdExpiresAt` is in the past, resets them to `available`, saves, and re-broadcasts via Socket.IO — seats turn green again automatically. This handles checkout abandonment without any user action.

**Concurrency Prevention**

MongoDB's document-level write lock is the concurrency gate. All seat statuses for a given event live in a single `SeatInventory` document. A hold request follows a read-check-write sequence within a single `document.save()`. Because MongoDB's WiredTiger storage engine serializes concurrent writes to the same document, when two users simultaneously request the same seat, the first write succeeds, and the second request reads the post-save state — finds the seat already `'held'` — and returns HTTP 409 Conflict. No distributed locks or multi-document transactions are required. This design keeps the implementation simple while providing correct mutual exclusion for all practical traffic levels.

**Waitlist Auto-Assignment Flow**

The waitlist is a FIFO queue modeled as one `Waitlist` document per event-category pair, with an `entries` subdocument array sorted by `joinedAt`. When a booking is cancelled, `cancelBooking` releases the seat and immediately calls `processWaitlist(eventId, category)`. This function finds the next `'waiting'` entry (sorted by `joinedAt` ascending), locates any available seat of that category, and atomically holds it for `WAITLIST_OFFER_TTL_MINUTES`. The entry transitions to `'offered'` with a UUID stored as `offerToken`.

An offer email is dispatched to the customer with a self-authenticating link containing the UUID token. No session login is required at the point of acceptance — the UUID token is the credential. The customer clicks the link; the `acceptOffer` endpoint validates the token, confirms the hold has not expired, creates a `Booking` record, marks the seat `'booked'`, and sends a QR code confirmation email.

**Time-Limited Offer Handling**

The same cron scheduler that releases expired seat holds also scans for waitlist entries in `'offered'` status whose `offerExpiresAt` has passed. For each expired offer, it: marks the entry `'expired'`, releases the held seat back to `'available'` in the inventory (with a Socket.IO broadcast so the seat map updates live for all viewers), and calls `processWaitlist` again to cascade the offer to the next person in the queue. This loop continues until either a customer successfully accepts or the queue is exhausted, ensuring no seat is permanently locked due to an unresponsive waitlisted customer.

**Real-Time Architecture**

Socket.IO rooms are keyed by event ID (`event:<id>`). Clients join the room when they open the seat map and leave on navigation. All seat state changes emit a minimal delta payload `[{ seatId, status }]` rather than the full seat map, minimising bandwidth. The React `SeatMap` component merges this delta into local state using `.map()`, achieving sub-second UI updates without polling.

**Email & QR Code Delivery**

QR codes are generated server-side using the `qrcode` package as base64 PNG data URLs encoding the booking reference. The data URL is stored in the `Booking` document for in-app display. Emails are delivered via the Brevo HTTP API (using Node's built-in `https` module) — chosen because Railway blocks all outbound SMTP ports. The QR image in emails is rendered via `api.qrserver.com` as a standard HTTPS image URL, since Gmail and most email clients strip base64 `data:` image URLs for security. All email sending is asynchronous so the API response is never blocked.
