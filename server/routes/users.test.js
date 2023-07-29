"use strict";

const request = require("supertest");

const db = require("../db.js");
const app = require("../app");
const User = require("../models/user");
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
  testGreenieIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /users */

describe("POST /users", function () {
  test("works for admins: create non-admin", async function () {
    const resp = await request(app)
      .post("/users")
      .send({
        email: "new@gmail.com",
        password: "password-new",
        firstName: "newFirst",
        lastName: "newLast",
        isAdmin: false,
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      user: {
        username: "newfirst-newlast",
        firstName: "newFirst",
        lastName: "newLast",
        email: "new@gmail.com",
        isAdmin: false,
      },
      token: expect.any(String),
    });
  });

  test("works for admins: create admin", async function () {
    const resp = await request(app)
      .post("/users")
      .send({
        email: "new@gmail.com",
        password: "password-new",
        firstName: "newFirst",
        lastName: "newLast",
        isAdmin: true,
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      user: {
        username: "newfirst-newlast",
        firstName: "newFirst",
        lastName: "newLast",
        email: "new@gmail.com",
        isAdmin: true,
      },
      token: expect.any(String),
    });
  });

  test("unauth for users", async function () {
    const resp = await request(app)
      .post("/users")
      .send({
        email: "new@gmail.com",
        password: "password-new",
        firstName: "newFirst",
        lastName: "newLast",
        isAdmin: true,
      })
      .set("authorization", `Bearer ${happyToken}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).post("/users").send({
      email: "new@gmail.com",
      password: "password-new",
      firstName: "newFirst",
      lastName: "newLast",
      isAdmin: false,
    });
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request if missing data", async function () {
    const resp = await request(app)
      .post("/users")
      .send({
        email: "new@gmail.com",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request if invalid data", async function () {
    const resp = await request(app)
      .post("/users")
      .send({
        email: "invalid-email",
        password: "password-new",
        firstName: "newFirst",
        lastName: "newLast",
        isAdmin: false,
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /users */

describe("GET /users", function () {
  test("works", async function () {
    const resp = await request(app).get("/users");
    expect(resp.body).toEqual({
      users: [
        {
          username: "happy-gilmore",
          firstName: "Happy",
          lastName: "Gilmore",
          isAdmin: false,
          avgGreenies: "1.00",
          avgPutts: "18.00",
          avgStrokes: "72.00",
          totalRounds: "1",
        },
        {
          username: "shooter-mcgavin",
          firstName: "Shooter",
          lastName: "McGavin",
          isAdmin: false,
          avgGreenies: "1.00",
          avgPutts: "36.00",
          avgStrokes: "90.00",
          totalRounds: "1",
        },
        {
          username: "chubbs-peterson",
          firstName: "Chubbs",
          lastName: "Peterson",
          isAdmin: true,
          avgGreenies: "1.00",
          avgPutts: "54.00",
          avgStrokes: "108.00",
          totalRounds: "1",
        },
        {
          firstName: "Bob",
          lastName: "Barker",
          username: "bob-barker",
          isAdmin: false,
          avgPutts: null,
          avgStrokes: null,
          totalRounds: "0",
        },
      ],
    });
  });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // but this will cause an error!
    await db.query("DROP TABLE users CASCADE");
    const resp = await request(app)
      .get("/users")
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(500);
  });
});

/************************************** GET /users/:username */

describe("GET /users/:username", function () {
  test("works", async function () {
    const resp = await request(app).get(`/users/happy-gilmore`);

    expect(resp.body).toEqual({
      user: {
        username: "happy-gilmore",
        firstName: "Happy",
        lastName: "Gilmore",
        email: "happy@gmail.com",
        isAdmin: false,
        rounds: [
          {
            id: testRoundIds[0],
            tournamentDate: "2022-01-01T08:00:00.000Z",
            courseHandle: "lone-tree",
            courseName: "Lone Tree Golf Course",
            totalStrokes: 72,
            netStrokes: 69,
            totalPutts: 18,
            courseHandicap: 3,
            playerIndex: "2.7",
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
        ],
      },
    });
  });

  test("not found if user not found", async function () {
    const resp = await request(app).get(`/users/invalid-user`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /users/:username */

describe("PATCH /users/:username", () => {
  test("works for admins", async function () {
    const resp = await request(app)
      .patch(`/users/happy-gilmore`)
      .send({
        firstName: "Sad",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      user: {
        username: "happy-gilmore",
        firstName: "Sad",
        lastName: "Gilmore",
        email: "happy@gmail.com",
        isAdmin: false,
      },
    });
  });

  test("works for same user", async function () {
    const resp = await request(app)
      .patch(`/users/happy-gilmore`)
      .send({
        firstName: "Joyful",
      })
      .set("authorization", `Bearer ${happyToken}`);
    expect(resp.body).toEqual({
      user: {
        username: "happy-gilmore",
        firstName: "Joyful",
        lastName: "Gilmore",
        email: "happy@gmail.com",
        isAdmin: false,
      },
    });
  });

  test("unauth if not same user", async function () {
    const resp = await request(app)
      .patch(`/users/u1`)
      .send({
        firstName: "Stupid",
      })
      .set("authorization", `Bearer ${shooterToken}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).patch(`/users/happy-gilmore`).send({
      firstName: "Funny",
    });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if no such user", async function () {
    const resp = await request(app)
      .patch(`/users/invalid-user`)
      .send({
        firstName: "Nope",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request if invalid data", async function () {
    const resp = await request(app)
      .patch(`/users/happy-gilmore`)
      .send({
        firstName: 42,
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("works: can set new password", async function () {
    const resp = await request(app)
      .patch(`/users/happy-gilmore`)
      .send({
        password: "secret",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      user: {
        username: "happy-gilmore",
        firstName: "Happy",
        lastName: "Gilmore",
        email: "happy@gmail.com",
        isAdmin: false,
      },
    });
    const isSuccessful = await User.authenticate("happy@gmail.com", "secret");
    expect(isSuccessful).toBeTruthy();
  });
});

/************************************** DELETE /users/:username */

describe("DELETE /users/:username", function () {
  test("works for admin", async function () {
    const resp = await request(app)
      .delete(`/users/bob-barker`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ deleted: "bob-barker" });
  });

  test("unauth if not admin", async function () {
    const resp = await request(app)
      .delete(`/users/bob-barker`)
      .set("authorization", `Bearer ${happyToken}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).delete(`/users/bob-barker`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if user missing", async function () {
    const resp = await request(app)
      .delete(`/users/invalid-user`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});
