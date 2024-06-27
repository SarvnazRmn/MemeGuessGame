import { db } from './db.mjs';



// Function to get 5 captions excluding best-matching caption IDs
const getRandomCaptions = (excludeIds, limit = 5) => {
  return new Promise((resolve, reject) => {
    //string of placeholders for the excluded IDs
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
const getMeme = () => {
  return new Promise((resolve, reject) => {
    const countSql = 'SELECT COUNT(*) AS count FROM memes';

    // Get the count of memes in the database
    db.get(countSql, (err, row) => {
      if (err) {
        reject(err);
      } else {
        const count = row.count;
        if (count === 0) {
          reject(new Error('No memes found'));
        } else {
          // Get a random index in the range of available memes
          const randomIndex = Math.floor(Math.random() * count);
          // SQL query to select a meme at the random index
          const memeSql = 'SELECT * FROM memes LIMIT 1 OFFSET ?';
          db.get(memeSql, [randomIndex], (err, row) => {
            if (err) {
              reject(err);
            } else {
              resolve(row);
            }
          });
        }
      }
    });
  });
};


export {getRandomCaptions, getBestMatchingCaptions, getMeme}