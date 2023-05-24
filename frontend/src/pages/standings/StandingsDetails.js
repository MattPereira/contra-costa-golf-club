import React, { useState, useEffect } from "react";
import CcgcApi from "../../api/api";
import LoadingSpinner from "../../components/LoadingSpinner";

import { Box, Tab, Tabs, Container, Grid, Typography } from "@mui/material";
import { Link } from "react-router-dom";

import PageHero from "../../components/PageHero";
import standingsImage from "../../assets/tour-standings.webp";
import { styled } from "@mui/material/styles";
import { Table } from "react-bootstrap";

/** Show club standings page
 *
 * * * * EXPORTING THE RankingsTable component TO TOURNAMENT DETAILS PAGE * * *
 *
 * Displays rankings by year and points details for each event
 *
 * Router -> Standings
 */

export default function StandingsDetails() {
  const [standings, setStandings] = useState(null);
  const [tourYear, setTourYear] = useState("2022-23");
  const [value, setValue] = useState(1);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  /* On component mount, load club standings from API */
  useEffect(
    function getStandingsOnMount() {
      console.debug("Standings useEffect getStandingsOnMount");

      async function getStandings() {
        setStandings(await CcgcApi.getStandings(tourYear));
      }
      getStandings();
    },
    [tourYear]
  );

  if (!standings) return <LoadingSpinner />;

  console.log(standings);

  const StyledTab = styled(Tab)(({ theme }) => ({
    fontFamily: "Cubano",
    fontSize: "1.5rem",
    color: "white",
  }));

  return (
    <Box>
      <PageHero title="Standings" backgroundImage={standingsImage} />

      <Box sx={{ bgcolor: "black", pb: 1 }}>
        <Tabs
          value={value}
          centered
          onChange={handleChange}
          textColor="secondary"
          indicatorColor="secondary"
          aria-label="standings tabs"
        >
          <StyledTab label="2022" onClick={() => setTourYear("2021-22")} />
          <StyledTab label="2023" onClick={() => setTourYear("2022-23")} />
        </Tabs>
      </Box>

      <Container sx={{ py: 3 }}>
        <Typography variant="h3" align="center">
          '{tourYear.split("-")[1]} Rankings
        </Typography>
        <Grid container justifyContent="center" sx={{ mt: 3 }}>
          <Grid item xs={12} lg={9} sx={{ textAlign: "center" }}>
            <TabPanel value={value} index={0}>
              <RankingsTable data={standings} />
            </TabPanel>
            <TabPanel value={value} index={1}>
              <RankingsTable data={standings} />
            </TabPanel>
          </Grid>
        </Grid>
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

export function RankingsTable({ data }) {
  return (
    <Table responsive striped bordered variant="light" className="text-center">
      <thead>
        <tr className="table-dark">
          <th>POS</th>
          <th className="text-start">NAME</th>
          <th className="d-none d-md-table-cell">PLY</th>
          <th>STR</th>
          <th>PUT</th>
          <th>GRN</th>
          <th className="d-none d-sm-table-cell">PAR</th>
          <th className="d-none d-sm-table-cell">BRD</th>
          <th className="d-none d-sm-table-cell">EGL</th>
          <th className="d-none d-sm-table-cell">ACE</th>
          <th>TOT</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr key={row.username}>
            <th>{idx + 1}</th>
            <th className="text-start">
              {row.roundId ? (
                <Link
                  to={`/rounds/${row.roundId}`}
                  className="text-decoration-none"
                >
                  {row.firstName} {row.lastName[0]}
                </Link>
              ) : (
                <Link
                  to={`/members/${row.username}`}
                  className="text-decoration-none"
                >
                  {row.firstName} {row.lastName[0]}
                </Link>
              )}
            </th>
            <td className="d-none d-md-table-cell">{row.participation}</td>
            <td>{row.strokes}</td>
            <td>{row.putts}</td>
            <td>{row.greenies}</td>
            <td className="d-none d-sm-table-cell">{row.pars}</td>
            <td className="d-none d-sm-table-cell">{row.birdies}</td>
            <td className="d-none d-sm-table-cell">{row.eagles}</td>
            <td className="d-none d-sm-table-cell">{row.aces}</td>
            <td>{row.total}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
