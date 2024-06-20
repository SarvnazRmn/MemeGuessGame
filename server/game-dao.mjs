import { db } from './db.mjs';

// Function to get a round by game ID and round ID
const getRound = (gameId, roundId) => {
    return new Promise((resolve, reject) => {
      openDb().then(db => {
        const sql = 'SELECT * FROM rounds WHERE game_id = ? AND id = ?';
        db.get(sql, [gameId, roundId], (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        });
      });
    });
  };