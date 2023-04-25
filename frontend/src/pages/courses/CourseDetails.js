import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import CcgcApi from "../../api/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import PageHero from "../../components/PageHero";
import courseImage from "../../assets/golf-courses.jpg";

import { Container, Row, Table } from "react-bootstrap";
import { Box } from "@mui/material";

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

      <Container className="py-5">
        <Row className="justify-content-center">
          <div className="col-lg-9">
            <Table responsive bordered className="mb-3">
              <thead>
                <tr className="table-dark">
                  <th>Name</th>
                  <th>Rating</th>
                  <th>Slope</th>
                </tr>
              </thead>
              <tbody>
                <tr className="table-light">
                  <td>{course.name}</td>
                  <td>{course.rating}</td>
                  <td>{course.slope}</td>
                </tr>
              </tbody>
            </Table>
            <img
              src={course.imgUrl}
              alt={`${course.name}`}
              className="img-fluid mb-3"
            />

            <div className="mb-5">
              <CourseTable
                key={course.handle}
                handle={course.handle}
                name={course.name}
                rating={course.rating}
                slope={course.slope}
                pars={course.pars}
                handicaps={course.handicaps}
              />
            </div>
          </div>
        </Row>
      </Container>
    </Box>
  );
}

function CourseTable({ pars, handicaps, slope, rating }) {
  return (
    <Table responsive bordered hover className="text-center">
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
          {Object.values(pars).map((p) => (
            <td key={uuidv4()}>{p}</td>
          ))}
        </tr>

        <tr className="table-light">
          <th>HCP</th>
          {Object.values(handicaps).map((h) => (
            <td key={uuidv4()}>{h}</td>
          ))}
          <td>--</td>
        </tr>
      </tbody>
    </Table>
  );
}
