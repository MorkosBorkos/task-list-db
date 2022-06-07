'use strict';

const { Client } = require('pg');
// postgres://dhzfsoszoiqlis:dce5ca1cfd5a0918ff13e468db9b88d96057bb9881a7aef85b0b57e998a9ba89@ec2-54-243-92-68.compute-1.amazonaws.com:5432/d3po9r81s8qfib
const client = new Client({
    user: "dhzfsoszoiqlis",
    password: "dce5ca1cfd5a0918ff13e468db9b88d96057bb9881a7aef85b0b57e998a9ba89",
    database: "c2-54-243-92-68",
    port: 5432,
    host: "compute-1.amazonaws.com",
    ssl: true
});

client.connect((err) => {
    if (err)
        throw err;
});

module.exports = client
