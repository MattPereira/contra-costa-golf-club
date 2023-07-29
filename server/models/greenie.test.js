"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
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

/************************************** create */

describe("create", function () {
  const newGreenie = {
    holeNumber: 11,
    feet: 11,
    inches: 11,
  };
  test("works", async function () {
    let greenie = await Greenie.create({
      ...newGreenie,
      roundId: testRoundsIds[2],
    });
    expect(greenie).toEqual({
      ...newGreenie,
      roundId: testRoundsIds[2],
      id: expect.any(Number),
    });
  });

  test("bad request with dupe roundId/holeNumber combination", async function () {
    try {
      const newGreenie = {
        roundId: testRoundsIds[2],
        holeNumber: 11,
        feet: 11,
        inches: 11,
      };
      await Greenie.create({ ...newGreenie, roundId: testRoundsIds[2] });
      await Greenie.create({ ...newGreenie, roundId: testRoundsIds[2] });

      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: all ordered by distance", async function () {
    let greenies = await Greenie.findAll();

    console.log("TEST ROUND IDS", testRoundsIds);

    expect(greenies).toEqual([
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
      {
        id: testGreeniesIds[3],
        roundId: testRoundsIds[3],
        holeNumber: 7,
        feet: 7,
        inches: 7,
        courseImg: "test.com/pebble-beach.jpg",
        courseName: "Pebble Beach Golf Course",
        firstName: "U2F",
        lastName: "U2L",
        tournamentDate: parse("2022-02-02"),
      },
      {
        id: testGreeniesIds[2],
        roundId: testRoundsIds[1],
        holeNumber: 1,
        feet: 11,
        inches: 11,
        courseImg: "test.com/roddy-ranch.jpg",
        courseName: "Roddy Ranch Golf Course",
        firstName: "U2F",
        lastName: "U2L",
        tournamentDate: parse("2022-01-01"),
      },
    ]);
  });
  test("works: all for one tournament date", async function () {
    let greenies = await Greenie.findAll("2022-02-02");
    expect(greenies).toEqual([
      {
        id: testGreeniesIds[3],
        roundId: testRoundsIds[3],
        holeNumber: 7,
        feet: 7,
        inches: 7,
        courseImg: "test.com/pebble-beach.jpg",
        courseName: "Pebble Beach Golf Course",
        firstName: "U2F",
        lastName: "U2L",
        tournamentDate: parse("2022-02-02"),
      },
    ]);
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let greenie = await Greenie.get(testGreeniesIds[0]);
    expect(greenie).toEqual({
      id: testGreeniesIds[0],
      roundId: testRoundsIds[0],
      holeNumber: 1,
      feet: 1,
      inches: 1,
      courseImg: "test.com/roddy-ranch.jpg",
      courseName: "Roddy Ranch Golf Course",
      firstName: "U1F",
      lastName: "U1L",
      username: "u1",
      tournamentDate: parse("2022-01-01"),
    });
  });

  test("not found if no such greenie", async function () {
    try {
      await Greenie.get(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    feet: 22,
    inches: 2,
  };

  test("works", async function () {
    let greenie = await Greenie.update(testGreeniesIds[0], updateData);
    expect(greenie).toEqual({
      id: testGreeniesIds[0],
      roundId: testRoundsIds[0],
      holeNumber: 1,
      feet: 22,
      inches: 2,
    });
  });

  test("not found if no such greenie", async function () {
    try {
      const test = await Greenie.update(0, updateData);
      console.log(test);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Greenie.update(testGreeniesIds[0], {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Greenie.remove(testGreeniesIds[0]);
    const res = await db.query("SELECT id FROM greenies WHERE id=$1", [
      testGreeniesIds[0],
    ]);
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such greenie", async function () {
    try {
      await Greenie.remove(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
