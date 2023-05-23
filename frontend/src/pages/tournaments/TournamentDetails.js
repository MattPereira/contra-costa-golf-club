import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";

import CcgcApi from "../../api/api";
import UserContext from "../../lib/UserContext";
import LoadingSpinner from "../../components/LoadingSpinner";
import { RankingsTable } from "../standings/StandingsDetails";
import PageHero from "../../components/PageHero";

// prettier-ignore
import { Button, Container, Box, Tab, Typography, Grid, Tabs } from "@mui/material";
import { styled } from "@mui/material/styles";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { Table } from "react-bootstrap";

/** Tournament Details Page
 *
 * - Scores leaderboard
 * - Skins game winners
 * - Greenie winners
 * - Points results tab
 * - Allows users to add rounds and greenies to a tournament
 *
 * path -> "/tournaments/:date"
 */

export default function TournamentDetails() {
  const { date } = useParams();

  const [value, setValue] = useState(0);
  const [tournament, setTournament] = useState(null);

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  /* On component mount, load tournament from API */
  useEffect(
    function getTournamentOnMount() {
      async function getTournament() {
        setTournament(await CcgcApi.getTournament(date));
      }
      getTournament();
    },
    [date]
  );

  if (!tournament) return <LoadingSpinner />;
  console.log("TOURNAMENT", tournament);

  const { greenies, rounds, points, handicaps } = tournament;

  const tournamentDate = new Date(date).toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  const StyledTab = styled(Tab)(({ theme }) => ({
    fontFamily: "Cubano",
    fontSize: "1.15rem",
    color: "white",
  }));

  return (
    <>
      <PageHero
        title="Tournament"
        backgroundImage={tournament.courseImg}
        date={tournamentDate}
        hasScores={tournament.rounds.length ? true : false}
      />

      <Box sx={{ bgcolor: "black", py: 1 }}>
        <Tabs
          value={value}
          centered
          onChange={handleTabChange}
          textColor="secondary"
          indicatorColor="secondary"
          aria-label="tournament details tabs"
        >
          <StyledTab label="Rounds" />
          <StyledTab label="Greenies" />
          <StyledTab label="Skins" />
          <StyledTab label="Winners" />
        </Tabs>
      </Box>
      <Container sx={{ pb: 5, pt: 3 }}>
        <TabPanel value={value} index={0}>
          <RoundsTab rounds={rounds} tournamentDate={date} />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <GreeniesTab
            greenies={greenies}
            tournamentDate={date}
            rounds={rounds}
          />
        </TabPanel>
        <TabPanel sx={{ px: 0 }} value={value} index={2}>
          <SkinsTab handicaps={handicaps} rounds={rounds} />
        </TabPanel>
        <TabPanel sx={{ px: 0 }} value={value} index={3}>
          <WinnersTab rounds={rounds} points={points} greenies={greenies} />
        </TabPanel>
      </Container>
    </>
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

function RoundsTab({ rounds, tournamentDate }) {
  // Only show edit button if user is logged in
  const { currentUser } = useContext(UserContext);

  const AddRoundButton = currentUser && (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <Button
        variant="contained"
        component={Link}
        to={`/rounds/create/${tournamentDate}`}
        sx={{ borderRadius: "30px", mb: 3, width: "150px" }}
      >
        <AddCircleOutlineIcon />{" "}
        <Box component="span" sx={{ ml: 1 }}>
          Round
        </Box>
      </Button>
    </Box>
  );

  return (
    <>
      {AddRoundButton}
      <Table
        responsive
        bordered
        striped
        variant="light"
        className="text-center"
        style={{ fontSize: "18px", fontFamily: "cubano" }}
      >
        <thead className="table-dark">
          <tr>
            {/* <th>NO</th> */}
            <th className="text-start fw-normal">PLAYER</th>
            {Array.from({ length: 18 }, (_, i) => (
              <th key={i + 1} className="d-none d-sm-table-cell">
                {i + 1}
              </th>
            ))}
            <th className="fw-normal">TOT</th>
            <th className="fw-normal">HCP</th>
            <th className="fw-normal">NET</th>
            <th className="fw-normal">PUT</th>
            {currentUser && (
              <th className="fw-normal">
                <BorderColorIcon />
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rounds.map((r, idx) => (
            <tr key={r.id}>
              {/* <th>{idx + 1}</th> */}
              <th className="text-start">
                <Link to={`/rounds/${r.id}`} className="text-decoration-none">
                  {r.firstName} {r.lastName[0]}
                </Link>
              </th>
              {Object.values(r.strokes || r.putts).map((s, idx) => (
                <td key={idx} className="d-none d-sm-table-cell">
                  {s}
                </td>
              ))}
              <td>{r.totalStrokes}</td>
              <td style={{ color: "red" }}>{r.courseHandicap}</td>
              <td>{r.netStrokes}</td>
              <td>{r.totalPutts}</td>
              {currentUser && (
                <td>
                  <Button
                    to={`/rounds/update/${r.id}`}
                    component={Link}
                    sx={{ p: 0.5, minWidth: "auto" }}
                  >
                    <BorderColorIcon />
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}

function GreeniesTab({ greenies, tournamentDate, rounds }) {
  const { currentUser } = useContext(UserContext);
  console.log("GREENIES", greenies);

  const AddGreenieButton =
    currentUser && rounds.length !== 0 ? (
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Button
          variant="contained"
          component={Link}
          color="success"
          to={`/greenies/create/${tournamentDate}`}
          sx={{ borderRadius: "30px", mb: 3, width: "150px" }}
        >
          <AddCircleOutlineIcon />{" "}
          <Box component="span" sx={{ ml: 1 }}>
            Greenie
          </Box>
        </Button>
      </Box>
    ) : (
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Typography variant="p">
          Create round before entering a greenie
        </Typography>
      </Box>
    );

  return (
    <Box>
      {AddGreenieButton}

      <Grid container justifyContent="center">
        <Grid item xs={12} md={8} lg={6}>
          <Table striped bordered className="text-center">
            <thead className="table-dark">
              <tr>
                <th className="text-start">PLAYER</th>
                <th>HOLE</th>
                <th>FEET</th>
                <th>INCH</th>
                {currentUser && (
                  <th className="fw-normal">
                    <BorderColorIcon />
                  </th>
                )}
              </tr>
            </thead>
            {greenies.length ? (
              <tbody>
                {greenies.map((g) => (
                  <tr key={g.id}>
                    <th className="text-start">
                      <Link
                        to={`/rounds/${g.roundId}`}
                        className="text-decoration-none"
                      >
                        {`${g.firstName} ${g.lastName[0]}`}
                      </Link>
                    </th>
                    <td>#{g.holeNumber}</td>
                    <td>{g.feet}'</td>
                    <td>{g.inches}"</td>
                    {currentUser && (
                      <td>
                        <Button
                          to={`/greenies/update/${g.id}`}
                          component={Link}
                          // variant="outlined"
                          sx={{ p: 0.5, minWidth: "auto" }}
                        >
                          <BorderColorIcon />
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            ) : null}
          </Table>
        </Grid>
      </Grid>
    </Box>
  );
}

/******************* SKINS TABLE ********************/
function SkinsTab({ pars, handicaps, rounds }) {
  // Transform rounds data to subtract strokes for each golfer based on their handicap
  const skinsData = rounds.map((r) => {
    const strokesValues = Object.values(r.strokes);
    const handicapValues = Object.values(handicaps);

    // Create an array of objects like [{ hole: 1, strokes: 4, handicap: 5 }, ...]
    const round = strokesValues.map((value, idx) => {
      return { hole: idx + 1, strokes: value, handicap: handicapValues[idx] };
    });

    // Only adjust this many holes
    let adjustedHandicap = r.courseHandicap / 2;

    // Map over existing hole scores and adjust based on handicap
    const adjustedRound = round.map((hole) => {
      if (adjustedHandicap > 18) adjustedHandicap = 18;

      // take a stroke off if handicap is less than or equal to the hole handicap
      if (hole.handicap <= adjustedHandicap) {
        hole.strokes = (hole.strokes - 1).toString();
      }

      return {
        holeNumber: hole.hole,
        strokes: hole.strokes,
        handicap: hole.handicap,
      };
    });

    const playerName = r.username.split("-");
    const shortName =
      playerName[0] + " " + (playerName[1] ? playerName[1][0] : "");

    return {
      name: shortName,
      courseHandicap: r.courseHandicap,
      round: adjustedRound,
    };
  });

  console.log(`SKINS TAB`, skinsData);

  // TODO: Figure out how to determine if there is a winner for each hole and who is the winner
  // Maybe start with transforming skinsData to be [{ holeNumber: 1, scores: [{name: "Dave", strokes: 4}, {name: "Tom", strokes: 3}]}, ...]
  // const winners = skinsData.map((item) => {
  //   return {
  //     name: item.name,
  //     hole: item.round[0].holeNumber,
  //     score: item.round[0].strokes,
  //   };
  // });
  // console.log(`WINNERS`, winners);

  return (
    <Box>
      <Table
        responsive
        striped
        bordered
        variant="light"
        className="text-center"
      >
        <thead>
          <tr className="table-dark">
            <th className="text-start">HOLE</th>
            {Array.from({ length: 18 }, (_, i) => (
              <th key={i + 1}>{i + 1}</th>
            ))}
          </tr>
          <tr className="table-dark">
            <th className="text-start">HANDICAP</th>
            {Object.values(handicaps).map((p, i) => (
              <th key={i}>{p}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {skinsData.map((player, idx) => (
            <tr key={idx}>
              <th className="text-start">
                {player.name} ({player.courseHandicap})
              </th>
              {player.round.map((hole, i) => (
                <td
                  key={i}
                  style={{
                    color: typeof hole.strokes === "string" ? "red" : "black",
                  }}
                >
                  {hole.strokes}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
      <Box sx={{ mb: 3, textAlign: "start" }}>
        <Typography variant="p">
          Skins game subtracts one stroke for the most difficult player handicap
          ÷ 2 holes for each golfer. Adjusted hole scores are shown in{" "}
          <span style={{ color: "red" }}>red</span>.
        </Typography>
      </Box>
    </Box>
  );
}

function WinnersTab({ rounds, points }) {
  // sort rounds by total putts and slice to only top 3
  const puttsWinners = [...rounds]
    .sort((a, b) => a.totalPutts - b.totalPutts)
    .slice(0, 3);

  // sort rounds by net strokes and slice to only top 3
  const strokesWinners = [...rounds]
    .sort((a, b) => a.netStrokes - b.netStrokes)
    .slice(0, 3);

  // TODO: HANDLE THIRD PLACE TIES
  // if (strokesWinners.length === 3){
  //   if(strokesWinners[2])
  // }
  console.log("STROKE WINNER", strokesWinners);

  return (
    <>
      <Box sx={{ mb: 5 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" align="center" gutterBottom>
              Strokes
            </Typography>
            <Table
              responsive
              bordered
              striped
              variant="light"
              className="text-center"
            >
              <thead className="table-dark">
                <tr>
                  <th>POS</th>
                  <th className="text-start">NAME</th>
                  <th>NET</th>
                </tr>
              </thead>
              <tbody>
                {strokesWinners.map((player, idx) => (
                  <tr key={idx}>
                    <td style={{ fontFamily: "cubano" }}>{idx + 1}</td>
                    <td style={{ textAlign: "start", fontFamily: "cubano" }}>
                      {player.firstName + " " + player.lastName}
                    </td>
                    <td>{player.netStrokes}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" align="center" gutterBottom>
              PUTTS
            </Typography>
            <Table
              responsive
              bordered
              striped
              variant="light"
              className="text-center"
            >
              <thead className="table-dark">
                <tr>
                  <th>POS</th>
                  <th className="text-start">NAME</th>
                  <th>TOT</th>
                </tr>
              </thead>
              <tbody>
                {puttsWinners.map((winner, idx) => (
                  <tr key={idx}>
                    <td style={{ fontFamily: "cubano" }}>{idx + 1}</td>
                    <td style={{ fontFamily: "cubano", textAlign: "start" }}>
                      {winner.firstName} {winner.lastName}
                    </td>
                    <td>{winner.totalPutts}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Grid>
        </Grid>
      </Box>

      <Box>
        <Typography variant="h4" gutterBottom align="center">
          Points
        </Typography>
        <RankingsTable data={points} />
      </Box>
    </>
  );
}
