// RoomManager को import कर रहे हैं — जो room बनाने, जोड़ने, हटाने का काम करता है
import { RoomManager } from '../modals/roomModel.js';


// 🔹 जब कोई client (player) game में connect होता है
const joinRoom = (io, socket, { roomId, isNew, maxPlayers }, callback) => {

  let room;
   console.log("Join Room Data start")
  console.log("roomId", roomId)
  console.log("isNew", isNew)
  console.log("maxPlayers", maxPlayers)
   console.log("Join Room Data end")
  

  if (isNew) {
     
    // 🔸 नया room बनाना है — player host होगा
    room = RoomManager.createRoom(socket.id, maxPlayers || 4);
    console.log(room, "new Room Create ho gya hai")
  } else {
    // 🔸 Existing room में player को जोड़ना है
    room = RoomManager.addPlayer(roomId, socket.id);

    console.log(room, "Romm mai koi Join huva hai")
    // अगर room नहीं मिला या full है
    if (!room) {
      return callback({ error: 'Room not found or already full' });
    }
  }

  // इस socket को उस room में officially जोड़ दो
  socket.join(room.id);

  // 🔸 सभी players को room का latest status भेजो
  io.to(room.id).emit('roomUpdate', {
    roomId: room.id,                  // Room ID
    players: room.players,            // कौन-कौन players हैं
    currentTurn: room.currentTurn,    // अभी किसकी turn है
    maxPlayers: room.maxPlayers       // max कितने players allowed हैं
  });

  // 🔸 Frontend को successful join का जवाब
  callback({ success: true, roomId: room.id });
};



// 🔹 जब कोई player move करता है (जैसे dice चलाना, piece move करना etc.)
const handleMove = (io, socket, { roomId, move }) => {
  const room = RoomManager.getRoom(roomId);   // उस room को find करो
  if (!room) return;                          // अगर नहीं मिला, तो ignore करो

  // 🔸 सिर्फ वही player move कर सकता है जिसका turn है
  if (socket.id !== room.currentTurn) return;

  // 🔸 move को history में add करो (कौन player और क्या move)
  room.moves.push({ by: socket.id, move });

  // 🔸 सभी players को यह move बता दो
  io.to(room.id).emit('moveMade', {
    by: socket.id,          // किसने move किया
    move,                   // क्या move किया
    moves: room.moves       // पूरी move history
  });

  // 🔸 turn अब अगले player को दे दो
  room.advanceTurn();

  // 🔸 सभी players को बताओ कि अब किसकी turn है
  io.to(room.id).emit('turnUpdate', {
    currentTurn: room.currentTurn
  });
};



// 🔹 जब कोई player disconnect हो जाता है या बाहर निकलता है
const leaveRoom = (io, socket) => {
  // उस player को room से remove करो
  const room = RoomManager.removePlayer(socket.id);

  // अगर वो किसी room में था तो सभी को बता दो
  if (room) {
    io.to(room.id).emit('playerLeft', {
      players: room.players,          // updated players list
      currentTurn: room.currentTurn   // अब किसकी turn है
    });
  }
};


//  Start Game 
const startGame = async (io, socket, { roomId, move }) => {
  try {
    // 1. Room data fetch karo
    const room = await RoomManager.getRoom(roomId);
    console.log(room, "room")
    // 2. Check karo kya players ready hain
     if(!room){
      
socket.emit('error', { message: 'Romm Avaliable nahi hai phel room crate karo' });
return
     }
    if (room?.players?.length < 2) {
      socket.emit('error', { message: 'कम से कम 2 players चाहिए!' });
      return;
    }


    // 3. Room state update karo (game started)
    // room.isGameStarted = true;
    // await RoomManager.updateRoom(roomId, { isGameStarted: true });

     console.log(room  ,"aab game start Hogya hai")
      // 4. Sab players ko broadcast karo
        io.to(roomId).emit('game-started', {
            players: room.players,
            roomId,
            message: 'Game शुरू हो गया!',
        });
              console.log(`Game started in room ${roomId}`);

  } catch (error) {
   console.error('Error starting game:', error);
        socket.emit('error', { message: 'Game start failed!' });
  }

}

// 🔚 बाकी files से import करने के लिए export कर रहे हैं
export { joinRoom, handleMove, leaveRoom, startGame };
