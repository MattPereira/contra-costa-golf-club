import React, { useState, useEffect } from "react";
import CcgcApi from "../../api/api";
import { useParams } from "react-router-dom";
import TournamentForm from "./TournamentForm";
import LoadingSpinner from "../../components/LoadingSpinner";

/** This component is used to fetch tournament data to pass to <TournamentUpdateForm/>
 *  in order to populate the form with the course's current data.
 *
 * Routed as /tournaments/:date/edit
 * Routes -> TournamentUpdate -> TournamentUpdateForm
 */

const TournamentUpdate = () => {
  const { date } = useParams();

  /** Fetch the courses and tournament data first to set formData state properly */
  const [courses, setCourses] = useState(null);
  const [tournament, setTournament] = useState(null);

  /* On component mount, load tournament and courses from API to populate form data */
  useEffect(
    function getFormDataOnMount() {
      console.debug("TournamentUpdate useEffect getFormDataOnMount");

      async function getTournament() {
        setTournament(await CcgcApi.getTournament(date));
      }

      async function fetchAllCourses() {
        let courses = await CcgcApi.getCourses();
        setCourses(courses);
      }
      fetchAllCourses();
      getTournament();
    },
    [date]
  );

  console.debug("TournamentUpdate", "tournament=", tournament);

  if (!tournament || !courses) return <LoadingSpinner />;

  console.log(tournament);

  const courseHandles = courses.map((c) => c.handle);

  return (
    <div>
      <TournamentForm tournament={tournament} courseHandles={courseHandles} />
    </div>
  );
};

export default TournamentUpdate;
