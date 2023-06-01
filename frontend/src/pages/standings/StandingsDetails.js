import React, { useState, useEffect } from "react";
import CcgcApi from "../../api/api";
import LoadingSpinner from "../../components/LoadingSpinner";
// prettier-ignore
import { Box, Container, Grid, FormControl, MenuItem, Select, Typography } from "@mui/material";
import { Link } from "react-router-dom";

import PageHero from "../../components/PageHero";
import standingsImage from "../../assets/tour-standings.webp";

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
  const [tournaments, setTournaments] = useState(null);

  const handleChange = (event) => {
    setTourYear(event.target.value);
  };

  /* On component mount, load club standings from API */
  useEffect(
    function getStandingsOnMount() {
      console.debug("Standings useEffect getStandingsOnMount");

      async function getStandings() {
        setStandings(await CcgcApi.getStandings(tourYear));
      }
      async function getTournaments() {
        setTournaments(await CcgcApi.getTournaments());
      }
      getStandings();
      getTournaments();
    },
    [tourYear]
  );

  if (!standings || !tournaments) return <LoadingSpinner />;

  console.log(standings);

  // Farm all tournaments for tour years and remove duplicates with set
  const tourYearsOptions = Array.from(
    new Set(
      tournaments.map((t) => {
        return t.tourYears;
      })
    )
  );
  console.log("years", tourYearsOptions);

  return (
    <Box>
      <PageHero title="Standings" backgroundImage={standingsImage} />

      <Container sx={{ py: 3 }}>
        <Grid container justifyContent="center" sx={{ mt: 3 }}>
          <Grid item xs={12} lg={9} sx={{ textAlign: "center" }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="p">
                Top 10 rounds for each player by tour year
              </Typography>
            </Box>

            <Grid container sx={{ mb: 3 }}>
              <Grid item xs={12} lg={6}>
                <FormControl fullWidth>
                  <label style={{ textAlign: "start" }}>Tour Year:</label>
                  <Select
                    id="tour-year"
                    value={tourYear}
                    onChange={handleChange}
                    sx={{ fontFamily: "cubano", fontSize: "1.5rem" }}
                  >
                    {tourYearsOptions.map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <RankingsTable data={standings} />
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
