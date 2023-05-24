import React, { useState } from "react";
import CcgcApi from "../../api/api";
import { useNavigate } from "react-router-dom";

import {
  Button,
  Box,
  Typography,
  Container,
  Grid,
  Paper,
  Select,
  MenuItem,
  Alert,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import PageHero from "../../components/PageHero";

/** Form to create a new tournament
 *
 *
 * Displays tournament form and handles changes to local form state.
 * Submission of form calls the API to save the course.
 *
 * Redirects to the tournament details page upon form submission.
 *
 * Routed as /tournaments/create/
 * Routes -> TournamentCreateForm
 */

const TournamentForm = ({ courseHandles, tournament }) => {
  let navigate = useNavigate();

  const [dateValue, setDateValue] = useState(null);

  //dynamically set initial state of formData based on whether creating or updating
  //a tournament by looking to see if a tournament is defined
  const [formData, setFormData] = useState({
    date: tournament ? tournament.date : dateValue,
    courseHandle: tournament ? tournament.courseHandle : courseHandles[0],
    tourYears: tournament ? tournament.tourYears : "2022-23",
  });

  const [formErrors, setFormErrors] = useState([]);

  console.debug(
    "TournamentCreateForm",
    "courseHandles=",
    courseHandles,
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

    let tournamentData;

    if (tournament) {
      tournamentData = {
        courseHandle: formData.courseHandle,
        tourYears: formData.tourYears,
      };
    } else {
      tournamentData = {
        date: dateValue,
        courseHandle: formData.courseHandle,
        tourYears: formData.tourYears,
      };
    }

    try {
      if (tournament) {
        await CcgcApi.updateTournament(tournament.date, tournamentData);
      } else {
        await CcgcApi.createTournament(tournamentData);
      }
    } catch (errors) {
      debugger;
      setFormErrors(errors);
      return;
    }

    //navigate to the course detail page for the newly created course
    navigate(`/tournaments/${formData.date}`);
  };

  console.log(tournament);
  console.log(formData);

  return (
    <Box>
      <PageHero title="Tournament" />

      <Container>
        <Box sx={{ my: 3 }}>
          <Typography variant="h2" align="center">
            {tournament ? "Update" : "Create"}
          </Typography>
        </Box>

        <Grid container justifyContent="center">
          <Grid item xs={12} md={8} lg={6}>
            <Paper
              elevation={0}
              sx={{ bgcolor: "secondary.main", px: 5, pt: 3, pb: 3, mb: 3 }}
            >
              <form onSubmit={handleSubmit}>
                <Box sx={{ mb: 2 }}>
                  <Box>
                    <label htmlFor="date">Date</label>
                  </Box>

                  {tournament ? (
                    <Box
                      sx={{
                        width: "100%",
                        bgcolor: "white",
                        p: 2,
                        borderRadius: "5px",
                      }}
                    >
                      <Typography variant="h5">
                        {new Date(tournament.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          timeZone: "UTC",
                        })}
                      </Typography>
                    </Box>
                  ) : (
                    <DatePicker
                      sx={{ width: "100%", bgcolor: "white" }}
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={(date) => setDateValue(date)}
                      required
                    />
                  )}
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box>
                    <label htmlFor="courseHandle">Course</label>
                  </Box>
                  <Select
                    id="courseHandle"
                    name="courseHandle"
                    type="select"
                    onChange={handleChange}
                    value={formData.courseHandle}
                    sx={{ width: "100%", bgcolor: "white" }}
                    required
                  >
                    {courseHandles.map((handle) => (
                      <MenuItem key={handle} value={handle}>
                        {handle
                          .split("-")
                          .map((word) => word[0].toUpperCase() + word.slice(1))
                          .join(" ")}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box>
                    <label htmlFor="tourYears">Tour Year</label>
                  </Box>

                  {tournament ? (
                    <Select
                      id="tourYears"
                      name="tourYears"
                      type="select"
                      onChange={handleChange}
                      value={formData.tourYears}
                      sx={{ width: "100%", bgcolor: "white" }}
                      required
                    >
                      {["2021-22", "2022-23", "2023-24"].map((year) => (
                        <MenuItem key={year} value={year}>
                          {year}
                        </MenuItem>
                      ))}
                    </Select>
                  ) : (
                    <Select
                      id="tourYears"
                      name="tourYears"
                      type="select"
                      onChange={handleChange}
                      value={formData.tourYears}
                      sx={{ width: "100%", bgcolor: "white" }}
                      required
                    >
                      {["2022-23", "2023-24"].map((year) => (
                        <MenuItem key={year} value={year}>
                          {year}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                </Box>

                <div className="row justify-content-end">
                  <div className="col-auto">
                    <Button variant="contained" type="submit">
                      Submit
                    </Button>
                  </div>
                </div>
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

export default TournamentForm;
