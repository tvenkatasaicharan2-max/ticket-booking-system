require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./config/db');
const { initSocket } = require('./socket');
const startScheduler = require('./services/seatHoldScheduler');

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Initialise Socket.IO and store io on app
const io = initSocket(server);
app.set('io', io);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// API Routes
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/admin',    require('./routes/admin'));
app.use('/api/events',   require('./routes/events'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/waitlist', require('./routes/waitlist'));

app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date() })
);

// Start background scheduler (TTL + waitlist expiry)
startScheduler();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`\u{1F680} Server running on http://localhost:${PORT}`)
);
