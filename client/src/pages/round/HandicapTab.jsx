import { Grid, Typography, Box } from "@mui/material";
import { Table } from "react-bootstrap";

export default function HandicapTab({ round }) {
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
    <div>
      {/* <h3 className="font-cubano text-4xl text-center mb-4">Calculations</h3> */}

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
          <Box
            sx={{ border: "1px solid black", borderRadius: "10px", py: 0.5 }}
          >
            {lowestTwoDiffs.length ? (
              <Typography variant="h6">
                ({" "}
                <span>
                  {lowestTwoDiffs[0] || 0} +{" "}
                  {lowestTwoDiffs[1] || lowestTwoDiffs[0]}
                </span>{" "}
                ) ÷ 2 ={" "}
                <span style={{ color: "royalblue" }}>{playerIndex}</span>
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
          <Box
            sx={{ border: "1px solid black", borderRadius: "10px", py: 0.5 }}
          >
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
    </div>
  );
}
