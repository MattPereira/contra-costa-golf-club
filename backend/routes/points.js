"use strict";

/** Routes for points:
 * create a points row for each round in a tournament,
 * get points for all rounds in a tournament,
 * get points for a specific user in a tournament,
 * update points for a specific tournament,
 * delete points for a specific tournament */

const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const Point = require("../models/point");
const Tournament = require("../models/tournament");

const router = new express.Router();

/** GET / => { points }
 *
 *  Returns all points data for a season grouped
 *  by username with each column summed and each row totaled.
 *
 *  Used to display points standings for a season.
 *
 *  Eventually will require a tourYears parameter to be passed in.
 *
 *  Authorization required: none
 */
router.get("/standings/:tourYears", async function (req, res, next) {
  try {
    console.log(req.params.tourYears);
    const standings = await Point.getYearlyStandings(req.params.tourYears);
    return res.status(200).json({ standings });
  } catch (err) {
    return next(err);
  }
});

/** GET /[date] => { points }
 *
 *  Returns all points data for a tournament.
 *  ordered by total points descending.
 *
 * Used to display points leaderboard for each tournament.
 *
 *
 *  Authorization required: none
 */
router.get("/:date", async function (req, res, next) {
  try {
    const points = await Point.getTournamentStandings(req.params.date);
    return res.status(200).json({ points });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[dates] => { points }
 *
 *  FOR DEVELOPMENT PURPOSES TO HANDLE PRE-SEEDED DATA
 *
 *  Updates points totals for all tournaments
 *  using the data that exists in the rounds
 *  and greenies tables
 *
 *
 * Authorization required: none
 */

router.patch("/all", async function (req, res, next) {
  try {
    //Query tournaments to map array of all tournament dates
    const tournaments = await Tournament.findAll();
    const dates = tournaments.map((tournament) => tournament.date);

    //update points for each tournament date previously seeded into db
    for (const date of dates) {
      await Point.updateStrokesPositions(date);
      await Point.updatePuttsPositions(date);
      await Point.updateAllGreenies(date);
      await Point.updateAllScores(date);
    }

    return res.status(201).json({ success: "seed data updated!" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
