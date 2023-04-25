import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:3001";

/** API Class.
 *
 * Static class tying together methods used to get/send to to the API.
 * There shouldn't be any frontend-specific stuff here, and there shouldn't
 * be any API-aware stuff elsewhere in the frontend.
 *
 */

class CcgcApi {
  // the token for interaction with the API will be stored here.
  static token;

  static async request(endpoint, data = {}, method = "get") {
    console.debug("API Call:", endpoint, data, method);

    //there are multiple ways to pass an authorization token, this is how you pass it in the header.
    //this has been provided to show you another way to pass the token.
    const url = `${BASE_URL}/${endpoint}`;
    const headers = { Authorization: `Bearer ${CcgcApi.token}` };
    const params = method === "get" ? data : {};

    try {
      return (await axios({ url, method, data, params, headers })).data;
    } catch (err) {
      console.error("API Error:", err.response);
      let message = err.response.data.error.message;
      throw Array.isArray(message) ? message : [message];
    }
  }

  //////////////////// AUTH ROUTES ////////////////////
  /***** Register for site.  *****/
  static async register(data) {
    let res = await this.request(`auth/register`, data, "post");
    return res.token;
  }

  /***** Login to site.  *****/
  static async login(data) {
    let res = await this.request(`auth/token`, data, "post");
    return res.token;
  }

  /***** Get the current user. *****/
  static async getUser(username) {
    let res = await this.request(`users/${username}`);
    return res.user;
  }

  //////////////////// USER ROUTES ////////////////////
  /***** Get all club members. *****/
  static async getMembers() {
    let res = await this.request(`users`);
    return res.users;
  }

  /***** Update a user profile  *****/
  static async updateProfile(username, data) {
    let res = await this.request(`users/${username}`, data, "patch");
    return res.user;
  }

  /***** Admin can add a new member */
  static async createMember(data) {
    let res = await this.request(`users`, data, "post");
    return res.user;
  }

  /***** Admin can update a member */

  /***** Admin can delete a member */
  static async deleteMember(username) {
    let res = await this.request(`users/${username}`, {}, "delete");
    return res.deleted;
  }

  //////////////////// COURSE ROUTES ////////////////////
  /** Get all courses */
  static async getCourses() {
    let res = await this.request("courses");
    return res.courses;
  }

  /** Get a course by handle */
  static async getCourse(handle) {
    let res = await this.request(`courses/${handle}`);
    return res.course;
  }

  /** Create a new course */
  static async createCourse(data) {
    let res = await this.request("courses", data, "post");
    return res.course;
  }

  /** Update a course */
  static async updateCourse(handle, data) {
    let res = await this.request(`courses/${handle}`, data, "patch");
    return res.course;
  }

  /** Delete a course */
  static async deleteCourse(handle, data) {
    let res = await this.request(`courses/${handle}`, data, "delete");
    return res.deleted;
  }

  //////////////////// TOURNAMENT ROUTES ////////////////////
  /** Get all tournaments */
  static async getTournaments() {
    let res = await this.request("tournaments");
    return res.tournaments;
  }

  /** Get a tournament  by date. */
  static async getTournament(date) {
    let res = await this.request(`tournaments/${date}`);
    return res.tournament;
  }

  /** Get the upcoming tournament (for the home page) */
  static async getUpcomingTournament() {
    let res = await this.request(`tournaments/upcoming`);
    return res.tournament;
  }

  /** Create a new tournament */
  static async createTournament(data) {
    let res = await this.request("tournaments", data, "post");
    return res.tournament;
  }

  /** Update a tournament by date */
  static async updateTournament(date, data) {
    let res = await this.request(`tournaments/${date}`, data, "patch");
    return res.tournament;
  }

  /** Delete a tournament by date */
  static async deleteTournament(date, data) {
    let res = await this.request(`tournaments/${date}`, data, "delete");
    return res.deleted;
  }

  ///////////////////////////  ROUND ROUTES /////////////////////////////
  /** Get all rounds (filtered by username) */
  static async getRoundsByUsername(username) {
    let res = await this.request(`rounds`, { username: username });
    return res.rounds;
  }

  /** Get all rounds (filtered by tournament_date) */
  static async getRoundsByDate(date) {
    let res = await this.request(`rounds`, { date: date });
    return res.rounds;
  }

  /** Get a round by id*/
  static async getRound(id) {
    let res = await this.request(`rounds/${id}`);
    return res.round;
  }

  /** Create a new round */
  static async createRound(data) {
    let res = await this.request("rounds", data, "post");
    return res.round;
  }

  /** Update a round by id */
  static async updateRound(id, data) {
    let res = await this.request(`rounds/${id}`, data, "patch");
    return res.round;
  }

  /** Delete a round by id */
  static async deleteRound(id, data) {
    let res = await this.request(`rounds/${id}`, data, "delete");
    return res.deleted;
  }

  //////////////////// GREENIE ROUTES ////////////////////
  /** Get all greenies (optionally filter by tournament_date) */
  static async getGreenies(date) {
    let res = await this.request("greenies", { date: date });
    return res.greenies;
  }

  /** Get a greenie by id */
  static async getGreenie(id) {
    let res = await this.request(`greenies/${id}`);
    return res.greenie;
  }

  /** Create a new greenie */
  static async createGreenie(data) {
    let res = await this.request(`greenies`, data, "post");
    return res.greenie;
  }

  /** Update a greenie by id */
  static async updateGreenie(id, data) {
    let res = await this.request(`greenies/${id}`, data, "patch");
    return res.greenie;
  }

  /** Delete a greenie by id */
  static async deleteGreenie(id, data) {
    let res = await this.request(`greenies/${id}`, data, "delete");
    return res.greenie;
  }

  //////////////////// POINTS ROUTES ////////////////////
  /**Get season standings points */
  static async getStandings(tourYears) {
    let res = await this.request(`points/standings/${tourYears}`);
    return res.standings;
  }

  // /**Get points generated by a tournament */
  // static async getPoints(date) {
  //   let res = await this.request(`points/${date}`);
  //   return res.points;
  // }
}

export default CcgcApi;
