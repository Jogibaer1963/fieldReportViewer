import http from 'node:http';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import dotenv from 'dotenv';
import app from './app.js';
import { Server as SocketIOServer } from 'socket.io';

// Load env first
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const PORT = process.env.PORT || 5000;

// Create HTTP server and attach Socket.IO once
const server = http.createServer(app);

// DO NOT use req/app/controller variables in server bootstrap.
// DO NOT import/export `io` from here for other modules.
// Create the Socket.IO instance and attach it to the app:
const io = new SocketIOServer(server, {
  path: '/socket.io',
  cors: {
    origin: ['http://localhost:4200'],
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  },
});

// Expose io to routes/controllers via Express app
app.set('io', io);

io.on('connection', (socket) => {
  console.log('[socket] client connected:', socket.id);
  socket.on('disconnect', (reason) => {
    console.log('[socket] client disconnected:', socket.id, reason);
  });
});

// Start server after any async init (e.g., DB) is done
server.listen(PORT, () => {
  console.log(`Server listening on Port ${PORT}`);
});



