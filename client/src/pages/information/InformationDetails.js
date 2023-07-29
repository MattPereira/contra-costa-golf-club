import PageHero from "../../components/PageHero";
import { Box, Container, Typography, Grid } from "@mui/material";

import * as React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { styled } from "@mui/material/styles";
import { Link } from "react-router-dom";
import { Table } from "react-bootstrap";

import glossaryHero from "../../assets/golf1.jpg";

/***** MUI Accordion Styles *****/

const StyledAccordionSummary = styled((props) => (
  <AccordionSummary {...props} />
))(({ theme }) => ({
  color: "black",
  backgroundColor: theme.palette.secondary.main,
  borderBottom: "1px solid black",
  paddingTop: "5px",
  paddingBottom: "5px",
}));

const StyledAccordionDetails = styled((props) => (
  <AccordionDetails {...props} />
))(({ theme }) => ({
  backgroundColor: theme.palette.secondary.main,
  padding: "20px",
}));

const StyledBadge = styled(Box)(({ theme }) => ({
  backgroundColor: "black",
  color: "white",
  display: "flex",
  alignItems: "center",
  marginRight: "10px",
  borderRadius: "5px",
  width: "55px",
  justifyContent: "center",
  padding: "3px 10px",
}));

export default function InformationDetails() {
  return (
    <Box>
      <PageHero
        title="Information"
        backgroundImage={glossaryHero}
        position={"bottom"}
      />
      <Container sx={{ py: 5 }}>
        <Grid spacing={4} container sx={{ mb: 5 }}>
          <Grid item xs={12} lg={6}>
            <TournamentSection />
          </Grid>
          <Grid item xs={12} lg={6}>
            <SkinsSection />
          </Grid>
        </Grid>
        <Grid spacing={4} container>
          <Grid item xs={12} lg={6}>
            <PointsSection />
          </Grid>
          <Grid item xs={12} lg={6}>
            <FormulaSection />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

function FormulaSection() {
  const [expanded, setExpanded] = React.useState("");

  const handleChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  };

  const formulas = [
    {
      title: "Total Strokes",
      abbreviation: "TOT",
      calculation: "Hole1 + Hole2 + ... + Hole18",
      description:
        "Sum of a players strokes for all 18 holes during a single round",
    },
    {
      title: "Score Differential",
      abbreviation: "DIF",
      calculation: "( 113 / Slope ) × ( Total Strokes − Course Rating )",
      description:
        "Measures the performance of a round in relation to the relative difficulty of the course that was played.",
    },
    {
      title: "Player Index",
      abbreviation: "IDX",
      calculation: "Average of Lowest 2 Score Differentials",
      description:
        "Average of lowest 2 score differentials from last 4 rounds played with club",
    },
    {
      title: "Course Handicap",
      abbreviation: "HCP",
      calculation: "( Player Index × Course Slope ) / 113",
      description:
        "The number to subtract from total strokes to get net strokes.",
    },
    {
      title: "Net Strokes",
      abbreviation: "NET",
      calculation: "Total Strokes − Course Handicap",
      description:
        "Used to determine the finishing order of players for each tournament",
    },
  ];

  return (
    <Box sx={{ mb: 5 }}>
      <Typography variant="h3" align="center" gutterBottom>
        Formulas
      </Typography>

      {formulas.map((formula, idx) => (
        <Accordion
          expanded={expanded === `panel${idx + 1}`}
          onChange={handleChange(`panel${idx + 1}`)}
          elevation={0}
          key={idx}
        >
          <StyledAccordionSummary
            expandIcon={
              <ExpandMoreIcon sx={{ color: "black", fontSize: "45px" }} />
            }
          >
            <Box sx={{ display: "flex" }}>
              <StyledBadge>
                <Typography variant="h5">{formula.abbreviation}</Typography>
              </StyledBadge>
              <Box>
                <Typography variant="h5">{formula.title} </Typography>
              </Box>
            </Box>
          </StyledAccordionSummary>
          <StyledAccordionDetails>
            <Typography variant="h5" color="primary.main" gutterBottom>
              {formula.calculation}
            </Typography>
            <Typography variant="p">
              <p>{formula.description}</p>
            </Typography>
          </StyledAccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}

function PointsSection() {
  const [expanded, setExpanded] = React.useState("");

  const handleChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  };

  const strokesTable = (
    <Table bordered responsive className="text-center">
      <thead>
        <tr className="table-dark">
          <th>1ST</th>
          <th>2ND</th>
          <th>3RD</th>
          <th>4TH</th>
          <th>5TH</th>
        </tr>
      </thead>
      <tbody>
        <tr className="bg-white">
          <td>25</td>
          <td>20</td>
          <td>15</td>
          <td>10</td>
          <td>5</td>
        </tr>
      </tbody>
    </Table>
  );

  const puttsTable = (
    <Table responsive bordered className="text-center">
      <thead>
        <tr className="table-dark">
          <th>1ST</th>
          <th>2ND</th>
          <th>3RD</th>
        </tr>
      </thead>
      <tbody>
        <tr className="bg-white">
          <td>6</td>
          <td>4</td>
          <td>2</td>
        </tr>
      </tbody>
    </Table>
  );

  const greeniesTable = (
    <Table bordered className="text-center">
      <thead>
        <tr className="table-dark">
          <th>ON</th>
          <th>INSIDE 20'</th>
          <th>INSIDE 10'</th>
          <th>INSIDE 2'</th>
        </tr>
      </thead>
      <tbody>
        <tr className="bg-white">
          <td>1</td>
          <td>+1</td>
          <td>+2</td>
          <td>+3</td>
        </tr>
      </tbody>
    </Table>
  );

  const scoresTable = (
    <Table bordered className="text-center">
      <thead>
        <tr className="table-dark">
          <th>PAR</th>
          <th>BIRDIE</th>
          <th>EAGLE</th>
          <th>ACE</th>
        </tr>
      </thead>
      <tbody>
        <tr className="bg-white">
          <td>1</td>
          <td>2</td>
          <td>4</td>
          <td>10</td>
        </tr>
      </tbody>
    </Table>
  );

  const pointsCategories = [
    {
      title: "strokes",
      abbreviation: "str",
      description:
        "The players with the lowest five net stroke totals for each tournament are awarded the following points:",
      table: strokesTable,
    },
    {
      title: "putts",
      abbreviation: "put",
      description:
        "The lowest three putt totals are awared the following points:",
      table: puttsTable,
    },
    {
      title: "greenies",
      abbreviation: "grn",
      description:
        "A player earns a greenie if their first stroke on a par 3 hole lands on the green. Each greenie is worth 1 point no matter the distance, but additional points are awarded based on proximity to the hole.",
      table: greeniesTable,
    },
    {
      title: "scores",
      abbreviation: "par",
      description: "Players earn bonus points for the following hole scores:",
      table: scoresTable,
    },
    {
      title: "participation",
      abbreviation: "ply",
      description: "Players receive 3 point for each tournament they play",
    },
  ];

  return (
    <Box>
      <Typography variant="h3" align="center" gutterBottom>
        Points
      </Typography>

      {pointsCategories.map((category, idx) => (
        <Accordion
          expanded={expanded === `panel${idx + 1}`}
          onChange={handleChange(`panel${idx + 1}`)}
          elevation={0}
          key={idx}
        >
          <StyledAccordionSummary
            expandIcon={
              <ExpandMoreIcon sx={{ color: "black", fontSize: "45px" }} />
            }
          >
            <Box sx={{ display: "flex" }}>
              <StyledBadge>
                <Typography variant="h5">{category.abbreviation}</Typography>
              </StyledBadge>
              <Box>
                <Typography variant="h5">{category.title} </Typography>
              </Box>
            </Box>
          </StyledAccordionSummary>
          <StyledAccordionDetails>
            <Box sx={{ mb: 2 }}>
              <Typography variant="p">{category.description}</Typography>
            </Box>
            <Box>{category.table}</Box>
          </StyledAccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}

function SkinsSection() {
  return (
    <Box>
      <Typography variant="h3" align="center" gutterBottom>
        Skins Game
      </Typography>
      <Typography variant="p">
        Match play competition where players win a "skin" by having the outright
        lowest adjusted score on a particular hole. If more than one player ties
        for the lowest score, there is no winner for that hole. All hole scores
        are reduced by one stroke for the most difficult player handicap divided
        by two holes for each golfer.
      </Typography>
    </Box>
  );
}

function TournamentSection() {
  return (
    <Box>
      <Typography variant="h3" align="center" gutterBottom>
        Tournaments
      </Typography>
      <Typography variant="p">
        The Contra Costa Golf Club holds 12 tournaments per year. Each round
        played generates points for the players based on their individual
        performance. At the end of the year, the player with the most points is
        crowned champion. Current player rankings are displayed on the{" "}
        <Link to="/standings">standings</Link> page.
      </Typography>
    </Box>
  );
}
