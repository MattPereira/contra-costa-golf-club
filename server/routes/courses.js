"use strict";

/** Routes for courses:
 * create a course,
 * get all courses,
 * get a specific course,
 * update a specific course,
 * delete a specific course */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const Course = require("../models/course");

const courseNewSchema = require("../schemas/courseNew.json");
const courseUpdateSchema = require("../schemas/courseUpdate.json");

const router = new express.Router();

/** POST / { course } =>  { course }
 *
 * Creates a new course.
 *
 * req.body data should be { handle, name, rating, slope, pars, handicaps }
 *  where pars is {hole1, hole2, ..., hole18}
 *  and handicaps is {hole1, hole2, ..., hole18}
 *
 * Returns { handle, name, rating, slope, pars, handicaps }
 *
 * Authorization required: admin
 *
 */

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, courseNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const course = await Course.create(req.body);
    return res.status(201).json({ course });
  } catch (err) {
    return next(err);
  }
});

/** GET /  =>
 *
 *   Returns a list of all courses.
 *
 * { courses: [ { handle, name, rating, slope, pars, handicaps }, ... ] }
 *  where pars is {hole1, hole2, ..., hole18}
 *  and handicaps is {hole1, hole2, ..., hole18}
 *
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  try {
    const courses = await Course.findAll();
    return res.json({ courses });
  } catch (err) {
    return next(err);
  }
});

/** GET /[handle]  =>  { course }
 *
 *  Returns data about a specific course by handle.
 *
 *  Course is { handle, name, rating, slope, pars, handicaps }
 *  where pars is {hole1, hole2, ..., hole18}
 *  and handicaps is {hole1, hole2, ..., hole18}
 *
 * Authorization required: none
 */

router.get("/:handle", async function (req, res, next) {
  try {
    const course = await Course.get(req.params.handle);
    return res.json({ course });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[handle] { fld1, fld2, ... } => { course }
 *
 * Patches course data (including pars and handicaps) by handle.
 *
 * fields can be: { name, rating, slope, pars, handicaps }
 *
 * Returns { handle, name, rating, slope, pars, handicaps }
 *
 * Authorization: admin
 */

router.patch("/:handle", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, courseUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const course = await Course.update(req.params.handle, req.body);

    return res.json({ course });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[handle]  =>  { deleted: handle }
 *
 * Deletes a course by handle.
 *
 * Authorization: admin
 */

router.delete("/:handle", ensureAdmin, async function (req, res, next) {
  try {
    await Course.remove(req.params.handle);
    return res.json({ deleted: req.params.handle });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
