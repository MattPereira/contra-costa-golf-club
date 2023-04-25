"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for courses. */

class Round {
  /** Create a round from data, update db, return new round data.
   *
   * data should be { tournament_date, username, strokes, putts }
   *  where strokes is {hole1, hole2, hole3, ...}
   *  and putts is {hole1, hole2, hole3, ...}
   *
   * Returns { tournamentDate, username, strokes, putts }
   *
   *
   * Throws BadRequestError if round already in database.
   * */

  static async create({ tournamentDate, username, strokes, putts }) {
    //block a user from inputing more than one round per tournament date
    const duplicateCheck = await db.query(
      `SELECT tournament_date, username
           FROM rounds
           WHERE tournament_date = $1 AND username = $2`,
      [tournamentDate, username]
    );

    if (duplicateCheck.rows[0])
      throw new BadRequestError(
        `Each golfer is only allowed to submit one round per tournament!`
      );

    /******  STEP 1 : Sum the strokes and putts objects to get total_strokes and total_putts *******/
    const totalStrokes = Object.values(strokes).reduce((a, b) => a + b, 0);
    const totalPutts = Object.values(putts).reduce((a, b) => a + b, 0);
    // console.log("TOTAL STROKES", totalStrokes);
    // console.log("TOTAL PUTTS", totalPutts);

    /**** Need course data for eventual computation of score diff and course handicap ******/
    const courseRes = await db.query(
      `SELECT date, course_handle AS "courseHandle", name AS "courseName", rating AS "courseRating", slope AS "courseSlope"
            FROM tournaments 
            JOIN courses ON tournaments.course_handle = courses.handle
            WHERE date = $1`,
      [tournamentDate]
    );
    const { courseRating, courseSlope } = courseRes.rows[0];

    /*******  Compute player_index by averaging lowest 2 of last 4 score diffs  ************/
    const scoreDiffRes = await db.query(
      `SELECT tournament_date AS "tournamentDate",
              score_differential AS "scoreDifferential" 
              FROM rounds 
              WHERE username=$1 AND score_differential IS NOT NULL
              ORDER BY tournament_date DESC LIMIT 4`,
      [username]
    );

    // make array of last 4 scoreDifferentials ['18.3', '22.1', '19.5', '24.4']
    const scoreDiffsArr = scoreDiffRes.rows.map((r) => +r.scoreDifferential);

    //if this is the players first round start them with score diff of 0
    if (scoreDiffsArr.length === 0) {
      scoreDiffsArr.push(0);
    }
    console.log("SCORE DIFFS ARRAY", scoreDiffsArr);

    // if the round is completed, these values will be reassigned in the "if" block
    let scoreDifferential = null;
    let netStrokes = null;
    let playerIndex;
    let courseHandicap;

    //Hard to account for player with less than 4 rounds without WET code

    ///////////////// IF THE ROUND IS FULLY COMPLETED ///////////////////////
    /******** calculate the score differential and net strokes  ******/
    if (
      Object.values(strokes).every((val) => val !== null) &&
      Object.values(putts).every((val) => val !== null)
    ) {
      /***** Compute score_differential for round: (113 / course_slope) * (total_strokes - course_rating) *****/
      scoreDifferential = +(
        (113 / courseSlope) *
        (totalStrokes - courseRating)
      ).toFixed(1);
      // console.log("SCORE DIFFERENTIAL", scoreDifferential);

      //If player has less than 4 previous rounds but more than 0, push current round scoreDifferential onto scoreDiffsArr to calculate a player index
      if (scoreDiffsArr.length > 0 && scoreDiffsArr.length < 4) {
        scoreDiffsArr.push(scoreDifferential);
      }
      console.log("SCORE DIFFS ARRAY", scoreDiffsArr);

      //sort from lowest to highest and slice to get the two lowest
      const lowestDiffs = scoreDiffsArr.sort((a, b) => a - b).slice(0, 2);
      // console.log("LOWEST DIFFS", lowestDiffs);

      playerIndex = (
        lowestDiffs.reduce((a, b) => a + b, 0) / lowestDiffs.length
      ).toFixed(1);
      console.log("PLAYER INDEX", playerIndex);

      /** Compute the course_handicap = (player_index * (course_slope)) / 113 ***/
      courseHandicap = Math.round((playerIndex * courseSlope) / 113);
      console.log("COURSE HANDICAP", courseHandicap);

      /** Compute the net_strokes = (total_strokes - course_handicap) ***/
      netStrokes = totalStrokes - courseHandicap;
      // console.log("NET STROKES", netStrokes);
    } else {
      ///////////////// IF THE ROUND IS ONLY PARTIALLY COMPLETED ///////////////////////
      /******** leave score differential and net strokes as null ******/

      //sort from lowest to highest and slice to get the two lowest
      const lowestDiffs = scoreDiffsArr.sort((a, b) => a - b).slice(0, 2);
      console.log("LOWEST DIFFS", lowestDiffs);

      playerIndex = (
        lowestDiffs.reduce((a, b) => a + b, 0) / lowestDiffs.length
      ).toFixed(1);
      console.log("PLAYER INDEX", playerIndex);

      /** Compute the course_handicap = (player_index * course_slope) / 113 ***/
      courseHandicap = Math.round((playerIndex * courseSlope) / 113);
      console.log("COURSE HANDICAP", courseHandicap);
    }

    /*** ALL TABLE INSERTION HAPPENS BELOW THE CONDITIONALS THAT COMPUTE ROUND COLUMN VALUES */
    // Insert into rounds table first and grab the round_id
    const roundRes = await db.query(
      `INSERT INTO rounds
               (tournament_date, username, total_strokes, total_putts, score_differential, player_index, course_handicap, net_strokes)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
               RETURNING id, 
               tournament_date AS "tournamentDate", 
               username, 
               total_strokes AS "totalStrokes", 
               total_putts AS "totalPutts"`,
      [
        tournamentDate,
        username,
        totalStrokes,
        totalPutts,
        scoreDifferential,
        playerIndex,
        courseHandicap,
        netStrokes,
      ]
    );

    const round = roundRes.rows[0];

    /*** Insert all the strokes for the round ***/
    const strokesRes = await db.query(
      `INSERT INTO strokes
      (round_id, hole1, hole2, hole3, hole4, hole5, hole6, hole7, hole8, hole9, hole10, hole11, hole12, hole13, hole14, hole15, hole16, hole17, hole18)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING hole1, hole2, hole3, hole4, hole5, hole6, hole7, hole8, hole9, hole10, hole11, hole12, hole13, hole14, hole15, hole16, hole17, hole18`,
      [round.id, ...Object.values(strokes)]
    );

    /*** Insert all the putts for the round ***/
    const puttsRes = await db.query(
      `INSERT INTO putts
      (round_id, hole1, hole2, hole3, hole4, hole5, hole6, hole7, hole8, hole9, hole10, hole11, hole12, hole13, hole14, hole15, hole16, hole17, hole18)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING hole1, hole2, hole3, hole4, hole5, hole6, hole7, hole8, hole9, hole10, hole11, hole12, hole13, hole14, hole15, hole16, hole17, hole18`,
      [round.id, ...Object.values(putts)]
    );

    round.strokes = strokesRes.rows[0];
    round.putts = puttsRes.rows[0];
    return round;
  }

  /** Search all rounds in database by username or tournament_date.
   *
   * Returns [{ tournament_date, username, strokes, putts }, ...]
   *  where strokes is {hole1, hole2, hole3, ...}
   *  and putts is {hole1, hole2, hole3, ...}
   * */

  static async findAll(searchFilters = {}) {
    let query = `SELECT id, 
                      tournament_date AS "tournamentDate", 
                      username, 
                      total_strokes AS "totalStrokes", 
                      net_strokes AS "netStrokes", 
                      total_putts AS "totalPutts", 
                      player_index AS "playerIndex", 
                      score_differential AS "scoreDifferential", 
                      course_handicap AS "courseHandicap"
                  FROM rounds`;

    const { username, date } = searchFilters;

    let whereExpressions = [];
    let queryValues = [];

    if (username) {
      queryValues.push(username);
      whereExpressions.push(`username = $${queryValues.length}`);
    }

    if (date) {
      queryValues.push(date);
      whereExpressions.push(`tournament_date = $${queryValues.length}`);
    }

    // .join will only actually run if whereExpressions.length > 1
    if (whereExpressions.length > 0) {
      query += " WHERE " + whereExpressions.join(" AND ");
    }

    query += " ORDER BY tournament_date DESC";

    const roundsRes = await db.query(query, queryValues);

    const rounds = roundsRes.rows;

    return rounds;
  }

  /** Find all rounds in database for a particular user.
   *
   *
   * Returns [{ tournament_date, username, strokes, putts }, ...]
   *  where strokes is {hole1, hole2, hole3, ...}
   *  and putts is {hole1, hole2, hole3, ...}
   * */

  static async getByUsername(username) {
    const roundsRes = await db.query(
      `SELECT id, 
      tournament_date AS "tournamentDate",
      course_handle AS "courseHandle",
      courses.name AS "courseName",
      total_strokes AS "totalStrokes",
      course_handicap AS "courseHandicap",
      player_index AS "playerIndex",
      net_strokes AS "netStrokes",
      total_putts AS "totalPutts"
   FROM rounds
   JOIN tournaments ON rounds.tournament_date = tournaments.date
   JOIN courses ON tournaments.course_handle = courses.handle
   WHERE username = $1
   ORDER BY tournament_date DESC`,
      [username]
    );

    if (roundsRes.rows.length === 0) {
      throw new NotFoundError(`No rounds found for user ${username}`, 404);
    }
    const rounds = roundsRes.rows;

    //map an array of roundIds and courseHandles to efficiently query strokes and putts and pars tables
    const roundsIds = rounds.map((r) => r.id);
    const courseHandles = rounds.map((r) => `'${r.courseHandle}'`);

    const strokesRes = await db.query(
      `SELECT *
          FROM strokes
          WHERE round_id IN (${roundsIds.join(", ")})`
    );

    const puttsRes = await db.query(
      `SELECT *
          FROM putts
          WHERE round_id IN (${roundsIds.join(", ")})`
    );
    const parsRes = await db.query(
      `SELECT *
          FROM pars
          WHERE course_handle IN (${courseHandles.join(", ")})`
    );

    const greeniesRes = await db.query(
      `SELECT greenies.id, 
              round_id AS "roundId", 
              first_name AS "firstName",
              last_name AS "lastName",
              tournament_date AS "tournamentDate", 
              name AS "courseName", 
              hole_number AS "holeNumber", 
              img_url AS "courseImg",
              feet, 
              inches
            FROM greenies
            JOIN rounds ON greenies.round_id = rounds.id
            JOIN tournaments ON rounds.tournament_date = tournaments.date
            JOIN courses ON tournaments.course_handle = courses.handle
            JOIN users ON rounds.username=users.username
            WHERE round_id IN (${roundsIds.join(", ")})
            ORDER BY hole_number`
    );

    const strokes = strokesRes.rows;
    const putts = puttsRes.rows;
    const pars = parsRes.rows;
    const greenies = greeniesRes.rows;

    //map strokes and putts data to rounds
    rounds.map((r) => {
      strokes.map((s) => {
        if (s.round_id === r.id) {
          delete s.round_id;
          r.strokes = s;
        }
      });
      putts.map((p) => {
        if (p.round_id === r.id) {
          delete p.round_id;
          r.putts = p;
        }
      });
      pars.map((p) => {
        if (p.course_handle === r.courseHandle) {
          // delete p.course_handle;
          r.pars = p;
        }
      });

      //make an array to push each greenie into
      r.greenies = [];
      greenies.map((g) => {
        if (g.roundId === r.id) {
          r.greenies.push(g);
        }
      });
    });

    /** Have to wait to delete the course handles until after the above map 
     to avoid bug caused by user playing more than one round at same course */
    rounds.map((r) => {
      delete r.pars.course_handle;
    });

    return rounds;
  }

  /** Given a round_id, return all the data associated with that round.
   *
   * Returns { id, tournament_date, username, totalStrokes, totalPutts, strokes, putts, greenies}
   *  where strokes is {hole1, hole2, hole3, ...}
   *  and putts is {hole1, hole2, hole3, ...}
   *  and greenies is {id, roundId, tournamentDate, holeNumber, feet, inches, firstName, lastName, courseImg, courseName}
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const roundRes = await db.query(
      `SELECT id, 
                  tournament_date AS "tournamentDate",
                  username, 
                  total_strokes AS "totalStrokes",
                  total_putts AS "totalPutts", 
                  courses.name AS "courseName",
                  courses.img_url AS "courseImg",
                  courses.rating AS "courseRating",
                  courses.slope AS "courseSlope"
            FROM rounds 
            JOIN tournaments ON tournaments.date=rounds.tournament_date
            JOIN courses ON tournaments.course_handle=courses.handle
            WHERE id = $1`,
      [id]
    );

    const round = roundRes.rows[0];

    if (!round) throw new NotFoundError(`No round: ${id}`);

    const strokesRes = await db.query(
      `SELECT hole1, hole2, hole3, hole4, hole5, hole6, hole7, hole8, hole9, hole10, hole11, hole12, hole13, hole14, hole15, hole16, hole17, hole18
             FROM strokes
             WHERE round_id = $1`,
      [id]
    );

    const puttsRes = await db.query(
      `SELECT hole1, hole2, hole3, hole4, hole5, hole6, hole7, hole8, hole9, hole10, hole11, hole12, hole13, hole14, hole15, hole16, hole17, hole18
             FROM putts
             WHERE round_id = $1`,
      [id]
    );

    const parsRes = await db.query(
      `SELECT hole1, hole2, hole3, hole4, hole5, hole6, hole7, hole8, hole9, hole10, hole11, hole12, hole13, hole14, hole15, hole16, hole17, hole18, total
             FROM rounds
             JOIN tournaments ON tournaments.date=rounds.tournament_date
             JOIN courses ON tournaments.course_handle=courses.handle
             JOIN pars ON pars.course_handle=courses.handle
             WHERE id = $1`,
      [id]
    );

    const greeniesRes = await db.query(
      `SELECT greenies.id, 
              round_id AS "roundId", 
              first_name AS "firstName",
              last_name AS "lastName",
              tournament_date AS "tournamentDate", 
              name AS "courseName", 
              hole_number AS "holeNumber", 
              img_url AS "courseImg",
              feet, 
              inches
          FROM greenies
          JOIN rounds ON greenies.round_id = rounds.id
          JOIN tournaments ON rounds.tournament_date = tournaments.date
          JOIN courses ON tournaments.course_handle = courses.handle
          JOIN users ON rounds.username=users.username
          WHERE round_id = $1
          ORDER BY hole_number`,
      [id]
    );

    /*******  Grab the last 4 score differentials for the user who's round this is to be displayed on handicaps tab of a round details page  ************/
    // make sure the rounds are the previous 4 starting from the round we are looking at in this round.get method
    const scoreDiffRes = await db.query(
      `SELECT tournament_date AS "tournamentDate",
                  score_differential AS "scoreDifferential",
                  total_strokes AS "totalStrokes"
                  FROM rounds 
                  WHERE username=$1 AND score_differential IS NOT NULL AND tournament_date < $2
                  ORDER BY tournament_date DESC LIMIT 4`,
      [round.username, round.tournamentDate]
    );

    round.strokes = strokesRes.rows[0];
    round.putts = puttsRes.rows[0];
    round.pars = parsRes.rows[0];
    round.greenies = greeniesRes.rows;
    round.recentScoreDiffs = scoreDiffRes.rows;

    return round;
  }

  /** Update a round's strokes and putts `data`
   *  which will also trigger a re-calculation of
   *  total_strokes, total_puts, player_index, score_differential, and course_handicap
   *
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {strokes, putts}
   *  where strokes could be any of {hole1, hole2, ..., hole18}
   *  and putts could be any of {hole1, hole2, ..., hole18}
   *
   * Returns { id, tournamentDate, username, totalStrokes, totalPutts, strokes, putts }
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    //Throw bad request error if data is empty
    if (Object.keys(data).length === 0) throw new BadRequestError("No data");

    const { strokes, putts, username } = data;

    /** STEP 1 : Sum strokes and putts objects to get new total_strokes and total_putts */
    const totalStrokes = Object.values(strokes).reduce((a, b) => a + b, 0);
    const totalPutts = Object.values(putts).reduce((a, b) => a + b, 0);
    // console.log("TOTAL STROKES", totalStrokes);
    // console.log("TOTAL PUTTS", totalPutts);

    /** Query courses table for rating and slope */
    const courseRes = await db.query(
      `SELECT rating AS "courseRating", slope AS "courseSlope"
        FROM rounds 
        JOIN tournaments ON tournaments.date = rounds.tournament_date
        JOIN courses ON tournaments.course_handle = courses.handle
        WHERE rounds.id = $1`,
      [id]
    );
    if (!courseRes.rows[0]) throw new NotFoundError(`No round id: ${id}`);

    const { courseRating, courseSlope } = courseRes.rows[0];

    /*******  Compute player_index by averaging lowest 2 of last 4 score diffs
     * NOT INCLUDING THE ROUND BEING EDITED BY USING OFFSET! ************/
    const scoreDiffRes = await db.query(
      `SELECT tournament_date AS "tournamentDate",
                      score_differential AS "scoreDifferential" 
                      FROM rounds 
                      WHERE username=$1 
                      ORDER BY tournament_date DESC LIMIT 4 OFFSET 1`,
      [username]
    );

    // make array of last 4 scoreDifferentials ['18.3', '22.1', '19.5', '24.4']
    const scoreDiffsArr = scoreDiffRes.rows.map((r) => +r.scoreDifferential);

    //if this is the players first round start them with score diff of 0
    if (scoreDiffsArr.length === 0) {
      scoreDiffsArr.push(0);
    }
    console.log("SCORE DIFFS ARRAY", scoreDiffsArr);

    // if the round is completed, these values will be reassigned in the "if" block
    let scoreDifferential = null;
    let netStrokes = null;
    let playerIndex;
    let courseHandicap;

    ///////////////// IF THE ROUND IS FULLY COMPLETED ///////////////////////
    /******** calculate the score differential and net strokes  ******/
    if (
      Object.values(strokes).every((val) => val !== null) &&
      Object.values(putts).every((val) => val !== null)
    ) {
      /** Compute score_differential = (113 / course_slope) * (total_strokes - course_rating) */
      scoreDifferential = +(
        (113 / courseSlope) *
        (totalStrokes - courseRating)
      ).toFixed(1);
      // console.log("SCORE DIFFERENTIAL", scoreDifferential);

      //If player has less than 4 previous rounds but more than 0, push current round scoreDifferential onto scoreDiffsArr to calculate a player index
      if (scoreDiffsArr.length > 0 && scoreDiffsArr.length < 4) {
        scoreDiffsArr.push(scoreDifferential);
      }
      console.log("SCORE DIFFS ARRAY", scoreDiffsArr);

      //sort from lowest to highest and slice to get the two lowest
      const lowestDiffs = scoreDiffsArr.sort((a, b) => a - b).slice(0, 2);
      // console.log("LOWEST DIFFS", lowestDiffs);

      playerIndex = (
        lowestDiffs.reduce((a, b) => a + b, 0) / lowestDiffs.length
      ).toFixed(1);
      console.log("PLAYER INDEX", playerIndex);

      /** Compute the course_handicap = (player_index * (course_slope)) / 113 ***/
      courseHandicap = Math.round((playerIndex * courseSlope) / 113);
      console.log("COURSE HANDICAP", courseHandicap);

      /** Compute the net_strokes = (total_strokes - course_handicap) ***/
      netStrokes = totalStrokes - courseHandicap;
      // console.log("NET STROKES", netStrokes);
    } else {
      ///////////////// IF THE ROUND IS ONLY PARTIALLY COMPLETED ///////////////////////
      /******** leave score differential and net strokes as null ******/

      //sort from lowest to highest and slice to get the two lowest
      const lowestDiffs = scoreDiffsArr.sort((a, b) => a - b).slice(0, 2);
      console.log("LOWEST DIFFS", lowestDiffs);

      playerIndex = (
        lowestDiffs.reduce((a, b) => a + b, 0) / lowestDiffs.length
      ).toFixed(1);
      console.log("PLAYER INDEX", playerIndex);

      /** Compute the course_handicap = (player_index * course_slope) / 113 ***/
      courseHandicap = Math.round((playerIndex * courseSlope) / 113);
      console.log("COURSE HANDICAP", courseHandicap);
    }

    /*** ALL TABLE UPDATES HAPPEN BELOW THE CONDITIONALS THAT COMPUTE ROUND COLUMN VALUES */
    /*** Update all computed data into rounds table ***/
    const roundRes = await db.query(
      `UPDATE rounds
               SET total_strokes=$1, total_putts=$2, score_differential=$3, player_index=$4, course_handicap=$5, net_strokes=$6
               WHERE id=$7
               RETURNING id, tournament_date AS "tournamentDate", username, total_strokes AS "totalStrokes", total_putts AS "totalPutts"`,
      [
        totalStrokes,
        totalPutts,
        scoreDifferential,
        playerIndex,
        courseHandicap,
        netStrokes,
        id,
      ]
    );

    const round = roundRes.rows[0];

    /*** Insert all the strokes for the round ***/
    const strokesRes = await db.query(
      `UPDATE strokes SET hole1=$1, hole2=$2, hole3=$3, hole4=$4, hole5=$5, hole6=$6, hole7=$7, hole8=$8, hole9=$9, hole10=$10, hole11=$11, hole12=$12, hole13=$13, hole14=$14, hole15=$15, hole16=$16, hole17=$17, hole18=$18
          WHERE round_id=$19
          RETURNING hole1, hole2, hole3, hole4, hole5, hole6, hole7, hole8, hole9, hole10, hole11, hole12, hole13, hole14, hole15, hole16, hole17, hole18`,
      [...Object.values(strokes), round.id]
    );

    /*** Insert all the putts for the round ***/
    const puttsRes = await db.query(
      `UPDATE putts SET hole1=$1, hole2=$2, hole3=$3, hole4=$4, hole5=$5, hole6=$6, hole7=$7, hole8=$8, hole9=$9, hole10=$10, hole11=$11, hole12=$12, hole13=$13, hole14=$14, hole15=$15, hole16=$16, hole17=$17, hole18=$18
          WHERE round_id=$19
          RETURNING hole1, hole2, hole3, hole4, hole5, hole6, hole7, hole8, hole9, hole10, hole11, hole12, hole13, hole14, hole15, hole16, hole17, hole18`,
      [...Object.values(putts), round.id]
    );

    round.strokes = strokesRes.rows[0];
    round.putts = puttsRes.rows[0];
    return round;
  }

  static async remove(id) {
    const result = await db.query(
      `DELETE
             FROM rounds
             WHERE id = $1
             RETURNING id`,
      [id]
    );
    const round = result.rows[0];

    if (!round) throw new NotFoundError(`No round id: ${id}`);
  }
}

module.exports = Round;
