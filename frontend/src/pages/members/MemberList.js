import React, { useState, useEffect } from "react";
import CcgcApi from "../../api/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Link } from "react-router-dom";
import { Row, Col, Container, Table } from "react-bootstrap";
import { Box, Typography } from "@mui/material";

import PageHero from "../../components/PageHero";
import membersImage from "../../assets/members-stats.jpg";

// import MemberCard from "../../components/Members/MemberCard";

/** Show page with all members listed
 *
 * On component mount, load members from API
 *
 * This is routed to path "/members"
 *
 * Routes -> { MemberCard }
 */

const MemberList = () => {
  console.debug("MemberList");

  const [members, setMembers] = useState(null);

  /* On component mount, load companies from API */
  useEffect(function getCompaniesOnMount() {
    console.debug("MemberList useEffect getMembersOnMount");

    async function fetchAllMembers() {
      let members = await CcgcApi.getMembers();
      setMembers(members);
    }
    fetchAllMembers();
  }, []);

  if (!members) return <LoadingSpinner />;
  console.log(members);

  return (
    <Box>
      <PageHero title="Member Metrics" backgroundImage={membersImage} />
      <Container className="pb-5 text-center">
        <Typography variant="h2" sx={{ my: 3 }}>
          Round Averages
        </Typography>
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            {members.length ? (
              <Table
                bordered
                striped
                hover
                responsive
                variant="light"
                className="text-center"
              >
                <thead>
                  <tr className="table-dark">
                    <th>NAME</th>
                    <th>RND</th>
                    <th>STR</th>
                    <th>PUT</th>
                    <th>GRN</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m.username}>
                      <th>
                        <Link
                          to={`/members/${m.username}`}
                          className="text-decoration-none"
                        >
                          {m.firstName} {m.lastName[0]}
                        </Link>
                      </th>
                      <td>{m.totalRounds}</td>
                      <td>{m.avgStrokes}</td>
                      <td>{m.avgPutts}</td>

                      <td>{m.avgGreenies}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <p>Sorry, no results were found!</p>
            )}
          </Col>
        </Row>
      </Container>
    </Box>
  );
};

export default MemberList;
