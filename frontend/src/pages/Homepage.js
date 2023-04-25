import standingsImage from "../assets/tour-standings.webp";
import greenieImage from "../assets/greenie.webp";
import membersImage from "../assets/members-stats.jpg";
import coursesImage from "../assets/golf-courses.jpg";
import tournamentsImage from "../assets/tournaments.jpg";

import CcgcApi from "../api/api";

import SiteHero from "../components/SiteHero";
import LoadingSpinner from "../components/LoadingSpinner";
import Footer from "../components/Footer";

import { styled } from "@mui/material/styles";

import { useState, useEffect } from "react";
import { Container, Box, Grid, Paper, Typography } from "@mui/material";
import { Link } from "react-router-dom";

/** Homepage component { path :"/" }
 *
 * displays cards for "current events" and "club resources"
 *
 * displays footer at bottom of page??
 *
 * Router -> Homepage
 */

export default function Homepage() {
  console.debug("Homepage");

  const [tournament, setTournament] = useState(null);

  useEffect(function getUpcomingTournamentOnMount() {
    console.debug("Homepage useEffect getUpcomingTournamentOnMount");

    async function getUpcomingTournament() {
      setTournament(await CcgcApi.getUpcomingTournament());
    }

    getUpcomingTournament();
  }, []);

  if (!tournament) return <LoadingSpinner />;

  const fullTournamentDate = new Date(tournament.date).toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    }
  );

  const tournamentMonth = new Date(tournament.date).toLocaleDateString(
    "en-US",
    {
      month: "long",
    }
  );

  const content = [
    {
      title: "Current Events",
      cards: [
        {
          path: `tournaments/${tournament.date}`,
          image: tournament.courseImg,
          title: `${tournamentMonth} Tournament`,
          description: `Join us on ${fullTournamentDate} at ${tournament.courseName}`,
        },
        {
          path: "standings",
          image: standingsImage,
          title: "Tour Standings",
          description: "All club members ranked by points earned this season",
        },
        {
          path: "greenies",
          image: greenieImage,
          title: "Closest Greenies",
          description:
            "Top 10 shots that landed nearest to the pin on par threes",
        },
      ],
    },
    {
      title: "Club Resources",
      cards: [
        {
          path: "members",
          image: membersImage,
          title: "Member Metrics",
          description:
            "Per round averages and handicap calculations for each club member",
        },
        {
          path: "tournaments",
          image: tournamentsImage,
          title: "Past Tournaments",
          description:
            "See the scorecards, greenies, and points for completed tournaments",
        },
        {
          path: "courses",
          image: coursesImage,
          title: "Golf Courses",
          description:
            "The pars, slopes, handicaps, and ratings for each course we play",
        },
      ],
    },
  ];

  const StyledFadeInBox = styled(Box)({
    animation: "fadeIn 3s",
    height: "100%",
    "@keyframes fadeIn": {
      "100%": {
        opacity: 1,
      },
      "0%": {
        opacity: 0,
      },
    },
  });

  const StyledCardPaper = styled(Paper)(({ theme }) => ({
    borderRadius: "30px",
    backgroundColor: "#eeeeee",
    "&:hover": {
      backgroundColor: "black",
      color: "white",
    },
  }));

  const StyledCardImage = styled(Box)(({ theme }) => ({
    width: "100%",
    height: "203.984px",
    borderRadius: "30px",
    objectFit: "cover",
  }));

  const StyledCardTitle = styled(Typography)(({ theme }) => ({
    marginBottom: "1rem",
  }));

  return (
    <StyledFadeInBox>
      <Grid
        container
        flexDirection="column"
        justifyContent="space-between"
        sx={{ height: "100%", flexWrap: "nowrap" }}
      >
        <Grid item>
          <SiteHero />
          <Container maxWidth="xl" disableGutters sx={{ p: { xs: 1, lg: 4 } }}>
            {content.map((section) => (
              <Box sx={{ mb: 5, mt: { xs: 4, lg: 0 } }} key={section.title}>
                <Typography variant="h3" sx={{ mb: 2, ml: 3 }}>
                  {section.title}
                </Typography>
                <Grid container spacing={3}>
                  {section.cards.map((card) => (
                    <Grid item xs={12} md={6} lg={4} key={card.title}>
                      <Link to={card.path} style={{ textDecoration: "none" }}>
                        <StyledCardPaper elevation={0}>
                          <StyledCardImage component="img" src={card.image} />
                          <Box sx={{ px: 3, pt: 3, pb: 5 }}>
                            <StyledCardTitle variant="h5">
                              {card.title}
                            </StyledCardTitle>
                            <Typography variant="p">
                              {card.description}
                            </Typography>
                          </Box>
                        </StyledCardPaper>
                      </Link>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))}
          </Container>
        </Grid>
        <Grid item>
          <Footer />
        </Grid>
      </Grid>
    </StyledFadeInBox>
  );
}
