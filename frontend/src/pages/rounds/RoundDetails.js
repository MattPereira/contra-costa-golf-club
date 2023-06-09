import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner";
import CcgcApi from "../../api/api";

import UserContext from "../../lib/UserContext";
import GreenieCardList from "../../components/GreenieCardList";
import { Link } from "react-router-dom";

import PageHero from "../../components/PageHero";

import ArrowCircleUpIcon from "@mui/icons-material/ArrowCircleUp";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
// prettier-ignore
import { Button, Typography, Container, Box, Modal, Tab, Grid, Tabs} from "@mui/material";

import { v4 as uuidv4 } from "uuid";

import { useTheme } from "@mui/material/styles";
import { styled } from "@mui/material/styles";
import { Table } from "react-bootstrap";

/** Round details page.
 *
 * On component mount, load the round data from API
 * which includes the strokes, putts, and calculations
 * for each round
 *
 * Only show edit and delete buttons if user isAdmin or
 * if the user is the owner of the round
 *
 * Router -> RoundDetails -> {AdminButtons, RoundTable}
 */

export default function RoundDetails() {
  const { id } = useParams();
  const { currentUser } = useContext(UserContext);
  let navigate = useNavigate();

  console.debug("RoundDetails", "id=", id);

  const [round, setRound] = useState(null);

  const [value, setValue] = useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleDelete = async (id) => {
    await CcgcApi.deleteRound(id);
    navigate(`/tournaments/${round.tournamentDate}`);
  };

  /* On component mount, load round data from API */
  useEffect(
    function getRoundOnMount() {
      console.debug("RoundDetails useEffect getRoundOnMount");

      async function getRound() {
        setRound(await CcgcApi.getRound(id));
      }
      getRound();
    },
    [id]
  );

  if (!round) return <LoadingSpinner />;
  console.log(round);

  ////////
  const modalStyles = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "rgb(211, 47, 47)",
    borderRadius: "20px",
    boxShadow: 24,
    p: 4,
  };

  const StyledTab = styled(Tab)(({ theme }) => ({
    fontFamily: "Cubano",
    fontSize: "1.15rem",
    color: "white",
  }));

  const date = new Date(round.tournamentDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  const memberButtons = (
    <Box sx={{ my: 3, textAlign: "center" }}>
      <Button
        variant="contained"
        color="error"
        size="large"
        onClick={handleOpen}
        sx={{
          mr: 1,
        }}
      >
        <HighlightOffIcon /> <span className="ms-2">Delete</span>
      </Button>
      <Button
        component={Link}
        to={`/rounds/update/${id}`}
        variant="contained"
        size="large"
        sx={{
          ml: 1,
        }}
      >
        <ArrowCircleUpIcon /> <span className="ms-2">Update</span>
      </Button>
    </Box>
  );

  return (
    <Box>
      <PageHero
        title={round.username.split("-").join(" ")}
        backgroundImage={round.courseImg}
        date={date}
        isRoundHero={true}
      />

      <Box sx={{ py: 1, bgcolor: "black" }}>
        <Tabs
          centered
          onChange={handleChange}
          textColor="secondary"
          indicatorColor="secondary"
          value={value}
        >
          <StyledTab label="Scores" />
          <StyledTab label="Greenies" />
          <StyledTab label="Handicap" />
        </Tabs>
      </Box>

      <Container sx={{ py: 5 }}>
        <TabPanel value={value} index={0}>
          <ScoresTable round={round} />
          {currentUser ? memberButtons : null}
        </TabPanel>
        <TabPanel value={value} index={1}>
          <Box sx={{ mb: 3, textAlign: "center" }}>
            <Button
              variant="contained"
              color="success"
              component={Link}
              to={`/greenies/create/${round.tournamentDate}`}
            >
              Add Greenie
            </Button>
          </Box>
          {round.greenies.length ? (
            <GreenieCardList greenies={round.greenies} />
          ) : null}
        </TabPanel>
        <TabPanel value={value} index={2}>
          <HandicapTab round={round} />
        </TabPanel>
      </Container>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyles}>
          <Typography id="modal-modal-title" variant="h4" color="white">
            Are you Sure?
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }} color="white">
            This action will permanently erase all data associated with this
            round including greenies. Proceed with caution.
          </Typography>
          <Box sx={{ mt: 3, textAlign: "right" }}>
            <Button
              variant="contained"
              onClick={handleClose}
              sx={{ mr: 2, bgcolor: "gray" }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="dark"
              sx={{ color: "white" }}
              onClick={() => handleDelete(round.id)}
            >
              Delete
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}

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

function ScoresTable({ round }) {
  const theme = useTheme();
  console.log("THEME", theme);
  const strokes = Object.values(round.strokes);
  const putts = Object.values(round.putts);
  const pars = Object.values(round.pars);

  // FOR MOBILE SCREEN SIZE DISPLAY
  //making an array like [{holeNumber: 1, strokes: 4, putts: 2, par: 3}, {holeNumber: 2, strokes: 4, putts: 2, par: 3}, ...]
  const mobileRows = [];

  for (let i = 0; i < 18; i++) {
    mobileRows.push({
      holeNumber: i + 1,
      strokes: strokes[i],
      putts: putts[i],
      par: pars[i],
    });
  }

  return (
    <Box>
      <Table
        bordered
        striped
        responsive
        variant="light"
        className="d-none d-lg-table"
      >
        <thead className="table-dark">
          <tr>
            <th>Hole</th>
            {[...Array(18)].map((_, i) => (
              <th className="text-center" key={uuidv4()}>
                {i + 1}
              </th>
            ))}
            <th className="text-center">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>Par</th>
            {Object.values(pars).map((p) => (
              <td
                key={uuidv4()}
                align="center"
                sx={{
                  borderRight: "1px solid rgb(224,224,224)",

                  color: "white",
                }}
              >
                {p}
              </td>
            ))}
          </tr>
          <tr className="text-center">
            <th className="text-start">Strokes</th>
            {Object.values(strokes).map((s) => (
              <td key={uuidv4()}>{s}</td>
            ))}
            <td align="center">{round.totalStrokes}</td>
          </tr>
          <tr className="text-center">
            <th className="text-start">Putts</th>
            {Object.values(putts).map((p) => (
              <td key={uuidv4()}>{p}</td>
            ))}
            <td>{round.totalPutts}</td>
          </tr>
        </tbody>
      </Table>
      <Table
        bordered
        responsive
        variant="light"
        className="text-center d-xs-flex d-lg-none"
      >
        <thead className="table-dark">
          <tr>
            <th>Hole</th>
            <th>Par</th>
            <th>Strokes</th>
            <th>Putts</th>
          </tr>
        </thead>
        <tbody>
          {mobileRows.map((hole) => (
            <tr key={hole.holeNumber}>
              <th className="table-dark">{hole.holeNumber}</th>
              <th className="table-secondary">{hole.par}</th>

              <td>{hole.strokes}</td>
              <td>{hole.putts}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Box>
  );
}

function HandicapTab({ round }) {
  //Logic for computing course handicap for a round
  //Need to add logic to check if this round is the most recent round for a user? if it is not the most recent, show text explaining that handicap calculation can only be seen on most recent round?

  const scoreDiffsArray = round.recentScoreDiffs.map(
    (diff) => +diff.scoreDifferential
  );
  console.log("All Diffs", scoreDiffsArray);

  const lowestTwoDiffs = scoreDiffsArray.sort((a, b) => a - b).slice(0, 2);
  console.log("Lowest Two Diffs", lowestTwoDiffs);

  let playerIndex = 0;

  if (lowestTwoDiffs.length) {
    playerIndex = (
      lowestTwoDiffs.reduce((a, b) => a + b) / lowestTwoDiffs.length
    ).toFixed(2);
  } else {
    playerIndex = (
      ((113 / round.courseSlope) * (round.totalStrokes - round.courseRating)) /
      2
    ).toFixed(2);
  }

  const courseHandicap = Math.round((playerIndex * round.courseSlope) / 113);

  return (
    <Grid
      container
      spacing={5}
      justifyContent="center"
      sx={{ textAlign: "center" }}
    >
      <Grid item xs={12} md={8} lg={6}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Past Rounds
        </Typography>
        <Table striped bordered responsive variant="light">
          <thead className="table-dark">
            <tr>
              <th sx={{ color: "white" }}>Date</th>
              <th>Tot Str</th>
              <th>Scr Dif</th>
            </tr>
          </thead>
          <tbody>
            {round.recentScoreDiffs.map((diff) => (
              <tr key={diff.tournamentDate}>
                <td>
                  {new Date(diff.tournamentDate).toLocaleDateString("en-US", {
                    month: "numeric",
                    day: "numeric",
                    year: "numeric",
                    timeZone: "UTC",
                  })}
                </td>
                <td>{diff.totalStrokes}</td>
                <td>{diff.scoreDifferential}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Grid>
      <Grid item xs={12} md={8} lg={6}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Player Index
        </Typography>
        <Box sx={{ mb: 2, textAlign: "start" }}>
          {lowestTwoDiffs.length ? (
            <Typography
              variant="p"
              textAlign="start"
              sx={{ fontSize: "1.2rem" }}
            >
              Average of lowest two score differentials from last four rounds
              played.
            </Typography>
          ) : (
            <Typography variant="p" textAlign="start">
              First round with club computes player index using your first
              round's score differential divided by 2.
            </Typography>
          )}
        </Box>
        <Box sx={{ border: "1px solid black", borderRadius: "10px", py: 0.5 }}>
          {lowestTwoDiffs.length ? (
            <Typography variant="h6">
              ({" "}
              <span>
                {lowestTwoDiffs[0] || 0} +{" "}
                {lowestTwoDiffs[1] || lowestTwoDiffs[0]}
              </span>{" "}
              ) ÷ 2 = <span style={{ color: "royalblue" }}>{playerIndex}</span>
            </Typography>
          ) : (
            <Typography variant="h6">
              {playerIndex * 2} ÷ 2 ={" "}
              <span style={{ color: "royalblue" }}>{playerIndex}</span>
            </Typography>
          )}
        </Box>
      </Grid>

      <Grid item xs={12} md={8} lg={6}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Golf Course
        </Typography>

        <Table striped bordered responsive>
          <thead className="table-dark">
            <tr>
              <th sx={{ color: "white" }}>Name</th>
              <th sx={{ color: "white" }}>Rating</th>
              <th sx={{ color: "white" }}>Slope</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{round.courseName}</td>
              <td>{round.courseRating}</td>
              <th className="text-success">{round.courseSlope}</th>
            </tr>
          </tbody>
        </Table>
      </Grid>
      <Grid item xs={12} md={8} lg={6}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Course Handicap
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="p" sx={{ fontSize: "1.2rem" }}>
            Player Index × Course Slope ÷ 113
          </Typography>
        </Box>
        <Box sx={{ border: "1px solid black", borderRadius: "10px", py: 0.5 }}>
          <Typography variant="h5">
            <Typography
              component="span"
              sx={{
                color: "royalblue",
                fontSize: "inherit",
                fontFamily: "inherit",
              }}
            >
              {playerIndex}
            </Typography>{" "}
            ×{" "}
            <Typography
              component="span"
              sx={{
                color: "success.main",
                fontSize: "inherit",
                fontFamily: "inherit",
              }}
            >
              {round.courseSlope}
            </Typography>{" "}
            ÷ 113 ={" "}
            <Typography
              component="span"
              sx={{
                color: "error.main",
                fontSize: "inherit",
                fontFamily: "inherit",
              }}
            >
              {courseHandicap}
            </Typography>
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
}
