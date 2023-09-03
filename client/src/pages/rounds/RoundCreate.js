import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

// Internal Imports
import UserContext from "../../lib/UserContext";
import PageHero from "../../components/PageHero";
import CcgcApi from "../../api/api";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function AddRound() {
  const { date } = useParams();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const onSubmit = async (data) => {
    const createNullHoleData = () => {
      return Object.fromEntries(
        Array.from({ length: 18 }, (_, i) => [`hole${i + 1}`, null])
      );
    };

    const roundData = {
      tournamentDate: date,
      username: data.username,
      strokes: createNullHoleData(),
      putts: createNullHoleData(),
    };

    try {
      const round = await CcgcApi.createRound(roundData);
      navigate(`/rounds/${round.id}`);
    } catch (e) {
      console.error(e);
    }
  };

  const [members, setMembers] = useState(null);
  const [rounds, setRounds] = useState(null);
  const [course, setCourse] = useState(null);

  // Grab all courses from API to make an array of course handles for select input
  // Fetch the members data first to set the select "player" input options
  useEffect(
    function getMembersOnMount() {
      async function fetchAllMembers() {
        let members = await CcgcApi.getMembers();
        setMembers(members);
      }

      async function fetchTournamentRounds() {
        let rounds = await CcgcApi.getRoundsByDate(date);
        setRounds(rounds);
      }

      async function fetchTournament() {
        const tournament = await CcgcApi.getTournament(date);
        setCourse(tournament.course);
      }
      fetchTournament();
      fetchTournamentRounds();
      fetchAllMembers();
    },
    [date]
  );

  if (!members || !rounds || !course) return <LoadingSpinner />;

  //Filter out users who have already submitted a round for this tournament
  //So they arent added to form select input as an option
  const usernames = members.map((m) => m.username);
  const alreadySubmitted = rounds.map((r) => r.username);
  const availableUsernames = usernames.filter(
    (u) => !alreadySubmitted.includes(u)
  );

  const humanDate = new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  console.log(watch("username"));

  return (
    <div>
      <PageHero
        title={course.courseHandle}
        backgroundImage={course.courseImg}
        date={humanDate}
      />
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div>
          <h3>Create Round</h3>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
              <select {...register("username")}>
                <option value="" disabled selected>
                  Choose player...
                </option>
                {availableUsernames.map((username) => (
                  <option key={username} value={username}>
                    {username}
                  </option>
                ))}
              </select>
            </div>

            <input type="submit" className="btn btn-primary" />
          </form>
        </div>
      </div>
    </div>
  );
}
