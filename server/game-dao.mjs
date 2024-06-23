import { db } from './db.mjs';
import { getBestMatchingCaptions } from './meme-dao.mjs';




const createGame = async (userId) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO games (user_id) VALUES ?';
    db.run(sql, [userId], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID); // Return the ID of the newly inserted game
      }
    });
  });
};


 const saveScores = (gameData) => {
  return new Promise((resolve, reject) => {
    const insertRound = 'INSERT INTO rounds (game_id, meme_id, selected_caption_id, score) VALUES (?, ?, ?, ?)';

    console.log('gameData in DAO:', gameData);
    
    if (!Array.isArray(gameData)) {
      return reject(new Error('Invalid gameData structure'));
    }

    db.serialize(() => {
      db.run('BEGIN TRANSACTION', (err) => {
        if (err) {
          reject(err);
          return;
        }

        let rollback = false;

        gameData.forEach((round) => {
          db.run(insertRound, [round.gameId, round.meme_id, round.selected_caption_id, round.score], (err) => {
            if (err) {
              rollback = true;
              db.run('ROLLBACK', (rollbackErr) => {
                if (rollbackErr) {
                  reject(rollbackErr);
                } else {
                  reject(err);
                }
              });
              return;
            }
          });
        });

        if (!rollback) {
          db.run('COMMIT', (commitErr) => {
            if (commitErr) {
              reject(commitErr);
            } else {
              resolve();
            }
          });
        }
      });
    });
  });
};




// Get games and rounds for a user ID
const getUserGameHistory = async (userId) => {
  const sql = `
    SELECT games.id AS game_id, rounds.id AS round_id, rounds.selected_caption_id, rounds.score, memes.url
    FROM games
    INNER JOIN rounds ON games.id = rounds.game_id
    INNER JOIN memes ON rounds.meme_id = memes.id
    WHERE games.user_id = ?
  `;
  return new Promise((resolve, reject) => {
    console.log('sql query with user_id:', userId)
    db.all(sql, [userId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        console.log('SQl returned rows:', rows)
        const games = {};
        rows.forEach(row => {
          if (!games[row.game_id]) {
            games[row.game_id] = {
              game_id: row.game_id,
              rounds: []
            };
          }
          games[row.game_id].rounds.push({
            round_id: row.round_id,
            selected_caption_id: row.selected_caption_id,
            score: row.score,
            meme_url: row.url
          });
        });
        resolve(Object.values(games)); // Convert object to array of games
      }
    });
  });
};

export { createGame, saveScores, getUserGameHistory};
