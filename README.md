# TicketSphere — Ticket Booking System

A full-stack ticket booking platform for movies and concerts with **real-time seat maps**, **seat hold TTL**, **waitlist auto-assignment**, and **QR code email delivery**.

---

## Assignment Requirements Coverage

| Requirement | Status |
|---|---|
| Visual seat map with available / held / booked status | ✅ |
| Seat hold with configurable TTL (default 10 min) | ✅ |
| Auto-release of abandoned holds via cron scheduler | ✅ |
| Concurrency protection — no double-booking | ✅ |
| Confirmed booking → QR code email | ✅ |
| Waitlist per seat category (FIFO) | ✅ |
| On cancellation → seat offered to next waitlisted customer | ✅ |
| Time-limited waitlist offer with auto-cascade | ✅ |
| Role-based auth: customer / organiser / admin | ✅ |
| Customer booking history + cancellation | ✅ |
| Organiser revenue + booking summary per event | ✅ |
| Admin venue management with seat layout | ✅ |
| Real-time seat status via Socket.IO | ✅ |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite, Vanilla CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| Real-time | Socket.IO |
| Seat Hold TTL | node-cron (every 60 s) |
| Email | Nodemailer (Gmail SMTP) |
| QR Code | qrcode npm package |

---

## Setup Guide

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (free tier M0 is sufficient)
- Gmail account with App Password (2FA must be enabled)

### 1. Clone & Install

```bash
# Backend dependencies
cd backend && npm install

# Frontend dependencies
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
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
SEAT_HOLD_TTL_MINUTES=10
WAITLIST_OFFER_TTL_MINUTES=15
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_16_char_app_password
EMAIL_FROM="TicketSphere <your@gmail.com>"
```

**`frontend/.env`** (set on Vercel for production):

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Seed an Admin Account

Admin accounts cannot self-register. Use the MongoDB shell:

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
| POST | /api/auth/register | — | Register as customer or organiser |
| POST | /api/auth/login | — | Login, returns JWT |
| GET | /api/auth/me | Bearer | Get current user profile |

### Admin

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /api/admin/venues | Bearer | List all venues |
| POST | /api/admin/venues | Admin | Create venue with seat layout |
| PUT | /api/admin/venues/:id | Admin | Update venue |
| DELETE | /api/admin/venues/:id | Admin | Delete venue |

### Events

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /api/events | — | Browse events (filter: type, search) |
| GET | /api/events/:id | — | Event detail |
| GET | /api/events/:id/seatmap | — | Live seat map for an event |
| POST | /api/events | Organiser | Create event |
| GET | /api/events/organiser/mine | Organiser | My events |
| GET | /api/events/:id/summary | Organiser | Revenue + booking summary |
| DELETE | /api/events/:id | Organiser | Cancel event |

### Bookings

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/bookings/hold | Customer | Hold seats (starts TTL timer) |
| POST | /api/bookings/confirm | Customer | Confirm booking, receive QR email |
| GET | /api/bookings/my | Customer | Booking history |
| POST | /api/bookings/:id/cancel | Customer | Cancel a booking |

### Waitlist

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/waitlist/join | Customer | Join waitlist for a category |
| GET | /api/waitlist/accept/:token | Public | Accept seat offer via token link |
| GET | /api/waitlist/position | Customer | Check waitlist position |

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
bookingRef (unique 8-char), qrCodeDataUrl,
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
3. If any seat is already `held` or `booked`, the **entire request is rejected** with HTTP 409 — no partial holds
4. On success, sets each seat to `status = 'held'`, records `heldBy`, `heldAt`, and `holdExpiresAt = now + SEAT_HOLD_TTL_MINUTES`
5. Saves the document and immediately emits a `seat-update` event via Socket.IO — seats turn amber on all connected clients in real time

A `node-cron` job fires every 60 seconds. It queries `SeatInventory` for seats where `status = 'held'` AND `holdExpiresAt < now`, resets them to `available`, saves, and re-broadcasts via Socket.IO — seats turn green without any page refresh.

---

## Concurrency Prevention

The system uses MongoDB's **document-level atomic writes** as its concurrency gate:

1. A hold request reads the inventory document and checks all seats are `available`
2. Marks them `held` and saves atomically
3. If two concurrent requests race for the same seat, one saves first — the second then finds the seat already `held` (not `available`) and returns HTTP 409

This is a **read-check-write** pattern within a single Mongoose `.save()`. MongoDB's WiredTiger engine serializes concurrent writes to the same document, so exactly one request wins. No distributed locks or transactions are required because all seat status for a given event lives in a single `SeatInventory` document.

---

## Waitlist Auto-Assignment Flow

1. **Join**: Customer posts `/api/waitlist/join` with `eventId` and `category`. A FIFO entry is appended. Duplicate joins are rejected (HTTP 409).

2. **Trigger**: When any booking is cancelled, `cancelBooking` releases the seat and immediately calls `processWaitlist(eventId, category)`.

3. **Process**: Finds the next `'waiting'` entry (sorted by `joinedAt`), locates an available seat, atomically holds it for `WAITLIST_OFFER_TTL_MINUTES`, and marks the entry `'offered'` with a UUID `offerToken`.

4. **Email**: Offer email sent with time-limited link: `{CLIENT_URL}/waitlist/accept?token=<offerToken>`.

5. **Accept**: Customer clicks the link. Backend validates token, checks hold not expired, creates `Booking`, marks seat `booked`, sends QR confirmation email.

6. **Cascade**: Cron scheduler detects expired `'offered'` entries, releases the held seat back to `'available'` (broadcasts via Socket.IO), marks entry `'expired'`, calls `processWaitlist` again for the next person.

---

## QR Code & Email Delivery

- On `POST /api/bookings/confirm`, `qrcode.toDataURL(bookingRef)` generates a base64 PNG encoding the booking reference
- The data URL is stored in the `Booking` document (for in-app QR display on My Tickets) and sent via Nodemailer
- Email is sent **asynchronously** so it never blocks the API response
- QR code is embedded inline in email HTML as `<img src="data:image/png;base64,...">` for broad email client compatibility

---

## Deployment

### Backend on Railway

1. Connect GitHub repo to Railway
2. Set **Root Directory** to `backend`
3. Add all env vars from `.env.example` in the Variables tab (`PORT` is auto-injected)
4. Start command: `node server.js`
5. Generate public domain under Settings → Networking

### Frontend on Vercel

1. Import GitHub repo to Vercel, set **Root Directory** to `frontend`
2. Framework: **Vite** (auto-detected), Build: `npm run build`, Output: `dist`
3. Add env vars:
   - `VITE_API_URL` = `https://<your-railway-domain>/api`
   - `VITE_SOCKET_URL` = `https://<your-railway-domain>`
4. After deploying, update `CLIENT_URL` in Railway to your Vercel URL and redeploy

---

## System Design Write-up

### TicketSphere — Architecture & Core Mechanisms

**Overview**

TicketSphere is a three-tier web application: a React + Vite frontend on Vercel, a Node.js/Express + Socket.IO backend on Railway, and MongoDB Atlas as the database. The primary engineering challenges are preventing double-booking under concurrent load, auto-releasing abandoned holds, and running a fair waitlist with cascading time-limited seat offers.

**Seat Hold & TTL Mechanism**

When a customer selects seats and clicks "Hold Seats", the system places a temporary, time-bounded reservation. The backend reads the `SeatInventory` document for that event — one document per event containing all seat statuses — validates every requested seat has `status = 'available'`, and if valid, atomically transitions them to `status = 'held'` with a `holdExpiresAt` timestamp set to `now + SEAT_HOLD_TTL_MINUTES` (default 10 minutes, configurable via env var). The hold is all-or-nothing: if any single seat is unavailable, the entire request is rejected with HTTP 409 so customers never partially hold a group.

After saving, Socket.IO immediately emits a `seat-update` event to all clients in the event's room (`io.to('event:<id>').emit('seat-update', deltaPayload)`). Every connected browser rerenders the affected seats as amber in real time, giving all users live visibility into which seats are being considered.

A `node-cron` background job runs every 60 seconds. It queries `SeatInventory` for documents with held seats whose `holdExpiresAt` is in the past, resets them to `available`, saves, and re-broadcasts via Socket.IO — seats turn green again without any user action or page reload. This handles checkout abandonment automatically.

**Concurrency Prevention**

MongoDB's document-level write lock is the concurrency gate. All seat statuses for a given event live in a single `SeatInventory` document. A hold request follows a read-check-write sequence within a single `Document.save()`. Because MongoDB's WiredTiger storage engine serializes concurrent writes to the same document, when two users simultaneously request the same seat: the first write succeeds, and when the second request reads the document afterwards, it finds that seat already `'held'` and returns HTTP 409 Conflict. No distributed locks, advisory locks, or multi-document transactions are required. For even higher throughput, MongoDB's `$elemMatch` filter on `findOneAndUpdate` could serve as a stricter optimistic lock, rejecting writes where the seat status no longer matches the expected `'available'` at the moment of write.

**Waitlist Auto-Assignment Flow**

The waitlist is a FIFO queue modeled as a single `Waitlist` document per event-category pair, with an `entries` subdocument array sorted by `joinedAt`. When a booking is cancelled, `cancelBooking` releases the seat and immediately calls `processWaitlist(eventId, category)`. This function finds the next `'waiting'` entry (by `joinedAt` ascending), locates any available seat of that category in the inventory, and atomically holds it for `WAITLIST_OFFER_TTL_MINUTES`. The entry transitions to `'offered'` with a UUID token stored as `offerToken`.

An offer email is sent to the customer with a self-authenticating link: `{CLIENT_URL}/waitlist/accept?token=<uuid>`. No login session is required — the UUID token is the credential. The customer clicks the link, the `acceptOffer` endpoint validates the token, confirms the hold has not expired, creates a `Booking` record, marks the seat `'booked'`, and sends a QR code confirmation email.

**Time-Limited Offer Handling**

The cron scheduler also scans for waitlist entries in `'offered'` status whose `offerExpiresAt` has passed. For each expired offer it: marks the entry `'expired'`, releases the held seat back to `'available'` in the `SeatInventory` document (with a Socket.IO broadcast so the seat map updates live), then calls `processWaitlist` again to cascade the offer to the next person in queue. This loop continues until either a customer accepts or the queue is empty, guaranteeing no seat is permanently stuck in limbo.

**Real-Time Architecture**

Socket.IO rooms are keyed by event ID (`event:<id>`). Clients join when they open the seat map and leave when they navigate away. All seat state changes push a minimal delta payload `[{ seatId, status }]` rather than the full seat map, minimising bandwidth. The React `SeatMap` component merges this delta into its local state using `.map()` with a find, achieving sub-second UI updates without any polling.

**Email & QR Code Delivery**

QR codes are generated server-side with the `qrcode` npm package as base64 PNG data URLs encoding the booking reference. The data URL is stored in the `Booking` document for in-app display on the "My Tickets" page, and also embedded inline in the HTML email body. Nodemailer with Gmail SMTP (App Password auth) delivers emails asynchronously using `.catch(console.error)` so the API response is never delayed by email delivery. The styled HTML email includes event details, seat list, booking reference, and the embedded QR image, giving customers everything needed to enter the venue.
