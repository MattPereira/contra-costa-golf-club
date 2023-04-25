"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config.js");

/** Related functions for users. */

class User {
  /** authenticate user with email, password.
   *
   * Returns { username, email, first_name, last_name, is_admin }
   *
   * Throws UnauthorizedError is user not found or wrong password.
   *
   ** Eventually try to impliment magic email link for login?
   **/

  static async authenticate(email, password) {
    // try to find the user first
    const result = await db.query(
      `SELECT email,
                  password,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  username,
                  is_admin AS "isAdmin"
           FROM users
           WHERE email = $1`,
      [email]
    );

    const user = result.rows[0];

    if (user) {
      //** TURNING OFF PASSWORD AUTH FOR NOW SINCE USERS CANT REMEMBER PASSWORDS */
      // // compare hashed password to a new hash from password
      // const isValid = await bcrypt.compare(password, user.password);
      // if (isValid === true) {
      //   //remove user's password before sending back user
      //   delete user.password;
      //   return user;
      // }
      delete user.password;

      return user;
    }

    throw new UnauthorizedError("Invalid credentials!");
  }

  /** Register user with data.
   *
   * Returns { username, email, firstName, lastName, isAdmin }
   *
   * Throws BadRequestError on duplicates.
   **/

  static async register({ email, password, firstName, lastName, isAdmin }) {
    // Set username to be lowercase firstName-lastName to use for primary key
    const username = `${firstName}-${lastName}`.toLowerCase();

    const duplicateCheck = await db.query(
      `SELECT username
           FROM users
           WHERE username = $1`,
      [username]
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate email: ${email}`);
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
      `INSERT INTO users
           (username,
            email,
            password,
            first_name,
            last_name,
            is_admin)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING username, email, first_name AS "firstName", last_name AS "lastName", is_admin AS "isAdmin"`,
      [username, email, hashedPassword, firstName, lastName, isAdmin]
    );

    const user = result.rows[0];

    return user;
  }

  /** Find all users.
   *
   * Returns [{ username, first_name, last_name, is_admin, avgStrokes, avgPutts, avgGreenies }, ...]
   *
   *
   *  bug with trying to double join users to rounds to greenies so don't do it
   **/

  static async findAll() {
    // const usersRes = await db.query(
    //   `SELECT users.username,
    //               first_name AS "firstName",
    //               last_name AS "lastName",
    //               is_admin AS "isAdmin",
    //               ROUND(AVG(total_strokes), 2) AS "avgStrokes",
    //               ROUND(AVG(total_putts), 2) AS "avgPutts",
    //               COUNT(rounds.id) AS "totalRounds"
    //        FROM users
    //        LEFT JOIN ROUNDS on users.username = rounds.username
    //        GROUP BY users.username
    //        ORDER BY AVG(total_strokes) ASC`
    // );

    const usersRes = await db.query(
      `SELECT users.username,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  is_admin AS "isAdmin",
                  email,
                  ROUND(AVG(total_strokes), 2) AS "avgStrokes",
                  ROUND(AVG(total_putts), 2) AS "avgPutts",
                  COUNT(rounds.id) AS "totalRounds"
           FROM users
           LEFT JOIN ROUNDS on users.username = rounds.username
           GROUP BY users.username
           ORDER BY COUNT(rounds.id) DESC`
    );

    const users = usersRes.rows;

    const greenieRes = await db.query(
      `SELECT username,
              COUNT(greenies.id) AS "totalGreenies"
          FROM rounds
          LEFT JOIN GREENIES on rounds.id = greenies.round_id
          GROUP BY username`
    );

    const greenies = greenieRes.rows;

    const result = {};

    result.members = users;

    users.map((m) => {
      greenies.map((g) => {
        if (g.username === m.username) {
          m.avgGreenies = (g.totalGreenies / m.totalRounds).toFixed(2);
        }
      });
    });

    return result.members;
  }

  /** Given a username, return basic data about user.
   *
   *  Returns { username, email, first_name, last_name, is_admin }
   *
   *
   */

  static async get(username) {
    const userRes = await db.query(
      `SELECT username,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email,
                  is_admin AS "isAdmin"
           FROM users
           WHERE username = $1`,
      [username]
    );

    const user = userRes.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    return user;
  }

  /** Update user data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include:
   *   { firstName, lastName, password, email }
   *
   * Returns { username, firstName, lastName, email, isAdmin }
   *
   * Throws NotFoundError if not found.
   *
   * WARNING: this function can set a new password or make a user an admin.
   * Callers of this function must be certain they have validated inputs to this
   * or a serious security risks are opened.
   */

  static async update(username, data) {
    if (Object.keys(data).length === 0) {
      throw new BadRequestError(`No data to update!`);
    }

    if (data.password) {
      data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
    }

    const { setCols, values } = sqlForPartialUpdate(data, {
      firstName: "first_name",
      lastName: "last_name",
      isAdmin: "is_admin",
    });
    const usernameVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE users 
                      SET ${setCols} 
                      WHERE username = ${usernameVarIdx} 
                      RETURNING username,
                                first_name AS "firstName",
                                last_name AS "lastName",
                                email,
                                is_admin AS "isAdmin"`;
    const result = await db.query(querySql, [...values, username]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    delete user.password;
    return user;
  }

  /** Delete given user from database; returns undefined. */

  static async remove(username) {
    let result = await db.query(
      `DELETE
           FROM users
           WHERE username = $1
           RETURNING username`,
      [username]
    );
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);
  }
}

module.exports = User;
