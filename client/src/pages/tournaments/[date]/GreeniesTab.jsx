import { useContext } from "react";
import { Link } from "react-router-dom";
import UserContext from "../../../lib/UserContext";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { Grid } from "@mui/material";

import GreeniesTable from "../../../components/GreeniesTable";

export default function GreeniesTab({ greenies, tournamentDate, rounds }) {
  const { currentUser } = useContext(UserContext);

  const AddGreenieButton =
    currentUser && rounds.length !== 0 ? (
      <div className="flex justify-end">
        <Link
          className="bg-green-700 hover:bg-green-800 text-white font-bold py-2 w-16 rounded text-center"
          to={`/greenies/create/${tournamentDate}`}
          sx={{ mb: 5 }}
        >
          <AddCircleOutlineIcon sx={{ fontSize: "30px" }} />
        </Link>
      </div>
    ) : (
      <div className="text-center">
        <p className="text-xl font-gothic">
          Must create a round before adding any greenies!
        </p>
      </div>
    );

  return (
    <div>
      <Grid container justifyContent="center">
        <Grid item xs={12} md={8} lg={6}>
          <p className="font-gothic text-center text-xl mb-4">
            Select player by name to manage greenies
          </p>
          <GreeniesTable greenies={greenies} />
          {AddGreenieButton}
        </Grid>
      </Grid>
    </div>
  );
}
