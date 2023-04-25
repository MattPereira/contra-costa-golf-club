import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import CcgcApi from "../../api/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import GreenieForm from "./GreenieForm";

/** This component is used to fetch tournament data to pass to <NewGreenieForm/>
 *  to populate the form's golfer select field with
 *  options from the tournament
 *
 * Routed as /greenies/:date/new
 * Routes -> NewGreenie -> NewGreenieForm
 */

export default function GreenieCreate() {
  const { date } = useParams();

  /** Fetch the tournament data first to set formData state properly */
  const [rounds, setRounds] = useState(null);
  const [tournament, setTournament] = useState(null);

  // Grab the round from API to make an array of roundIds for select input
  useEffect(
    function getTournamentOnMount() {
      console.debug("NewGreenie useEffect getRoundOnMount");

      async function fetchRound() {
        const rounds = await CcgcApi.getRoundsByDate(date);
        setRounds(rounds);
      }

      async function fetchTournament() {
        const tournament = await CcgcApi.getTournament(date);
        setTournament(tournament);
      }
      fetchTournament();
      fetchRound();
    },
    [date]
  );

  if (!rounds || !tournament) return <LoadingSpinner />;
  console.log("ROUNDS", rounds);
  console.log("TOURNAMENT", tournament);

  const usernames = rounds.map((round) => [round.id, round.username]);

  //array of par 3 hole numbers for select input
  const par3HoleNums = Object.entries(tournament.pars)
    .filter((p) => p[1] === 3)
    .map((h) => h[0])
    .map((h) => h.split("e")[1]);
  console.log(par3HoleNums);

  return (
    <div>
      <GreenieForm par3HoleNums={par3HoleNums} usernames={usernames} />
    </div>
  );
}
