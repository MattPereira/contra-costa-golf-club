"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Round = require("./round.js");
const parse = require("postgres-date");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testRoundsIds,
  testGreeniesIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newRound = {
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
  };

  test("works", async function () {
    let round = await Round.create(newRound);
    expect(round).toEqual({
      ...newRound,
      tournamentDate: parse(newRound.tournamentDate),
      totalPutts: 18,
      totalStrokes: 72,
      id: expect.any(Number),
    });
  });

  test("bad request with dupe", async function () {
    try {
      await Round.create(newRound);
      await Round.create(newRound);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let round = await Round.get(testRoundsIds[0]);
    expect(round).toEqual({
      id: testRoundsIds[0],
      username: "u1",
      tournamentDate: parse("2022-01-01"),
      courseName: "Roddy Ranch Golf Course",
      totalStrokes: 72,
      totalPutts: 18,
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
      pars: {
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
        total: 72,
      },
      greenies: [
        {
          id: testGreeniesIds[0],
          roundId: testRoundsIds[0],
          holeNumber: 1,
          feet: 1,
          inches: 1,
          courseImg: "test.com/roddy-ranch.jpg",
          courseName: "Roddy Ranch Golf Course",
          firstName: "U1F",
          lastName: "U1L",
          tournamentDate: parse("2022-01-01"),
        },
        {
          id: testGreeniesIds[1],
          roundId: testRoundsIds[0],
          holeNumber: 7,
          feet: 7,
          inches: 7,
          courseImg: "test.com/roddy-ranch.jpg",
          courseName: "Roddy Ranch Golf Course",
          firstName: "U1F",
          lastName: "U1L",
          tournamentDate: parse("2022-01-01"),
        },
      ],
    });
  });

  test("not found if no such round", async function () {
    try {
      await Round.get(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateRoundData = {
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
  };

  test("works", async function () {
    let round = await Round.update(testRoundsIds[0], updateRoundData);
    expect(round).toEqual({
      id: testRoundsIds[0],
      tournamentDate: parse("2022-01-01"),
      username: "u1",
      totalStrokes: 90,
      totalPutts: 36,
      ...updateRoundData,
    });
  });

  test("not found if invalid round id", async function () {
    try {
      await Round.update(0, updateRoundData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Round.update(testRoundsIds[0], {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Round.remove(testRoundsIds[0]);
    const res = await db.query("SELECT id FROM rounds WHERE id=$1", [
      testRoundsIds[0],
    ]);
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such round", async function () {
    try {
      await Round.remove(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
