"use strict";

/** Routes for rounds:
 * create a round,
 * get all rounds for a specific tournament,
 * get a specific round,
 * update a specific round,
 * delete a specific round */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const {
  ensureAdmin,
  ensureCorrectUserOrAdmin,
  ensureLoggedIn,
} = require("../middleware/auth");
const Round = require("../models/round");
const Point = require("../models/point");

const roundNewSchema = require("../schemas/roundNew.json");
const roundUpdateSchema = require("../schemas/roundUpdate.json");

const router = new express.Router();

/** POST / { round } =>  { round }
 *
 * Creates a new round.
 *
 * req.body data should be { tournament_date, username, strokes, putts }
 *  where strokes is {hole1, hole2, ..., hole18}
 *  and putts is {hole1, hole2, ..., hole18}
 *
 * Returns { id, tournament_date, username, strokes, putts, total_strokes, net_strokes, total_putts, player_index, score_differential, course_handicap }
 *
 * Authorization required: admin (not sure how to handle this yet)
 *
 */

router.post("/", ensureLoggedIn, async function (req, res, next) {
  try {
    /****** TEMP TURN OFF VALIDATION DURING PARTIAL ROUND INPUT WORK *******/
    // const validator = jsonschema.validate(req.body, roundNewSchema);
    // if (!validator.valid) {
    //   const errs = validator.errors.map((e) => e.stack);
    //   throw new BadRequestError(errs);
    // }

    const round = await Round.create(req.body);

    //create a points row for the new round
    await Point.create(round);

    // Update the tournament strokes and putts points incase of new top 5
    await Point.updateStrokesPositions(round.tournamentDate);
    await Point.updatePuttsPositions(round.tournamentDate);

    return res.status(201).json({ round });
  } catch (err) {
    return next(err);
  }
});

/** GET /  => { rounds }
 *
 *    MEMBER DETAILS PAGE
 *
 *   Returns a list of all rounds associated with a particular username.
 *
 * { rounds: [ { id, tournament_date, username, strokes, putts, total_strokes, net_strokes, total_putts, player_index, score_differential, course_handicap }, ... ] }
 *  where strokes is {hole1, hole2, ..., hole18}
 *  and putts is {hole1, hole2, ..., hole18}
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  try {
    const q = req.query;

    const rounds = await Round.findAll(q);
    // console.log(rounds);
    return res.json({ rounds });
  } catch (err) {
    return next(err);
  }
});

/** GET /[id]  =>  { round }
 *
 *  ROUND DETAILS PAGE
 *
 *  Returns data about a specific round by id.
 *
 *
 *  Round is { id, tournament_date, username, strokes, putts, total_strokes, net_strokes, total_putts, player_index, score_differential, course_handicap }
 *  where strokes is {hole1, hole2, ..., hole18}
 *  and putts is {hole1, hole2, ..., hole18}
 *
 * Authorization required: none
 */

router.get("/:id", async function (req, res, next) {
  try {
    const round = await Round.get(req.params.id);
    return res.json({ round });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[id] { fld1, fld2, ... } => { round }
 *
 * Patches round data (including strokes and putts) by id.
 *
 * fields can be: { strokes, putts }
 *
 * Returns { id, tournament_date, username, strokes, putts, total_strokes, net_strokes, total_putts, player_index, score_differential, course_handicap }
 *
 * Authorization: admin (not sure how to handle this yet)
 */

router.patch("/:id", ensureLoggedIn, async function (req, res, next) {
  try {
    /****** TEMP TURN OFF VALIDATION DURING PARTIAL ROUND INPUT WORK *******/

    // const validator = jsonschema.validate(req.body, roundUpdateSchema);
    // if (!validator.valid) {
    //   const errs = validator.errors.map((e) => e.stack);
    //   throw new BadRequestError(errs);
    // }

    const round = await Round.update(req.params.id, req.body);

    // Update the scores(pars, birdies, etc) for the round since strokes have changed
    await Point.updateScores(round);
    // Update the tournament strokes and putts incase of new top 5
    await Point.updateStrokesPositions(round.tournamentDate);
    await Point.updatePuttsPositions(round.tournamentDate);

    return res.json({ round });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[id]  =>  { deleted: id }
 *
 * Deletes a round by id.
 *
 *
 * Authorization: admin
 */

router.delete(
  "/:id",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      //grab round.tournamentDate for Point.updates below
      const round = await Round.get(req.params.id);

      await Round.remove(req.params.id);

      // Update the tournament strokes and putts
      // incase of new top 5 post round deletion
      await Point.updateStrokesPositions(round.tournamentDate);
      await Point.updatePuttsPositions(round.tournamentDate);

      return res.json({ deleted: req.params.id });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
