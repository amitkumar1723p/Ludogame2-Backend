// Express और HTTP server बनाते हैं
import express from 'express';
import { createServer } from 'http';
import dotenv from 'dotenv';

// CORS का use करते हैं ताकि अलग domain से भी API call हो सके
import cors from 'cors';

// Socket.io को import करते हैं real-time communication के लिए
import { Server } from 'socket.io';

// Game से related controller functions import करते हैं
import {
  joinRoom,
  leaveRoom,
  startGame,
  rejoinRoom,
  diceRolled,
  updateNextTurn,
  enablePileSelection,
  enableCellSelection,
  pileEnableFromPocket,
  handleForwardThunk,
} from './src/controllers/gameController.js';

// Express app initialize करते हैं
const app = express();
dotenv.config();
// CORS middleware apply करते हैं (हर जगह से access की इजाज़त)
app.use(cors());

// ✅ Test GET API route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: `new Backend- is running! ${process.env.TESTING} AND MONGO DB URL IS ${process.env.MONGODB} add change pipelinn`,
    timestamp: new Date(),
  });
});

// HTTP server बनाते हैं Express app से
const httpServer = createServer(app);

// Socket.IO server बनाते हैं और cross-origin को allow करते हैं
// const io = new Server(httpServer, { cors: { origin: '*' } });

const io = new Server(httpServer, {
  cors: { origin: '*' },
  pingTimeout: 60000, // 60 sec tak wait karega
  pingInterval: 25000, // 25 sec me ek ping bhejega
});
// जब कोई नया client (user) connect होता है
io.on('connection', (socket) => {
  console.log('New socket:', socket.id); // socket ID log करते हैं

  // जब user room बनाता है (createRoom)
  // socket.on('createRoom', callback => joinRoom(io, socket, callback));
  socket.on('createRoom', (data, callback) =>
    joinRoom(io, socket, data, callback)
  );

  socket.on('joinRoom', (data, callback) =>
    joinRoom(io, socket, data, callback)
  );
  // जब user किसी room को join करता है
  // socket.on('joinRoom', (roomId, callback) => joinRoom(io, socket, callback));

  //  game STart
  // socket.on('start-game', ()=> )
  socket.on('start-game', (data) => startGame(io, socket, data));
  // जब कोई player अपनी चाल चलता है
  // socket.on('makeMove', data => handleMove(io, socket, data));

  // 🔁 Rejoin-room socket event — jab user app refresh karke wapas aaye
  socket.on('rejoin-room', (data) => rejoinRoom(io, socket, data));

  // जब कोई user disconnect (leave) करता है
  socket.on('leaveRoom', (data) => leaveRoom(io, socket, data));

  // जब कोई user disconnect (leave) करता है
  socket.on('diceRolled', (data, callback) =>
    diceRolled(io, socket, data, callback)
  );
  //  socket.on('createRoom', (data, callback) => joinRoom(io, socket, data, callback));00

  // ⏭️ Next turn socket listener
  socket.on('nextTurn', (data) => updateNextTurn(io, socket, data));
  socket.on('enablePileSelection', (data) =>
    enablePileSelection(io, socket, data)
  );
  socket.on('enableCellSelection', (data) =>
    enableCellSelection(io, socket, data)
  );
  socket.on('PileEnableFromPocket', (data) =>
    pileEnableFromPocket(io, socket, data)
  );
  socket.on('handleForwardThunk', (data) =>
    handleForwardThunk(io, socket, data)
  );
  // socket.on('disconnecting', (data) => leaveRoom(io, socket, data));
  // socket.on('disconnect', (data, callback) => {
  //   console.log('❌ Player disconnected:', socket.id);
  // });
});

// Server को port 3000 (या environment के दिए हुए port) पर चलाते हैं
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, '0.0.0.0', () =>
  console.log(`Server running on ${PORT}`)
);
