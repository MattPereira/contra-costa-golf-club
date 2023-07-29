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

/************************************** POST /round */

describe("POST /rounds", function () {
  const newRound = {
    tournamentDate: "2022-03-03",
    username: "chubbs-peterson",
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

  test("ok for logged in users", async function () {
    const resp = await request(app)
      .post("/rounds")
      .send(newRound)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      round: {
        ...newRound,
        id: expect.any(Number),
        tournamentDate: "2022-03-03T08:00:00.000Z",
        totalStrokes: 72,
        totalPutts: 18,
      },
    });
  });

  test("unauth for anon", async function () {
    const resp = await request(app).post("/rounds").send(newRound);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
      .post("/rounds")
      .send({
        tournamentDate: "2022-03-03",
        username: "chubbs-peterson",
        strokes: {
          hole1: 4,
          hole2: 4,
          hole3: 4,
          hole4: 4,
          hole5: 4,
        },
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .post("/rounds")
      .send({
        ...newRound,
        username: 12345,
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /round */

describe("GET /companies/:handle", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/rounds/${testRoundIds[0]}`);
    expect(resp.body).toEqual({
      round: {
        id: expect.any(Number),
        tournamentDate: "2022-01-01T08:00:00.000Z",
        courseName: "Lone Tree Golf Course",
        username: "happy-gilmore",
        totalStrokes: 72,
        totalPutts: 18,
        greenies: [
          {
            id: testGreenieIds[0],
            roundId: testRoundIds[0],
            holeNumber: 1,
            feet: 1,
            inches: 1,
            courseImg: null,
            courseName: "Lone Tree Golf Course",
            firstName: "Happy",
            lastName: "Gilmore",
            tournamentDate: "2022-01-01T08:00:00.000Z",
          },
        ],
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
          total: 71,
        },
      },
    });
  });

  test("not found for no such round", async function () {
    const resp = await request(app).get(`/rounds/0`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /rounds/:id */

describe("PATCH /rounds/:id", function () {
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
      hole1: 2,
      hole2: 2,
      hole3: 2,
      hole4: 2,
      hole5: 2,
      hole6: 2,
      hole7: 2,
      hole8: 2,
      hole9: 2,
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
  test("works for logged in user", async function () {
    const resp = await request(app)
      .patch(`/rounds/${testRoundIds[0]}`)
      .send(updateRoundData)
      .set("authorization", `Bearer ${happyToken}`);
    expect(resp.body).toEqual({
      round: {
        ...updateRoundData,
        id: testRoundIds[0],
        totalPutts: 45,
        totalStrokes: 99,
        tournamentDate: "2022-01-01T08:00:00.000Z",
        username: "happy-gilmore",
      },
    });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
      .patch(`/rounds/${testRoundIds[0]}`)
      .send(updateRoundData);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such round id", async function () {
    const resp = await request(app)
      .patch(`/rounds/0`)
      .send(updateRoundData)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on id change attempt", async function () {
    const resp = await request(app)
      .patch(`/rounds/${testRoundIds[0]}`)
      .send({ ...updateRoundData, id: 99 })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
      .patch(`/rounds/${testRoundIds[0]}`)
      .send({ ...updateRoundData, strokes: "invalid strokes" })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /rounds/:id */

describe("DELETE /rounds/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
      .delete(`/rounds/${testRoundIds[0]}`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ deleted: testRoundIds[0].toString() });
  });

  test("unauth for non-admin", async function () {
    const resp = await request(app)
      .delete(`/rounds/${testRoundIds[0]}`)
      .set("authorization", `Bearer ${happyToken}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).delete(`/rounds/${testRoundIds[0]}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such round id", async function () {
    const resp = await request(app)
      .delete(`/rounds/0`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});
