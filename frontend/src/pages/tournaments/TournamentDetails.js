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

  const { greenies, rounds, points, course } = tournament;

  const tournamentDate = new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  const StyledTab = styled(Tab)(({ theme }) => ({
    fontFamily: "Cubano",
    fontSize: "1.25rem",
    color: "white",
  }));

  const shortCourseName = course.courseName.split(" ").slice(0, 2).join(" ");

  return (
    <>
      <PageHero
        title={shortCourseName}
        backgroundImage={course.courseImg}
        date={tournamentDate}
        hasScores={rounds.length ? true : false}
      />

      <Box sx={{ bgcolor: "black", py: 1 }}>
        <Tabs
          value={value}
          centered
          onChange={handleTabChange}
          textColor="secondary"
          indicatorColor="secondary"
        >
          <StyledTab label="Rounds" />
          <StyledTab label="Greenies" />
          <StyledTab label="Winners" />
        </Tabs>
      </Box>
      <Container sx={{ py: 5 }}>
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
          <WinnersTab
            rounds={rounds}
            points={points}
            greenies={greenies}
            handicaps={course.handicaps}
          />
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
        sx={{ mb: 5, width: "150px" }}
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
                    sx={{
                      p: 0.5,
                      minWidth: "auto",
                      "&:hover": { color: "primary.dark" },
                    }}
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

  const AddGreenieButton =
    currentUser && rounds.length !== 0 ? (
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Button
          variant="contained"
          component={Link}
          color="success"
          to={`/greenies/create/${tournamentDate}`}
          sx={{ mb: 5, width: "150px" }}
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
          <Table striped bordered variant="light" className="text-center">
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
                          sx={{
                            p: 0.5,
                            minWidth: "auto",
                            "&:hover": { color: "primary.dark" },
                          }}
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

function WinnersTab({ rounds, points, handicaps }) {
  const [selectedDetailsTable, setSelectedDetailsTable] = useState(null);

  // sort rounds by total putts and slice to only top 3
  const puttsWinners = [...rounds]
    .sort((a, b) => a.totalPutts - b.totalPutts)
    .slice(0, 3);

  // sort rounds by net strokes and slice to only top 3
  let strokesWinners = [...rounds]
    .sort((a, b) => a.netStrokes - b.netStrokes)
    .slice(0, 3);

  // TODO: HANDLE THIRD PLACE TIES
  // if (strokesWinners.length === 3){
  //   if(strokesWinners[2])
  // }

  // Transform rounds data to subtract strokes for each golfer based on their handicap
  const adjustedSkinsScores = rounds.map((r) => {
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

  console.log(`SKINS SCORES`, adjustedSkinsScores);

  const skinsWinners = [];

  // step 1: make an array of arrays (one for each hole)
  // inside the nested arrays will be an object for each player with their name and score for that hole

  // TODO: Figure out how to determine if there is a winner for each hole and who is the winner
  // Maybe start with transforming adjustedSkinsScores to be [{ holeNumber: 1, scores: [{name: "Dave", strokes: 4}, {name: "Tom", strokes: 3}]}, ...]
  // const winners = adjustedSkinsScores.map((item) => {
  //   return {
  //     name: item.name,
  //     hole: item.round[0].holeNumber,
  //     score: item.round[0].strokes,
  //   };
  // });
  // console.log(`WINNERS`, winners);

  const detailsTables = {
    strokes: <StrokesDetailsTable rounds={rounds} />,
    putts: <PuttsDetailsTable rounds={rounds} />,
    points: <PointsDetailsTable data={points} />,
    skins: (
      <SkinsDetailsTable
        adjustedSkinsScores={adjustedSkinsScores}
        handicaps={handicaps}
      />
    ),
  };

  const StyledTypography = styled(Typography)(({ theme }) => ({
    "&:hover": {
      color: theme.palette.primary.dark,
    },
    color: theme.palette.primary.main,
    cursor: "pointer",
    textDecoration: "underline",
  }));

  return (
    <section>
      <Box sx={{ mb: 5 }}>
        {!selectedDetailsTable && (
          <Box>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <StrokesWinnersTable winners={strokesWinners} />
              </Grid>
              <Grid item xs={12} md={6}>
                <PuttsWinnersTable winners={puttsWinners} />
              </Grid>
              <Grid item xs={12} md={6}>
                <GreeniesWinnersTable winners="coming soon" />
              </Grid>
              <Grid item xs={12} md={6}>
                <SkinsWinnersTable winners={adjustedSkinsScores} />
              </Grid>
            </Grid>

            <Box sx={{ mt: 5 }}>
              <Typography variant="p">
                See all round data for this tournament's{" "}
              </Typography>
              {["strokes", "putts", "skins", "points"].map((category, idx) => (
                <span key={category}>
                  <StyledTypography
                    variant="p"
                    onClick={() => setSelectedDetailsTable(category)}
                  >
                    {category}
                  </StyledTypography>
                  <>
                    {idx !== 3 && ", "} {idx === 2 && "and "}
                  </>
                </span>
              ))}
            </Box>
          </Box>
        )}
        {selectedDetailsTable && (
          <DetailsTableWrapper
            setSelectedDetailsTable={setSelectedDetailsTable}
          >
            {detailsTables[selectedDetailsTable]}
          </DetailsTableWrapper>
        )}
      </Box>
    </section>
  );
}

function StrokesWinnersTable({ winners }) {
  return (
    <Box>
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
          {winners.map((player, idx) => (
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
    </Box>
  );
}

function PuttsWinnersTable({ winners }) {
  return (
    <Box>
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
          {winners.map((winner, idx) => (
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
    </Box>
  );
}

function GreeniesWinnersTable({ winners }) {
  return (
    <Box>
      <Typography variant="h4" align="center" gutterBottom>
        Greenies
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
            <th>HOLE</th>
            <th className="text-start">NAME</th>
            <th>LENGTH</th>
          </tr>
        </thead>
        <tbody></tbody>
      </Table>
    </Box>
  );
}

function SkinsWinnersTable({ winners }) {
  return (
    <Box>
      <Typography variant="h4" align="center" gutterBottom>
        Skins
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
            <th>HOLE</th>
            <th className="text-start">NAME</th>
            <th>SCORE</th>
          </tr>
        </thead>
        <tbody></tbody>
      </Table>
    </Box>
  );
}

function StrokesDetailsTable({ rounds }) {
  return (
    <Box>
      <Typography variant="h3" align="center" gutterBottom>
        Strokes
      </Typography>
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
            <th className="text-start fw-normal">PLAYER</th>
            {Array.from({ length: 18 }, (_, i) => (
              <th key={i + 1} className="d-none d-sm-table-cell">
                {i + 1}
              </th>
            ))}
            <th className="fw-normal">TOT</th>
            <th className="fw-normal">HCP</th>
            <th className="fw-normal">NET</th>
          </tr>
        </thead>
        <tbody>
          {rounds.map((r, idx) => (
            <tr key={r.id}>
              <th className="text-start">
                <Link to={`/rounds/${r.id}`} className="text-decoration-none">
                  {r.firstName} {r.lastName[0]}
                </Link>
              </th>
              {Object.values(r.strokes).map((s, idx) => (
                <td key={idx} className="d-none d-sm-table-cell">
                  {s}
                </td>
              ))}
              <td>{r.totalStrokes}</td>
              <td style={{ color: "red" }}>{r.courseHandicap}</td>
              <td>{r.netStrokes}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Box>
  );
}

function PuttsDetailsTable({ rounds }) {
  const sortedByPutts = [...rounds].sort((a, b) => a.totalPutts - b.totalPutts);

  return (
    <Box>
      <Typography variant="h3" align="center" sx={{ mb: 3 }}>
        Putts
      </Typography>
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
            <th className="text-start fw-normal">PLAYER</th>
            {Array.from({ length: 18 }, (_, i) => (
              <th key={i + 1} className="d-none d-sm-table-cell">
                {i + 1}
              </th>
            ))}
            <th className="fw-normal">TOT</th>
          </tr>
        </thead>
        <tbody>
          {sortedByPutts.map((r, idx) => (
            <tr key={r.id}>
              <th className="text-start">
                {r.firstName} {r.lastName[0]}
              </th>
              {Object.values(r.putts).map((putt, idx) => (
                <td key={idx} className="d-none d-sm-table-cell">
                  {putt}
                </td>
              ))}
              <td>{r.totalPutts}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Box>
  );
}

function SkinsDetailsTable({ adjustedSkinsScores, handicaps }) {
  return (
    <Box>
      <Typography variant="h3" align="center" sx={{ mb: 3 }}>
        Skins
      </Typography>
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
          {adjustedSkinsScores.map((player, idx) => (
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

function PointsDetailsTable({ data }) {
  return (
    <Box>
      <Typography variant="h3" gutterBottom align="center">
        Points
      </Typography>
      <RankingsTable data={data} />
    </Box>
  );
}

function DetailsTableWrapper({ setSelectedDetailsTable, ...props }) {
  return (
    <Box>
      {props.children}
      <Box sx={{ textAlign: "end", mb: 3 }}>
        <Typography
          variant="p"
          sx={{
            color: "primary.main",
            textDecoration: "underline",
            cursor: "pointer",
          }}
          onClick={() => setSelectedDetailsTable(null)}
        >
          Back to Winners
        </Typography>
      </Box>
    </Box>
  );
}
