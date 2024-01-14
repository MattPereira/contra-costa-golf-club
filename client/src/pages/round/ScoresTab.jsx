import React, { useContext, useState } from "react";
import { Button, Typography, Box, Modal } from "@mui/material";
import { useForm } from "react-hook-form";
import CcgcApi from "../../api/api";

import { useNavigate } from "react-router-dom";
import UserContext from "../../lib/UserContext";

const modalStyles = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "rgb(211, 47, 47)",
  borderRadius: "20px",
  boxShadow: 24,
  p: 4,
};

/** Scores tab of "round page"
 *
 * Only show edit and delete buttons if user isAdmin or
 * if the user is the owner of the round
 */

export default function ScoresTab({ round, setRound }) {
  const navigate = useNavigate();

  // State & functions for modal that allows round deletion
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleDelete = async (id) => {
    await CcgcApi.deleteRound(id);
    navigate(`/tournaments/${round.tournamentDate}`);
  };

  return (
    <div className="flex justify-center">
      <div className="w-full md:w-3/4 xl:w-1/2">
        {/* <h3 className="font-cubano text-4xl text-center mb-4">Scorecard</h3> */}
        <ScoresTable
          round={round}
          setRound={setRound}
          handleOpen={handleOpen}
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

function ScoresTable({ round, setRound, handleOpen }) {
  const { currentUser } = useContext(UserContext);
  const [isEditMode, setEditMode] = useState(false);

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
    <div className="mb-5">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex justify-end items-center mb-4 px-2">
          {/* <button
            type="button"
            className="bg-red-600 text-white rounded py-2 font-cubano text-xl w-28"
            onClick={handleOpen}
          >
            Delete
          </button> */}
          {currentUser && !isEditMode && (
            <button
              type="button"
              onClick={() => setEditMode(!isEditMode)}
              className="text-blue-500 font-cubano bg-blue-600 text-white rounded w-28 py-2 text-xl"
            >
              update
            </button>
          )}
          {isEditMode && (
            <button
              type="submit"
              className=" font-cubano bg-green-600 text-white rounded w-28 py-2 text-xl"
            >
              save
            </button>
          )}
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
                  <td className={`px-2 border-r border-b border-black w-1/4`}>
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
      </form>
    </div>
  );
}
