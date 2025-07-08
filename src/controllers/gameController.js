// Unique ID बनाने के लिए UUID package import किया है
import { v4 as uuidv4 } from 'uuid';

// Room Manager class को import कर रहे हैं जो room को manage करता है (create, join, remove)
import { RoomManager } from '../models/roomModel.js';





const joinRoom = (io, socket, callback) => {
  // callback के अंदर से roomId और isNew (flag: नया room है या नहीं) निकालते हैं
  const { roomId, isNew } = callback?.data || {};
  let room;

  if (isNew) {
    // अगर client ने नया room बनाने के लिए request किया है
    room = RoomManager.createRoom(socket.id); // नया room बनाएं और current user को host बनाएं
    console.log(`Room ${room.id} created by ${socket.id}`);
  } else {
    // अगर client किसी existing room को join कर रहा है
    room = RoomManager.addPlayer(roomId, socket.id); // roomId के हिसाब से player को room में जोड़ें
    if (!room) return callback({ error: 'Room not found or full' }); // अगर room नहीं मिला या full है
    console.log(`${socket.id} joined Room ${roomId}`);
  }

  socket.join(room.id); // socket.io के through socket को room में officially जोड़ते हैं

  // पूरे room को update कर देते हैं (broadcast करते हैं सभी players को)
  io.to(room.id).emit('roomUpdate', room);

  // callback के ज़रिए client को success message और room की जानकारी भेजते हैं
  callback({ success: true, room });
};


const handleMove = (io, socket, { roomId, move }) => {
  const room = RoomManager.getRoom(roomId); // room को find करते हैं ID से
  if (!room) return; // अगर room नहीं मिला तो function वहीं रोक देते हैं

  room.moves.push(move); // move को room की moves list में जोड़ते हैं

  // currentTurn को toggle करते हैं: अगर 1 था तो 2, और 2 था तो 1
  room.currentTurn = 3 - room.currentTurn;

  // move हो जाने के बाद सभी users को updated move, turn और पूरी move history भेजते हैं
  io.to(roomId).emit('moveMade', {
    move,                         // अभी की move
    currentTurn: room.currentTurn, // अगला कौन खेलेगा
    moves: room.moves,             // सारी moves अब तक की
  });
};


const leaveRoom = (io, socket) => {
  // Player को remove करते हैं और उसका room return होता है
  const room = RoomManager.removePlayer(socket.id);

  if (room) {
    // अगर room मिला, तो सभी को notify करते हैं कि player left हो गया
    io.to(room.id).emit('playerLeft', room);
  }
};


// सभी functions को export कर रहे हैं ताकि दूसरे modules (जैसे server.js) में use हो सकें
module.exports = {
  joinRoom,
  handleMove,
  leaveRoom
};
