import { useContext } from "react";
import { Route, Routes, Navigate, Outlet } from "react-router-dom";
import UserContext from "../lib/UserContext";

/***** MEMBERS (USERS) *****/
import MemberList from "../pages/members/MemberList";
import MemberDetails from "../pages/members/MemberDetails";
import MemberUpdate from "../pages/members/MemberUpdate";

/***** COURSES *****/
import CourseList from "../pages/courses/CourseList";
import CourseDetails from "../pages/courses/CourseDetails";
import CourseCreate from "../pages/courses/CourseForm";
import CourseUpdate from "../pages/courses/CourseUpdate";

/***** GREENIES *****/
import GreenieList from "../pages/greenies/GreenieList";

/***** TOURNAMENTS *****/
import TournamentList from "../pages/tournaments/page";
import TournamentDetails from "../pages/tournaments/[date]/page";
import TournamentCreate from "../pages/tournaments/TournamentCreate";
import TournamentUpdate from "../pages/tournaments/TournamentUpdate";

/***** ROUNDS *****/
import RoundDetails from "../pages/round/page";

/***** AUTH *****/
import LoginForm from "../pages/auth/LoginForm";
import RegisterForm from "../pages/auth/RegisterForm";
import ProfileForm from "../pages/auth/ProfileForm";

/***** MISC *****/
import Standings from "../pages/standings/page";
import Dashboard from "../pages/dashboard/DashboardDetails";
import Information from "../pages/information/InformationDetails";
import Homepage from "../pages/Homepage";

/** Site-wide routes.
 *
 * Accessing some Routes requires a user to be logged in.
 * Those routes are wrapped by <PrivateRoute>, which functions
 * as an authorization component.
 *
 * Visiting a non-existant route redirects to the homepage.
 */

const PrivateRoutes = () => {
  const { currentUser } = useContext(UserContext);

  return currentUser ? <Outlet /> : <Navigate to="/login" />;
};

export default function Router({ login, register, logout }) {
  return (
    <Routes>
      <Route exact path="/" element={<Homepage />} />

      <Route exact path="/login" element={<LoginForm login={login} />} />
      <Route
        exact
        path="/register"
        element={<RegisterForm register={register} />}
      />
      <Route exact path="/profile" element={<ProfileForm />} />

      <Route element={<PrivateRoutes />}>
        <Route exact path="/dashboard" element={<Dashboard />} />
      </Route>

      <Route exact path="/standings" element={<Standings />} />
      <Route exact path="/information" element={<Information />} />

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

      <Route exact path="/greenies" element={<GreenieList />} />

      {/* Redirect to homepage if route doesn't exist */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
