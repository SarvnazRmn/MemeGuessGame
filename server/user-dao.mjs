import { db } from './db.mjs';
import crypto from 'crypto';


//Function to get a user by username and verify the password
export const getUser =( username, password)=> {
    return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE username =?';
    db.get(sql, [username], (err, row) => {
        if (err) { 
          reject(err); 
        }
        else if (row === undefined) { 
            resolve(false); 
          }
          else {
            const user = {id: row.id, username: row.username};
            // Hash the password with the stored salt and compare with the stored password
            crypto.scrypt(password, row.salt, 32, function(err, hashedPassword) {
                if (err) reject(err);
                if(!crypto.timingSafeEqual(Buffer.from(row.password, 'hex'), hashedPassword))
                  resolve(false);
                else
                  resolve(user);
              });
            }
          });
        });
      };


// Function to get a user by ID
export const getUserById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE id = ?';
    db.get(sql, [id], (err, row) => {
      if (err) { 
        reject(err); 
      }
      else if (row === undefined) { 
        resolve({error: 'User not found!'}); 
      }
      else {
        const user = {id: row.id, username: row.username};
        resolve(user);
      }
    });
  });
};