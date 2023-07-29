"use strict";

const request = require("supertest");

const app = require("../app");
const parse = require("postgres-date");
const db = require("../db");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  happyToken,
  shooterToken,
  adminToken,
  testRoundIds,
  testGreenieIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** GET /points/standings */

describe("GET /points/standings", function () {
  test("works", async function () {
    const resp = await request(app).get("/points/standings");

    expect(resp.body).toEqual({
      standings: [
        {
          username: "happy-gilmore",
          firstName: "Happy",
          lastName: "Gilmore",
          participation: "3",
          putts: "6",
          strokes: "25",
          greenies: "4",
          pars: "9",
          birdies: "8",
          eagles: "0",
          aces: "0",
          total: "55",
        },
        {
          username: "shooter-mcgavin",
          firstName: "Shooter",
          lastName: "McGavin",
          participation: "3",
          putts: "4",
          strokes: "20",
          greenies: "3",
          pars: "4",
          birdies: "0",
          eagles: "0",
          aces: "0",
          total: "34",
        },
        {
          username: "chubbs-peterson",
          firstName: "Chubbs",
          lastName: "Peterson",
          participation: "3",
          putts: "2",
          strokes: "15",
          greenies: "3",
          pars: "0",
          birdies: "0",
          eagles: "0",
          aces: "0",
          total: "23",
        },
      ],
    });
  });
});

/************************************** GET /points/:date */

describe("GET /points/:date", function () {
  test("works", async function () {
    const resp = await request(app).get("/points/2022-01-01");

    expect(resp.body).toEqual({
      points: [
        {
          roundId: testRoundIds[0],
          username: "happy-gilmore",
          firstName: "Happy",
          lastName: "Gilmore",
          participation: 3,
          putts: 6,
          strokes: 25,
          greenies: 4,
          pars: 9,
          birdies: 8,
          eagles: 0,
          aces: 0,
          total: 55,
        },
        {
          roundId: testRoundIds[1],
          username: "shooter-mcgavin",
          firstName: "Shooter",
          lastName: "McGavin",
          participation: 3,
          putts: 4,
          strokes: 20,
          greenies: 3,
          pars: 4,
          birdies: 0,
          eagles: 0,
          aces: 0,
          total: 34,
        },
        {
          roundId: testRoundIds[2],
          username: "chubbs-peterson",
          firstName: "Chubbs",
          lastName: "Peterson",
          participation: 3,
          putts: 2,
          strokes: 15,
          greenies: 3,
          pars: 0,
          birdies: 0,
          eagles: 0,
          aces: 0,
          total: 23,
        },
      ],
    });
  });
});
