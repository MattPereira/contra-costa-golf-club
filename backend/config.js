"use strict";

/** Shared config for application; can be required many places. */

require("dotenv").config();
require("colors");

const SECRET_KEY = process.env.SECRET_KEY || "secret-dev";

const PORT = +process.env.PORT || 3001;

// Use dev database, testing database, or via env var, production database
function getDatabaseUri() {
  return process.env.NODE_ENV === "test"
    ? "ccgc_test"
    : process.env.DATABASE_URL || "ccgc_railway";
}

// Speed up bcrypt during tests, since the algorithm safety isn't being tested
const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

console.log("CONFIG LOGS".green);
console.log("-----");
console.log("NODE_ENV", process.env.NODE_ENV);
console.log("DATABASE_URL", process.env.DATABASE_URL);
console.log("PGDATABASE", process.env.PGDATABASE);
console.log("PGHOST", process.env.PGHOST);
console.log("PGPORT", process.env.PGPORT);
console.log("PGUSER", process.env.PGUSER);
console.log("-----");
console.log("PORT:".yellow, PORT.toString());
console.log("DatabaseUri:".yellow, getDatabaseUri());
console.log("-----");

module.exports = {
  SECRET_KEY,
  PORT,
  BCRYPT_WORK_FACTOR,
  getDatabaseUri,
};
