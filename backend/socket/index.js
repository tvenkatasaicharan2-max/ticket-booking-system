const { Server } = require('socket.io');

let io;

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    socket.on('join-event', (eventId) => {
      socket.join(`event:${eventId}`);
    });

    socket.on('leave-event', (eventId) => {
      socket.leave(`event:${eventId}`);
    });

    socket.on('disconnect', () => {});
  });

  console.log('\u2705 Socket.IO initialised');
  return io;
}

/**
 * Emit seat status updates to all clients watching a specific event.
 * @param {string} eventId
 * @param {Array<{seatId: string, status: string}>} updatedSeats
 */
function emitSeatUpdate(eventId, updatedSeats) {
  if (io) {
    io.to(`event:${eventId}`).emit('seat-update', updatedSeats);
  }
}

module.exports = { initSocket, emitSeatUpdate };
