import { db } from './db.mjs';

// Function to get a random meme
const getMeme = () => {
  return new Promise((resolve, reject) => {
    const countSql = 'SELECT COUNT(*) AS count FROM memes';
    db.get(countSql, (err, row) => {
      if (err) {
        reject(err);
      } else {
        const count = row.count;
        //check if there are any memes in db
        if (count === 0) {
          reject(new Error('No memes found'));
        } else {
          const randomIndex = Math.floor(Math.random() * count);

          //get one meme from the memes table at the calculated random index
          const memeSql = 'SELECT * FROM memes LIMIT 1 OFFSET ?';
          db.get(memeSql, [randomIndex], (err, row) => {
            if (err) {
                //reject promise if there is an error
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


export {getMeme}