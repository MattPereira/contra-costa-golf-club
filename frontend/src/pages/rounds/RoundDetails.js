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
import {
  Button,
  Typography,
  Container,
  Box,
  Modal,
  Tab,
  Grid,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
} from "@mui/material";

import { v4 as uuidv4 } from "uuid";

import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";

import { useTheme } from "@mui/material/styles";
import { styled } from "@mui/material/styles";

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

  const [value, setValue] = useState("1");
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
  const style = {
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

  const date = new Date(round.tournamentDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  const memberButtons = (
    <Box sx={{ mt: 3, textAlign: "center" }}>
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
        tournamentDate={date}
        isRoundHero={true}
      />
      <Container sx={{ pb: 3 }}>
        <TabContext value={value}>
          <Box sx={{ mt: 2 }}>
            <TabList
              centered
              onChange={handleChange}
              aria-label="lab API tabs example"
            >
              <Tab
                label="Scores"
                value="1"
                sx={{ fontFamily: "Cubano", fontSize: "1.25rem" }}
              />
              <Tab
                label="Greenies"
                value="2"
                sx={{ fontFamily: "Cubano", fontSize: "1.25rem" }}
              />
              <Tab
                label="Handicap"
                value="3"
                sx={{ fontFamily: "Cubano", fontSize: "1.25rem" }}
              />
            </TabList>
          </Box>
          <TabPanel sx={{ px: 0 }} value="1">
            <ScoresTable round={round} />
            {currentUser ? memberButtons : null}
          </TabPanel>
          <TabPanel sx={{ px: 0 }} value="2">
            {round.greenies.length ? (
              <GreenieCardList greenies={round.greenies} />
            ) : null}
          </TabPanel>
          <TabPanel sx={{ px: 0 }} value="3">
            <HandicapCalculations round={round} />
          </TabPanel>
        </TabContext>

        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Typography id="modal-modal-title" variant="h4" color="white">
              Are you Sure?
            </Typography>
            <Typography
              id="modal-modal-description"
              sx={{ mt: 2 }}
              color="white"
            >
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
      </Container>
    </Box>
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
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{ border: "1px solid rgb(224, 224, 224)" }}
    >
      <Table sx={{ display: { xs: "none", lg: "table" } }}>
        <TableHead sx={{ bgcolor: "dark.main" }}>
          <TableRow>
            <TableCell
              align="center"
              sx={{
                color: "white",
                borderRight: "1px solid rgb(224, 224, 224)",
                fontWeight: "bold",
              }}
            >
              Hole
            </TableCell>
            {[...Array(18)].map((_, i) => (
              <TableCell
                align="center"
                sx={{
                  color: "white",
                  borderRight: "1px solid rgb(224, 224, 224)",
                  fontWeight: "bold",
                }}
                key={uuidv4()}
              >
                {i + 1}
              </TableCell>
            ))}
            <TableCell align="center" sx={{ color: "white" }}>
              Total
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow sx={{ backgroundColor: "gray" }}>
            <TableCell
              align="center"
              sx={{
                borderRight: "1px solid rgb(224,224,224)",
                fontWeight: "bold",
                color: "white",
              }}
            >
              Par
            </TableCell>
            {Object.values(pars).map((p) => (
              <TableCell
                key={uuidv4()}
                align="center"
                sx={{
                  borderRight: "1px solid rgb(224,224,224)",

                  color: "white",
                }}
              >
                {p}
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell
              align="center"
              sx={{ borderRight: "1px solid rgb(224,224,224)" }}
            >
              Strokes
            </TableCell>
            {Object.values(strokes).map((s) => (
              <TableCell
                key={uuidv4()}
                align="center"
                sx={{ borderRight: "1px solid rgb(224,224,224)" }}
              >
                {s}
              </TableCell>
            ))}
            <TableCell align="center">{round.totalStrokes}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell
              align="center"
              sx={{ borderRight: "1px solid rgb(224,224,224)" }}
            >
              Putts
            </TableCell>
            {Object.values(putts).map((p) => (
              <TableCell
                key={uuidv4()}
                align="center"
                sx={{ borderRight: "1px solid rgb(224,224,224)" }}
              >
                {p}
              </TableCell>
            ))}
            <TableCell align="center">{round.totalPutts}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <Table size="small" sx={{ display: { xs: "table", lg: "none" } }}>
        <TableHead sx={{ backgroundColor: "rgb(33,37,41)" }}>
          <TableRow>
            <TableCell
              align="center"
              sx={{
                color: "white",
                py: 1,
                borderRight: "1px solid rgb(224, 224, 224)",
              }}
            >
              Hole
            </TableCell>
            <TableCell
              align="center"
              sx={{
                color: "white",
                borderRight: "1px solid rgb(224, 224, 224)",
              }}
            >
              Par
            </TableCell>
            <TableCell
              align="center"
              sx={{
                color: "white",
                borderRight: "1px solid rgb(224, 224, 224)",
              }}
            >
              Strokes
            </TableCell>
            <TableCell
              align="center"
              sx={{
                color: "white",
                borderRight: "1px solid rgb(224, 224, 224)",
              }}
            >
              Putts
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {mobileRows.map((hole) => (
            <TableRow key={hole.holeNumber}>
              <TableCell
                variant="head"
                align="center"
                width="20%"
                sx={{
                  backgroundColor: "rgb(33,37,41)",
                  color: "white",
                  borderRight: "1px solid rgb(224, 224, 224)",
                }}
              >
                {hole.holeNumber}
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  backgroundColor: "grey.600",
                  color: "white",
                  borderRight: "1px solid rgb(224, 224, 224)",
                  fontWeight: "bold",
                }}
                width="20%"
              >
                {hole.par}
              </TableCell>

              <TableCell
                align="center"
                width="30%"
                sx={{ borderRight: "1px solid rgb(224, 224, 224)" }}
              >
                {hole.strokes}
              </TableCell>
              <TableCell align="center" width="30%">
                {hole.putts}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function HandicapCalculations({ round }) {
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

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    fontFamily: "Cubano",
    fontSize: "1.15rem",
  }));

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
        <TableContainer
          sx={{ border: "1px solid black", borderRadius: "10px" }}
        >
          <Table>
            <TableHead sx={{ bgcolor: "dark.main", color: "white" }}>
              <TableRow>
                <StyledTableCell sx={{ color: "white" }}>Date</StyledTableCell>
                <StyledTableCell align="right" sx={{ color: "white" }}>
                  Total
                </StyledTableCell>
                <StyledTableCell align="right" sx={{ color: "white" }}>
                  Score Diff
                </StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {round.recentScoreDiffs.map((diff) => (
                <TableRow key={diff.tournamentDate}>
                  <StyledTableCell>
                    {new Date(diff.tournamentDate).toLocaleDateString("en-US", {
                      month: "numeric",
                      day: "numeric",
                      year: "numeric",
                      timeZone: "UTC",
                    })}
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    {diff.totalStrokes}
                  </StyledTableCell>
                  <StyledTableCell align="right" sx={{ color: "#ef6c00" }}>
                    {diff.scoreDifferential}
                  </StyledTableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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
            <Typography variant="h6" fontFamily="cubano">
              ({" "}
              <span style={{ color: "#ef6c00" }}>
                {lowestTwoDiffs[0] || 0} +{" "}
                {lowestTwoDiffs[1] || lowestTwoDiffs[0]}
              </span>{" "}
              ) ÷ 2 = <span style={{ color: "royalblue" }}>{playerIndex}</span>
            </Typography>
          ) : (
            <Typography variant="h6" fontFamily="cubano">
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
        <TableContainer
          sx={{ border: "1px solid black", borderRadius: "10px" }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "dark.main", color: "white" }}>
                <StyledTableCell sx={{ color: "white" }}>Name</StyledTableCell>
                <StyledTableCell align="right" sx={{ color: "white" }}>
                  Rating
                </StyledTableCell>
                <StyledTableCell align="right" sx={{ color: "white" }}>
                  Slope
                </StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <StyledTableCell>{round.courseName}</StyledTableCell>
                <StyledTableCell align="right">
                  {round.courseRating}
                </StyledTableCell>
                <StyledTableCell align="right" sx={{ color: "success.main" }}>
                  {round.courseSlope}
                </StyledTableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
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
