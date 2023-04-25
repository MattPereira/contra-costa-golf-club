"use strict";

/** Routes for tournaments:
 * create a tournament,
 * get all tournament,
 * get a specific tournament,
 * update a specific tournament,
 * delete a specific tournament */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const Tournament = require("../models/tournament");
const Greenie = require("../models/greenie");
const Point = require("../models/point");

const tournamentNewSchema = require("../schemas/tournamentNew.json");
const tournamentUpdateSchema = require("../schemas/tournamentUpdate.json");

const router = new express.Router();

/** POST / { tournament } =>  { tournament }
 *
 * Creates a new tournament.
 *
 * req.body data should be { date, courseHandle, tourYears }
 *
 * Returns { date, courseHandle, tourYears }
 *
 * Authorization required: admin
 *
 */

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, tournamentNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const tournament = await Tournament.create(req.body);
    return res.status(201).json({ tournament });
  } catch (err) {
    return next(err);
  }
});

/** GET /  =>
 *
 *   Returns a list of all tournaments.
 *
 * { tournaments: [ { date, courseName, seasonEndYear }, ... ] }
 *
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  try {
    const tournaments = await Tournament.findAll();
    return res.json({ tournaments });
  } catch (err) {
    return next(err);
  }
});

/** GET /[date]  =>  { tournament }
 *
 *  Returns all leaderboard data about a specific tournament by date.
 *
 *
 *  pointsLeaderboard is ...
 *
 *  strokesLeaderboard is { date, course_handle, season_end_year, rounds }
 *  where rounds is [{ username, strokes, total_strokes, net_strokes, player_index, score_differential, course_handicap }, ...]
 *  where strokes is {hole1, hole2, ..., hole18}
 *
 * puttsLeaderboard orders rounds by total_putts ascending
 *
 * puttsLeaderboard is { date, courseHandle, seasonEndYear, rounds}
 * *  where rounds is [{ username, firstName, lastName, totalPutts, putts }, ...]
 *  where putts is {hole1, hole2, ..., hole18}
 *
 * greenies is [{id, roundId, tournamentDate, courseName, holeNumber, feet, inches, firstName, lastName}, ...]
 *
 * Authorization required: none
 */

router.get("/:date", async function (req, res, next) {
  try {
    const { date } = req.params;

    /** if front end is requesting "/tournaments/upcoming"
     *  send back the upcoming tournament
     */
    if (date === "upcoming") {
      const tournament = await Tournament.getUpcoming();
      return res.json({ tournament });
    }

    const tournament = await Tournament.get(date);
    const scoresLeaderboard = await Tournament.getScores(date);
    const pointsLeaderboard = await Point.getTournamentStandings(date);
    const greenies = await Greenie.findAll(date);
    return res.json({
      tournament: {
        ...tournament,
        pointsLeaderboard,
        scoresLeaderboard,
        greenies,
      },
    });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[date] { fld1, fld2, ... } => { tournament }
 *
 * Patches course data (including pars and handicaps) by handle.
 *
 * fields can be: { course_handle, season_end_year }
 *
 * Returns { date, course_handle, season_end_year }
 *
 * Authorization: admin
 */

router.patch("/:date", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, tournamentUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const tournament = await Tournament.update(req.params.date, req.body);

    return res.json({ tournament });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[date]  =>  { deleted: date }
 *
 * Deletes a tournament by date.
 *
 * Authorization: admin
 */

router.delete("/:date", ensureAdmin, async function (req, res, next) {
  try {
    await Tournament.remove(req.params.date);
    return res.json({ deleted: req.params.date });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
