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
      <PageHero title="Tour Standings" backgroundImage={standingsImage} />

      <Container sx={{ py: 5 }}>
        <Grid container justifyContent="center">
          <Grid item xs={12} lg={9} sx={{ textAlign: "center" }}>
            <Typography variant="h3" sx={{ mb: 2 }}>
              Rankings
            </Typography>
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
                    sx={{ fontFamily: "Cubano", fontSize: "1.25rem" }}
                  />
                  <Tab
                    label="2023"
                    value="2"
                    onClick={() => setTourYear("2022-23")}
                    sx={{ fontFamily: "Cubano", fontSize: "1.25rem" }}
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
            <Box sx={{ my: 5 }}>
              <PointsTables />
            </Box>
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
          <th>NAME</th>
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
            <th>
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

function PointsTables() {
  const [value, setValue] = useState("1");
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  return (
    <>
      <Typography variant="h3" gutterBottom>
        Points
      </Typography>

      <TabContext value={value}>
        <Box>
          <TabList
            centered
            onChange={handleChange}
            aria-label="lab API tabs example"
          >
            <Tab
              label="Position"
              value="1"
              sx={{ fontFamily: "Cubano", fontSize: "1.25rem" }}
            />
            <Tab
              label="Greenies"
              value="2"
              sx={{ fontFamily: "Cubano", fontSize: "1.25rem" }}
            />
            <Tab
              label="Scores"
              value="3"
              sx={{ fontFamily: "Cubano", fontSize: "1.25rem" }}
            />
          </TabList>
        </Box>
        <TabPanel sx={{ px: 0 }} value="1">
          <Table
            responsive
            bordered
            variant="light"
            striped
            className="text-center"
          >
            <thead>
              <tr className="table-dark">
                <th>POSITION</th>
                <th>1ST</th>
                <th>2ND</th>
                <th>3RD</th>
                <th>4TH</th>
                <th>5TH</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>STROKES</th>
                <td>25</td>
                <td>20</td>
                <td>15</td>
                <td>10</td>
                <td>5</td>
              </tr>
              <tr>
                <th>PUTTS</th>
                <td>6</td>
                <td>4</td>
                <td>2</td>
                <td>-</td>
                <td>-</td>
              </tr>
            </tbody>
          </Table>
        </TabPanel>
        <TabPanel sx={{ px: 0 }} value="2">
          <Table bordered variant="light" striped className="text-center">
            <thead>
              <tr className="table-dark">
                <th>ON</th>
                <th>INSIDE 20'</th>
                <th>INSIDE 10'</th>
                <th>INSIDE 2'</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>1</td>
                <td>2</td>
                <td>3</td>
              </tr>
            </tbody>
          </Table>
        </TabPanel>
        <TabPanel sx={{ px: 0 }} value="3">
          <Table bordered variant="light" striped className="text-center">
            <thead>
              <tr className="table-dark">
                <th>PAR</th>
                <th>BIRDIE</th>
                <th>EAGLE</th>
                <th>ACE</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>2</td>
                <td>4</td>
                <td>10</td>
              </tr>
            </tbody>
          </Table>
        </TabPanel>
      </TabContext>
    </>
  );
}
