import app from "./app.js";
import http from "http";
import { Server } from 'socket.io';

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*' }
});

export { io };

const PORT = process.env.PORT || 5000;

server.listen(process.env.PORT || 5000, () => {
  console.log(`Server listening on Port ${PORT}`);
});



