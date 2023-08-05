import React, { useEffect, useState, useContext } from "react";
import UserContext from "../../lib/UserContext";

import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import CcgcApi from "../../api/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import PageHero from "../../components/PageHero";
import courseImage from "../../assets/golf-courses.jpg";

import { Table } from "react-bootstrap";
import { Box, Button, Container } from "@mui/material";

/** Course details page.
 *
 * On component mount, load the course data from API
 * which includes the pars and handicaps for the course.
 *
 * Also offer edit and delete buttons for admins users only.
 *
 * This is routed to path "/courses/:handle"
 *
 * Routes -> CourseDetails -> {AdminButtons, CourseTable}
 *
 */

export default function CourseDetails() {
  const { currentUser } = useContext(UserContext);
  const { handle } = useParams();

  console.debug("CourseDetails", "handle=", handle);

  const [course, setCourse] = useState(null);

  /* On component mount, load course data from API */
  useEffect(
    function getCourseOnMount() {
      console.debug("CourseDetails useEffect getCourseOnMount");

      async function getCourse() {
        setCourse(await CcgcApi.getCourse(handle));
      }
      getCourse();
    },
    [handle]
  );

  if (!course) return <LoadingSpinner />;

  console.log(course);

  return (
    <Box>
      <PageHero title="Course Details" backgroundImage={courseImage} />

      <Container sx={{ py: 10 }}>
        <Box
          component="img"
          src={course.imgUrl}
          alt={`${course.name}`}
          sx={{ width: "100%" }}
        />
        <div className="mb-5">
          <Table responsive bordered hover className="text-center">
            <thead>
              <tr className="table-dark">
                <th colspan={10}>Name</th>
                <th colspan={5}>Rating</th>
                <th colspan={5}>Slope</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={10}>{course.name}</td>
                <td colSpan={5}>{course.rating}</td>
                <td colspan={5}>{course.slope}</td>
              </tr>
            </tbody>
            <thead>
              <tr className="table-dark">
                <th>HOLE</th>
                {Array.from({ length: 18 }, (_, i) => (
                  <th key={i + 1}>{i + 1}</th>
                ))}
                <th>TOT</th>
              </tr>
            </thead>
            <tbody>
              <tr className="table-secondary">
                <th>PAR</th>
                {Object.values(course.pars).map((p) => (
                  <td key={uuidv4()}>{p}</td>
                ))}
              </tr>

              <tr className="table-light">
                <th>HCP</th>
                {Object.values(course.handicaps).map((h) => (
                  <td key={uuidv4()}>{h}</td>
                ))}
                <td>--</td>
              </tr>
            </tbody>
          </Table>
        </div>

        {currentUser && currentUser.isAdmin && (
          <Box sx={{ mt: 3, display: "flex", justifyContent: "end" }}>
            <Button variant="contained" href={`/courses/update/${handle}`}>
              Edit Course
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
}
