"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Point = require("./point.js");
const Round = require("./round.js");
const Greenie = require("./greenie.js");
const parse = require("postgres-date");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testGreeniesIds,
  testRoundsIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/***** useful testround */
const testRound = {
  tournamentDate: "2022-03-03",
  username: "u1",
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
    hole10: 5,
    hole11: 5,
    hole12: 5,
    hole13: 3,
    hole14: 3,
    hole15: 3,
    hole16: 2,
    hole17: 2,
    hole18: 1,
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
};

/************************************** create */

describe("create", function () {
  test("works", async function () {
    let round = await Round.create(testRound);
    let points = await Point.create(round);
    expect(points).toEqual({
      roundId: round.id,
      participation: 3,
      pars: 9,
      birdies: 6,
      eagles: 8,
      aces: 10,
    });
  });

  test("bad request with duplicate round Id", async function () {
    try {
      let round = await Round.create(testRound);
      await Point.create(round);
      await Point.create(round);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** updateScores */

describe("updateScores", function () {
  const updatedRound = {
    tournamentDate: "2022-03-03",
    username: "u1",
    strokes: {
      hole1: 1,
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
  };
  test("works", async function () {
    let points = await Point.updateScores({
      ...updatedRound,
      id: testRoundsIds[0],
    });

    expect(points).toEqual({
      roundId: testRoundsIds[0],
      pars: 0,
      birdies: 0,
      eagles: 0,
      aces: 10,
    });
  });
});

/************************************** updateGreenies */

describe("updateGreenies", function () {
  test("works", async function () {
    const greenie = await Greenie.create({
      roundId: testRoundsIds[0],
      holeNumber: 18,
      feet: 1,
      inches: 1,
    });
    let greeniePoints = await Point.updateGreenies(greenie);
    expect(greeniePoints).toEqual({
      roundId: testRoundsIds[0],
      greenies: 11,
    });
  });
});

/************************************** getYearlyStandings */

describe("getYearlyStandings", function () {
  test("works", async function () {
    let standings = await Point.getYearlyStandings();
    expect(standings).toEqual([
      {
        username: "u1",
        firstName: "U1F",
        lastName: "U1L",
        participation: "6",
        strokes: "50",
        putts: "12",
        greenies: "7",
        pars: "18",
        birdies: "36",
        eagles: "0",
        aces: "0",
        total: "129",
      },
      {
        username: "u2",
        firstName: "U2F",
        lastName: "U2L",
        participation: "6",
        strokes: "40",
        putts: "8",
        greenies: "5",
        pars: "18",
        birdies: "0",
        eagles: "0",
        aces: "0",
        total: "77",
      },
    ]);
  });
});

/************************************** getTournamentStandings */

describe("getTournamentStandings", function () {
  test("works", async function () {
    let leaderboard = await Point.getTournamentStandings("2022-01-01");
    expect(leaderboard).toEqual([
      {
        username: "u1",
        firstName: "U1F",
        lastName: "U1L",
        roundId: testRoundsIds[0],
        participation: 3,
        strokes: 25,
        putts: 6,
        greenies: 7,
        pars: 18,
        birdies: 0,
        eagles: 0,
        aces: 0,
        total: 59,
      },
      {
        username: "u2",
        firstName: "U2F",
        lastName: "U2L",
        roundId: testRoundsIds[1],
        participation: 3,
        strokes: 20,
        putts: 4,
        greenies: 2,
        pars: 0,
        birdies: 0,
        eagles: 0,
        aces: 0,
        total: 29,
      },
    ]);
  });
});

/************************************** updateStrokesPositions */

describe("updateStrokesPositions", function () {
  let updateRoundData = {
    strokes: {
      hole1: 7,
      hole2: 7,
      hole3: 7,
      hole4: 7,
      hole5: 7,
      hole6: 7,
      hole7: 7,
      hole8: 7,
      hole9: 7,
      hole10: 7,
      hole11: 7,
      hole12: 7,
      hole13: 7,
      hole14: 7,
      hole15: 7,
      hole16: 7,
      hole17: 7,
      hole18: 7,
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
  };
  test("works", async function () {
    //changing round that was first place to second place for strokes position points
    let round = await Round.update(testRoundsIds[0], updateRoundData);
    let updatedStrokesPoints = await Point.updateStrokesPositions("2022-01-01");
    expect(updatedStrokesPoints).toEqual([
      { roundId: testRoundsIds[1], strokes: 25 },
      { roundId: testRoundsIds[0], strokes: 20 },
    ]);
  });
});

/************************************** updatePuttsPositions */

describe("updatePuttsPositions", function () {
  let updateRoundData = {
    strokes: {
      hole1: 7,
      hole2: 7,
      hole3: 7,
      hole4: 7,
      hole5: 7,
      hole6: 7,
      hole7: 7,
      hole8: 7,
      hole9: 7,
      hole10: 7,
      hole11: 7,
      hole12: 7,
      hole13: 7,
      hole14: 7,
      hole15: 7,
      hole16: 7,
      hole17: 7,
      hole18: 7,
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
  };
  test("works", async function () {
    //changing round that was first place to second place in putts position points
    await Round.update(testRoundsIds[0], updateRoundData);
    let updatedPuttsPoints = await Point.updatePuttsPositions("2022-01-01");
    expect(updatedPuttsPoints).toEqual([
      { roundId: testRoundsIds[1], putts: 6 },
      { roundId: testRoundsIds[0], putts: 4 },
    ]);
  });
});
