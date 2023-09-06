import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner";
import CcgcApi from "../../api/api";

import UserContext from "../../lib/UserContext";

import PageHero from "../../components/PageHero";

// prettier-ignore
import { Button, Typography, Container, Box, Modal, Tab, Grid, Tabs} from "@mui/material";
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

/** The Round Page
 * @tab Scores
 * - See, edit, and delete scores
 * @tab Greenies
 * - See, edit, and delete greenies
 * @tab Handicap
 * - Information for how handicaps are calculated
 */

export default function RoundDetails() {
  let navigate = useNavigate();
  const { id } = useParams();

  const [round, setRound] = useState(null);
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleDelete = async (id) => {
    await CcgcApi.deleteRound(id);
    navigate(`/tournaments/${round.tournamentDate}`);
  };

  /* On component mount, load round data from API */
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

  const date = new Date(round.tournamentDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  const formattedName = round.username.split("-").join(" ");

  return (
    <Box>
      <PageHero
        title={round.courseName.split(" ").slice(0, 2).join(" ")}
        backgroundImage={round.courseImg}
        date={date}
        isRoundHero={true}
      />

      <Box sx={{ py: 1, bgcolor: "black" }}>
        <StyledTabs
          centered
          onChange={handleChange}
          textColor="secondary"
          indicatorColor="secondary"
          value={value}
        >
          <StyledTab label="Scores" />
          <StyledTab label="Greenies" />
          <StyledTab label="Handicap" />
        </StyledTabs>
      </Box>

      <Container sx={{ py: 4 }}>
        <h3 className="ml-5 text-3xl font-cubano text-center mb-4">
          {formattedName}
        </h3>
        <TabPanel value={value} index={0}>
          <ScoresTab round={round} setRound={setRound} />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <GreeniesTab {...round} />
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
