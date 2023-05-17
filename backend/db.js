"use strict";
/** Database setup for ccgc. */
const { Pool } = require("pg");
const { getDatabaseUri } = require("./config");

const db = new Pool({
  connectionString: getDatabaseUri(),
  connectionTimeoutMillis: 10000,
});

db.connect((err) => {
  if (err) {
    console.log("db connection error 💔", err.stack);
    console.error("STACK", err.stack);
  } else {
    console.log("db connected 🚀");
  }
});

// Catching errors with listener attatched to Client. https://node-postgres.com/apis/client#events
db.on("error", async (err) => {
  console.error("Unexpected error on idle client 🫠", err.stack);
});

module.exports = db;
