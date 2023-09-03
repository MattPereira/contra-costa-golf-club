// External Imports
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
// prettier-ignore
import { Button, Typography, Box, Container, Grid, FormControl, MenuItem, Select, TextField, Alert,Tab, Tabs } from "@mui/material";

import { styled } from "@mui/material/styles";

// Internal Imports
import UserContext from "../../lib/UserContext";
import PageHero from "../../components/PageHero";
import CcgcApi from "../../api/api";

/***** Styles *****/
const StyledTabs = styled(Tabs)(({ theme }) => ({
  "& .MuiTabs-indicator": {
    backgroundColor: "transparent",
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  fontFamily: "Cubano",
  fontSize: "1.25rem",
  color: "white",
  "&.Mui-selected": {
    backgroundColor: "white",
    color: "black",
    borderRadius: "5px",
  },
}));

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

/** Form to create a new round
 *
 * Displays new round form and handles changes to local form state.
 * Submission of form calls the API to save the round and redirects
 * to the tournament details page.
 *
 * Routed as /rounds/create/:date
 */

const RoundForm = ({ availableUsernames, round, course }) => {
  let navigate = useNavigate();
  const { currentUser } = useContext(UserContext);
  const { date } = useParams();
  const { strokes, putts } = round || {};

  const [formErrors, setFormErrors] = useState([]);

  //Gracefully handling react requirement that form input value not be null lol
  const [formData, setFormData] = useState({
    username: round
      ? round.username
      : availableUsernames.includes(currentUser.username)
      ? currentUser.username
      : availableUsernames[0],
    strokes1: strokes ? (strokes.hole1 === null ? "" : strokes.hole1) : "",
    strokes2: strokes ? (strokes.hole2 === null ? "" : strokes.hole2) : "",
    strokes3: strokes ? (strokes.hole3 === null ? "" : strokes.hole3) : "",
    strokes4: strokes ? (strokes.hole4 === null ? "" : strokes.hole4) : "",
    strokes5: strokes ? (strokes.hole5 === null ? "" : strokes.hole5) : "",
    strokes6: strokes ? (strokes.hole6 === null ? "" : strokes.hole6) : "",
    strokes7: strokes ? (strokes.hole7 === null ? "" : strokes.hole7) : "",
    strokes8: strokes ? (strokes.hole8 === null ? "" : strokes.hole8) : "",
    strokes9: strokes ? (strokes.hole9 === null ? "" : strokes.hole9) : "",
    strokes10: strokes ? (strokes.hole10 === null ? "" : strokes.hole10) : "",
    strokes11: strokes ? (strokes.hole11 === null ? "" : strokes.hole11) : "",
    strokes12: strokes ? (strokes.hole12 === null ? "" : strokes.hole12) : "",
    strokes13: strokes ? (strokes.hole13 === null ? "" : strokes.hole13) : "",
    strokes14: strokes ? (strokes.hole14 === null ? "" : strokes.hole14) : "",
    strokes15: strokes ? (strokes.hole15 === null ? "" : strokes.hole15) : "",
    strokes16: strokes ? (strokes.hole16 === null ? "" : strokes.hole16) : "",
    strokes17: strokes ? (strokes.hole17 === null ? "" : strokes.hole17) : "",
    strokes18: strokes ? (strokes.hole18 === null ? "" : strokes.hole18) : "",
    putts1: putts ? (putts.hole1 === null ? "" : putts.hole1) : "",
    putts2: putts ? (putts.hole2 === null ? "" : putts.hole2) : "",
    putts3: putts ? (putts.hole3 === null ? "" : putts.hole3) : "",
    putts4: putts ? (putts.hole4 === null ? "" : putts.hole4) : "",
    putts5: putts ? (putts.hole5 === null ? "" : putts.hole5) : "",
    putts6: putts ? (putts.hole6 === null ? "" : putts.hole6) : "",
    putts7: putts ? (putts.hole7 === null ? "" : putts.hole7) : "",
    putts8: putts ? (putts.hole8 === null ? "" : putts.hole8) : "",
    putts9: putts ? (putts.hole9 === null ? "" : putts.hole9) : "",
    putts10: putts ? (putts.hole10 === null ? "" : putts.hole10) : "",
    putts11: putts ? (putts.hole11 === null ? "" : putts.hole11) : "",
    putts12: putts ? (putts.hole12 === null ? "" : putts.hole12) : "",
    putts13: putts ? (putts.hole13 === null ? "" : putts.hole13) : "",
    putts14: putts ? (putts.hole14 === null ? "" : putts.hole14) : "",
    putts15: putts ? (putts.hole15 === null ? "" : putts.hole15) : "",
    putts16: putts ? (putts.hole16 === null ? "" : putts.hole16) : "",
    putts17: putts ? (putts.hole17 === null ? "" : putts.hole17) : "",
    putts18: putts ? (putts.hole18 === null ? "" : putts.hole18) : "",
  });

  /***** Update state of formData onChange of any form input field *****/
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((fData) => ({
      ...fData,
      [name]: value,
    }));
    setFormErrors([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    //package the formData into the format that the API wants
    let roundData = {
      tournamentDate: round ? round.tournamentDate : date,
      username: formData.username,
      strokes: {
        hole1: formData.strokes1 === "" ? null : +formData.strokes1,
        hole2: formData.strokes2 === "" ? null : +formData.strokes2,
        hole3: formData.strokes3 === "" ? null : +formData.strokes3,
        hole4: formData.strokes4 === "" ? null : +formData.strokes4,
        hole5: formData.strokes5 === "" ? null : +formData.strokes5,
        hole6: formData.strokes6 === "" ? null : +formData.strokes6,
        hole7: formData.strokes7 === "" ? null : +formData.strokes7,
        hole8: formData.strokes8 === "" ? null : +formData.strokes8,
        hole9: formData.strokes9 === "" ? null : +formData.strokes9,
        hole10: formData.strokes10 === "" ? null : +formData.strokes10,
        hole11: formData.strokes11 === "" ? null : +formData.strokes11,
        hole12: formData.strokes12 === "" ? null : +formData.strokes12,
        hole13: formData.strokes13 === "" ? null : +formData.strokes13,
        hole14: formData.strokes14 === "" ? null : +formData.strokes14,
        hole15: formData.strokes15 === "" ? null : +formData.strokes15,
        hole16: formData.strokes16 === "" ? null : +formData.strokes16,
        hole17: formData.strokes17 === "" ? null : +formData.strokes17,
        hole18: formData.strokes18 === "" ? null : +formData.strokes18,
      },
      putts: {
        hole1: formData.putts1 === "" ? null : +formData.putts1,
        hole2: formData.putts2 === "" ? null : +formData.putts2,
        hole3: formData.putts3 === "" ? null : +formData.putts3,
        hole4: formData.putts4 === "" ? null : +formData.putts4,
        hole5: formData.putts5 === "" ? null : +formData.putts5,
        hole6: formData.putts6 === "" ? null : +formData.putts6,
        hole7: formData.putts7 === "" ? null : +formData.putts7,
        hole8: formData.putts8 === "" ? null : +formData.putts8,
        hole9: formData.putts9 === "" ? null : +formData.putts9,
        hole10: formData.putts10 === "" ? null : +formData.putts10,
        hole11: formData.putts11 === "" ? null : +formData.putts11,
        hole12: formData.putts12 === "" ? null : +formData.putts12,
        hole13: formData.putts13 === "" ? null : +formData.putts13,
        hole14: formData.putts14 === "" ? null : +formData.putts14,
        hole15: formData.putts15 === "" ? null : +formData.putts15,
        hole16: formData.putts16 === "" ? null : +formData.putts16,
        hole17: formData.putts17 === "" ? null : +formData.putts17,
        hole18: formData.putts18 === "" ? null : +formData.putts18,
      },
    };

    try {
      if (round) {
        await CcgcApi.updateRound(round.id, roundData);
      } else {
        await CcgcApi.createRound(roundData);
      }
    } catch (errors) {
      debugger;
      setFormErrors(errors);
      return;
    }

    if (round) {
      //navigate to the tournament details page after editing a round
      navigate(`/rounds/${round.id}`);
    } else {
      //navigate to the tournament details page for a newly created round
      navigate(`/tournaments/${date}`);
    }
  };

  let tournamentDate;
  tournamentDate = round ? round.tournamentDate : date;
  tournamentDate = new Date(tournamentDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  let formattedName;

  if (round) {
    formattedName = round.username
      .split("-")
      .map((name) => {
        return name.charAt(0).toUpperCase() + name.slice(1);
      })
      .join(" ");
  }

  const courseName = round ? round.courseName : course.courseName;

  const shortCourseName = courseName.split(" ").slice(0, 2).join(" ");

  // const frontNine = Array.from({ length: 9 }, (v, i) => i + 1);
  const backNine = Array.from({ length: 9 }, (v, i) => i + 10);

  const [value, setValue] = useState(0);
  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  const formattedRound = [];

  for (let hole in round.strokes) {
    let obj = {};
    obj[hole] = {
      par: round.pars[hole],
      strokes: round.strokes[hole],
      putts: round.putts[hole],
    };
    formattedRound.push(obj);
  }

  console.log("formattedRound", formattedRound);

  const frontNine = formattedRound.slice(0, 9);

  // console.log("course", course);
  // console.log("round", round);

  return (
    <Box>
      <PageHero
        title={shortCourseName}
        backgroundImage={round ? round.courseImg : course.courseImg}
        date={tournamentDate}
      />
      <Box sx={{ bgcolor: "black", py: 1 }}>
        <StyledTabs
          value={value}
          centered
          onChange={handleTabChange}
          textColor="secondary"
          indicatorColor="secondary"
        >
          <StyledTab label="Front" />
          <StyledTab label="Back" />
        </StyledTabs>
      </Box>
      <Container sx={{ pb: 5, pt: 1 }} disableGutters>
        <Grid container justifyContent="center">
          <Grid item xs={12} sm={10} md={8} lg={6}>
            <form className="p-3" onSubmit={handleSubmit}>
              {round ? (
                <Box
                  sx={{
                    mb: 3,
                    mt: 1,
                  }}
                >
                  <Typography variant="h3" align="center">
                    {formattedName}
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h3" align="center" sx={{ mb: 3 }}>
                    Create Round
                  </Typography>
                  <FormControl fullWidth>
                    <label id="username" htmlFor="username">
                      Player Name
                    </label>

                    <Select
                      id="username"
                      name="username"
                      onChange={handleChange}
                      value={formData.username}
                      required
                    >
                      {availableUsernames.map((username) => (
                        <MenuItem key={username} value={username}>
                          {username
                            .split("-")
                            .map((name) => {
                              return (
                                name.charAt(0).toUpperCase() + name.slice(1)
                              );
                            })
                            .join(" ")}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              )}

              <TabPanel value={value} index={0}>
                <table className="table table-bordered">
                  <thead>
                    <tr className="table-dark text-center">
                      <th scope="col">#</th>
                      <th scope="col">Par</th>
                      <th scope="col">STR</th>
                      <th scope="col">PUT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {frontNine.map((hole, idx) => (
                      <tr key={idx} className="text-center">
                        <td className="bg-secondary text-white px-3">
                          {idx + 1}
                        </td>
                        <td className="bg-primary text-white">
                          {hole[`hole${idx + 1}`].par}
                        </td>
                        <td>
                          <input
                            id={`strokes${idx + 1}`}
                            name={`strokes${idx + 1}`}
                            type="number"
                            min="1"
                            onChange={handleChange}
                            value={formData[`strokes${idx + 1}`]}
                            className="form-control"
                          />
                        </td>
                        <td>
                          <input
                            id={`putts${idx + 1}`}
                            name={`putts${idx + 1}}`}
                            type="number"
                            min="0"
                            onChange={handleChange}
                            value={formData[`putts${idx + 1}`]}
                            className="form-control"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TabPanel>
              <TabPanel value={value} index={1}>
                {backNine.map((num) => (
                  <Grid container spacing={2} key={num} sx={{ mb: 1.5 }}>
                    <Grid item xs={6}>
                      <TextField
                        id={`strokes${num}`}
                        name={`strokes${num}`}
                        label={`Hole ${num}`}
                        type="number"
                        min="1"
                        onChange={handleChange}
                        value={formData[`strokes${num}`]}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        id={`putts${num}`}
                        name={`putts${num}`}
                        label={`Hole ${num}`}
                        type="number"
                        min="0"
                        onChange={handleChange}
                        value={formData[`putts${num}`]}
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                ))}
              </TabPanel>

              <Box sx={{ textAlign: "end", mt: 3 }}>
                <Button
                  variant="contained"
                  type="submit"
                  size="large"
                  sx={{ width: "150px", borderRadius: "4px" }}
                >
                  Submit
                </Button>
              </Box>
            </form>
          </Grid>
        </Grid>

        {formErrors.length
          ? formErrors.map((err) => (
              <Alert key={err} severity="danger">
                {err}
              </Alert>
            ))
          : null}
      </Container>
    </Box>
  );
};

export default RoundForm;
