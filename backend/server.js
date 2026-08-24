require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./config/db');
const { initSocket } = require('./socket');
const startScheduler = require('./services/seatHoldScheduler');
const { sendTestEmail } = require('./services/emailService');

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

// Email test — hit GET /api/health/email-test?to=your@gmail.com to verify SMTP works
app.get('/api/health/email-test', async (req, res) => {
  const to = req.query.to;
  if (!to) return res.status(400).json({ message: 'Pass ?to=your@email.com' });
  try {
    await sendTestEmail(to);
    res.json({ message: `✅ Test email sent to ${to} — check your inbox (and spam folder)!` });
  } catch (err) {
    res.status(500).json({
      message: '❌ Email send failed',
      error: err.message,
      hint: 'Check EMAIL_USER, EMAIL_PASS (App Password), EMAIL_HOST env vars on Railway'
    });
  }
});

// Start background scheduler (TTL + waitlist expiry)
startScheduler();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`\u{1F680} Server running on http://localhost:${PORT}`)
);
