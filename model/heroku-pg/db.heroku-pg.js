'use strict';

const { Client } = require('pg');
//    postgres://igyarmltcjtqmf:179ba1800d084184ed8ec152b0884c965f1d1b2a7b7d3ae7759cf7d4ad24aca5@ec2-63-32-248-14.eu-west-1.compute.amazonaws.com:5432/ddanb7168cgnrj
const client = new Client({
    user: "igyarmltcjtqmf",
    password: "179ba1800d084184ed8ec152b0884c965f1d1b2a7b7d3ae7759cf7d4ad24aca5",
    database: "ddanb7168cgnrj",
    port: 5432,
    host: "c2-63-32-248-14.eu-west-1.compute.amazonaws.com",
    ssl: true
});

client.connect((err) => {
    if (err)
        throw err;
});

module.exports = client
