import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import { setupSockets } from './sockets';

const PORT = process.env.PORT || 4000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST']
  }
});

setupSockets(io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
