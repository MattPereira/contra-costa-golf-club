import PageHero from "../../components/PageHero";
import { Box, Container, Typography } from "@mui/material";

import { Table } from "react-bootstrap";

export default function GlossaryDetails() {
  const formulaList = [
    {
      title: "Total Strokes",
      abbreviation: "TOT",
      formula: "Hole1 + Hole2 + ... + Hole18",
      description:
        "Sum of a players strokes for all 18 holes during a single round",
    },
    {
      title: "Score Differential",
      abbreviation: "DIF",
      formula: "( 113 / Slope ) × ( Total Strokes − Course Rating )",
      description:
        "Measures the performance of a round in relation to the relative difficulty of the course that was played.",
    },
    {
      title: "Player Index",
      abbreviation: "IDX",
      formula: "Average of Lowest 2 Score Differentials",
      description:
        "Average of lowest 2 score differentials from last 4 rounds played with club",
    },
    {
      title: "Course Handicap",
      abbreviation: "HCP",
      formula: "( Player Index × Course Slope ) / 113",
      description:
        "The number to subtract from total strokes to get net strokes.",
    },
    {
      title: "Net Strokes",
      abbreviation: "NET",
      formula: "Total Strokes − Course Handicap",
      description:
        "Used to determine the finishing order for players in each tournament",
    },
  ];

  return (
    <Box>
      <PageHero title="Glossary" />
      <Container sx={{ py: 5 }}>
        <Typography variant="h3" align="center" gutterBottom>
          Formulas
        </Typography>
        {formulaList.map((formula) => (
          <Box key={formula.abbreviation} sx={{ mb: 5 }}>
            <Box
              sx={{ display: "flex", borderBottom: "2px solid black", pb: 1 }}
            >
              <Box
                sx={{
                  backgroundColor: "black",
                  color: "white",
                  px: 1,
                  display: "flex",
                  alignItems: "center",
                  mr: 1,
                  borderRadius: "5px",
                }}
              >
                <Typography variant="h5">{formula.abbreviation}</Typography>
              </Box>
              <Typography variant="h4">{formula.title} </Typography>
            </Box>
            <Typography variant="h5" color="primary.main">
              {formula.formula}
            </Typography>
            <Typography variant="p">
              <p>{formula.description}</p>
            </Typography>
          </Box>
        ))}
        <Typography variant="h3" align="center" gutterBottom>
          Points
        </Typography>

        <Typography variant="h4" gutterBottom>
          Strokes
        </Typography>
        <Typography variant="h4" gutterBottom>
          Putts
        </Typography>
        <Typography variant="h4" gutterBottom>
          Greenies
        </Typography>
        <Typography variant="h4" gutterBottom>
          Skins Game
        </Typography>
        <Typography variant="h4" gutterBottom>
          Hole Scores
        </Typography>

        <Box sx={{ mb: 5 }}>
          <Table
            responsive
            bordered
            variant="light"
            striped
            className="text-center"
          >
            <thead>
              <tr className="table-dark">
                <th>POSITION</th>
                <th>1ST</th>
                <th>2ND</th>
                <th>3RD</th>
                <th>4TH</th>
                <th>5TH</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>STROKES</th>
                <td>25</td>
                <td>20</td>
                <td>15</td>
                <td>10</td>
                <td>5</td>
              </tr>
              <tr>
                <th>PUTTS</th>
                <td>6</td>
                <td>4</td>
                <td>2</td>
                <td>-</td>
                <td>-</td>
              </tr>
            </tbody>
          </Table>
        </Box>
        <Box sx={{ mb: 5 }}>
          <Table bordered variant="light" striped className="text-center">
            <thead>
              <tr className="table-dark">
                <th>ON</th>
                <th>INSIDE 20'</th>
                <th>INSIDE 10'</th>
                <th>INSIDE 2'</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>1</td>
                <td>2</td>
                <td>3</td>
              </tr>
            </tbody>
          </Table>
        </Box>
        <Box sx={{ mb: 5 }}>
          <Table bordered variant="light" striped className="text-center">
            <thead>
              <tr className="table-dark">
                <th>PAR</th>
                <th>BIRDIE</th>
                <th>EAGLE</th>
                <th>ACE</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>2</td>
                <td>4</td>
                <td>10</td>
              </tr>
            </tbody>
          </Table>
        </Box>
      </Container>
    </Box>
  );
}
