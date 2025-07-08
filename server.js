 // Express और HTTP server बनाते हैं
import express from 'express';
import { createServer } from 'http';

// CORS का use करते हैं ताकि अलग domain से भी API call हो सके
import cors from 'cors';

// Socket.io को import करते हैं real-time communication के लिए
import { Server } from 'socket.io';

// Game से related controller functions import करते हैं
import { joinRoom, handleMove, leaveRoom } from './src/controllers/gameController.js';

// Express app initialize करते हैं
const app = express();

// CORS middleware apply करते हैं (हर जगह से access की इजाज़त)
app.use(cors());

// HTTP server बनाते हैं Express app से
const httpServer = createServer(app);

// Socket.IO server बनाते हैं और cross-origin को allow करते हैं
const io = new Server(httpServer, { cors: { origin: '*' } });

// जब कोई नया client (user) connect होता है
io.on('connection', socket => {
  console.log('New socket:', socket.id); // socket ID log करते हैं

  // जब user room बनाता है (createRoom)
  socket.on('createRoom', callback => joinRoom(io, socket, callback));

  // जब user किसी room को join करता है
  socket.on('joinRoom', (roomId, callback) => joinRoom(io, socket, callback));

  // जब कोई player अपनी चाल चलता है
  socket.on('makeMove', data => handleMove(io, socket, data));

  // जब कोई user disconnect (leave) करता है
  socket.on('disconnect', () => leaveRoom(io, socket));
});

// Server को port 3000 (या environment के दिए हुए port) पर चलाते हैं
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => console.log(`Server running on ${PORT}`));
