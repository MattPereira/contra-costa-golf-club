import React, { useState, useEffect } from "react";
import CcgcApi from "../../api/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import TournamentForm from "./TournamentForm";

/** This component is used to fetch courseHandle data to pass to <TournamentCreateForm/>
 *  in order to populate the form's select field with the course options
 *
 * Routed as /tournaments/:date/new
 * Routes -> TournamentCreate -> TournamentCreateForm
 */

const TournamentCreate = () => {
  /** Fetch the courses data first to set formData state properly */
  const [courses, setCourses] = useState(null);

  // Grab all courses from API to make an array of course handles for select input
  /* On component mount, load courses from API */
  useEffect(function getCoursesOnMount() {
    console.debug("TournamentCreate useEffect getCoursesOnMount");

    async function fetchAllCourses() {
      let courses = await CcgcApi.getCourses();
      setCourses(courses);
    }
    fetchAllCourses();
  }, []);

  if (!courses) return <LoadingSpinner />;

  const courseHandles = courses.map((c) => c.handle);

  return (
    <div>
      <TournamentForm courseHandles={courseHandles} />
    </div>
  );
};

export default TournamentCreate;
