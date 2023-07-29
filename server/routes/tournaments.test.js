"use strict";

const request = require("supertest");

const app = require("../app");
const parse = require("postgres-date");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  happyToken,
  shooterToken,
  adminToken,
  testRoundIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /tournaments */

describe("POST /tournaments", function () {
  const newTournament = {
    date: "2022-07-07",
    courseHandle: "wild-horse",
    tourYears: "2021-22",
  };

  test("ok for admin", async function () {
    const resp = await request(app)
      .post("/tournaments")
      .send(newTournament)
      .set("authorization", `Bearer ${adminToken}`);

    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      tournament: { ...newTournament, date: "2022-07-07T07:00:00.000Z" },
    });
  });

  test("unauth for non-admin", async function () {
    const resp = await request(app)
      .post("/tournaments")
      .send(newTournament)
      .set("authorization", `Bearer ${happyToken}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
      .post("/tournaments")
      .send({
        date: "2022-07-07",
        courseHandle: "wild-horse",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .post("/tournaments")
      .send({
        ...newTournament,
        courseHandle: 55,
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /tournaments */

describe("GET /tournaments", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/tournaments");
    expect(resp.body).toEqual({
      tournaments: [
        {
          date: "2022-03-03T08:00:00.000Z",
          courseHandle: "lone-tree",
          courseName: "Lone Tree Golf Course",
          tourYears: "2021-22",
          imgUrl: null,
        },
        {
          date: "2022-02-02T08:00:00.000Z",
          courseHandle: "paradise-valley",
          courseName: "Paradise Valley Golf Course",
          tourYears: "2021-22",
          imgUrl: null,
        },
        {
          date: "2022-01-01T08:00:00.000Z",
          courseHandle: "lone-tree",
          courseName: "Lone Tree Golf Course",
          tourYears: "2021-22",
          imgUrl: null,
        },
      ],
    });
  });
});

/************************************** GET /tournament:date */

/////// COME BACK LATER LUL /////////

/************************************** PATCH /tournament/:date */

describe("PATCH /tournaments/:date", function () {
  test("works for admin", async function () {
    const resp = await request(app)
      .patch(`/tournaments/2022-01-01`)
      .send({
        courseHandle: "wild-horse",
        tourYears: "2022-23",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      tournament: {
        date: "2022-01-01T08:00:00.000Z",
        courseHandle: "wild-horse",
        tourYears: "2022-23",
      },
    });
  });

  test("unauth for non-admin", async function () {
    const resp = await request(app)
      .patch(`/tournaments/2022-01-01`)
      .send({
        courseHandle: "wild-horse",
        tourYears: "2022-23",
      })
      .set("authorization", `Bearer ${happyToken}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).patch(`/tournaments/2022-01-01`).send({
      courseHandle: "wild-horse",
      tourYears: "2022-23",
    });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such tournament date", async function () {
    const resp = await request(app)
      .patch(`/tournaments/1999-01-01`)
      .send({
        courseHandle: "wild-horse",
        tourYears: "2022-23",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on date change attempt", async function () {
    const resp = await request(app)
      .patch(`/tournaments/2022-01-01`)
      .send({
        date: "1999-01-01",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
      .patch(`/tournaments/2022-01-01`)
      .send({
        courseHandle: "wild-horse",
        tourYears: 1999,
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /tournaments/:date */

describe("DELETE /tournaments/:date", function () {
  test("works for admin", async function () {
    const resp = await request(app)
      .delete(`/tournaments/2022-03-03`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ deleted: "2022-03-03" });
  });

  test("unauth for non-admin", async function () {
    const resp = await request(app)
      .delete(`/tournaments/2022-03-03`)
      .set("authorization", `Bearer ${happyToken}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).delete(`/tournaments/2022-03-03`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such tournament date", async function () {
    const resp = await request(app)
      .delete(`/companies/1999-01-01`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});
