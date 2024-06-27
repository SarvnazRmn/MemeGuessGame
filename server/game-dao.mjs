import { db } from './db.mjs';

 const saveScores = (gameData) => {
  return new Promise((resolve, reject) => {
    const insertRound = 'INSERT INTO rounds (game_id, meme_id, selected_caption_id, score) VALUES (?, ?, ?, ?)';
    const insertGame = 'INSERT INTO games (user_id) VALUES (?)';

    console.log('gameData in DAO:', gameData);
    

    db.serialize(() => {
      db.run('BEGIN TRANSACTION', (err) => {
        if (err) {
          reject(err);
          return;
        }

        let rollback = false;

        db.run(insertGame, [gameData[0].user_id], function(err) {
          if (err) {
            db.run('ROLLBACK', (rollbackErr) => {
              return rollbackErr ? reject(rollbackErr) : reject(err);
            });
            return;
          }

          const gameId = this.lastID; // Retrieve the ID of the inserted game

          // Insert each round record for the game
          gameData.forEach((round) => {
            db.run(insertRound, [gameId, round.meme_id, round.selected_caption_id, round.score], (err) => {
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
        // game history object to be returned
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
        // Convert object to array of games
        resolve(Object.values(games)); 
      }
    });
  });
};

export { saveScores, getUserGameHistory};
