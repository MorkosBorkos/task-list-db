'use strict';

const { Client } = require('pg');

const client = new Client({
    user: "igyarmltcjtqmf",
    password: "179ba1800d084184ed8ec152b0884c965f1d1b2a7b7d3ae7759cf7d4ad24aca5",
    database: "ddanb7168cgnrj",
    port: 5432,
    host: "ec2-63-32-248-14.eu-west-1.compute.amazonaws.com",
    ssl: { rejectUnauthorized: false }
});

client.connect((err) => {
    if (err)
        throw err;
});

module.exports = client
