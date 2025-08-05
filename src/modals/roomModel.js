// एक Room class बनाते हैं — जो हर गेम रूम को represent करता है
class Room {
  constructor(hostSocketId, maxPlayers = 4 ,PlayerName) {
    // 🔹 Random ID generate किया गया room के लिए (UUID की जगह simple ID)
    this.id = Math.random().toString(36).substr(2, 8);

    // 🔹 Players list में सबसे पहले host जुड़ता है
    this.players = [{PlayerSocketId:hostSocketId ,PlayerName ,host:true ,position: 1 }];

    // 🔹 Room में कितने players allowed हैं (default: 4)
    this.maxPlayers = maxPlayers;

    // 🔹 अभी किसकी turn है — उसका index track कर रहे हैं
    this.currentTurnIndex = 0;

    // 🔹 अब तक के सभी moves को track करने के लिए list
    this.moves = [];
    
     
      
  }

  // 🔸 अभी जिसकी turn है, उसका socket ID return करो
  get currentTurn() {
    return this.players[this.currentTurnIndex].PlayerSocketId;
  }

  // 🔸 Turn को अगले player पर rotate करो
  advanceTurn() {
    this.currentTurnIndex = (this.currentTurnIndex + 1) % this.players.length;
  }
}

// 🔹 Global object — सभी active game rooms यहाँ store होंगे
const rooms = {};
  console.log(rooms ,"Print  Globally Room")

// 🔸 RoomManager: सारे room से जुड़ा logic और handling करेगा
class RoomManager {
  // ✅ नया room create करो
  static createRoom(hostId, maxPlayers , PlayerName) {
     
    const room = new Room(hostId, maxPlayers ,PlayerName); // नया room instance
    rooms[room.id] = room;                     // rooms map में डाल दो
    return room;
  }

  // ✅ Existing room में player को जोड़ो
  static addPlayer(roomId, playerId ,PlayerName) {
    const room = rooms[roomId];               // room ID से room खोजो
    if (!room) return null;                   // अगर नहीं मिला, null भेजो

    if (room.players.length >= room.maxPlayers) return null; // room full
  const nextPosition = room.players.length + 1;  // ✅ Automatically 2, 3, 4...
    room.players.push({ PlayerSocketId: playerId, PlayerName, host:false  ,   position: nextPosition});              // player को जोड़ो
    return room;
  }

  // ✅ room ID से पूरा room object वापिस दो
  static getRoom(roomId) {
    return rooms[roomId];
  }

  //  Abi is ki jarurat nahi hai 
  // ✅ अगर कोई player leave करता है, तो handle करो
static removePlayer(playerId) {
  for (const roomId in rooms) {
    const room = rooms[roomId];
    const idx = room.players.findIndex(p => p.PlayerSocketId === playerId); // ✅ Change

    if (idx > -1) {
      room.players.splice(idx, 1); // ✅ Remove player

      if (room.players.length === 0) {
        delete rooms[roomId];
        return null;
      }

      if (idx <= room.currentTurnIndex) {
        room.currentTurnIndex = Math.max(0, room.currentTurnIndex - 1);
      }

      return room;
    }
  }

  return null;
}

}

// 🔚 RoomManager को export कर रहे हैं — ताकि controller में use हो सके
export { RoomManager };
