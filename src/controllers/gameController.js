// RoomManager को import कर रहे हैं — जो room बनाने, जोड़ने, हटाने का काम करता है
import { RoomManager } from '../modals/roomModel.js';


// 🔹 जब कोई client (player) game में connect होता है
const joinRoom = (io, socket, { roomId, isNew, maxPlayers, PlayerName }, callback) => {

  let room;
  


  if (isNew) {

    // 🔸 नया room बनाना है — player host होगा
    room = RoomManager.createRoom(socket.id, maxPlayers || 4, PlayerName);
    console.log(room, "new Room Create ho gya hai")
  } else {
    
    // 🔸 Existing room में player को जोड़ना है
    room = RoomManager.addPlayer(roomId, socket.id, PlayerName);

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
    maxPlayers: room.maxPlayers       // max कितने players allowed हैं
  });

  // 🔸 Frontend को successful join का जवाब
  callback({ success: true, room });
};



 


// 🔹 जब कोई player disconnect हो जाता है या बाहर निकलता है
const leaveRoom = (io, socket) => {
  // उस player को room से remove करो
  const room = RoomManager.removePlayer(socket.id);

  // अगर वो किसी room में था तो सभी को बता दो
  if (room) {
    io.to(room.id).emit('playerLeft', {
      players: room.players,          // updated players list
    });
  }
};


//  Start Game 
const startGame = async (io, socket, { roomId, move }) => {
  try {
    // 1. Room data fetch karo
    const room = await RoomManager.getRoom(roomId);
   
    // 2. Check karo kya players ready hain
    if (!room) {

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

    
    // 4. Sab players ko broadcast karo
    io.to(roomId).emit('game-started', {
      players: room.players,
      roomId,
      message: 'Game शुरू हो गया!',
    });
  

  } catch (error) {
    console.error('Error starting game:', error);
    socket.emit('error', { message: 'Game start failed!' });
  }

}



// 🔹 जब कोई client refresh ke baad game me wapas aata hai
const rejoinRoom = (io, socket, { roomId, playerId }) => {
  // 1. Room ko fetch karo
  const room = RoomManager.getRoom(roomId);
   console.log("rejoinRoom" ,"runkar krha hai")

  // 2. Agar room exist nahi karta toh error bhejo
  if (!room) {
    socket.emit('error', { message: 'Room exist nahi karta ya expire ho gaya' });
    return;
  }
  
  // 3. Agar player room me nahi hai, toh usse add karo
  const alreadyPresent = room.players.some(p => p.PlayerSocketId === playerId);
  if (!alreadyPresent) {
    room.players.push({ PlayerSocketId: playerId, PlayerName: "Rejoined" });
  }


  // 4. Current socket ko room me join karwao (socket.io ka join)
  socket.join(roomId);

  // 5. Room ka latest status sabko emit karo
  io.to(roomId).emit('roomUpdate', {
    roomId: room.id,
    players: room.players,
    maxPlayers: room.maxPlayers
  });

  // // 6. Agar game already start ho chuka hai (moves exist karein)
  // if (room.moves.length > 0) {
  //   socket.emit('game-started', {
  //     players: room.players,
  //     roomId: room.id,
  //     message: 'Game already chalu hai — reconnect ho gaya!',
  //   });
  // }

   
};



const diceRolled = (io, socket, { roomId, playerNo, PlayerSocketId, diceNo }) => {

 

  const room = RoomManager.getRoom(roomId);   // उस room को find करो
  if (!room) {
     
     socket.emit('error', { message: 'Room not Found restart game again' });
    return;
  }

  // // ✅ Broadcast dice number to all players in room
  // io.to(roomId).emit('diceRolled', {
  //   playerNo,    // Position (e.g. 1 or 2)
  //   diceNo  ,  // Rolled dice number
  //   PlayerSocketId
  // });

  // ✅ Broadcast dice rolling animation first
  io.to(roomId).emit('diceRolling', {
    playerNo,
    PlayerSocketId
  });
  // Then after 1 second delay, send diceRolled with value
  setTimeout(() => {
    io.to(roomId).emit('diceRolled', {
      playerNo,    // Position (e.g. 1 or 2)
      diceNo,      // Rolled dice number
      PlayerSocketId
    });
  }, 1000);
};





// 🔄 Add new: Handle nextTurn update from frontend
const updateNextTurn = (io, socket, { roomId, chancePlayer }) => {
  
  const room = RoomManager.getRoom(roomId);
  if (!room) {
     socket.emit('error', { message: 'Room not found for nextTurn:' });
  
    return;
  }

  const index = room.players.findIndex(p => p.position === chancePlayer);
  if (index === -1) {
    console.log(`❌ Player with position ${chancePlayer} not found in room ${roomId}`);
    return;
  }

  room.currentTurnIndex = index;

  // 📢 Notify all players
  io.to(roomId).emit('nextTurn', {
    chancePlayer
  });
};

const enablePileSelection = (io, socket, { roomId, playerNo }) => {

  const room = RoomManager.getRoom(roomId);
  if (!room) {
     socket.emit('error', { message: 'Room not found for enablePileSelection:' });
    return;
  }





  // 📢 Notify all players
  io.to(roomId).emit('enablePileSelection', {
    playerNo
  });
};
const enableCellSelection = (io, socket, { roomId, playerNo }) => {

  const room = RoomManager.getRoom(roomId);
  if (!room) {
     socket.emit('error', { message: 'Room not found for enableCellSelection' });
    
    return;
  }

  // 📢 Notify all players
  io.to(roomId).emit('enableCellSelection', {
    playerNo
  });
}; 
const pileEnableFromPocket = (io, socket, { roomId, playerNo, pieceId, pos, travelCount }) => {

  const room = RoomManager.getRoom(roomId);
  if (!room) {
      socket.emit('error', { message: 'Room not found for pileEnableFromPocket:' });
    return;
  } 

  io.to(roomId).emit('PileEnableFromPocket', {
    playerNo, pieceId, pos, travelCount
  });
  

}
const handleForwardThunk = (io, socket, { roomId, playerNo, pieceId, id }) => {

  const room = RoomManager.getRoom(roomId);
  if (!room) {
     socket.emit('error', { message: 'Room not found for handleForwardThunk:' });
   
    return;
  }

  io.to(roomId).emit('handleForwardThunk', {
    playerNo, pieceId, id
  });

}


// 🔚 बाकी files से import करने के लिए export कर रहे हैं
export { joinRoom,  leaveRoom, startGame, rejoinRoom, diceRolled, updateNextTurn, enablePileSelection, enableCellSelection, pileEnableFromPocket, handleForwardThunk };
