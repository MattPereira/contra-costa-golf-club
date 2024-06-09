import React, { useContext, useState, useRef } from "react";
import { Modal } from "@mui/material";
import { useForm } from "react-hook-form";
import CcgcApi from "../../api/api";
import { useEffect } from "react";

import { useNavigate } from "react-router-dom";
import UserContext from "../../lib/UserContext";
import { Link } from "react-router-dom";
import ArrowDropDownCircleOutlinedIcon from "@mui/icons-material/ArrowDropDownCircleOutlined";

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
      console.log("res", res);

      const players = res.map((round) => ({
        roundId: round.id,
        username: round.username,
        totalStrokes: round.totalStrokes,
      }));

      console.log("players", players);

      setPlayers(players);
    };

    fetchPlayers();
  }, [round]);

  return (
    <div className="flex justify-center">
      <div className="w-full md:w-3/4 xl:w-1/2">
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
  console.log("currentUser", currentUser);
  const [isEditMode, setEditMode] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const formRef = useRef(null); // Ref for the form element

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

  const handleBlur = (event) => {
    // Check if the new focused element is outside the form
    if (!formRef.current.contains(event.relatedTarget)) {
      if (isEditMode) {
        console.log("here!!!!");
        setEditMode(false);
        handleSubmit(onSubmit)();
      }
    }
  };

  return (
    <div className="mb-3">
      <form ref={formRef} onBlur={handleBlur} onSubmit={handleSubmit(onSubmit)}>
        {/* <div className="w-full">
          <div className="dropdown dropdown-end w-full mb-3">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-lg btn-outline border-4 border-black text-black w-full text-xl font-cubano font-normal flex justify-between"
              onClick={() => {
                if (isEditMode) handleSubmit(onSubmit)();
                setDropdownOpen(!isDropdownOpen);
              }}
            >
              Select Player{" "}
              <ArrowDropDownCircleOutlinedIcon
                fontSize="large"
                className="text-black"
              />
            </div>
            {isDropdownOpen && (
              <ul className="dropdown-content z-[1] menu p-2 shadow bg-white text-black rounded-box w-80 mt-3 border-4 border-black">
                {players && players.length > 0
                  ? players.map((player, idx) => (
                      <li key={player.roundId}>
                        <a
                          href={`/rounds/${player.roundId}`}
                          className={`font-cubano font-normal text-black py-[12px] text-xl flex justify-between  rounded-none ${
                            idx !== players.length - 1 &&
                            "border-b border-black"
                          }`}
                          onClick={() => setDropdownOpen(false)} // Close dropdown on click
                        >
                          <div>{player.username.split("-").join(" ")}</div>
                          <div>{player.totalStrokes}</div>
                        </a>
                      </li>
                    ))
                  : null}
              </ul>
            )}
          </div>
        </div> */}

        <div className="flex justify-between items-center mb-3">
          <div className="text-center font-cubano font-normal text-3xl">
            {round.username.split("-").join(" ")}
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
                <th className="py-2 w-1/4 border-r border-b bg-[#212529]">
                  PAR
                </th>
                <th className="py-2 w-1/4 border-r">STR</th>
                <th className="py-2 w-1/4">PUT</th>
              </tr>
            </thead>
            <tbody>
              {mobileRows.map((hole, index) => (
                <tr
                  key={hole.holeNumber}
                  className={`text-gray-700 text-center ${index % 2 === 0 ? "bg-gray-200" : "bg-gray-100"
                    }`}
                >
                  <th className="py-2 border-r border-t bg-[#212529] text-white">
                    #{hole.holeNumber}
                  </th>
                  <td className="py-2 bg-zinc-600 border-r border-white text-white border-b w-1/4">
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

        {currentUser && (
          <div className="flexitems-center mt-28">
            <button
              type="button"
              className="bg-red-600 w-full text-white rounded py-2 font-cubano text-xl"
              onClick={handleOpen}
            >
              Delete
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
