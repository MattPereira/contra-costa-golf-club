import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";

/** MEMBERS (USERS) **/
import MemberList from "../pages/members/MemberList";
import MemberDetails from "../pages/members/MemberDetails";
import MemberUpdate from "../pages/members/MemberUpdate";

/** COURSES */
import CourseList from "../pages/courses/CourseList";
import CourseDetails from "../pages/courses/CourseDetails";
import CourseCreate from "../pages/courses/CourseForm";
import CourseUpdate from "../pages/courses/CourseUpdate";

/** GREENIES */
import GreenieList from "../pages/greenies/GreenieList";
import GreenieDetails from "../pages/greenies/GreenieDetails";
import GreenieCreate from "../pages/greenies/GreenieCreate";
import GreenieUpdate from "../pages/greenies/GreenieUpdate";

/** TOURNAMENTS */
import TournamentList from "../pages/tournaments/TournamentList";
import TournamentDetails from "../pages/tournaments/TournamentDetails";
import TournamentCreate from "../pages/tournaments/TournamentCreate";
import TournamentUpdate from "../pages/tournaments/TournamentUpdate";

/** ROUNDS */
import RoundDetails from "../pages/rounds/RoundDetails";
import RoundCreate from "../pages/rounds/RoundCreate";
import RoundUpdate from "../pages/rounds/RoundUpdate";

/** AUTH */
import LoginForm from "../pages/auth/LoginForm";
import RegisterForm from "../pages/auth/RegisterForm";
import ProfileForm from "../pages/auth/ProfileForm";

/** MISCELLANEOUS */
import Standings from "../pages/standings/StandingsDetails";
import Dashboard from "../pages/dashboard/DashboardDetails";
import Homepage from "../pages/Homepage";

/** Site-wide routes.
 *
 * Accessing some Routes requires a user to be logged in.
 * Those routes are wrapped by <PrivateRoute>, which functions
 * as an authorization component.
 *
 * Visiting a non-existant route redirects to the homepage.
 */

export default function Router({ login, register, logout }) {
  console.debug(
    "Routes",
    `login=${typeof login}`,
    `register=${typeof register}`
  );

  return (
    <Routes>
      <Route exact path="/" element={<Homepage />} />

      <Route exact path="/login" element={<LoginForm login={login} />} />
      <Route
        exact
        path="/register"
        element={<RegisterForm register={register} />}
      />

      <Route exact path="/dashboard" element={<Dashboard />} />

      <Route exact path="/profile" element={<ProfileForm />} />

      <Route exact path="/standings" element={<Standings />} />

      <Route exact path="/members" element={<MemberList />} />
      <Route exact path="/members/:username" element={<MemberDetails />} />
      <Route exact path="/members/create" element={<RegisterForm />} />
      <Route
        exact
        path="/members/update/:username"
        element={<MemberUpdate />}
      />

      <Route exact path="/courses" element={<CourseList />} />
      <Route exact path="/courses/:handle" element={<CourseDetails />} />
      <Route exact path="/courses/create" element={<CourseCreate />} />
      <Route exact path="/courses/update/:handle" element={<CourseUpdate />} />

      <Route exact path="/tournaments" element={<TournamentList />} />
      <Route exact path="/tournaments/:date" element={<TournamentDetails />} />
      <Route exact path="/tournaments/create/" element={<TournamentCreate />} />
      <Route
        exact
        path="/tournaments/update/:date"
        element={<TournamentUpdate />}
      />

      <Route exact path="/rounds/:id" element={<RoundDetails />} />
      <Route exact path="/rounds/create/:date" element={<RoundCreate />} />
      <Route exact path="/rounds/update/:id" element={<RoundUpdate />} />

      <Route exact path="/greenies" element={<GreenieList />} />
      <Route exact path="/greenies/:id" element={<GreenieDetails />} />
      <Route exact path="/greenies/create/:date" element={<GreenieCreate />} />
      <Route exact path="/greenies/update/:id" element={<GreenieUpdate />} />

      {/* Redirect to homepage if route doesn't exist */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
