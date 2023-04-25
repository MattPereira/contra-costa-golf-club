"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for tour points.
 *
 * Point changes are triggered by the following events:
 * - A round creation
 * - A round update
 * - A round deletion
 * - A greenie creation
 * - A greenie update
 * - A greenie deletion
 *
 *  SPECIAL EVENT
 * Big loops triggered only in development for seeded data at bottom of class
 * (Allows for copying of local database and pushing up to heroku to handle
 *  all of the previously seeded data)
 *
 *
 */

class Point {
  /** Create a points table row for a round
   *
   *  called when a new round is created
   *
   *  uses round.tournamentDate to get pars from pars table
   *  uses round.strokes to calculate points
   *  uses round.id to insert into points table
   *
   *
   */
  static async create(round) {
    const duplicateCheck = await db.query(
      `SELECT round_id
           FROM points
           WHERE round_id = $1`,
      [round.id]
    );

    if (duplicateCheck.rows[0])
      throw new BadRequestError(
        `Points already exist for round id: ${round.id}`
      );

    const parsRes = await db.query(
      `SELECT hole1, hole2, hole3, hole4, hole5, hole6, hole7, hole8, hole9, hole10, hole11, hole12, hole13, hole14, hole15, hole16, hole17, hole18
         FROM pars
         JOIN courses ON courses.handle=pars.course_handle
         JOIN tournaments ON courses.handle=tournaments.course_handle
         WHERE tournaments.date=$1`,
      [round.tournamentDate]
    );

    //create array of 18 par values from the parsRes
    const parsArr = Object.values(parsRes.rows[0]);

    const strokesArr = Object.values(round.strokes);
    console.log(strokesArr);

    let pars = 0;
    let birdies = 0;
    let eagles = 0;
    let aces = 0;

    for (let i = 0; i < strokesArr.length; i++) {
      if (strokesArr[i] === parsArr[i]) pars++;
      else if (strokesArr[i] === parsArr[i] - 1) birdies++;
      else if (strokesArr[i] === 1) aces++;
      // now that null values are allowed, watch for shooting 2 on par 4 or 2 on par 5 to count as an eagle
      else if (
        strokesArr[i] === parsArr[i] - 2 ||
        strokesArr[i] === parsArr[i] - 3
      )
        eagles++;
    }

    // input points for hole scores with corresponding bonus multipliers
    const pointsRes = await db.query(
      `INSERT INTO points 
          (round_id, 
          participation, 
          pars, 
          birdies, 
          eagles, 
          aces)
            VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING round_id AS "roundId", participation, pars, birdies, eagles, aces`,
      [round.id, 3, pars, birdies * 2, eagles * 4, aces * 10]
    );

    return pointsRes.rows[0];
  }

  /** Update the pars, birdies, eagles, aces columns of the
   *  points table for a particular roundId
   *
   *  uses round.tournamentDate to get pars from pars table
   *  uses round.strokes to calculate points
   *  uses round.id to update points table
   *
   *  called when a round is updated
   *
   */
  static async updateScores(round) {
    const parsRes = await db.query(
      `SELECT hole1, hole2, hole3, hole4, hole5, hole6, hole7, hole8, hole9, hole10, hole11, hole12, hole13, hole14, hole15, hole16, hole17, hole18
         FROM pars
         JOIN courses ON courses.handle=pars.course_handle
         JOIN tournaments ON courses.handle=tournaments.course_handle
         WHERE tournaments.date=$1`,
      [round.tournamentDate]
    );

    const parsArr = Object.values(parsRes.rows[0]);
    const strokesArr = Object.values(round.strokes);

    let pars = 0;
    let birdies = 0;
    let eagles = 0;
    let aces = 0;

    for (let i = 0; i < strokesArr.length; i++) {
      if (strokesArr[i] === parsArr[i]) pars++;
      else if (strokesArr[i] === parsArr[i] - 1) birdies++;
      else if (strokesArr[i] === 1) aces++;
      else if (strokesArr[i] <= parsArr[i] - 2 && strokesArr[i] > 1) eagles++;
    }

    // input points for hole scores with corresponding bonus multipliers
    const pointsRes = await db.query(
      `UPDATE points 
          SET pars = $1, birdies = $2, eagles = $3, aces = $4
          WHERE round_id = $5
          RETURNING round_id AS "roundId", pars, birdies, eagles, aces`,
      [pars, birdies * 2, eagles * 4, aces * 10, round.id]
    );

    return pointsRes.rows[0];
  }

  /** Update the points for greenies
   *
   *  called when a greenie is created, updated, or deleted
   *
   *  uses greenie.roundId to get all the greenies from greenies table
   *  to calculate the total greenie points and to update the points table
   *
   */

  static async updateGreenies(greenie) {
    //Select all the existing greenies for a single roundId
    //Loop to calculate points and update points.greenies based on that
    const greeniesRes = await db.query(
      `SELECT rounds.id AS "roundId", username, feet FROM rounds
          JOIN greenies ON rounds.id=greenies.round_id
          WHERE round_id = $1`,
      [greenie.roundId]
    );

    // console.log(greenie);

    const greenies = greeniesRes.rows;

    // console.log(greenies);

    const greeniePointsArr = greenies.map((g) => {
      if (g.feet > 20) return 1;
      if (g.feet < 20 && g.feet >= 10) return 2;
      if (g.feet < 10 && g.feet >= 2) return 3;
      if (g.feet < 2) return 4;
    });

    // console.log(greeniePointsArr);

    const greeniePointTotal = greeniePointsArr.reduce(
      (acc, curr) => acc + curr,
      0
    );

    console.log(greeniePointTotal);

    const pointsRes = await db.query(
      `UPDATE points SET greenies = $1 WHERE round_id = $2
      RETURNING round_id AS "roundId", greenies`,
      [greeniePointTotal, greenie.roundId]
    );

    return pointsRes.rows[0];
  }

  /** Removes greenies points for a greenie deletion
   *
   * necessary because you can delete a greenie without deleting the round
   */

  static async removeGreenie(greenieId) {
    const greenieRes = await db.query(
      `SELECT id, round_id, feet FROM greenies WHERE id = $1`,
      [greenieId]
    );

    const greenie = greenieRes.rows[0];

    if (!greenie) throw new NotFoundError(`No greenie with id: ${greenieId}`);

    let subtrahend = 0;

    if (greenie.feet > 20) subtrahend = 1;
    if (greenie.feet < 20 && greenie.feet >= 10) subtrahend = 2;
    if (greenie.feet < 10 && greenie.feet >= 2) subtrahend = 3;
    if (greenie.feet < 2) subtrahend = 4;

    const pointsRes = await db.query(
      `UPDATE points SET greenies = greenies - $1 WHERE round_id = $2`,
      [subtrahend, greenie.round_id]
    );

    return pointsRes.rows[0];
  }

  /** Get all the points for a particular tour year
   *
   * sum the column values and group by username
   *
   * */
  static async getYearlyStandings(tourYears) {
    const standingsRes = await db.query(
      `SELECT rounds.username,
            first_name AS "firstName",
            last_name AS "lastName",
            SUM(participation) AS "participation",
            SUM(strokes) AS "strokes",
            SUM(putts) AS "putts",
            SUM(greenies) AS "greenies",
            SUM(pars) AS "pars",
            SUM(birdies) AS "birdies",
            SUM(eagles) AS "eagles",
            SUM(aces) AS "aces",
            (SUM(strokes) + SUM(putts) + SUM(greenies) + SUM(participation) + SUM(pars) + SUM(birdies) + SUM(eagles) + SUM(aces)) AS "total"
          FROM points
          JOIN rounds ON points.round_id=rounds.id
          JOIN users ON rounds.username=users.username
          JOIN tournaments ON rounds.tournament_date = tournaments.date
          WHERE tour_years = $1
          GROUP BY rounds.username, last_name, first_name
          ORDER BY total DESC`,
      [tourYears]
    );

    /// TOUR YEARS FILTER NOT WORKING WITH row_number() solution?!?!

    // const standingsRes = await db.query(
    //   `SELECT * FROM (
    //     SELECT rounds.username,
    //           first_name AS "firstName",
    //           last_name AS "lastName",
    //           participation,
    //           strokes,
    //           putts,
    //           greenies,
    //           pars,
    //           birdies,
    //           eagles,
    //           aces,
    //           (strokes + putts + greenies + participation + pars + birdies + eagles + aces) AS "total",
    //           tour_years,
    //           row_number() OVER (PARTITION BY rounds.username ORDER BY (strokes + putts + greenies + participation + pars + birdies + eagles + aces) DESC) AS rn
    //       FROM points
    //       JOIN rounds ON points.round_id=rounds.id
    //       JOIN users ON rounds.username=users.username
    //       JOIN tournaments ON rounds.tournament_date = tournaments.date
    //       WHERE tour_years = $1) AS sub
    //       WHERE rn < 4`,
    //   [tourYears]
    // );

    // rank window function partitioning by golfer id? or username? rank over the year and order by total points per round order by total descending

    // const standingsRes = await db.query(
    //   `SELECT *
    //   FROM (
    //     SELECT rounds.username,
    //     first_name AS "firstName",
    //     last_name AS "lastName",
    //     SUM(participation) AS "participation",
    //     SUM(strokes) AS "strokes",
    //     SUM(putts) AS "putts",
    //     SUM(greenies) AS "greenies",
    //     SUM(pars) AS "pars",
    //     SUM(birdies) AS "birdies",
    //     SUM(eagles) AS "eagles",
    //     SUM(aces) AS "aces",
    //     (SUM(strokes) + SUM(putts) + SUM(greenies) + SUM(participation) + SUM(pars) + SUM(birdies) + SUM(eagles) + SUM(aces)) AS "total",
    //     row_number() OVER (PARTITION BY rounds.username ORDER BY (SUM(strokes) + SUM(putts) + SUM(greenies) + SUM(participation) + SUM(pars) + SUM(birdies) + SUM(eagles) + SUM(aces)) DESC) AS rn
    //       FROM points
    //       JOIN rounds ON points.round_id=rounds.id
    //       JOIN users ON rounds.username=users.username
    //       JOIN tournaments ON rounds.tournament_date = tournaments.date
    //       WHERE tour_years = $1
    //       GROUP BY rounds.username, last_name, first_name
    //       ORDER BY total DESC) AS sub
    //       WHERE rn < 4`,
    //   [tourYears]
    // );

    return standingsRes.rows;
  }

  /** Find all points for a specific tournament_date
   *
   * sum the columns
   *
   *
   *
   * */
  static async getTournamentStandings(tournamentDate) {
    const result = await db.query(
      `SELECT rounds.id AS "roundId",
              users.username,
              first_name AS "firstName",
              last_name AS "lastName",
              participation,
              strokes,
              putts,
              greenies,
              pars,
              birdies, 
              eagles, 
              aces,
              (strokes + putts + greenies + participation + pars + birdies + eagles + aces) AS "total"
            FROM points 
            JOIN rounds ON points.round_id=rounds.id 
            JOIN users ON rounds.username=users.username
            WHERE tournament_date = $1
            ORDER BY total DESC`,
      [tournamentDate]
    );

    return result.rows;
  }

  /**
   * handle updating all the strokes points for a given tournamentDate
   *
   * call it on each round create/update?
   *
   * what happens when a round is deleted?
   * */

  static async updateStrokesPositions(tournamentDate) {
    // select all roundIds for the tournamentDate ordered by net_strokes from lowest to highest
    const strokesPosRes = await db.query(
      `SELECT id, net_strokes FROM rounds WHERE tournament_date=$1 ORDER BY net_strokes, total_strokes ASC`,
      [tournamentDate]
    );

    //make array of roundIds ordered from lowest to highest net_strokes
    const roundsIds = strokesPosRes.rows.map((r) => r.id);
    // console.log("STROKES IDS", roundsIds);
    //array of points to be awarded for each roundId by finishing position
    const strokesPoints = [25, 20, 15, 10, 5];

    const results = [];

    for (let i = 0; i < roundsIds.length; i++) {
      //the first 5 indexes of roundsIds are 1st, 2nd, 3rd, 4th, and 5th place so they get the points
      if (i < strokesPoints.length) {
        let updateRes = await db.query(
          `UPDATE points SET strokes=$1 WHERE round_id=$2 RETURNING round_id AS "roundId", strokes`,
          [strokesPoints[i], roundsIds[i]]
        );
        results.push(updateRes.rows[0]);
      } else {
        //else block will handle removal of points from roundIds that are no longer top 5
        let updateRes = await db.query(
          `UPDATE points SET strokes=$1 WHERE round_id=$2 RETURNING round_id AS "roundId", strokes`,
          [0, roundsIds[i]]
        );
        results.push(updateRes.rows[0]);
      }
    }

    return results;
  }

  /**
   * handle the updating of all the putts points for a tournamentDate
   *
   * call on each round create/update and delete?
   *
   */
  static async updatePuttsPositions(tournamentDate) {
    /*********Update the points table column "putts" **************/
    const puttsPosRes = await db.query(
      `SELECT id, total_putts FROM rounds WHERE tournament_date=$1 ORDER BY total_putts ASC`,
      [tournamentDate]
    );

    //make array of roundIds ordered from lowest to highest total_putts
    const puttsIds = puttsPosRes.rows.map((r) => r.id);
    //array of points to be awarded for each roundId by finishing position
    const puttsPoints = [6, 4, 2];

    const results = [];

    for (let i = 0; i < puttsIds.length; i++) {
      if (i < puttsPoints.length) {
        let updateRes = await db.query(
          `UPDATE points SET putts=$1 WHERE round_id=$2 RETURNING round_id AS "roundId", putts`,
          [puttsPoints[i], puttsIds[i]]
        );
        results.push(updateRes.rows[0]);
      } else {
        //else block will handle removal of putts position points from roundIds that are not longer top 3
        let updateRes = await db.query(
          `UPDATE points SET putts=$1 WHERE round_id=$2 RETURNING round_id AS "roundId", putts`,
          [0, puttsIds[i]]
        );
        results.push(updateRes.rows[0]);
      }
    }

    return results;
  }

  /**
   * handle the updating of greenie points for all
   * rounds assocatiated with a particular tournamentDate
   *
   * called only in development for adding points to seed data
   *
   */
  static async updateAllGreenies(tournamentDate) {
    /*********Update the points table column "greenies" **************/

    //have to figure out some way to sum greenies points before updating points column greenies

    const greeniesRes = await db.query(
      `SELECT rounds.id AS "roundId", username, feet FROM rounds
        JOIN greenies ON rounds.id=greenies.round_id
        WHERE tournament_date=$1`,
      [tournamentDate]
    );

    //array of objects containing roundId and points per greenie depending on feet
    const greenieObjs = greeniesRes.rows.map((g) => {
      let total = 1;
      if (g.feet < 20 && g.feet >= 10) total += 1;
      if (g.feet < 10 && g.feet >= 2) total += 2;
      if (g.feet < 2) total += 3;
      return { roundId: g.roundId, points: total };
    });

    console.log("GREENIE OBJS", greenieObjs);

    //reduce the greenieObjs to sum the points for each unique roundId
    const reducedGreenieObjs = greenieObjs.reduce((acc, item) => {
      //item points at each obj in array
      const { roundId, points } = item;
      //does roundId exist in intial object?
      if (acc[roundId]) {
        acc[roundId] += points;
      } else {
        acc[roundId] = points;
      }
      return acc;
    }, {});

    //reformat the reducedGreenieObjs
    const finalGreenieObj = Object.keys(reducedGreenieObjs).map((k) => ({
      roundId: k,
      points: reducedGreenieObjs[k],
    }));

    for (let greenie of finalGreenieObj) {
      await db.query(`UPDATE points SET greenies=$1 WHERE round_id=$2`, [
        greenie.points,
        greenie.roundId,
      ]);
    }
  }

  /**
   * Update pars, birdies, eagles and aces points for all rounds
   * associated with a particular tournamentDate
   *
   *  called only in development for adding points to seed data
   *
   */
  static async updateAllScores(tournamentDate) {
    /*********Update the points table columns pars, birdies, eagles, aces **************/
    //grab the pars for each hole for the course played using the tournamentDate
    const parsRes = await db.query(
      `SELECT hole1, hole2, hole3, hole4, hole5, hole6, hole7, hole8, hole9, hole10, hole11, hole12, hole13, hole14, hole15, hole16, hole17, hole18
         FROM pars
         JOIN courses ON courses.handle=pars.course_handle
         JOIN tournaments ON courses.handle=tournaments.course_handle
         WHERE tournaments.date=$1`,
      [tournamentDate]
    );

    //create array of 18 par values from the parsRes
    const parsArr = Object.values(parsRes.rows[0]);

    // console.log("PARS ARR", parsArr);

    //grab the roundId and strokes for each round for the tournamentDate
    const strokesRes = await db.query(
      `SELECT round_id, hole1, hole2, hole3, hole4, hole5, hole6, hole7, hole8, hole9, hole10, hole11, hole12, hole13, hole14, hole15, hole16, hole17, hole18
         FROM strokes
         JOIN rounds ON rounds.id=strokes.round_id
         WHERE rounds.tournament_date=$1`,
      [tournamentDate]
    );

    //array of objects containing roundId and strokes
    const roundsArr = strokesRes.rows.map((s) => {
      return {
        roundId: Object.values(s)[0],
        strokes: Object.values(s).slice(1, 19),
      };
    });

    // console.log("ROUNDS ARR", roundsArr);

    // console.log("ROUNDS ARR", roundsArr);

    for (let round of roundsArr) {
      // console.log("ROUND STROKES", round.strokes);
      //count the pars and birdies
      let parCount = 0;
      let birdyCount = 0;
      let eagleCount = 0;
      let aceCount = 0;
      for (let i = 0; i < round.strokes.length; i++) {
        if (round.strokes[i] === parsArr[i]) {
          parCount += 1;
        }
        if (round.strokes[i] === parsArr[i] - 1) {
          birdyCount += 1;
        }
        if (round.strokes[i] === parsArr[i] - 2) {
          eagleCount += 1;
        }
        if (round.strokes[i] === 1) {
          aceCount += 1;
        }
      }
      //Update pars, birdies, eagles, and aces including the bonus multiplier
      await db.query(
        `UPDATE points SET pars=$1, birdies=$2, eagles=$3, aces=$4 WHERE round_id=$5`,
        [parCount, birdyCount * 2, eagleCount * 4, aceCount * 10, round.roundId]
      );
    }
  }

  /////////////////// OBSOLETE ? ////////////////
  // /** UPDATE ALL
  //  *
  //  * special method for updating points table based on
  //  *  previously seeded greenie and round scores(pars, birdies, ...) data
  //  *
  //  * only called through patch request to "/points/all"
  //  *
  //  */

  // static async updateSeededData(tournamentDate) {
  //   /*********Update the points table column "greenies" **************/

  //   //have to figure out some way to sum greenies points before updating points column greenies

  //   const greeniesRes = await db.query(
  //     `SELECT rounds.id AS "roundId", username, feet FROM rounds
  //       JOIN greenies ON rounds.id=greenies.round_id
  //       WHERE tournament_date=$1`,
  //     [tournamentDate]
  //   );

  //   //array of objects containing roundId and points per greenie depending on feet
  //   const greenieObjs = greeniesRes.rows.map((g) => {
  //     let total = 1;
  //     if (g.feet < 20 && g.feet >= 10) total += 1;
  //     if (g.feet < 10 && g.feet >= 2) total += 2;
  //     if (g.feet < 2) total += 3;
  //     return { roundId: g.roundId, points: total };
  //   });

  //   console.log("GREENIE OBJS", greenieObjs);

  //   //reduce the greenieObjs to sum the points for each unique roundId
  //   const reducedGreenieObjs = greenieObjs.reduce((acc, item) => {
  //     //item points at each obj in array
  //     const { roundId, points } = item;
  //     //does roundId exist in intial object?
  //     if (acc[roundId]) {
  //       acc[roundId] += points;
  //     } else {
  //       acc[roundId] = points;
  //     }
  //     return acc;
  //   }, {});

  //   //reformat the reducedGreenieObjs
  //   const finalGreenieObj = Object.keys(reducedGreenieObjs).map((k) => ({
  //     roundId: k,
  //     points: reducedGreenieObjs[k],
  //   }));

  //   for (let greenie of finalGreenieObj) {
  //     await db.query(`UPDATE points SET greenies=$1 WHERE round_id=$2`, [
  //       greenie.points,
  //       greenie.roundId,
  //     ]);
  //   }

  //   //OBSOLETE CODE
  //   //EDGE CASE: deleting last existing greenie for a roundId will not remove the greenie points
  //   // const greenieRoundIds = greeniesRes.rows.map((g) => g.roundId);
  //   //strokesId contains all roundIds for the tournament_date
  //   // const nonGreenieRoundIds = strokesIds.filter(
  //   //   (id) => !greenieRoundIds.includes(id)
  //   // );

  //   // console.log("NON GREENIE ROUND IDS", nonGreenieRoundIds);

  //   // for (let id of nonGreenieRoundIds) {
  //   //   await db.query(`UPDATE points SET greenies=$1 WHERE round_id=$2`, [
  //   //     0,
  //   //     id,
  //   //   ]);
  //   // }

  //   /*********Update the points table columns pars, birdies, eagles, aces **************/
  //   //grab the pars for each hole for the course played using the tournamentDate
  //   const parsRes = await db.query(
  //     `SELECT hole1, hole2, hole3, hole4, hole5, hole6, hole7, hole8, hole9, hole10, hole11, hole12, hole13, hole14, hole15, hole16, hole17, hole18
  //        FROM pars
  //        JOIN courses ON courses.handle=pars.course_handle
  //        JOIN tournaments ON courses.handle=tournaments.course_handle
  //        WHERE tournaments.date=$1`,
  //     [tournamentDate]
  //   );

  //   //create array of 18 par values from the parsRes
  //   const parsArr = Object.values(parsRes.rows[0]);

  //   console.log("PARS ARR", parsArr);

  //   //grab the roundId and strokes for each round for the tournamentDate
  //   const strokesRes = await db.query(
  //     `SELECT round_id, hole1, hole2, hole3, hole4, hole5, hole6, hole7, hole8, hole9, hole10, hole11, hole12, hole13, hole14, hole15, hole16, hole17, hole18
  //        FROM strokes
  //        JOIN rounds ON rounds.id=strokes.round_id
  //        WHERE rounds.tournament_date=$1`,
  //     [tournamentDate]
  //   );

  //   //array of objects containing roundId and strokes
  //   const roundsArr = strokesRes.rows.map((s) => {
  //     return {
  //       roundId: Object.values(s)[0],
  //       strokes: Object.values(s).slice(1, 19),
  //     };
  //   });

  //   console.log("ROUNDS ARR", roundsArr);

  //   // console.log("ROUNDS ARR", roundsArr);

  //   for (let round of roundsArr) {
  //     // console.log("ROUND STROKES", round.strokes);
  //     //count the pars and birdies
  //     let parCount = 0;
  //     let birdyCount = 0;
  //     let eagleCount = 0;
  //     let aceCount = 0;
  //     for (let i = 0; i < round.strokes.length; i++) {
  //       if (round.strokes[i] === parsArr[i]) {
  //         parCount += 1;
  //       }
  //       if (round.strokes[i] === parsArr[i] - 1) {
  //         birdyCount += 1;
  //       }
  //       if (round.strokes[i] === parsArr[i] - 2) {
  //         eagleCount += 1;
  //       }
  //       if (round.strokes[i] === 1) {
  //         aceCount += 1;
  //       }
  //     }
  //     //Update pars, birdies, eagles, and aces including the bonus multiplier
  //     await db.query(
  //       `UPDATE points SET pars=$1, birdies=$2, eagles=$3, aces=$4 WHERE round_id=$5`,
  //       [parCount, birdyCount * 2, eagleCount * 4, aceCount * 10, round.roundId]
  //     );
  //   }
  // }
}
module.exports = Point;
