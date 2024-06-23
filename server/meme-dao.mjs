import { db } from './db.mjs';



// Function to get captions
const getRandomCaptions = (excludeIds, limit = 5) => {
  return new Promise((resolve, reject) => {
    const placeholders = excludeIds.map(() => '?').join(',');
    const sql = `SELECT id, caption FROM captions WHERE id NOT IN (${placeholders}) ORDER BY RANDOM() LIMIT ?`;
    db.all(sql, [...excludeIds, limit], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};



// Function to get best-matching captions for a specific meme
const getBestMatchingCaptions = (memeId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT captions.id, captions.caption FROM captions ' +
                'JOIN meme_caption ON captions.id = meme_caption.caption_id ' +
                'WHERE meme_caption.meme_id = ? LIMIT 2';
    db.all(sql, [memeId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};



// Function to get a random meme
const getMeme = (count) => {
  return new Promise((resolve, reject) => {
    const countSql = 'SELECT COUNT(*) AS count FROM memes';
    db.get(countSql, (err, row) => {
      if (err) {
        reject(err);
      } else {
        const totalCount = row.count;
        // Check if there are any memes in db
        if (totalCount === 0) {
          reject(new Error('No memes found'));
        } else if (count > totalCount) {
          reject(new Error(`Requested count (${count}) exceeds total available memes (${totalCount})`));
        } else {
          const memeSql = 'SELECT * FROM memes ORDER BY RANDOM() LIMIT ?';
          db.all(memeSql, [count], (err, rows) => {
            if (err) {
              // Reject promise if there is an error
              reject(err);
            } else {
              resolve(rows);
            }
          });
        }
      }
    });
  });
};


export {getRandomCaptions, getBestMatchingCaptions, getMeme}