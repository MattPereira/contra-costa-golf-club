"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for greenies. */

class Greenie {
  /** Create a greenie (from data), update db, return new greenie data.
   *
   * data should be { roundId, holeNumber, feet, inches}
   *
   * Returns { id, roundId, holeNumber, feet, inches }
   *
   * */
  static async create({ roundId, holeNumber, feet, inches }) {
    //block a user from inputing more than one greenie per hole for one round
    const duplicateCheck = await db.query(
      `SELECT round_id, hole_number
           FROM greenies
           WHERE round_id = $1 AND hole_number = $2`,
      [roundId, holeNumber]
    );

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Only allowed to submit one greenie per hole`);

    const greenieRes = await db.query(
      `INSERT INTO greenies
           (round_id, hole_number, feet, inches)
           VALUES ($1, $2, $3, $4)
           RETURNING id, round_id AS "roundId", hole_number AS "holeNumber", feet, inches`,
      [roundId, holeNumber, feet, inches]
    );

    const greenie = greenieRes.rows[0];

    return greenie;
  }

  /** Find all greenies
   * sorted by feet and inches
   * from shortest to longest distance
   *
   *  Optionally pass in a tournament_date
   *   to get only the greenies for a specific tournament
   *
   * Returns [{ roundId, holeNumber, feet, inches }, ...]
   *
   *
   * */

  // TEMPORARY CHANGE TO SHOW ONLY 2022-23 GREENIES
  static async findAll(date) {
    let query = `SELECT greenies.id, 
                  round_id AS "roundId", 
                  first_name AS "firstName",
                  last_name AS "lastName",
                  tournament_date AS "tournamentDate",
                  name AS "courseName",
                  img_url AS "courseImg",
                  hole_number AS "holeNumber", 
                  feet, 
                  inches
              FROM greenies
              JOIN rounds ON greenies.round_id = rounds.id
              JOIN tournaments ON rounds.tournament_date = tournaments.date
              JOIN courses ON tournaments.course_handle = courses.handle
              JOIN users ON rounds.username=users.username`;
    let queryValues = [];
    //always order by distance from cup
    if (date !== undefined) {
      //add WHERE clause if date is passed in as a parameter
      query += " WHERE tournament_date = $1";
      queryValues.push(date);
      query += " ORDER BY feet, inches";
    } else {
      //if no date is passed in
      query += " ORDER BY feet, inches";
      query += " LIMIT 10";
    }

    const greeniesRes = await db.query(query, queryValues);

    return greeniesRes.rows;
  }

  /** Given a greenie id, return data about that particular greenie
   *
   * Returns { id, roundId, tournamentDate, courseName, holeNumber, feet, inches }
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const greenieRes = await db.query(
      `SELECT greenies.id, 
              round_id AS "roundId",
              users.username,
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
          WHERE greenies.id = $1`,
      [id]
    );

    const greenie = greenieRes.rows[0];

    if (!greenie) throw new NotFoundError(`No greenie with id: ${id}`);

    return greenie;
  }

  /** Update a greenie with `data`.
   *
   * Data must include: { feet, inches}
   *
   * (hole number is fixed for now)
   *
   * Returns {id, roundId, holeNumber, feet, inches}
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    //bad request error if no data!
    if (Object.keys(data).length === 0)
      throw new BadRequestError("No data provided");

    const greenieRes = await db.query(
      `UPDATE greenies
      SET feet=$1, inches=$2
      WHERE id=$3
      RETURNING id, round_id AS "roundId", hole_number AS "holeNumber", feet, inches`,
      [data.feet, data.inches, id]
    );

    const greenie = greenieRes.rows[0];
    if (!greenie) throw new NotFoundError(`No greenie with id: ${id}`);

    return greenie;
  }

  /** Delete given greenie from the database; returns undefined.
   *
   * Throws NotFoundError if greenie not found.
   **/

  static async remove(id) {
    const result = await db.query(
      `DELETE
           FROM greenies
           WHERE id = $1
           RETURNING id`,
      [id]
    );
    const greenie = result.rows[0];

    if (!greenie) throw new NotFoundError(`No greenie with id: ${id}`);
  }
}

module.exports = Greenie;
