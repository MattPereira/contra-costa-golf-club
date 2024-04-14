import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner";
import CcgcApi from "../../api/api";
import PageHero from "../../components/PageHero";
import useQuery from "../../hooks/useQuery";

import { Container, Box, Tab, Tabs } from "@mui/material";
import { styled } from "@mui/material/styles";

import GreeniesTab from "./GreeniesTab";
import HandicapTab from "./HandicapTab";
import ScoresTab from "./ScoresTab";

/***** STYLES *****/
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

const StyledTabs = styled(Tabs)(({ theme }) => ({
  "& .MuiTabs-indicator": {
    backgroundColor: "transparent",
  },
}));

/** The Round Details Page
 * @tab Scores
 * - Shows round scorecard
 * - Edit round scores
 * - Delete whole round including greenis
 * @tab Greenies
 * - See, edit, and delete greenies
 * @tab Handicap
 * - Information for how handicaps are calculated
 */

export default function RoundDetails() {
  const { id } = useParams();
  const { tab } = useQuery();

  const [round, setRound] = useState(null);
  const [value, setValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    if (tab === "greenies") {
      setValue(1);
    } else if (tab === "handicap") {
      setValue(2);
    } else {
      setValue(0);
    }
  }, [tab]);

  useEffect(
    function getRoundOnMount() {
      console.debug("RoundDetails useEffect getRoundOnMount");

      async function getRound() {
        setRound(await CcgcApi.getRound(id));
      }
      getRound();
    },
    [id]
  );

  if (!round) return <LoadingSpinner />;
  console.log("round", round);
  const formattedName = round.username.split("-").join(" ");

  return (
    <Box>
      <PageHero
        // title={formattedName}
        backgroundImage={round.courseImg}
        date={round.tournamentDate}
        isRoundHero={true}
      />

      <Box sx={{ py: 1, bgcolor: "black" }}>
        <StyledTabs
          centered
          onChange={handleTabChange}
          textColor="secondary"
          indicatorColor="secondary"
          value={value}
        >
          <StyledTab label="Scores" />
          <StyledTab label="Greenies" />
          <StyledTab label="Handicap" />
        </StyledTabs>
      </Box>

      <Container sx={{ py: 3 }}>
        <TabPanel value={value} index={0}>
          <ScoresTab round={round} setRound={setRound} />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <GreeniesTab {...round} setRound={setRound} />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <HandicapTab round={round} />
        </TabPanel>
      </Container>
    </Box>
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
