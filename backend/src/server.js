import app from "./app.js";
import http from "http";
import {Server} from "socket.io";


const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "http://localhost:4200" }
});

export { io };

const PORT = process.env.PORT || 5000;

server.listen(PORT, () =>
{
  console.log(`Server listening on Port ${PORT}`);
});



