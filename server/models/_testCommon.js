const bcrypt = require("bcrypt");

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");

const testGreeniesIds = [];
const testRoundsIds = [];

/* ON DELETE CASCADE handles the putts, strokes, pars,
 * handicaps, greenies, and points */
async function commonBeforeAll() {
  await db.query("DELETE FROM rounds");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM tournaments");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM courses");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");

  //// TEST DATA FOR USERS ////
  await db.query(
    `
        INSERT INTO users(username,
                          password,
                          first_name,
                          last_name,
                          email)
        VALUES ('u1', $1, 'U1F', 'U1L', 'u1@gmail.com'),
               ('u2', $2, 'U2F', 'U2L', 'u2@gmail.com'),
               ('u3', $3, 'U3F', 'U3L', 'u3@gmail.com')

        RETURNING username`,
    [
      await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
      await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
      await bcrypt.hash("password3", BCRYPT_WORK_FACTOR),
    ]
  );

  //// TEST DATA FOR COURSES ////
  await db.query(`
        INSERT INTO courses(handle, name, rating, slope, img_url)
        VALUES ('roddy-ranch', 'Roddy Ranch Golf Course', 77.7, 111, 'test.com/roddy-ranch.jpg'),
               ('pebble-beach', 'Pebble Beach Golf Course', 88.8, 123, 'test.com/pebble-beach.jpg'),
               ('rooster-run', 'Rooster Run Golf Course', 99.9, 124, 'test.com/rooster-run.jpg')`);

  //// TEST DATA FOR PARS ////
  await db.query(`
    INSERT INTO pars (course_handle, hole1, hole2, hole3, hole4, hole5, hole6, hole7, hole8, hole9, hole10, hole11, hole12, hole13, hole14, hole15, hole16, hole17, hole18, total)
    VALUES ('roddy-ranch', 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 72),
           ('pebble-beach', 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 90),
           ('rooster-run', 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 54)`);

  //// TEST DATA FOR HANDICAPS ////
  await db.query(`
    INSERT INTO handicaps (course_handle, hole1, hole2, hole3, hole4, hole5, hole6, hole7, hole8, hole9, hole10, hole11, hole12, hole13, hole14, hole15, hole16, hole17, hole18)
    VALUES ('roddy-ranch', 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18),
           ('pebble-beach', 18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1),
           ('rooster-run', 18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1)`);

  //// TEST DATA FOR TOURNAMENTS ////
  await db.query(`
    INSERT INTO tournaments (date, course_handle, tour_years)
    VALUES ('2022-01-01', 'roddy-ranch', '2021-22'),
          ('2022-02-02', 'pebble-beach', '2021-22'),
          ('2022-03-03', 'roddy-ranch', '2021-22')`);

  //// TEST DATA FOR ROUNDS ////
  const roundsRes = await db.query(`
    INSERT INTO rounds (tournament_date, username, total_strokes, net_strokes, total_putts, player_index, score_differential, course_handicap)
    VALUES ('2022-01-01', 'u1', 72, 72, 18, 0, 0, 0),
           ('2022-01-01', 'u2', 90, 75, 36, 17.7, 15.5, 15),
           ('2022-02-02', 'u1', 72, 72, 18, 0, 0, 0),
           ('2022-02-02', 'u2', 90, 75, 36, 17.7, 15.5, 15)
           RETURNING id`);

  testRoundsIds.splice(0, 0, ...roundsRes.rows.map((row) => row.id));

  //// TEST DATA FOR STROKES ////
  await db.query(
    `
    INSERT INTO strokes (round_id, hole1, hole2, hole3, hole4, hole5, hole6, hole7, hole8, hole9, hole10, hole11, hole12, hole13, hole14, hole15, hole16, hole17, hole18)
    VALUES ($1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4),
           ($2, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5),
           ($3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4),
           ($4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5)`,
    [testRoundsIds[0], testRoundsIds[1], testRoundsIds[2], testRoundsIds[3]]
  );

  //// TEST DATA FOR PUTTS ////
  await db.query(
    `
    INSERT INTO putts (round_id, hole1, hole2, hole3, hole4, hole5, hole6, hole7, hole8, hole9, hole10, hole11, hole12, hole13, hole14, hole15, hole16, hole17, hole18)
    VALUES ($1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1),
           ($2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2),
           ($3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1),
           ($4, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2)`,
    [testRoundsIds[0], testRoundsIds[1], testRoundsIds[2], testRoundsIds[3]]
  );

  //// TEST DATA FOR GREENIES ////
  const greenieRes = await db.query(
    `
    INSERT INTO greenies (round_id, hole_number, feet, inches)
    VALUES ($1, 1, 1, 1),
           ($1, 7, 7, 7),
           ($2, 1, 11, 11),
           ($3, 7, 7, 7)
           RETURNING id`,
    [testRoundsIds[0], testRoundsIds[1], testRoundsIds[3]]
  );

  testGreeniesIds.splice(0, 0, ...greenieRes.rows.map((row) => row.id));

  //// TEST DATA FOR POINTS ////
  await db.query(
    `
      INSERT INTO points (round_id, participation, strokes, putts, pars, birdies, eagles, aces, greenies)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [testRoundsIds[0], 3, 25, 6, 18, 0, 0, 0, 7]
  );
  await db.query(
    `
      INSERT INTO points (round_id, participation, strokes, putts, pars, birdies, eagles, aces, greenies)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [testRoundsIds[1], 3, 20, 4, 0, 0, 0, 0, 2]
  );
  await db.query(
    `
      INSERT INTO points (round_id, participation, strokes, putts, pars, birdies, eagles, aces, greenies)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [testRoundsIds[2], 3, 25, 6, 0, 36, 0, 0, 0]
  );
  await db.query(
    `
      INSERT INTO points (round_id, participation, strokes, putts, pars, birdies, eagles, aces, greenies)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [testRoundsIds[3], 3, 20, 4, 18, 0, 0, 0, 3]
  );
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testGreeniesIds,
  testRoundsIds,
};
