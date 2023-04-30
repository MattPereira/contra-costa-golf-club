"use strict";
/** Database setup for ccgc. */
const { Pool } = require("pg");
const { getDatabaseUri } = require("./config");

// Create a pg.Client instance
let db;

// Only use SSL in production, can't get SSL to work in local docker container for now
if (process.env.NODE_ENV === "production") {
  db = new Pool({
    connectionString: getDatabaseUri(),
    connectionTimeoutMillis: 10000,
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else {
  db = new Pool({
    connectionString: getDatabaseUri(),
    connectionTimeoutMillis: 10000,
  });
}

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
