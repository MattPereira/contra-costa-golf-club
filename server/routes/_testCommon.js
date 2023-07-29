"use strict";

const db = require("../db.js");
const User = require("../models/user");
const Course = require("../models/course");
const Tournament = require("../models/tournament");
const Round = require("../models/round");
const Greenie = require("../models/greenie");
const Point = require("../models/point");
const { createToken } = require("../helpers/tokens");

const testRoundIds = [];
const testGreenieIds = [];

/* ON DELETE CASCADE handles the putts, strokes, pars,
 * handicaps, greenies, and points */
async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM rounds");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM tournaments");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM courses");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");

  /************ CREATE 3 COURSES **************/
  await Course.create({
    handle: "lone-tree",
    name: "Lone Tree Golf Course",
    rating: "69.1",
    slope: 121,
    pars: {
      hole1: 4,
      hole2: 3,
      hole3: 4,
      hole4: 5,
      hole5: 4,
      hole6: 4,
      hole7: 4,
      hole8: 3,
      hole9: 4,
      hole10: 3,
      hole11: 3,
      hole12: 5,
      hole13: 4,
      hole14: 3,
      hole15: 4,
      hole16: 5,
      hole17: 5,
      hole18: 4,
    },
    handicaps: {
      hole1: 1,
      hole2: 13,
      hole3: 17,
      hole4: 9,
      hole5: 7,
      hole6: 15,
      hole7: 3,
      hole8: 11,
      hole9: 5,
      hole10: 16,
      hole11: 12,
      hole12: 2,
      hole13: 4,
      hole14: 18,
      hole15: 6,
      hole16: 8,
      hole17: 10,
      hole18: 14,
    },
  });

  await Course.create({
    handle: "paradise-valley",
    name: "Paradise Valley Golf Course",
    rating: "70.4",
    slope: 125,
    pars: {
      hole1: 5,
      hole2: 4,
      hole3: 3,
      hole4: 5,
      hole5: 4,
      hole6: 4,
      hole7: 4,
      hole8: 3,
      hole9: 4,
      hole10: 5,
      hole11: 4,
      hole12: 3,
      hole13: 4,
      hole14: 4,
      hole15: 3,
      hole16: 5,
      hole17: 4,
      hole18: 4,
    },
    handicaps: {
      hole1: 5,
      hole2: 7,
      hole3: 17,
      hole4: 9,
      hole5: 1,
      hole6: 3,
      hole7: 11,
      hole8: 15,
      hole9: 13,
      hole10: 4,
      hole11: 10,
      hole12: 18,
      hole13: 6,
      hole14: 14,
      hole15: 16,
      hole16: 8,
      hole17: 12,
      hole18: 2,
    },
  });

  await Course.create({
    handle: "wild-horse",
    name: "Wild Horse Golf Course",
    rating: "68.4",
    slope: 120,
    pars: {
      hole1: 4,
      hole2: 4,
      hole3: 4,
      hole4: 3,
      hole5: 5,
      hole6: 3,
      hole7: 5,
      hole8: 4,
      hole9: 4,
      hole10: 4,
      hole11: 4,
      hole12: 3,
      hole13: 5,
      hole14: 3,
      hole15: 4,
      hole16: 4,
      hole17: 5,
      hole18: 4,
    },
    handicaps: {
      hole1: 9,
      hole2: 15,
      hole3: 1,
      hole4: 7,
      hole5: 3,
      hole6: 17,
      hole7: 11,
      hole8: 5,
      hole9: 13,
      hole10: 18,
      hole11: 16,
      hole12: 10,
      hole13: 8,
      hole14: 14,
      hole15: 4,
      hole16: 12,
      hole17: 6,
      hole18: 2,
    },
  });

  /****************** REGISTER 4 USERS *****************/
  await User.register({
    firstName: "Happy",
    lastName: "Gilmore",
    email: "happy@gmail.com",
    password: "password1",
    isAdmin: false,
  });
  await User.register({
    firstName: "Shooter",
    lastName: "McGavin",
    email: "shooter@gmail.com",
    password: "password2",
    isAdmin: false,
  });
  await User.register({
    firstName: "Chubbs",
    lastName: "Peterson",
    email: "chubbs@gmail.com",
    password: "password3",
    isAdmin: true,
  });
  await User.register({
    firstName: "Bob",
    lastName: "Barker",
    email: "bob@gmail.com",
    password: "password4",
    isAdmin: false,
  });

  /****************** CREATE 3 TOURNAMENTS *****************/
  await Tournament.create({
    date: "2022-01-01",
    courseHandle: "lone-tree",
    tourYears: "2021-22",
  });

  await Tournament.create({
    date: "2022-02-02",
    courseHandle: "paradise-valley",
    tourYears: "2021-22",
  });

  await Tournament.create({
    date: "2022-03-03",
    courseHandle: "lone-tree",
    tourYears: "2021-22",
  });

  /****************** CREATE 3 ROUNDS *****************/

  const happyRound = await Round.create({
    tournamentDate: "2022-01-01",
    username: "happy-gilmore",
    strokes: {
      hole1: 4,
      hole2: 4,
      hole3: 4,
      hole4: 4,
      hole5: 4,
      hole6: 4,
      hole7: 4,
      hole8: 4,
      hole9: 4,
      hole10: 4,
      hole11: 4,
      hole12: 4,
      hole13: 4,
      hole14: 4,
      hole15: 4,
      hole16: 4,
      hole17: 4,
      hole18: 4,
    },
    putts: {
      hole1: 1,
      hole2: 1,
      hole3: 1,
      hole4: 1,
      hole5: 1,
      hole6: 1,
      hole7: 1,
      hole8: 1,
      hole9: 1,
      hole10: 1,
      hole11: 1,
      hole12: 1,
      hole13: 1,
      hole14: 1,
      hole15: 1,
      hole16: 1,
      hole17: 1,
      hole18: 1,
    },
  });

  await Point.create(happyRound);

  testRoundIds[0] = happyRound.id;

  const shooterRound = await Round.create({
    tournamentDate: "2022-01-01",
    username: "shooter-mcgavin",
    strokes: {
      hole1: 5,
      hole2: 5,
      hole3: 5,
      hole4: 5,
      hole5: 5,
      hole6: 5,
      hole7: 5,
      hole8: 5,
      hole9: 5,
      hole10: 5,
      hole11: 5,
      hole12: 5,
      hole13: 5,
      hole14: 5,
      hole15: 5,
      hole16: 5,
      hole17: 5,
      hole18: 5,
    },
    putts: {
      hole1: 2,
      hole2: 2,
      hole3: 2,
      hole4: 2,
      hole5: 2,
      hole6: 2,
      hole7: 2,
      hole8: 2,
      hole9: 2,
      hole10: 2,
      hole11: 2,
      hole12: 2,
      hole13: 2,
      hole14: 2,
      hole15: 2,
      hole16: 2,
      hole17: 2,
      hole18: 2,
    },
  });

  await Point.create(shooterRound);

  testRoundIds[1] = shooterRound.id;

  const chubbsRound = await Round.create({
    tournamentDate: "2022-01-01",
    username: "chubbs-peterson",
    strokes: {
      hole1: 6,
      hole2: 6,
      hole3: 6,
      hole4: 6,
      hole5: 6,
      hole6: 6,
      hole7: 6,
      hole8: 6,
      hole9: 6,
      hole10: 6,
      hole11: 6,
      hole12: 6,
      hole13: 6,
      hole14: 6,
      hole15: 6,
      hole16: 6,
      hole17: 6,
      hole18: 6,
    },
    putts: {
      hole1: 3,
      hole2: 3,
      hole3: 3,
      hole4: 3,
      hole5: 3,
      hole6: 3,
      hole7: 3,
      hole8: 3,
      hole9: 3,
      hole10: 3,
      hole11: 3,
      hole12: 3,
      hole13: 3,
      hole14: 3,
      hole15: 3,
      hole16: 3,
      hole17: 3,
      hole18: 3,
    },
  });

  await Point.create(chubbsRound);
  testRoundIds[2] = chubbsRound.id;

  await Point.updateStrokesPositions("2022-01-01");
  await Point.updatePuttsPositions("2022-01-01");

  /****************** CREATE 3 GREENIES *****************/

  const happyGreenie = await Greenie.create({
    roundId: testRoundIds[0],
    holeNumber: 1,
    feet: 1,
    inches: 1,
  });

  await Point.updateGreenies(happyGreenie);
  testGreenieIds[0] = happyGreenie.id;

  const shooterGreenie = await Greenie.create({
    roundId: testRoundIds[1],
    holeNumber: 1,
    feet: 2,
    inches: 2,
  });

  await Point.updateGreenies(shooterGreenie);
  testGreenieIds[1] = shooterGreenie.id;

  const chubbsGreenie = await Greenie.create({
    roundId: testRoundIds[2],
    holeNumber: 1,
    feet: 3,
    inches: 3,
  });

  await Point.updateGreenies(chubbsGreenie);
  testGreenieIds[2] = chubbsGreenie.id;

  /****************** CREATE SOME POINTS *****************/
}
async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}

const happyToken = createToken({ username: "happy-gilmore", isAdmin: false });
const shooterToken = createToken({
  username: "shooter-mcgavin",
  isAdmin: false,
});
const adminToken = createToken({ username: "chubbs-peterson", isAdmin: true });

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  happyToken,
  shooterToken,
  adminToken,
  testRoundIds,
  testGreenieIds,
};
