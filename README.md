# TicketSphere — Ticket Booking System

A full-stack ticket booking platform for movies and concerts with real-time seat maps, seat hold TTL, waitlist management, and QR code email delivery.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite, Vanilla CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| Real-time | Socket.IO |
| Seat Hold TTL | node-cron (every 60s) |
| Email | Nodemailer (Gmail SMTP) |
| QR Code | qrcode npm package |

## Setup Guide

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier)
- Gmail account with App Password enabled

### 1. Clone & Install

```bash
# Install backend
cd backend
npm install

# Install frontend
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
# backend/.env
cp backend/.env.example backend/.env
# Fill in your values
```

### 3. Seed Admin User

Since admin accounts can't self-register, create one via MongoDB shell or a one-time script:

```js
// In MongoDB shell (mongosh)
use ticketdb
db.users.insertOne({
  name: "Admin User",
  email: "admin@ticketsphere.com",
  password: "<bcrypt_hash_of_your_password>",  // use bcrypt.hashSync("yourpass", 12)
  role: "admin",
  createdAt: new Date()
})
```

Or run: `node backend/seedAdmin.js` (create this file manually with your credentials).

### 4. Run Locally

```bash
# Terminal 1 — Backend
cd backend
node server.js

# Terminal 2 — Frontend
cd frontend
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

## API Documentation

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | — | Register (customer/organiser) |
| POST | /api/auth/login | — | Login, returns JWT |
| GET | /api/auth/me | Bearer | Get current user |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/admin/venues | Bearer | List all venues |
| POST | /api/admin/venues | Admin | Create venue |
| PUT | /api/admin/venues/:id | Admin | Update venue |
| DELETE | /api/admin/venues/:id | Admin | Delete venue |

### Events
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/events | — | Browse events (filter: type, search) |
| GET | /api/events/:id | — | Event detail |
| GET | /api/events/:id/seatmap | — | Live seat map |
| POST | /api/events | Organiser | Create event |
| GET | /api/events/organiser/mine | Organiser | My events |
| GET | /api/events/:id/summary | Organiser | Booking + revenue summary |
| DELETE | /api/events/:id | Organiser | Cancel event |

### Bookings
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/bookings/hold | Customer | Hold seats (starts TTL) |
| POST | /api/bookings/confirm | Customer | Confirm booking, get QR |
| GET | /api/bookings/my | Customer | Booking history |
| POST | /api/bookings/:id/cancel | Customer | Cancel booking |

### Waitlist
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/waitlist/join | Customer | Join waitlist |
| GET | /api/waitlist/accept/:token | — | Accept seat offer |
| GET | /api/waitlist/position | Customer | Check position |

## Database Schema

### users
`_id, name, email, password (hash), role (customer|organiser|admin), createdAt`

### venues
`_id, name, address, createdBy (ref User), seats[{seatNumber, row, col, category}]`

### events
`_id, title, type, description, bannerUrl, organiser (ref User), venue (ref Venue), showDateTime, priceMap{Premium, Standard}, status`

### seatInventory
`_id, event (ref Event), seats[{seatId, seatNumber, row, col, category, status, heldBy, heldAt, holdExpiresAt, bookedBy}]`

### bookings
`_id, event, customer, seats[{seatId, seatNumber, category, price}], totalAmount, status, bookingRef (unique), qrCodeDataUrl, createdAt, cancelledAt`

### waitlist
`_id, event, category, entries[{customer, joinedAt, offerSentAt, offerExpiresAt, offerToken, offeredSeatId, status}]`

## Seat Hold & TTL Mechanism

When a customer selects seats and clicks "Hold Seats", the backend atomically checks all requested seats have `status = 'available'`. If any seat is already held or booked, the entire request is rejected with a 409 Conflict. On success, each seat's status is set to `'held'` with a `holdExpiresAt` timestamp (now + `SEAT_HOLD_TTL_MINUTES`). Socket.IO immediately broadcasts the status change to all clients viewing the same event, making the seats appear yellow (held) in real time.

A `node-cron` job runs every 60 seconds and queries `SeatInventory` for any seats where `status = 'held'` AND `holdExpiresAt < now`. These expired seats are reset to `'available'` and Socket.IO re-broadcasts the update — seats turn green again without any page refresh.

## Concurrency Prevention

Seat holds use a read-modify-write pattern inside a single Mongoose document save. The hold request first reads the `SeatInventory` document, validates all requested seats are `'available'`, marks them as `'held'`, and saves. The critical protection is the **filter condition**: each seat's status is checked against `'available'` before marking. If two concurrent requests race for the same seat, one will find the seat already `'held'` after the other saves, and return a 409 error. MongoDB's document-level write lock ensures only one concurrent write wins per document.

## Waitlist Auto-Assignment Flow

1. Customer joins waitlist (FIFO queue, sorted by `joinedAt`).
2. When any booking is cancelled, `cancelBooking` releases the seat and calls `processWaitlist(eventId, category)`.
3. `processWaitlist` finds the next `'waiting'` entry, locates an available seat in that category, and atomically holds it for `WAITLIST_OFFER_TTL_MINUTES`.
4. An email is sent with a unique `offerToken` link: `/waitlist/accept?token=<token>`.
5. If the customer accepts within the TTL, their booking is confirmed and a QR email is sent.
6. The `node-cron` scheduler also checks for expired `'offered'` entries and cascades to the next person in queue.

## Deployment

### Backend (Render)
- Build command: (none)
- Start command: `node server.js`
- Add all env vars from `.env.example`

### Frontend (Vercel)
- Framework: Vite
- Build: `npm run build`
- Output: `dist`
- Add env vars: `VITE_API_URL`, `VITE_SOCKET_URL` (both pointing to your Render backend URL)
