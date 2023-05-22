import React, { useState, useEffect } from "react";
import CcgcApi from "../../api/api";
import LoadingSpinner from "../../components/LoadingSpinner";

import { Typography, Box, Tab, Container, Grid } from "@mui/material";
import { Link } from "react-router-dom";

// import StandingsTable from "../../components/Standings/StandingsTable";
// import PointsDetails from "../../components/Standings/PointsDetails";
import PageHero from "../../components/PageHero";
import standingsImage from "../../assets/tour-standings.webp";

import { Table } from "react-bootstrap";

import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";

/** Show club standings page
 *
 * * * * EXPORTING THE RankingsTable component TO TOURNAMENT DETAILS PAGE * * *
 *
 * Displays rankings by year and points details for each event
 *
 * Router -> Standings
 */

export default function StandingsDetails() {
  console.debug("Standings");
  const [standings, setStandings] = useState(null);

  const [tourYear, setTourYear] = useState("2022-23");

  const [value, setValue] = useState("2");
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

  return (
    <Box>
      <PageHero title="Standings" backgroundImage={standingsImage} />

      <Container>
        <Grid container justifyContent="center" sx={{ mt: 3 }}>
          <Grid item xs={12} lg={9} sx={{ textAlign: "center" }}>
            <TabContext value={value}>
              <Box>
                <TabList
                  centered
                  onChange={handleChange}
                  aria-label="lab API tabs example"
                >
                  <Tab
                    label="2022"
                    value="1"
                    onClick={() => setTourYear("2021-22")}
                    sx={{ fontFamily: "Cubano", fontSize: "1.5rem" }}
                  />
                  <Tab
                    label="2023"
                    value="2"
                    onClick={() => setTourYear("2022-23")}
                    sx={{ fontFamily: "Cubano", fontSize: "1.5rem" }}
                  />
                </TabList>
              </Box>
              <TabPanel sx={{ px: 0 }} value="1">
                <RankingsTable data={standings} />
              </TabPanel>
              <TabPanel sx={{ px: 0 }} value="2">
                <RankingsTable data={standings} />
              </TabPanel>
            </TabContext>
          </Grid>
        </Grid>
      </Container>
    </Box>
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
