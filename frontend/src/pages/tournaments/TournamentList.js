import React, { useState, useEffect } from "react";
import LoadingSpinner from "../../components/LoadingSpinner";
import CcgcApi from "../../api/api";
// import TournamentCard from "../../components/Tournaments/TournamentCard";
import PageHero from "../../components/PageHero";
import tournamentsImage from "../../assets/tournaments.jpg";
import { Link } from "react-router-dom";

import { Container, Col } from "react-bootstrap";
import { Box, Paper, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

/** Show page with all tournaments listed
 *
 * On component mount, load tournaments from API
 *
 * TournamentList component is parent component
 * that will render TournamentCard components
 * that serve as links to get to the TournamentDetails component
 *
 * This is routed to path "/tournaments"
 *
 * Router -> TournamentList -> TournamentCard
 */

export default function TournamentList() {
  console.debug("TournamentList");

  const [tournaments, setTournaments] = useState(null);

  /* On component mount, load tournaments from API */
  useEffect(function getTournamentsOnMount() {
    console.debug("TournamentList useEffect getTournamentsOnMount");

    async function fetchAllTournaments() {
      let tournaments = await CcgcApi.getTournaments();
      setTournaments(tournaments);
    }
    fetchAllTournaments();
  }, []);

  if (!tournaments) return <LoadingSpinner />;

  return (
    <Box>
      <PageHero title="Tournaments" backgroundImage={tournamentsImage} />
      <Container className="py-5">
        <div className="text-center row justify-content-center">
          {tournaments.map((t) => (
            <Col md={12} lg={6} xl={6} key={t.date}>
              <TournamentCard key={t.date} date={t.date} imgUrl={t.imgUrl} />
            </Col>
          ))}
        </div>
      </Container>
    </Box>
  );
}

/** Tournament card component.
 *
 * Show card with tournament date and course image
 * TournamentCard functions as a link to each tournament's detail page.
 */

function TournamentCard({ date, imgUrl }) {
  const StyledPaper = styled(Paper)(({ theme }) => ({
    borderRadius: "30px",
    backgroundColor: "black",
    color: "white",
    "&:hover": {
      backgroundColor: "#eeeeee",
      color: "black",
    },
  }));

  const StyledCardImage = styled(Box)(({ theme }) => ({
    width: "100%",
    height: "203.984px",
    borderRadius: "30px",
    objectFit: "cover",
  }));

  return (
    <Box sx={{ mb: 5 }}>
      <Link to={`/tournaments/${date}`} style={{ textDecoration: "none" }}>
        <StyledPaper elevation={8}>
          <StyledCardImage component="img" src={imgUrl} />
          <Box
            sx={{
              py: 2,
            }}
          >
            <Typography variant="h4">
              {" "}
              {new Date(date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                timeZone: "UTC",
              })}
            </Typography>
          </Box>
        </StyledPaper>
      </Link>
    </Box>
  );
}
