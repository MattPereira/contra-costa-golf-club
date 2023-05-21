import PageHero from "../../components/PageHero";
import { Box, Container, Typography } from "@mui/material";
import FunctionsIcon from "@mui/icons-material/Functions";

export default function FormulaDetails() {
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
      <PageHero title="Formulas" />
      <Container sx={{ py: 5 }}>
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
      </Container>
    </Box>
  );
}
