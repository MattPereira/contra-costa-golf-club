import { useContext, useState, useEffect } from "react";
import UserContext from "../../../lib/UserContext";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import LoadingSpinner from "../../../components/LoadingSpinner";
import CcgcApi from "../../../api/api";

import { Grid, Modal } from "@mui/material";
import { useForm } from "react-hook-form";

import GreeniesTable from "../../../components/GreeniesTable";

export default function GreeniesTab({ tournament, setTournament }) {
  const { greenies, rounds, course } = tournament;

  // create greenie route expects { roundId, holeNumber, feet, inches}
  // so we need to create an array of roundIds and usernames to pass to select input
  const usernames = rounds.map((round) => [round.id, round.username]);

  //array of par 3 hole numbers for select input
  const par3HoleNums = Object.entries(course.pars)
    .filter((p) => p[1] === 3)
    .map((h) => h[0])
    .map((h) => h.split("e")[1]);

  return (
    <div>
      <Grid container justifyContent="center">
        <Grid item xs={12} md={8} lg={6}>
          {/* <h3 className="font-cubano text-4xl text-center mb-3">Greenies</h3> */}

          {/* <p className="font-gothic text-center text-xl mb-3">
            Select player by name to update greenies
          </p> */}
          <GreeniesTable greenies={greenies} />
          <AddGreenieModal
            rounds={rounds}
            par3HoleNums={par3HoleNums}
            usernames={usernames}
            setTournament={setTournament}
          />
        </Grid>
      </Grid>
    </div>
  );
}

function AddGreenieModal({ rounds, setTournament, usernames, par3HoleNums }) {
  const { currentUser } = useContext(UserContext); // Only show edit button if user is logged in
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [submitError, setSubmitError] = useState(null); // For form submission errors

  // react hook form state
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();
  const onSubmit = async (data) => {
    try {
      const { roundId, holeNumber, feet, inches } = data;
      data.roundId = parseInt(roundId);
      data.holeNumber = parseInt(holeNumber);
      data.feet = parseInt(feet);
      data.inches = parseInt(inches);
      const newGreenie = await CcgcApi.createGreenie(data);
      setTournament((t) => ({
        ...t,
        greenies: [...t.greenies, newGreenie],
      }));
      reset();
      setSubmitError(null);
      handleClose();
    } catch (e) {
      console.log(e);
      setSubmitError(e);
    }
  };

  return (
    <div>
      {currentUser && rounds.length !== 0 ? (
        <div className="flex justify-end">
          <button
            onClick={handleOpen}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 w-16 rounded text-center"
          >
            <AddCircleOutlineIcon sx={{ fontSize: "30px" }} />
          </button>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-xl font-gothic">
            Must create a round before adding any greenies!
          </p>
        </div>
      )}

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 rounded bg-green-700 shadow-lg">
          <div className="p-4">
            <h3 className="font-cubano text-3xl text-white text-center mb-4">
              Add Greenie
            </h3>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="">
                <label className="text-white">Player Name</label>
                <select
                  {...register("roundId", {
                    required: "Must choose a player",
                  })}
                  className="w-full py-2 px-4 rounded font-gothic text-2xl cursor-pointer bg-white"
                  defaultValue=""
                >
                  <option value="" disabled>
                    select player
                  </option>
                  {usernames.map((username) => {
                    const [roundId, name] = username;
                    return (
                      <option key={roundId} value={roundId}>
                        {name.split("-").join(" ")}
                      </option>
                    );
                  })}
                </select>
                <p className="text-white font-gothic h-6">
                  {errors.username ? errors.username.message : null}
                </p>
              </div>
              <div>
                <label className="text-white">Hole Number</label>
                <select
                  {...register("holeNumber", {
                    required: "Must choose a hole number",
                  })}
                  className="w-full py-2 px-4 rounded font-gothic text-2xl cursor-pointer bg-white text-center"
                  defaultValue=""
                >
                  <option value="" disabled className="text-start">
                    select number
                  </option>
                  {par3HoleNums.map((holeNum) => (
                    <option key={holeNum} value={holeNum}>
                      {holeNum}
                    </option>
                  ))}
                </select>
                <p className="text-white font-gothic h-6">
                  {errors.holeNumber ? errors.holeNumber.message : null}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div>
                  <label className="text-white">Feet</label>
                  <input
                    {...register("feet", {
                      required: "How many feet?",
                    })}
                    type="number"
                    className="w-full py-2 px-4 rounded font-gothic text-2xl bg-white"
                  />
                  <p className="text-white font-gothic h-6">
                    {errors.feet ? errors.feet.message : null}
                  </p>
                </div>
                <div>
                  <label className="text-white">Inches</label>
                  <input
                    {...register("inches", {
                      required: "How many inches?",
                    })}
                    type="number"
                    className="w-full py-2 px-4 rounded font-gothic text-2xl bg-white"
                  />
                  <p className="text-white font-gothic h-6">
                    {errors.inches ? errors.inches.message : null}
                  </p>
                </div>
              </div>
              <div className="flex gap-4 justify-between">
                <button
                  onClick={handleClose}
                  className="text-xl border border-white text-white px-4 py-2 rounded font-cubano"
                >
                  cancel
                </button>
                <input
                  type="submit"
                  className="text-xl border border-white text-white px-4 py-2 rounded font-cubano"
                />
              </div>
              {submitError ? (
                <div className="bg-red-500 font-gothic p-3 text-white mt-3 rounded-lg">
                  <p>{submitError}</p>
                </div>
              ) : null}
            </form>
          </div>
        </div>
      </Modal>
    </div>
  );
}
