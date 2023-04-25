"use strict";

const request = require("supertest");

const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  happyToken,
  shooterToken,
  adminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /companies */

describe("POST /courses", function () {
  const newCourse = {
    handle: "new-course",
    name: "New Course Country Club",
    rating: 72.1,
    slope: 123,
    imgUrl: "test.com/new-course.jpg",
    pars: {
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
    handicaps: {
      hole1: 18,
      hole2: 17,
      hole3: 16,
      hole4: 15,
      hole5: 14,
      hole6: 13,
      hole7: 12,
      hole8: 11,
      hole9: 10,
      hole10: 9,
      hole11: 8,
      hole12: 7,
      hole13: 6,
      hole14: 5,
      hole15: 4,
      hole16: 3,
      hole17: 2,
      hole18: 1,
    },
  };

  test("ok for admin", async function () {
    const resp = await request(app)
      .post("/courses")
      .send(newCourse)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      course: {
        ...newCourse,
        rating: "72.1",
        pars: { ...newCourse.pars, total: 54 },
      },
    });
  });

  test("unauth for non-admin", async function () {
    const resp = await request(app)
      .post("/courses")
      .send(newCourse)
      .set("authorization", `Bearer ${happyToken}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
      .post("/courses")
      .send({
        handle: "rooster-run",
        name: "Rooster Run Golf Course",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .post("/courses")
      .send({
        ...newCourse,
        slope: "not-a-number",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /courses */

describe("GET /courses", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/courses");
    expect(resp.body).toEqual({
      courses: [
        {
          handle: "lone-tree",
          name: "Lone Tree Golf Course",
          rating: "69.1",
          slope: 121,
          imgUrl: null,
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
        },
        {
          handle: "paradise-valley",
          name: "Paradise Valley Golf Course",
          rating: "70.4",
          slope: 125,
          imgUrl: null,
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
            total: 72,
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
        },
        {
          handle: "wild-horse",
          name: "Wild Horse Golf Course",
          rating: "68.4",
          slope: 120,
          imgUrl: null,
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
            total: 72,
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
        },
      ],
    });
  });
});

/************************************** GET /courses/:handle */

describe("GET /courses/:handle", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/courses/lone-tree`);
    expect(resp.body).toEqual({
      course: {
        handle: "lone-tree",
        name: "Lone Tree Golf Course",
        rating: "69.1",
        slope: 121,
        imgUrl: null,
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
      },
    });
  });

  test("not found for no such course", async function () {
    const resp = await request(app).get(`/course/invalid-course`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /courses/:handle */

describe("PATCH /courses/:handle", function () {
  test("works for admin", async function () {
    const resp = await request(app)
      .patch(`/courses/lone-tree`)
      .send({
        name: "Patched Name Golf Course",
        slope: 222,
        rating: 77.7,
        imgUrl: "test.com/patched.jpg",
        pars: {
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
        handicaps: {
          hole1: 1,
          hole2: 2,
          hole3: 3,
          hole4: 4,
          hole5: 5,
          hole6: 6,
          hole7: 7,
          hole8: 8,
          hole9: 9,
          hole10: 10,
          hole11: 11,
          hole12: 12,
          hole13: 13,
          hole14: 14,
          hole15: 15,
          hole16: 16,
          hole17: 17,
          hole18: 18,
        },
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      course: {
        handle: "lone-tree",
        name: "Patched Name Golf Course",
        rating: "77.7",
        slope: 222,
        imgUrl: "test.com/patched.jpg",
        pars: {
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
          total: 90,
        },
        handicaps: {
          hole1: 1,
          hole2: 2,
          hole3: 3,
          hole4: 4,
          hole5: 5,
          hole6: 6,
          hole7: 7,
          hole8: 8,
          hole9: 9,
          hole10: 10,
          hole11: 11,
          hole12: 12,
          hole13: 13,
          hole14: 14,
          hole15: 15,
          hole16: 16,
          hole17: 17,
          hole18: 18,
        },
      },
    });
  });

  test("unauth for non-admin", async function () {
    const resp = await request(app)
      .patch(`/courses/lone-tree`)
      .send({
        name: "Patched Name Golf Course",
      })
      .set("authorization", `Bearer ${happyToken}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).patch(`/courses/lone-tree`).send({
      name: "Patched Name Golf Course",
    });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such company", async function () {
    const resp = await request(app)
      .patch(`/courses/invalid-course`)
      .send({
        name: "Patched Name Golf Course",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on handle change attempt", async function () {
    const resp = await request(app)
      .patch(`/courses/lone-tree`)
      .send({
        handle: "new-handle",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
      .patch(`/courses/lone-tree`)
      .send({
        slope: "not-an-integer",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /courses/:handle */

describe("DELETE /courses/:handle", function () {
  test("works for admin", async function () {
    const resp = await request(app)
      .delete(`/courses/wild-horse`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ deleted: "wild-horse" });
  });

  test("unauth for non-admin", async function () {
    const resp = await request(app)
      .delete(`/courses/wild-horse`)
      .set("authorization", `Bearer ${happyToken}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).delete(`/courses/wild-horse`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such course", async function () {
    const resp = await request(app)
      .delete(`/courses/invalid-course`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});
