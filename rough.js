 

    // ⚠️ You already have room creation & join logic, so we won’t duplicate that

    // 🟢 LISTENER: When a player rolls the dice in online game
    socket.on('diceRolled', ({ roomId, playerNo,   PlayerSoketId,diceNo }) => {
      console.log(`🎲 Player ${player} rolled dice = ${diceNo} in room ${roomId}`);

      const room = rooms[roomId];
      if (!room) {
        console.log('❌ Room not found:', roomId);
        return;
      }

      // ✅ Broadcast dice number to all players in room
      io.to(roomId).emit('diceRolled', {
        playerNo,    // Position (e.g. 1 or 2)
        diceNo     // Rolled dice number
        PlayerSoketId
      });
    });
