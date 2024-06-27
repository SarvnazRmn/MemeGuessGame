import sqlite from 'sqlite3';
export const db = new sqlite.Database('db.sqlite',(err) => {
    if (err) throw err;
})