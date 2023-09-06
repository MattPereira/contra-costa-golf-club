import { Link } from "react-router-dom";
import { Box, Button } from "@mui/material";
import GreeniesTable from "../../components/GreeniesTable";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

export default function GreeniesTab({ tournamentDate, greenies }) {
  return (
    <Box>
      {greenies.length ? (
        <GreeniesTable greenies={greenies} />
      ) : (
        <div className="text-center font-gothic mb-5 text-xl">
          No greenies entered for this round.
        </div>
      )}
      <Box sx={{ mb: 3, textAlign: "end" }}>
        <Button
          variant="contained"
          color="success"
          component={Link}
          to={`/greenies/create/${tournamentDate}`}
        >
          <AddCircleOutlineIcon sx={{ fontSize: "30px" }} />
        </Button>
      </Box>
    </Box>
  );
}
