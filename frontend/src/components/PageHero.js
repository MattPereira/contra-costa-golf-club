import React, { useContext } from "react";
import UserContext from "../lib/UserContext";

import { Paper, Typography, Box, Button } from "@mui/material";
import { styled } from "@mui/material/styles";

import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { Link } from "react-router-dom";

export default function PageHero({
  title,
  backgroundImage,
  tournamentDate,
  hasScores,
  isRoundHero,
}) {
  const { currentUser } = useContext(UserContext);

  const StyledButton = styled(Button)({
    color: "white",
    border: "2px solid white",
    "&:hover": {
      backgroundColor: "white",
      color: "black",
      borderColor: "white",
    },
    minidth: "138.906px",
    borderRadius: "30px",
    margin: "0rem 0.5rem",
  });

  // Only show add buttons inside showcase if on tournament page and authenticated user
  const addButtons = tournamentDate && currentUser && !isRoundHero && (
    <Box sx={{ mt: 2 }}>
      <StyledButton
        variant="outlined"
        component={Link}
        to={`/rounds/create/${tournamentDate}`}
      >
        <AddCircleOutlineIcon />{" "}
        <Box component="span" sx={{ ml: 0.5 }}>
          Round
        </Box>
      </StyledButton>

      {hasScores && (
        <StyledButton
          variant="outlined"
          component={Link}
          to={`/greenies/create/${tournamentDate}`}
        >
          <AddCircleOutlineIcon /> <span className="ms-2">Greenie</span>
        </StyledButton>
      )}
    </Box>
  );

  const dateButton = isRoundHero && tournamentDate && (
    <Box sx={{ mt: 2 }}>
      <StyledButton
        variant="outlined"
        component={Link}
        to={`/tournaments/${tournamentDate}`}
      >
        {tournamentDate}
      </StyledButton>
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 0, sm: 1.5 } }}>
      <Paper
        sx={{
          height: { xs: "175px", sm: "275px" },
          borderRadius: { xs: "0px", sm: "30px" },
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${backgroundImage}) center / cover no-repeat`,
          padding: "0.5rem",
        }}
      >
        <Box>
          <Typography
            variant="h1"
            sx={{ color: "white", fontSize: "2.5rem", mb: 0 }}
          >
            {title}
          </Typography>
        </Box>
        {addButtons}
        {dateButton}
      </Paper>
    </Box>
  );
}
