import React, { useState, useEffect } from "react";
import CcgcApi from "../../api/api";
import { useParams } from "react-router-dom";
import CourseForm from "./CourseForm";
import LoadingSpinner from "../../components/LoadingSpinner";

/** This component is used to fetch course data to pass to <CourseForm/>
 *  in order to populate the form with the course's current data.
 */

export default function EditCourse() {
  const { handle } = useParams();

  const [course, setCourse] = useState(null);

  /* On component mount, load course from API to populate form data */
  useEffect(() => {
    async function getCourse() {
      setCourse(await CcgcApi.getCourse(handle));
    }
    getCourse();
  }, [handle]);

  if (!course) return <LoadingSpinner />;
  console.log("COURSE", course);

  return <CourseForm course={course} />;
}
