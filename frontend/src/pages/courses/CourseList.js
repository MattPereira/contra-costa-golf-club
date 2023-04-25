import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import CcgcApi from "../../api/api";

import { Container, Grid, Box, Paper, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

import PageHero from "../../components/PageHero";
import LoadingSpinner from "../../components/LoadingSpinner";
import courseImage from "../../assets/golf-courses.jpg";

/** Show page with all courses listed
 *
 * On component mount, load courses from API to pass to CourseCard
 *
 * This is routed to path "/courses"
 *
 * Router -> CourseList -> CourseCard
 */

export default function CourseList() {
  console.debug("CourseList");

  const [courses, setCourses] = useState(null);

  /* On component mount, load courses from API */
  useEffect(function getCoursesOnMount() {
    console.debug("CourseList useEffect getCoursesOnMount");

    async function fetchAllCourses() {
      let courses = await CcgcApi.getCourses();
      setCourses(courses);
    }
    fetchAllCourses();
  }, []);

  if (!courses) return <LoadingSpinner />;

  return (
    <Box>
      <PageHero title="Golf Courses" backgroundImage={courseImage} />
      <Container className="pb-5 pt-4">
        <Grid container spacing={3} justifyContent="center">
          {courses.map((c) => (
            <Grid item xs={12} sm={10} md={8} lg={6} key={c.handle}>
              <CourseCard
                key={c.handle}
                handle={c.handle}
                name={c.name}
                rating={c.rating}
                slope={c.slope}
                imgUrl={c.imgUrl}
              />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

function CourseCard({ handle, rating, slope, name, imgUrl }) {
  const StyledPaper = styled(Paper)(({ theme }) => ({
    borderRadius: "30px",
    backgroundColor: "black",
    color: "white",
    "&:hover": {
      backgroundColor: "#eeeeee",
      color: "black",
    },
  }));

  const StyledCardImage = styled(Box)(({ theme }) => ({
    width: "100%",
    height: "203.984px",
    borderRadius: "30px",
    objectFit: "cover",
  }));

  return (
    <Box>
      <Link to={`/courses/${handle}`} style={{ textDecoration: "none" }}>
        <StyledPaper elevation={8}>
          <StyledCardImage component="img" src={imgUrl} />
          <Box sx={{ py: 2 }}>
            <Typography variant="h4" align="center">
              {name}
            </Typography>
          </Box>
        </StyledPaper>
      </Link>
    </Box>
  );
}
