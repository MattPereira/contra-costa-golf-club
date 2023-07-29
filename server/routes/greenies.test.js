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

/************************************** POST /greenies */

describe("POST /greenies", function () {
  test("ok for admin", async function () {
    const newGreenie = {
      roundId: testRoundIds[0],
      holeNumber: 11,
      feet: 11,
      inches: 11,
    };
    const resp = await request(app)
      .post("/greenies")
      .send(newGreenie)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      greenie: { ...newGreenie, id: expect.any(Number) },
    });
  });

  test("ok for logged-in user", async function () {
    const newGreenie = {
      roundId: testRoundIds[0],
      holeNumber: 11,
      feet: 11,
      inches: 11,
    };
    const resp = await request(app)
      .post("/greenies")
      .send(newGreenie)
      .set("authorization", `Bearer ${happyToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      greenie: { ...newGreenie, id: expect.any(Number) },
    });
  });

  test("unauth for anon", async function () {
    const newGreenie = {
      roundId: testRoundIds[0],
      holeNumber: 11,
      feet: 11,
      inches: 11,
    };
    const resp = await request(app).post("/greenies").send(newGreenie);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
      .post("/greenies")
      .send({
        holeNumber: 11,
        feet: 11,
        inches: 11,
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const newGreenie = {
      roundId: testRoundIds[0],
      holeNumber: "eleven",
      feet: 11,
      inches: 11,
    };
    const resp = await request(app)
      .post("/greenies")
      .send({ newGreenie })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /greenies */

describe("GET /greenies", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/greenies");
    expect(resp.body).toEqual({
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
        {
          id: testGreenieIds[1],
          roundId: testRoundIds[1],
          holeNumber: 1,
          feet: 2,
          inches: 2,
          courseImg: null,
          courseName: "Lone Tree Golf Course",
          firstName: "Shooter",
          lastName: "McGavin",
          tournamentDate: "2022-01-01T08:00:00.000Z",
        },
        {
          id: testGreenieIds[2],
          roundId: testRoundIds[2],
          holeNumber: 1,
          feet: 3,
          inches: 3,
          courseImg: null,
          courseName: "Lone Tree Golf Course",
          firstName: "Chubbs",
          lastName: "Peterson",
          tournamentDate: "2022-01-01T08:00:00.000Z",
        },
      ],
    });
  });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE greenies CASCADE");
    const resp = await request(app)
      .get("/greenies")
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(500);
  });
});

/************************************** GET /greenies/:id */

describe("GET /greenies/:id", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/greenies/${testGreenieIds[0]}`);
    expect(resp.body).toEqual({
      greenie: {
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
        username: "happy-gilmore",
      },
    });
  });

  test("not found for no such greenie id", async function () {
    const resp = await request(app).get(`/greenies/0`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /companies/:handle */

describe("PATCH /greenies/:id", function () {
  test("ok for logged in users", async function () {
    const resp = await request(app)
      .patch(`/greenies/${testGreenieIds[0]}`)
      .send({ feet: 11, inches: 11 })
      .set("authorization", `Bearer ${happyToken}`);
    expect(resp.body).toEqual({
      greenie: {
        id: testGreenieIds[0],
        roundId: testRoundIds[0],
        holeNumber: 1,
        feet: 11,
        inches: 11,
      },
    });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
      .patch(`/greenies/${testGreenieIds[0]}`)
      .send({ feet: 11, inches: 11 });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such greenie", async function () {
    const resp = await request(app)
      .patch(`/greenies/0`)
      .send({ feet: 11, inches: 11 })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on greenie id change attempt", async function () {
    const resp = await request(app)
      .patch(`/greenies/${testGreenieIds[0]}`)
      .send({ id: 99, feet: 11, inches: 11 })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
      .patch(`/greenies/${testGreenieIds[0]}`)
      .send({ feet: "NaN", inches: 11 })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /greenies/:id */

describe("DELETE /greenies/:id", function () {
  test("works for logged in users", async function () {
    const resp = await request(app)
      .delete(`/greenies/${testGreenieIds[0]}`)
      .set("authorization", `Bearer ${happyToken}`);
    expect(resp.body).toEqual({ deleted: testGreenieIds[0].toString() });
  });

  //TRYING AUTH FOR ALL LOGGED IN USERS
  // test("unauth for non-admin", async function () {
  //   const resp = await request(app)
  //     .delete(`/greenies/${testGreenieIds[0]}`)
  //     .set("authorization", `Bearer ${happyToken}`);
  //   expect(resp.statusCode).toEqual(401);
  // });

  test("unauth for anon", async function () {
    const resp = await request(app).delete(`/greenies/${testGreenieIds[0]}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such greenie", async function () {
    const resp = await request(app)
      .delete(`/greenies/11`)
      .set("authorization", `Bearer ${adminToken}`);

    expect(resp.statusCode).toEqual(404);
  });
});
