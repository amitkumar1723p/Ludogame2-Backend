// 🔹 एक Room class बनाते हैं — जो हर गेम रूम को represent करता है
class Room {
  constructor(hostSocketId, maxPlayers = 4, PlayerName) {
    // 🔹 Random ID generate किया गया room के लिए (UUID की जगह simple ID)
    this.id = Math.random().toString(36).substr(2, 8);

    // 🔹 Players list में सबसे पहले host जुड़ता है
    this.players = [
      { PlayerSocketId: hostSocketId, PlayerName, host: true, position: 1 },
    ];

    // 🔹 Room में कितने players allowed हैं (default: 4)
    this.maxPlayers = maxPlayers;
  }
}

// 🔹 Global object — सभी active game rooms यहाँ store होंगे
const rooms = {};

console.log(rooms, 'Print Globally Room');
// 🔸 RoomManager: सारे room से जुड़ा logic और handling करेगा
class RoomManager {
  // ✅ नया room create करो
  static createRoom(hostId, maxPlayers, PlayerName) {
    const room = new Room(hostId, maxPlayers, PlayerName); // नया room instance
    rooms[room.id] = room; // rooms map में डाल दो
    return room;
  }

  // ✅ Case-insensitive room find helper
  static findRoomInsensitive(roomId) {
    const normalizedId = roomId?.trim()?.toLowerCase();
    const foundKey = Object.keys(rooms).find(
      (key) => key.toLowerCase() === normalizedId
    );
    return foundKey ? rooms[foundKey] : null;
  }

  // ✅ Existing room में player को जोड़ो
  static addPlayer(roomId, playerId, PlayerName) {
    // 🔹 Case-insensitive find
    const room = this.findRoomInsensitive(roomId);

    if (!room) return null; // ❌ अगर नहीं मिला, null भेजो

    if (room.players.length >= room.maxPlayers) return null; // room full

    // 🔹 Check duplicate player (same socket)
    const exists = room.players.some((p) => p.PlayerSocketId === playerId);
    if (exists) return room; // पहले से जुड़ा है

    const nextPosition = room.players.length + 1; // ✅ Automatically 2, 3, 4...
    room.players.push({
      PlayerSocketId: playerId,
      PlayerName,
      host: false,
      position: nextPosition,
    });

    console.log(
      `✅ Player "${PlayerName}" joined Room "${room.id}" successfully.`
    );

    return room;
  }

  // ✅ room ID से पूरा room object वापिस दो (case-insensitive)
  static getRoom(roomId) {
    return this.findRoomInsensitive(roomId);
  }

  // ✅ अगर कोई player leave करता है, तो handle करो
  static removePlayer(playerId) {
    for (const roomId in rooms) {
      const room = rooms[roomId];
      const idx = room.players.findIndex((p) => p.PlayerSocketId === playerId);

      if (idx > -1) {
        let [RemovePlayerData] = room.players.splice(idx, 1);
        console.log(
          `🚪 Player "${RemovePlayerData.PlayerName}" left Room "${roomId}"`
        );
        return { room, RemovePlayerData };
      }
    }
    return null;
  }

  // ✅ Room delete karo (case-insensitive)
  static deleteRoom(roomId) {
    const normalizedId = roomId?.trim()?.toLowerCase();
    const foundKey = Object.keys(rooms).find(
      (key) => key.toLowerCase() === normalizedId
    );
    if (foundKey) {
      delete rooms[foundKey];
      console.log(`🗑️ Room deleted: ${foundKey}`);
    }
  }
}

// 🔚 RoomManager को export कर रहे हैं — ताकि controller में use हो सके
export { RoomManager };
