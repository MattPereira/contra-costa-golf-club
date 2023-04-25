import React from "react";
import GreenieCard from "./GreenieCard";
import { Grid } from "@mui/material";

/** Show list of greenie cards.
 *
 * Used by both GreenieList and TournamentDetails to list GreenieCards.
 *
 *
 * GreenieList -> GreenieCardList -> GreenieCard
 * TournamentDetails -> GreenieCardList -> GreenieCard
 */

const GreenieCardList = ({ greenies }) => {
  console.debug("GreenieCardList", "greenies=", greenies);

  return (
    <Grid container spacing={3}>
      {greenies.map((g) => (
        <Grid item xs={12} md={6} lg={4} key={g.id}>
          <GreenieCard greenie={g} />
        </Grid>
      ))}
    </Grid>
  );
};

export default GreenieCardList;
