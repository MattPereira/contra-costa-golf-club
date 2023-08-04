import React, { useState } from "react";
import CcgcApi from "../../api/api";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Container,
  Box,
  Alert,
  Grid,
  Paper,
  TextField,
} from "@mui/material";

import PageHero from "../../components/PageHero";

/** Form for creating or updating a golf course
 *
 */

export default function CourseForm({ course }) {
  let navigate = useNavigate();

  const [formErrors, setFormErrors] = useState([]);
  const [formData, setFormData] = useState({
    name: course ? course.name : "",
    rating: course ? course.rating : "",
    slope: course ? course.slope : "",
    imgUrl: course ? course.imgUrl : "",
    holes: Array.from({ length: 18 }, (_, i) => ({
      par: course ? course.pars[`hole${i + 1}`] : "",
      handicap: course ? course.handicaps[`hole${i + 1}`] : "",
    })),
  });

  //update state of formData onChange of any form input field
  const handleChange = (e) => {
    const { name, value } = e.target;
    const parsedName = name.match(/(\D+)(\d+)/);
    console.log("parse", parsedName);

    if (parsedName) {
      // eslint-disable-next-line no-unused-vars
      const [_, field, index] = parsedName;
      setFormData((fData) => ({
        ...fData,
        holes: fData.holes.map((hole, idx) =>
          idx === Number(index) - 1 ? { ...hole, [field]: value } : hole
        ),
      }));
    } else {
      setFormData((fData) => ({
        ...fData,
        [name]: value,
      }));
    }

    setFormErrors([]);
  };

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
    let courseData = {
      handle: courseHandle,
      name: formData.name,
      rating: +formData.rating,
      slope: +formData.slope,
      imgUrl: formData.imgUrl,
      pars: formData.holes.reduce((acc, hole, i) => {
        acc[`hole${i + 1}`] = +hole.par;
        return acc;
      }, {}),
      handicaps: formData.holes.reduce((acc, hole, i) => {
        acc[`hole${i + 1}`] = +hole.handicap;
        return acc;
      }, {}),
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

  return (
    <Box>
      <PageHero
        title={course ? "Update Course" : "Create Course"}
        backgroundImage={course ? course.imgUrl : ""}
      />
      <Container sx={{ py: { xs: 0, lg: 5 }, px: { xs: 0 } }}>
        <Grid container justifyContent="center">
          <Grid item xs={12} md={8} lg={6}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                bgcolor: "secondary.main",
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
                      />
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
                {formData.holes.map((hole, index) => (
                  <div key={index} className="row align-items-center mb-3">
                    <div className="col-2 text-center">
                      <label>#{index + 1}</label>
                    </div>
                    <div className="col-5 align-self-center">
                      <TextField
                        className="form-control"
                        id={`par${index + 1}`}
                        name={`par${index + 1}`}
                        type="number"
                        onChange={handleChange}
                        value={hole.par}
                        required
                      />
                    </div>
                    <div className="col-5">
                      <TextField
                        className="form-control"
                        id={`handicap${index + 1}`}
                        name={`handicap${index + 1}`}
                        type="number"
                        onChange={handleChange}
                        value={hole.handicap}
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
