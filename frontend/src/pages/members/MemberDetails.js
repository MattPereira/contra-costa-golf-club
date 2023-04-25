import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CcgcApi from "../../api/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Link } from "react-router-dom";

import { Container, Row, Table, Accordion } from "react-bootstrap";
import { Typography } from "@mui/material";

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

  console.log("Member:", member);
  console.log("ROUNDS:", rounds);

  return (
    <Container className="py-5">
      <Row className="row justify-content-center">
        <Typography variant="h1">
          {member.firstName} {member.lastName}
        </Typography>

        <hr
          className="mb-5"
          style={{ border: "2px solid grey", width: "20%" }}
        ></hr>

        <div className="col-md-10 mb-3">
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
              <div className="my-5">
                <Typography align="center" variant="h3" gutterBottom>
                  Calculations
                </Typography>
                <CalculationsAccordion />
              </div>
            </div>
          ) : (
            <p>{member.firstName} has not submitted any rounds yet!</p>
          )}
        </div>
      </Row>
    </Container>
  );
}

function CalculationsAccordion() {
  return (
    <Accordion variant="dark">
      <Accordion.Item eventKey="0">
        <Accordion.Header>Total Strokes</Accordion.Header>
        <Accordion.Body>
          <p className="lead fw-bold">Hole1 + Hole2 + ... + Hole18</p>
          <p>Sum of the strokes for all 18 holes.</p>
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="1">
        <Accordion.Header>Score Differential</Accordion.Header>
        <Accordion.Body>
          <p className="lead fw-bold">
            ( 113 / Slope ) × ( Total Strokes − Rating )
          </p>
          <p>
            Measures the performance of a round in relation to the relative
            difficulty of the course that was played.
          </p>
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="2">
        <Accordion.Header>Player Index</Accordion.Header>
        <Accordion.Body>
          <p className="lead fw-bold">( Two lowest score diffs ) / 2</p>
          <p>Avg of lowest 2 score differentials out of last 4 rounds</p>
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="3">
        <Accordion.Header>Course Handicap</Accordion.Header>
        <Accordion.Body>
          <p className="lead fw-bold">
            ( Handicap Index × Course Slope ) / 113
          </p>
          <p>The number to subtract from total strokes to get net strokes.</p>
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="4">
        <Accordion.Header>Net Strokes</Accordion.Header>
        <Accordion.Body>
          <p className="lead fw-bold">Total Strokes − Course Handicap</p>
          <p>
            Net strokes is used to determine the finishing order for players in
            each tournament.
          </p>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
}
