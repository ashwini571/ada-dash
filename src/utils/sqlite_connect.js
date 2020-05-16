// execution mode is set to verbose to produce long stack traces
const sqlite3 = require('sqlite3').verbose();

let sqliteDb= new sqlite3.Database('sqlite_db.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err)
        console.log(err.message);
    else
        console.log('Connected to the sqlite database.');
});

module.exports = sqliteDb;