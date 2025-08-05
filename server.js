 // Express और HTTP server बनाते हैं
import express from 'express';
import { createServer } from 'http';

// CORS का use करते हैं ताकि अलग domain से भी API call हो सके
import cors from 'cors';

// Socket.io को import करते हैं real-time communication के लिए
import { Server } from 'socket.io';

// Game से related controller functions import करते हैं
import { joinRoom, handleMove, leaveRoom  ,startGame, rejoinRoom, diceRolled} from './src/controllers/gameController.js';

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
  // socket.on('createRoom', callback => joinRoom(io, socket, callback));
  socket.on('createRoom', (data, callback) => joinRoom(io, socket, data, callback));

  socket.on('joinRoom', (data, callback) => joinRoom(io, socket, data, callback));
  // जब user किसी room को join करता है
  // socket.on('joinRoom', (roomId, callback) => joinRoom(io, socket, callback));

  //  game STart 
  // socket.on('start-game', ()=> )
    socket.on('start-game', data => startGame(io, socket, data));
  // जब कोई player अपनी चाल चलता है
  socket.on('makeMove', data => handleMove(io, socket, data));


// 🔁 Rejoin-room socket event — jab user app refresh karke wapas aaye
socket.on('rejoin-room', data => rejoinRoom(io, socket, data));

  // जब कोई user disconnect (leave) करता है
  socket.on('disconnect', () => leaveRoom(io, socket));

    // जब कोई user disconnect (leave) करता है
  socket.on('diceRolled', data  => diceRolled(io, socket ,data));
  
});

// Server को port 3000 (या environment के दिए हुए port) पर चलाते हैं
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, '0.0.0.0', () => console.log(`Server running on ${PORT}`));
