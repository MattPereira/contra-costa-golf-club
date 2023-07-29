"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Tournament = require("./tournament.js");
const parse = require("postgres-date");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newTournament = {
    date: "2022-04-04",
    courseHandle: "roddy-ranch",
    tourYears: "2021-22",
  };

  test("works", async function () {
    let tournament = await Tournament.create(newTournament);
    expect(tournament).toEqual({
      ...newTournament,
      date: parse(newTournament.date),
    });

    const result = await db.query(
      `SELECT date, course_handle AS "courseHandle", tour_years AS "tourYears"
             FROM tournaments
             WHERE date = '2022-04-04'`
    );
    expect(result.rows).toEqual([
      {
        date: parse("2022-04-04"),
        courseHandle: "roddy-ranch",
        tourYears: "2021-22",
      },
    ]);
  });

  test("bad request with dupe", async function () {
    try {
      await Tournament.create(newTournament);
      await Tournament.create(newTournament);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: all", async function () {
    let tournaments = await Tournament.findAll();
    expect(tournaments).toEqual([
      {
        date: parse("2022-03-03"),
        courseHandle: "roddy-ranch",
        courseName: "Roddy Ranch Golf Course",
        tourYears: "2021-22",
        imgUrl: "test.com/roddy-ranch.jpg",
      },
      {
        date: parse("2022-02-02"),
        courseHandle: "pebble-beach",
        courseName: "Pebble Beach Golf Course",
        tourYears: "2021-22",
        imgUrl: "test.com/pebble-beach.jpg",
      },
      {
        date: parse("2022-01-01"),
        courseHandle: "roddy-ranch",
        courseName: "Roddy Ranch Golf Course",
        tourYears: "2021-22",
        imgUrl: "test.com/roddy-ranch.jpg",
      },
    ]);
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let tournament = await Tournament.get("2022-01-01");
    expect(tournament).toEqual({
      date: parse("2022-01-01"),
      courseHandle: "roddy-ranch",
      courseName: "Roddy Ranch Golf Course",
      tourYears: "2021-22",
    });
  });

  test("not found if no such tournament", async function () {
    try {
      await Tournament.get("1999-01-01");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    courseHandle: "rooster-run",
    tourYears: "2021-22",
  };

  test("works", async function () {
    let tournament = await Tournament.update("2022-01-01", updateData);
    expect(tournament).toEqual({
      date: parse("2022-01-01"),
      ...updateData,
    });

    const result = await db.query(
      `SELECT date, course_handle AS "courseHandle", tour_years AS "tourYears"
               FROM tournaments
               WHERE date = '2022-01-01'`
    );
    expect(result.rows).toEqual([
      {
        date: parse("2022-01-01"),
        courseHandle: "rooster-run",
        tourYears: "2021-22",
      },
    ]);
  });

  test("not found if no such tournament", async function () {
    try {
      const test = await Tournament.update("1999-01-01", updateData);
      console.log(test);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Tournament.update("2022-01-01", {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Tournament.remove("2022-03-03");
    const res = await db.query(
      "SELECT * FROM tournaments WHERE date='2022-03-03'"
    );
    expect(res.rows.length).toEqual(0);
  });

  test("throws error if trying to delete tournament with rounds still associated", async function () {
    try {
      await Tournament.remove("2022-01-01");
      const res = await db.query(
        "SELECT * FROM tournaments WHERE date='2022-01-01'"
      );
      expect(res.rows.length).toEqual(0);
    } catch (err) {
      expect(err instanceof Error).toBeTruthy();
    }
  });

  test("not found if no such tournament", async function () {
    try {
      await Tournament.remove("1999-01-01");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
