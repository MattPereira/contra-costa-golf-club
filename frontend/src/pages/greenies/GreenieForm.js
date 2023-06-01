import React, { useState } from "react";
import CcgcApi from "../../api/api";
import { useNavigate, useParams } from "react-router-dom";
// prettier-ignore
import { Button, Typography, Alert, Box, Container, Grid, Paper, TextField, FormControl, Select, MenuItem } from "@mui/material";
import { styled } from "@mui/material/styles";

import PageHero from "../../components/PageHero";

/** Form to create a new greenie
 *
 *
 * Displays new greenie form and handles changes to local form state.
 * Submission of form calls the API to save the greenie.
 *
 * Redirects to CourseDetails page upon form submission.
 *
 * Routed as /greenies/:date/new
 * Routes -> NewGreenie -> NewGreenieForm
 */

const GreenieForm = ({ par3HoleNums, usernames, greenie, course }) => {
  let navigate = useNavigate();
  const { date } = useParams();

  /// HOW TO SEND AND SET THE ROUND ID AS SELECT INPUT OPTIONS CHANGE?
  /// NEED TO USE NAMES FOR THE SELECT INPUT OPTIONS USER SEES BUT KEEP ROUND ID IN STATE

  console.log(usernames);

  //dynamically set initial state of formData based on whether creating or updating
  //a greenie by looking to see if greenie is passed in as a prop
  const [formData, setFormData] = useState({
    roundId: greenie ? greenie.roundId : "",
    holeNumber: greenie ? greenie.holeNumber : "",
    feet: greenie ? greenie.feet : "",
    inches: greenie ? greenie.inches : "",
  });

  const [formErrors, setFormErrors] = useState([]);

  console.debug(
    "NewGreenieForm",
    "formData=",
    formData,
    "formErrors=",
    formErrors
  );
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

    let newGreenieData = {
      roundId: +formData.roundId,
      holeNumber: +formData.holeNumber,
      feet: +formData.feet,
      inches: +formData.inches,
    };

    let updateGreenieData = {
      feet: +formData.feet,
      inches: +formData.inches,
    };

    try {
      if (greenie) {
        await CcgcApi.updateGreenie(greenie.id, updateGreenieData);
      } else {
        await CcgcApi.createGreenie(newGreenieData);
      }
    } catch (errors) {
      setFormErrors(errors);
      return;
    }

    //navigate to the tournament detail page associated with the new greenie
    if (greenie) {
      navigate(`/tournaments/${greenie.tournamentDate}`);
    } else {
      navigate(`/tournaments/${date}`);
    }
  };

  const tournamentDate = new Date(
    date || greenie.tournamentDate
  ).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  console.log(greenie);

  return (
    <Box>
      <PageHero
        backgroundImage={greenie ? greenie.courseImg : course.courseImg}
        title={greenie ? greenie.courseName : course.courseName}
        date={tournamentDate}
      />
      <Container>
        <Typography variant="h3" align="center" sx={{ my: 3 }}>
          {greenie ? "Update Greenie" : "Create Greenie"}
        </Typography>
        <Grid container justifyContent="center">
          <Grid item>
            <Paper
              elevation={0}
              sx={{ mb: 3, bgcolor: "secondary.main", p: 5 }}
            >
              <form onSubmit={handleSubmit}>
                <Box sx={{ mb: 3 }}>
                  <label>Player Name</label>

                  {greenie ? (
                    <Box sx={{ bgcolor: "white", p: 2, borderRadius: "5px" }}>
                      <Typography variant="h5">
                        {greenie.firstName + " " + greenie.lastName}
                      </Typography>
                    </Box>
                  ) : (
                    <FormControl fullWidth>
                      <Select
                        name="roundId"
                        id="roundId"
                        value={formData.roundId}
                        onChange={handleChange}
                        sx={{ bgcolor: "white" }}
                        required
                      >
                        {usernames.map((user) => (
                          <MenuItem key={user[0]} value={user[0]}>
                            {user[1]
                              .split("-")
                              .map((n) => n[0].toUpperCase() + n.slice(1))
                              .join(" ")}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                </Box>

                <Box sx={{ mb: 3 }}>
                  <label>Hole Number</label>
                  {greenie ? (
                    <>
                      <Box sx={{ bgcolor: "white", p: 2, borderRadius: "5px" }}>
                        <Typography variant="h5" align="center">
                          {greenie.holeNumber}
                        </Typography>
                      </Box>
                    </>
                  ) : (
                    <FormControl fullWidth>
                      <Select
                        id="holeNumber"
                        name="holeNumber"
                        onChange={handleChange}
                        value={formData.holeNumber}
                        sx={{ bgcolor: "white" }}
                        required
                      >
                        {par3HoleNums.map((num) => (
                          <MenuItem key={num} value={num}>
                            {num}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                </Box>

                <Grid container spacing={4} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <Box>
                      <label>Feet</label>
                    </Box>
                    <TextField
                      id="feet"
                      name="feet"
                      type="number"
                      inputProps={{
                        min: "0",
                      }}
                      onChange={handleChange}
                      value={formData.feet}
                      sx={{ bgcolor: "white" }}
                      required
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Box>
                      <label>Inches</label>
                    </Box>
                    <TextField
                      id="inches"
                      name="inches"
                      type="number"
                      inputProps={{
                        min: "0",
                        max: "11",
                      }}
                      onChange={handleChange}
                      value={formData.inches}
                      sx={{ bgcolor: "white", width: "100%" }}
                      required
                    />
                  </Grid>
                </Grid>
                <Box sx={{ display: "flex", justifyContent: "end" }}>
                  <Button
                    fullWidth
                    variant="contained"
                    type="submit"
                    size="large"
                  >
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
};

export default GreenieForm;
