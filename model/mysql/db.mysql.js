'use strict';

const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'sql7.freemysqlhosting.net',
    database: 'sql7341226',
    user: 'sql7341226',
    password: 'rufAVnrbgV',
});

db.connect(function (err) {
    if (err) throw err;
});

module.exports = db;