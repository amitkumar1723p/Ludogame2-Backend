 // Room class define करते हैं जो एक room की पूरी structure को handle करेगा
class Room {
  constructor(hostId) {
    this.id = uuidv4().slice(0, 8); // हर Room को एक unique 8-character id मिलती है
    this.players = [hostId];        // इस room में सबसे पहले host (creator) को जोड़ते हैं
    this.currentTurn = 1;           // Game की शुरुआत player 1 से होती है (turn = 1)
    this.moves = [];                // Game की move history — हर move इस array में store होगी
  }
}


// एक object जिसमें सारे active rooms memory में temporarily store होंगे
const rooms = {};

class RoomManager {
  // ✅ नया Room बनाता है और उसे memory (rooms object) में जोड़ता है
  static createRoom(hostId) {
    const room = new Room(hostId);   // नया Room instance बनाएं
    rooms[room.id] = room;           // rooms object में उसे ID के साथ add करें
    return room;                     // उस room की जानकारी return करें
  }

  // ✅ Existing room में नए player को जोड़ता है
  static addPlayer(roomId, playerId) {
    const room = rooms[roomId];     // roomId से room find करें
    if (!room || room.players.length >= 2) return null;  // अगर room नहीं मिला या full है (2 players तक ही)
    room.players.push(playerId);    // room में player को add करें
    return room;                    // updated room return करें
  }

  // ✅ किसी भी room को उसके ID से get करना (find)
  static getRoom(roomId) {
    return rooms[roomId];           // अगर मिला तो room return कर दो
  }

  // ✅ किसी player को room से remove करना
  static removePlayer(playerId) {
    for (let id in rooms) {
      const room = rooms[id];                     // हर room में check करेंगे
      const idx = room.players.indexOf(playerId); // क्या player उस room में है?

      if (idx > -1) {
        room.players.splice(idx, 1);              // अगर है, तो उसे हटाओ

        if (room.players.length === 0) {
          delete rooms[id];                       // अगर room empty हो गया, तो memory से delete करो
        }

        return room;                              // updated room return करो
      }
    }
    return null; // अगर कोई match नहीं मिला तो null return करो
  }
}


module.exports = { RoomManager };
