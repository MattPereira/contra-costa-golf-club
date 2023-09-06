import React, { useContext, useState } from "react";
import { Button, Typography, Box, Modal } from "@mui/material";
import { useForm } from "react-hook-form";
import CcgcApi from "../../api/api";

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
  const { currentUser } = useContext(UserContext);
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div className="flex justify-center">
      <div className="w-full md:w-3/4 xl:w-1/2">
        <ScoresTable round={round} setRound={setRound} />
        {currentUser && (
          <Box sx={{ my: 3, textAlign: "start" }}>
            <button
              className="bg-red-600 text-white rounded py-2 font-cubano text-xl px-4"
              onClick={handleOpen}
            >
              Delete
            </button>
          </Box>
        )}
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={modalStyles}>
            <Typography id="modal-modal-title" variant="h4" color="white">
              Are you Sure?
            </Typography>
            <Typography
              id="modal-modal-description"
              sx={{ mt: 2 }}
              color="white"
            >
              This action will permanently erase all data associated with this
              round including greenies. Proceed with caution.
            </Typography>
            <Box sx={{ mt: 3, textAlign: "right" }}>
              <Button
                variant="contained"
                onClick={handleClose}
                sx={{ mr: 2, bgcolor: "gray" }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="dark"
                sx={{ color: "white" }}
                onClick={() => handleDelete(round.id)}
              >
                Delete
              </Button>
            </Box>
          </Box>
        </Modal>
      </div>
    </div>
  );
}

function ScoresTable({ round, setRound }) {
  const { currentUser } = useContext(UserContext);
  const [isEditMode, setEditMode] = useState(false); // New state variable

  const strokes = Object.values(round.strokes);
  const putts = Object.values(round.putts);
  const pars = Object.values(round.pars);

  console.log("ROUND", round);

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
      console.log("ROUND DATA", roundData);

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
    <div>
      <div className="flex justify-end items-center mb-4">
        {currentUser && !isEditMode && (
          <button
            onClick={() => setEditMode(!isEditMode)}
            className="text-blue-500 font-cubano bg-blue-500 text-white rounded w-24 py-2 text-xl"
          >
            edit
          </button>
        )}
        {isEditMode && (
          <button
            onClick={handleSubmit(onSubmit)}
            className=" font-cubano bg-green-600 text-white rounded w-24 py-2 text-xl"
          >
            save
          </button>
        )}
      </div>
      <div className="border rounded-xl overflow-hidden">
        <form>
          <table className="min-w-full">
            <thead>
              <tr className="text-white bg-black text-center">
                <th className="py-2 border-r">#</th>
                <th className="py-2 w-1/4 border-r text-white">PAR</th>
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
                  <th className="py-2 border-r border-t bg-black text-white">
                    {hole.holeNumber}
                  </th>
                  <td className="py-2 border-r w-1/4 border-t">{hole.par}</td>
                  <td className={`px-2 border-r w-1/4`}>
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
                  <td className={`px-2 border-r w-1/4`}>
                    {isEditMode ? (
                      <input
                        defaultValue={hole.putts}
                        {...register(`putts${hole.holeNumber}`)}
                        type="number"
                        className="w-full"
                      />
                    ) : (
                      hole.putts
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </form>
      </div>
    </div>
  );
}
