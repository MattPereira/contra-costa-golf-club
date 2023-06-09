import React, { useState } from "react";
import CcgcApi from "../../api/api";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Container,
  Box,
  Alert,
  Grid,
  Typography,
  Paper,
  TextField,
} from "@mui/material";

import PageHero from "../../components/PageHero";

/** Form to create a new course
 *
 * Displays new course form and handles changes to local form state.
 * Submission of form calls the API to save the course and redirects
 * to the newly created course details page.
 *
 */

export default function CourseForm({ course }) {
  let navigate = useNavigate();

  // const { pars, handicaps } = course || {};

  const [formData, setFormData] = useState({
    name: course ? course.name : "",
    rating: course ? course.rating : "",
    slope: course ? course.slope : "",
    imgUrl: course ? course.imgUrl : "",
    par1: course ? course.pars.hole1 : "",
    par2: course ? course.pars.hole2 : "",
    par3: course ? course.pars.hole3 : "",
    par4: course ? course.pars.hole4 : "",
    par5: course ? course.pars.hole5 : "",
    par6: course ? course.pars.hole6 : "",
    par7: course ? course.pars.hole7 : "",
    par8: course ? course.pars.hole8 : "",
    par9: course ? course.pars.hole9 : "",
    par10: course ? course.pars.hole10 : "",
    par11: course ? course.pars.hole11 : "",
    par12: course ? course.pars.hole12 : "",
    par13: course ? course.pars.hole13 : "",
    par14: course ? course.pars.hole14 : "",
    par15: course ? course.pars.hole15 : "",
    par16: course ? course.pars.hole16 : "",
    par17: course ? course.pars.hole17 : "",
    par18: course ? course.pars.hole18 : "",
    handicap1: course ? course.handicaps.hole1 : "",
    handicap2: course ? course.handicaps.hole2 : "",
    handicap3: course ? course.handicaps.hole3 : "",
    handicap4: course ? course.handicaps.hole4 : "",
    handicap5: course ? course.handicaps.hole5 : "",
    handicap6: course ? course.handicaps.hole6 : "",
    handicap7: course ? course.handicaps.hole7 : "",
    handicap8: course ? course.handicaps.hole8 : "",
    handicap9: course ? course.handicaps.hole9 : "",
    handicap10: course ? course.handicaps.hole10 : "",
    handicap11: course ? course.handicaps.hole11 : "",
    handicap12: course ? course.handicaps.hole12 : "",
    handicap13: course ? course.handicaps.hole13 : "",
    handicap14: course ? course.handicaps.hole14 : "",
    handicap15: course ? course.handicaps.hole15 : "",
    handicap16: course ? course.handicaps.hole16 : "",
    handicap17: course ? course.handicaps.hole17 : "",
    handicap18: course ? course.handicaps.hole18 : "",
  });

  const [formErrors, setFormErrors] = useState([]);

  console.debug("CourseForm", "formData=", formData, "formErrors=", formErrors);

  //update state of formData onChange of any form input field
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((fData) => ({
      ...fData,
      [name]: value,
    }));
    setFormErrors([]);
  };

  /**on form submission:
   * -attempt save to backend & report any errors
   * -if successful
   *  -clear previous error messages and password
   *  - show update-confirmed alert
   *  - set current user info throughout the site
   */

  const handleSubmit = async (e) => {
    e.preventDefault();

    //create course handle from formData.name
    const courseHandle = formData.name
      .toLowerCase()
      .replaceAll("'", "")
      .split(" ")
      .slice(0, 2)
      .join("-");

    //package the formData into the format that the API wants
    //including converting strings to integers/numbers
    let courseData = {
      handle: courseHandle,
      name: formData.name,
      rating: +formData.rating,
      slope: +formData.slope,
      imgUrl: formData.imgUrl,
      pars: {
        hole1: +formData.par1,
        hole2: +formData.par2,
        hole3: +formData.par3,
        hole4: +formData.par4,
        hole5: +formData.par5,
        hole6: +formData.par6,
        hole7: +formData.par7,
        hole8: +formData.par8,
        hole9: +formData.par9,
        hole10: +formData.par10,
        hole11: +formData.par11,
        hole12: +formData.par12,
        hole13: +formData.par13,
        hole14: +formData.par14,
        hole15: +formData.par15,
        hole16: +formData.par16,
        hole17: +formData.par17,
        hole18: +formData.par18,
      },
      handicaps: {
        hole1: +formData.handicap1,
        hole2: +formData.handicap2,
        hole3: +formData.handicap3,
        hole4: +formData.handicap4,
        hole5: +formData.handicap5,
        hole6: +formData.handicap6,
        hole7: +formData.handicap7,
        hole8: +formData.handicap8,
        hole9: +formData.handicap9,
        hole10: +formData.handicap10,
        hole11: +formData.handicap11,
        hole12: +formData.handicap12,
        hole13: +formData.handicap13,
        hole14: +formData.handicap14,
        hole15: +formData.handicap15,
        hole16: +formData.handicap16,
        hole17: +formData.handicap17,
        hole18: +formData.handicap18,
      },
    };

    try {
      if (course) {
        delete courseData.handle;
        await CcgcApi.updateCourse(course.handle, courseData);
      } else {
        await CcgcApi.createCourse(courseData);
      }
    } catch (errors) {
      debugger;
      setFormErrors(errors);
      return;
    }

    //navigate to the course detail page for the newly created or updated course
    if (course) {
      navigate(`/courses/${course.handle}`);
    } else {
      navigate(`/courses/${courseHandle}`);
    }
  };

  const HOLES = Array.from({ length: 18 }, (v, i) => i + 1);

  return (
    <Box>
      <PageHero title="Course" />
      <Typography variant="h3" align="center" sx={{ my: 3 }}>
        {" "}
        {course ? "Update" : "Create"}
      </Typography>
      <Container sx={{ pb: 5 }}>
        <Grid container justifyContent="center">
          <Grid item sx={12} md={8} lg={6}>
            <Paper
              elevation={0}
              sx={{
                px: 4,
                pt: 4,
                pb: 2,
                bgcolor: "secondary.main",
                mb: 3,
              }}
            >
              <form onSubmit={handleSubmit}>
                <Box sx={{ mb: 2 }}>
                  <label htmlFor="name">Name</label>
                  <TextField
                    className="form-control"
                    id="name"
                    name="name"
                    type="text"
                    onChange={handleChange}
                    value={formData.name}
                    required
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <label htmlFor="name">Image URL</label>
                  <TextField
                    className="form-control"
                    id="imgUrl"
                    name="imgUrl"
                    type="text"
                    onChange={handleChange}
                    value={formData.imgUrl}
                    required
                  />
                </Box>

                <Grid container spacing={4} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Box>
                      <label htmlFor="rating">Rating</label>
                      <TextField
                        className="form-control"
                        id="rating"
                        name="rating"
                        type="number"
                        step="0.1"
                        onChange={handleChange}
                        value={formData.rating}
                        required
                      ></TextField>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box>
                      <label htmlFor="slope">Slope</label>
                      <TextField
                        className="form-control"
                        id="slope"
                        name="slope"
                        type="number"
                        onChange={handleChange}
                        value={formData.slope}
                        required
                      />
                    </Box>
                  </Grid>
                </Grid>

                <div className="row text-center">
                  <div className="col-2">
                    <label>Hole</label>
                  </div>
                  <div className="col-5">
                    <label>Par</label>
                  </div>
                  <div className="col-5">
                    <label>Handicap</label>
                  </div>
                </div>
                {HOLES.map((num) => (
                  <div key={num} className="row align-items-center mb-3">
                    <div className="col-2 text-center">
                      <label>#{num}</label>
                    </div>
                    <div className="col-5 align-self-center">
                      <TextField
                        className="form-control"
                        id={`par${num}`}
                        name={`par${num}`}
                        type="number"
                        onChange={handleChange}
                        value={formData[`par${num}`]}
                        required
                      />
                    </div>
                    <div className="col-5">
                      <TextField
                        className="form-control"
                        id={`handicap${num}`}
                        name={`handicap${num}`}
                        type="number"
                        onChange={handleChange}
                        value={formData[`handicap${num}`]}
                        required
                      />
                    </div>
                  </div>
                ))}
                <Box sx={{ textAlign: "end" }}>
                  <Button variant="contained" type="submit">
                    Submit
                  </Button>
                </Box>
              </form>
            </Paper>

            {formErrors.length
              ? formErrors.map((err) => (
                  <Alert key={err} severity="error">
                    {err}
                  </Alert>
                ))
              : null}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
