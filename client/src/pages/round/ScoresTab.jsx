import React, { useContext, useState } from "react";
import { Modal } from "@mui/material";
import { useForm } from "react-hook-form";
import CcgcApi from "../../api/api";
import { useEffect } from "react";

import { useNavigate } from "react-router-dom";
import UserContext from "../../lib/UserContext";
import { Link } from "react-router-dom";

/** Scores tab of "round page"
 *
 * Only show edit and delete buttons if user isAdmin or
 * if the user is the owner of the round
 */

export default function ScoresTab({ round, setRound }) {
  const navigate = useNavigate();

  // State & functions for modal that allows round deletion
  const [open, setOpen] = useState(false);
  const [players, setPlayers] = useState(undefined);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleDelete = async (id) => {
    await CcgcApi.deleteRound(id);
    navigate(`/tournaments/${round.tournamentDate}`);
  };

  useEffect(() => {
    const fetchPlayers = async () => {
      const res = await CcgcApi.getRoundsByDate(round.tournamentDate);

      const players = res.map((round) => ({
        roundId: round.id,
        username: round.username,
      }));

      setPlayers(players);
    };

    fetchPlayers();
  }, [round]);

  console.log("players", players);

  return (
    <div className="flex justify-center">
      <div className="w-full md:w-3/4 xl:w-1/2">
        <div className="flex"></div>
        <ScoresTable
          round={round}
          setRound={setRound}
          handleOpen={handleOpen}
          players={players}
          key={round.id}
        />
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 rounded bg-red-700 shadow-lg">
            <div className="p-4 text-white">
              <h5 className="font-cubano text-3xl mb-3">Are you Sure?</h5>
              <p className="font-gothic text-xl mb-4">
                This action will permanently erase all data associated with this
                round including greenies. Proceed with caution.
              </p>
              <div className="flex gap-4 justify-end">
                <button
                  className="text-xl border border-white text-white px-4 py-2 rounded font-cubano"
                  onClick={handleClose}
                >
                  Cancel
                </button>
                <button
                  className="text-xl border border-white text-white px-4 py-2 rounded font-cubano"
                  onClick={() => handleDelete(round.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}

function ScoresTable({ round, setRound, handleOpen, players }) {
  const { currentUser } = useContext(UserContext);
  const [isEditMode, setEditMode] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const strokes = Object.values(round.strokes);
  const putts = Object.values(round.putts);
  const pars = Object.values(round.pars);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const roundData = {
        tournamentDate: round.tournamentDate,
        username: round.username,
        strokes: {},
        putts: {},
      };

      Object.keys(data).forEach((key) => {
        // Extract the type and hole number from the key
        const matches = key.match(/(putts|strokes)(\d+)/);
        if (matches) {
          const type = matches[1]; // either "putts" or "strokes"
          const hole = `hole${matches[2]}`; // hole number
          // Insert the strokes or putts into roundData.putts or roundData.strokes
          let value;

          if (data[key] === "") {
            value = null;
          } else {
            value = +data[key];
          }

          roundData[type][hole] = value;
        }
      });

      await CcgcApi.updateRound(round.id, roundData);

      setRound((prevRound) => {
        return {
          ...prevRound,
          strokes: roundData.strokes,
          putts: roundData.putts,
        };
      });

      setEditMode(false);
    } catch (err) {
      console.log(err);
    }
  };

  // FOR MOBILE SCREEN SIZE DISPLAY
  //making an array like [{holeNumber: 1, strokes: 4, putts: 2, par: 3}, {holeNumber: 2, strokes: 4, putts: 2, par: 3}, ...]
  const mobileRows = [];

  for (let i = 0; i < 18; i++) {
    mobileRows.push({
      holeNumber: i + 1,
      strokes: strokes[i],
      putts: putts[i],
      par: pars[i],
    });
  }

  return (
    <div className="mb-3">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-10">
          <div className="dropdown w-full mb-4">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-outline btn-secondary w-full text-xl font-cubano font-normal"
              onClick={() => setDropdownOpen(!isDropdownOpen)}
            >
              Player
            </div>
            {isDropdownOpen && (
              <ul className="dropdown-content z-[1] menu p-2 shadow bg-white border border-black rounded-box w-72 mt-2">
                {players && players.length > 0
                  ? players.map((player) => (
                      <li key={player.roundId} className="my-1 text-xl">
                        <Link
                          to={`/rounds/${player.roundId}`}
                          className="font-cubano font-normal text-blue-600"
                          onClick={() => setDropdownOpen(false)} // Close dropdown on click
                        >
                          {player.username.split("-").join(" ")}
                        </Link>
                      </li>
                    ))
                  : null}
              </ul>
            )}
          </div>
          <div>
            {currentUser && !isEditMode && (
              <button
                type="button"
                onClick={() => setEditMode(!isEditMode)}
                className="font-cubano font-normal w-full btn btn-primary text-xl"
              >
                update
              </button>
            )}
            {isEditMode && (
              <button
                type="submit"
                className="font-cubano btn btn-success font-normal w-full text-xl text-white"
              >
                save
              </button>
            )}
          </div>
        </div>

        <div className="border rounded-xl overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="text-white bg-[#212529] text-center">
                <th className="py-2 border-r">HOLE</th>
                <th className="py-2 w-1/4 border-r">PAR</th>
                <th className="py-2 w-1/4 border-r">STR</th>
                <th className="py-2 w-1/4">PUT</th>
              </tr>
            </thead>
            <tbody>
              {mobileRows.map((hole, index) => (
                <tr
                  key={hole.holeNumber}
                  className={`text-gray-700 text-center ${
                    index % 2 === 0 ? "bg-gray-200" : "bg-gray-100"
                  }`}
                >
                  <th className="py-2 border-r border-t bg-[#212529] text-white">
                    #{hole.holeNumber}
                  </th>
                  <td className="py-2 border-r border-[#212529] border-b w-1/4">
                    {hole.par}
                  </td>
                  <td
                    className={`px-2 border-r border-[#212529] border-b w-1/4`}
                    onClick={() => setEditMode(true)}
                  >
                    {isEditMode ? (
                      <input
                        defaultValue={hole.strokes}
                        {...register(`strokes${hole.holeNumber}`)}
                        type="number"
                        className="w-full rounded"
                        onBlur={handleSubmit(onSubmit)} // Submit form on blur
                      />
                    ) : (
                      hole.strokes
                    )}
                  </td>
                  <td
                    className={`px-2 border-r border-b border-black w-1/4`}
                    onClick={() => setEditMode(true)}
                  >
                    {isEditMode ? (
                      <input
                        defaultValue={hole.putts}
                        {...register(`putts${hole.holeNumber}`)}
                        type="number"
                        className="w-full rounded"
                        onBlur={handleSubmit(onSubmit)} // Submit form on blur
                      />
                    ) : (
                      hole.putts
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-32 px-2">
          <button
            type="button"
            className="bg-red-600 w-full text-white rounded py-2 font-cubano text-xl"
            onClick={handleOpen}
          >
            Delete
          </button>
        </div>
      </form>
    </div>
  );
}
