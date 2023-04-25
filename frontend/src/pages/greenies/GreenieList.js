import React, { useState, useEffect } from "react";
import LoadingSpinner from "../../components/LoadingSpinner";
import CcgcApi from "../../api/api";

import GreenieCardList from "../../components/GreenieCardList";
import PageHero from "../../components/PageHero";
import greenieImage from "../../assets/greenie.webp";

import { Box, Container } from "@mui/material";

/** Show page with all greenies listed
 *
 *
 * On component mount, load greenies from API
 *
 * GreenieList component is "smart" parent component
 * that will render the GreenieCardList component.
 *
 * This is routed to path "/greenies"
 *
 * Router -> GreenieList -> GreenieCardList -> GreenieCard
 */

export default function GreenieList() {
  console.debug("GreenieList");
  const [greenies, setGreenies] = useState(null);

  /* On component mount, load greenies from API */
  useEffect(function getGreeniesOnMount() {
    console.debug("GreenieList useEffect getGreeniesOnMount");

    async function fetchAllGreenies() {
      let greenies = await CcgcApi.getGreenies();
      setGreenies(greenies);
    }
    fetchAllGreenies();
  }, []);

  if (!greenies) return <LoadingSpinner />;

  // console.log(greenies);

  return (
    <Box>
      <PageHero title="Closest Greenies" backgroundImage={greenieImage} />
      <Container sx={{ py: 5 }}>
        <Box>
          <GreenieCardList greenies={greenies} />
        </Box>
      </Container>
    </Box>
  );
}
