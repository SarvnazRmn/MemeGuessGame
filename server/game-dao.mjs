import { db } from './db.mjs';
import { getBestMatchingCaptions } from './meme-dao.mjs';

const createGame = async (userId) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO games (user_id) VALUES (?)';
    db.run(sql, [userId], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID); // Return the ID of the newly game
      }
    });
  });
};



//submit round of games and their score
const submitGame = async (gameId, roundsData) => {
  return new Promise((resolve, reject) => {
    const insertRoundSql = `
      INSERT INTO rounds (game_id, meme_id, selected_caption_id) 
      VALUES (?, ?, ?)
    `;
    const updateRoundSql = `UPDATE rounds SET score = ? WHERE id = ?`;

    let totalScore = 0;
    let roundIds = [];
    let allRoundsData = [];
    let usedMemeIds = new Set();

    // Check for repeated meme images
    for (const roundData of roundsData) {
      if (usedMemeIds.has(roundData.memeId)) {
        return reject(new Error('Repeated meme image in the same game is not allowed.'));
      }
      usedMemeIds.add(roundData.memeId);
    }

    // Insert rounds data
    roundsData.forEach((roundData, index) => {
      db.run(insertRoundSql, [gameId, roundData.memeId, roundData.selectedCaptionId], function(err) {
        if (err) {
          reject(err);
        } else {
          roundIds.push({ roundId: this.lastID, memeId: roundData.memeId, selectedCaptionId: roundData.selectedCaptionId });

          if (roundIds.length === roundsData.length) {
            // Now we have all round IDs, let's calculate scores
            Promise.all(
              roundIds.map(async (round) => {
                const bestMatchingCaptions = await getBestMatchingCaptions(round.memeId);
                const bestCaptionIds = bestMatchingCaptions.map(caption => caption.id);
                const score = bestCaptionIds.includes(round.selectedCaptionId) ? 5 : 0;
                totalScore += score;

                // Update the round with the score
                await new Promise((resolve, reject) => {
                  db.run(updateRoundSql, [score, round.roundId], function(err) {
                    if (err) {
                      reject(err);
                    } else {
                      allRoundsData.push({
                        roundId: round.roundId,
                        memeId: round.memeId,
                        selectedCaptionId: round.selectedCaptionId,
                        score: score
                      });
                      resolve();
                    }
                  });
                });
              })
            ).then(() => {
              resolve({
                gameId: gameId,
                totalScore: totalScore,
                rounds: allRoundsData
              });
            }).catch(err => reject(err));
          }
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

export { createGame, submitGame, getUserGameHistory};
