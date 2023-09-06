import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";

import CcgcApi from "../../api/api";
import UserContext from "../../lib/UserContext";
import LoadingSpinner from "../../components/LoadingSpinner";
import { RankingsTable } from "../standings/StandingsDetails";
import PageHero from "../../components/PageHero";
import GreeniesTable from "../../components/GreeniesTable";

// prettier-ignore
import { Button, Container, Box, Tab, Typography, Grid, Tabs } from "@mui/material";
import { styled } from "@mui/material/styles";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { Table } from "react-bootstrap";

// STYLES
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

  const shortCourseName = course.courseName.split(" ").slice(0, 2).join(" ");

  return (
    <>
      <PageHero
        title={shortCourseName}
        backgroundImage={course.courseImg}
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
          <StyledTab label="Rounds" />
          <StyledTab label="Greenies" />
          <StyledTab label="Winners" />
        </StyledTabs>
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
            setValue={setValue}
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
    <Box sx={{ display: "flex", justifyContent: "end" }}>
      <Button
        variant="contained"
        component={Link}
        to={`/rounds/create/${tournamentDate}`}
        sx={{ mb: 5 }}
      >
        <AddCircleOutlineIcon sx={{ fontSize: "30px" }} />
      </Button>
    </Box>
  );

  return (
    <>
      <p className="text-center text-xl mb-[35px] font-gothic">
        Select player by name to update round
      </p>
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
          </tr>
        </thead>
        <tbody>
          {rounds.map((r, idx) => (
            <tr key={r.id}>
              {/* <th>{idx + 1}</th> */}
              <th className="text-start">
                <Link
                  to={`/rounds/${r.id}`}
                  className="font-gothic font-bold text-blue-500 underline"
                >
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
            </tr>
          ))}
        </tbody>
      </Table>
      {AddRoundButton}
    </>
  );
}

function GreeniesTab({ greenies, tournamentDate, rounds }) {
  const { currentUser } = useContext(UserContext);

  const AddGreenieButton =
    currentUser && rounds.length !== 0 ? (
      <Box sx={{ display: "flex", justifyContent: "end" }}>
        <Button
          variant="contained"
          component={Link}
          color="success"
          to={`/greenies/create/${tournamentDate}`}
          sx={{ mb: 5 }}
        >
          <AddCircleOutlineIcon sx={{ fontSize: "30px" }} />
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
      <Grid container justifyContent="center">
        <Grid item xs={12} md={8} lg={6}>
          <GreeniesTable greenies={greenies} />
        </Grid>
      </Grid>

      {AddGreenieButton}
    </Box>
  );
}

function WinnersTab({ rounds, points, handicaps, greenies, setValue }) {
  const [selectedDetailsTable, setSelectedDetailsTable] = useState(null);

  // ADJUSTING EACH ROUNDS STROKES FOR SKINS USING HANDICAPS
  const adjustedSkinsScores = rounds.map((r) => {
    // Transform rounds data to subtract strokes for each golfer based on their handicap
    const strokesValues = Object.values(r.strokes);
    const handicapValues = Object.values(handicaps);

    // Create an array of objects like [{ hole: 1, strokes: 4, handicap: 5 }, ...]
    const round = strokesValues.map((value, idx) => {
      return { hole: idx + 1, strokes: value, handicap: handicapValues[idx] };
    });

    // Only adjust this many holes scores
    let adjustedHandicap = r.courseHandicap / 2;

    // Map over existing hole scores and adjust based on handicap
    const adjustedRound = round.map((hole) => {
      if (adjustedHandicap > 18) adjustedHandicap = 18;

      // take a stroke off if handicap is less than or equal to the hole handicap
      if (hole.handicap <= adjustedHandicap) {
        // turn into string to differentiate to display ajusted strokes in red text color
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
      playerName[0] + " " + (playerName[1] ? playerName[1] : "");

    return {
      name: shortName,
      courseHandicap: r.courseHandicap,
      round: adjustedRound,
    };
  });

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

  const StyledSpan = styled("span")(({ theme }) => ({
    "&:hover": {
      color: theme.palette.primary.dark,
    },
    color: theme.palette.primary.main,
    cursor: "pointer",
    textDecoration: "underline",
  }));

  const tournamentIsComplete = rounds.every((r) => {
    return (
      Object.values(r.strokes).every((s) => s !== null) &&
      Object.values(r.putts).every((p) => p !== null)
    );
  });

  return (
    <section>
      <Box sx={{ mb: 5 }}>
        {!selectedDetailsTable && (
          <Box>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <StrokesWinnersTable rounds={rounds} />
                <Typography variant="p">
                  Lowest net strokes for this tournament. See the{" "}
                  <StyledSpan
                    onClick={() => setSelectedDetailsTable("strokes")}
                  >
                    strokes table
                  </StyledSpan>
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <PuttsWinnersTable rounds={rounds} />
                <Typography variant="p">
                  Lowest total putts for this tournament. See the{" "}
                  <StyledSpan onClick={() => setSelectedDetailsTable("putts")}>
                    putts table
                  </StyledSpan>
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <GreeniesWinnersTable greenies={greenies} />
                <Typography variant="p">
                  Closest to the pin wins the hole, but each player can only win
                  one par 3 per tournament. See{" "}
                  <StyledSpan onClick={() => setValue(1)}>
                    greenies table
                  </StyledSpan>
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <SkinsWinnersTable adjustedSkinsScores={adjustedSkinsScores} />
                <Typography variant="p">
                  Scores are adjusted based on hole difficulty and player
                  handicap. See{" "}
                  <StyledSpan onClick={() => setSelectedDetailsTable("skins")}>
                    skins table
                  </StyledSpan>
                </Typography>
              </Grid>
            </Grid>
            {tournamentIsComplete && <PointsDetailsTable points={points} />}
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

/***** EVERYTHING BELOW IS COMPONENTS FOR WinnersTab *****/
function StrokesWinnersTable({ rounds }) {
  console.log("rounds", rounds);

  const completedRounds = rounds.filter((r) => {
    return Object.values(r.strokes).every((s) => s !== null);
  });

  console.log("completedRounds", completedRounds);

  // sort rounds by net strokes
  const sortedRounds = [...completedRounds].sort(
    (a, b) => a.netStrokes - b.netStrokes
  );

  // top 3 will be winners of some sort
  const strokesWinners = sortedRounds.slice(0, 3);
  // TODO: HANDLE TIES
  // if there are at least three rounds completed
  // grab the third round from sorted array and see if there are any ties

  if (strokesWinners.length > 2) {
    sortedRounds.forEach((round) => {
      if (
        round.netStrokes === strokesWinners[2].netStrokes &&
        round.id !== strokesWinners[2].id
      ) {
        strokesWinners.push(round);
      }
    });
  }
  console.log("third", strokesWinners[2]);

  let position = 1;

  const winners = strokesWinners.map((round, idx) => {
    // only increment poisition if the previous round's net strokes is different
    if (idx > 0 && round.netStrokes !== strokesWinners[idx - 1].netStrokes) {
      position++;
    }

    return { position: position, ...round };
  });

  console.log("winners", winners);

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
              <td style={{ fontFamily: "cubano" }}>{player.position}</td>
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

function PuttsWinnersTable({ rounds }) {
  const completedRounds = rounds.filter((r) => {
    return Object.values(r.putts).every((s) => s !== null);
  });

  // sort rounds by total putts
  const sortedByPutts = [...completedRounds].sort(
    (a, b) => a.totalPutts - b.totalPutts
  );

  //slice the top 3 rounds who for sure win
  const puttsWinners = sortedByPutts.slice(0, 3);

  if (puttsWinners.length > 2) {
    sortedByPutts.forEach((round) => {
      // if there is a tie for third place, add the tied round to the winners array
      if (
        round.totalPutts === puttsWinners[2].totalPutts &&
        !puttsWinners.map((w) => w.id).includes(round.id)
      ) {
        puttsWinners.push(round);
      }
    });
  }

  let position = 1;

  const winners = puttsWinners.map((round, idx) => {
    // only increment poisition if the previous round's total putts is different
    if (idx > 0 && round.totalPutts !== puttsWinners[idx - 1].totalPutts) {
      console.log("puttsWinners", puttsWinners[idx - 1].totalPutts);

      position++;
    }

    return { position: position, ...round };
  });

  console.log("winners", winners);

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
              <td style={{ fontFamily: "cubano" }}>{winner.position}</td>
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

function GreeniesWinnersTable({ greenies }) {
  const winners = [];

  // determines number of holes that can be won
  const uniqueHoleNums = new Set(greenies.map((g) => g?.holeNumber));

  const alreadyWonHoles = [];
  const alreadyWonPlayers = [];

  console.log("GREENIES", greenies);

  /****** BUG HOTFIX AREA*****/
  // somehow the winners array was getting an undefined item in it

  // for each hole that can be won
  for (let i = 0; i < uniqueHoleNums.size; i++) {
    // each hole can only have one winner && each player cannot win more than one hole
    let filteredGreenies = greenies.filter(
      (g) =>
        !alreadyWonHoles.includes(g?.holeNumber) &&
        !alreadyWonPlayers.includes(g?.roundId)
    );

    // push the 0th index of the filtered array (pre-sorted by distance) to winners
    if (filteredGreenies[0]) {
      winners.push(filteredGreenies[0]);
    }
    // push the hole number and player id to alreadyWon arrays
    alreadyWonHoles.push(filteredGreenies[0]?.holeNumber);
    alreadyWonPlayers.push(filteredGreenies[0]?.roundId);
  }

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
        <tbody>
          {winners.map((winner, idx) => (
            <tr key={idx}>
              <td style={{ fontFamily: "cubano" }}>#{winner?.holeNumber}</td>
              <td style={{ fontFamily: "cubano", textAlign: "start" }}>
                {winner.firstName} {winner.lastName}
              </td>
              <td>
                {winner.feet}' {winner.inches}"
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Box>
  );
}

function SkinsWinnersTable({ adjustedSkinsScores }) {
  // TODO: Decide on how skins winners table should behave as incomplete rounds are entered
  // step 1: make an array of arrays (one for each hole)
  // inside the nested arrays will be an object for each player with their name and score for that hole
  // i.e. [{ holeNumber: 1, scores: [{name: "Dave", strokes: 4}, {name: "Tom", strokes: 3}]}, ...]

  const scoresByHoleNum = [];

  // loop 18 times to create an array of arrays
  for (let i = 0; i < 18; i++) {
    const holeScores = [];
    // loop over each golfer's round trying to add their score to the correct hole
    adjustedSkinsScores.forEach((golfer) => {
      // for each hole, add the golfer's name and score to the array
      if (i + 1 === golfer.round[i]?.holeNumber) {
        const scores = {
          name: golfer.name,
          strokes: +golfer.round[i].strokes,
          holeNumber: golfer.round[i]?.holeNumber,
        };

        holeScores.push(scores);
      }
    });

    scoresByHoleNum.push(holeScores);
  }

  // scoresByHoleNum looks like: [[{name: "Dennis", strokes: 5, holeNumber: 1},{name: "Matt", strokes: 3, holeNumber: 1} ], [...], [...]]
  // console.log(`SCORES BY HOLE`, scoresByHoleNum);

  const skinsWinners = [];
  //step 2: figure out if there is a holeScore that is lower than the rest
  // if there is, push that object onto skinsWinners
  // mabye make an array from just the strokes values and use Math.min() to find the lowest score and then check if its unique using a set
  // if it is unique, find it from original array of objects and push onto skinsWinners

  console.log("SCORES BY HOLE", scoresByHoleNum);

  scoresByHoleNum.forEach((hole) => {
    // make array of just hole scores i.e. [5,7,3,4]
    const holeScores = hole.map((golfer) => golfer.strokes);
    // find the lowest value in the array that is greater than 1
    const lowestScore = Math.min(...holeScores.filter((score) => score >= 1));
    // if that score is unique, push it onto skinsWinners
    const frequencyOfLowestScore = holeScores.filter(
      (score) => score === lowestScore
    );

    if (frequencyOfLowestScore.length === 1 && lowestScore >= 1) {
      // search array for golfer with strokes score equal to unique lowest score
      const winner = hole.find((golfer) => golfer.strokes === lowestScore);
      skinsWinners.push(winner);
    }
  });

  // console.log("SKINS WINNERS", skinsWinners);s

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
        <tbody>
          {skinsWinners.map((winner, idx) => (
            <tr key={idx}>
              <th>#{winner?.holeNumber}</th>
              <th className="text-start">{winner.name}</th>
              <td>{winner.strokes}</td>
            </tr>
          ))}
        </tbody>
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

function PointsDetailsTable({ points }) {
  return (
    <Box sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom align="center">
        Points
      </Typography>
      <RankingsTable data={points} />
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
