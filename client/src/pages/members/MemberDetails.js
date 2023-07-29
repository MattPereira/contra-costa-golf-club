import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CcgcApi from "../../api/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Link } from "react-router-dom";

import { Table } from "react-bootstrap";
import { Typography, Box, Container } from "@mui/material";
import PageHero from "../../components/PageHero";

/** Member details page.
 *
 * On component mount, load the member data from API
 * which includes all the rounds the member has played with CCGC
 *
 * This is routed to path "/members/:username"
 *
 *
 */

export default function MemberDetails() {
  const { username } = useParams();

  console.debug("MemberDetails", "username=", username);
  const [member, setMember] = useState(null);
  const [rounds, setRounds] = useState(null);

  /* On component mount, load user and rounds data from API */
  useEffect(
    function getMemberOnMount() {
      console.debug("MemberDetails useEffect getMemberOnMount");

      async function fetchUser() {
        setMember(await CcgcApi.getUser(username));
      }
      fetchUser();

      //get all rounds played by a particular member
      async function fetchRoundsByUsername() {
        setRounds(await CcgcApi.getRoundsByUsername(username));
      }
      fetchRoundsByUsername();
    },
    [username]
  );

  if (!member) return <LoadingSpinner />;

  const fullName = `${member.firstName} ${member.lastName}`;

  return (
    <Box>
      <PageHero title={fullName} />
      <Container sx={{ mb: 5 }}>
        <Box sx={{ my: 3 }}>
          <Typography variant="h3" align="center">
            Rounds
          </Typography>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "center" }}>
          {rounds ? (
            <div>
              <Table
                striped
                bordered
                responsive
                variant="light"
                className="text-center"
              >
                <thead>
                  <tr className="table-dark">
                    <th>DATE</th>
                    <th>TOT</th>
                    <th>DIF</th>
                    <th>IDX</th>
                    <th>HCP</th>
                    <th>NET</th>
                  </tr>
                </thead>
                <tbody>
                  {rounds.map((r) => (
                    <tr key={r.id}>
                      <th>
                        <Link
                          to={`/rounds/${r.id}`}
                          className="text-decoration-none"
                        >
                          {new Date(r.tournamentDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "numeric",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </Link>
                      </th>
                      <td>{r.totalStrokes}</td>
                      <td>{r.scoreDifferential}</td>
                      <td>{r.playerIndex}</td>
                      <td>{r.courseHandicap}</td>
                      <td>{r.netStrokes}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <Typography variant="p">
              {member.firstName} has not submitted any rounds yet!
            </Typography>
          )}
        </Box>
      </Container>
    </Box>
  );
}
