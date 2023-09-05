import { Link } from "react-router-dom";
import { Box, Button } from "@mui/material";
import GreeniesTable from "../../components/GreeniesTable";

export default function GreeniesTab({ tournamentDate, greenies }) {
  return (
    <Box>
      <Box sx={{ mb: 3, textAlign: "center" }}>
        <Button
          variant="contained"
          color="success"
          component={Link}
          to={`/greenies/create/${tournamentDate}`}
        >
          Add Greenie
        </Button>
      </Box>
      {greenies.length ? (
        <GreeniesTable greenies={greenies} />
      ) : (
        <div>No greenies entered for this round.</div>
      )}
    </Box>
  );
}
