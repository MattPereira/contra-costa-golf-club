import { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";

import UserContext from "../../../lib/UserContext";
import CcgcApi from "../../../api/api";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { Modal } from "@mui/material";
import { Table } from "react-bootstrap";

export default function RoundsTab({
  rounds,
  tournamentDate,
  setTournament,
  usernameOptions,
}) {
  return (
    <div>
      <h3 className="font-cubano text-4xl text-center mb-3">Rounds</h3>

      <p className="text-center text-xl mb-3 font-gothic">
        Select player by name to update scores
      </p>
      <RoundsTable rounds={rounds} />
      <AddRoundModal
        rounds={rounds}
        date={tournamentDate}
        setTournament={setTournament}
        usernameOptions={usernameOptions}
      />
    </div>
  );
}

function RoundsTable({ rounds }) {
  return (
    <Table responsive bordered striped variant="light" className="text-center">
      <thead className="table-dark">
        <tr>
          <th className="text-start">PLAYER</th>
          {Array.from({ length: 18 }, (_, i) => (
            <th key={i + 1} className="d-none d-sm-table-cell">
              {i + 1}
            </th>
          ))}
          <th>TOT</th>
          <th>HCP</th>
          <th>NET</th>
          <th>PUT</th>
        </tr>
      </thead>
      <tbody>
        {rounds.map((r, idx) => (
          <tr key={r.id}>
            <th className="text-start">
              <Link
                to={`/rounds/${r.id}`}
                className="font-gothic text-blue-600"
              >
                {r.username.split("-").join(" ")}
              </Link>
            </th>
            {Object.values(r.strokes || r.putts).map((s, idx) => (
              <td key={idx} className="d-none d-sm-table-cell">
                {s}
              </td>
            ))}
            <td>{r.totalStrokes}</td>
            <td style={{ color: "red" }}>{r.courseHandicap}</td>
            <td>{r.netStrokes}</td>
            <td>{r.totalPutts}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

function AddRoundModal({ rounds, date, setTournament, usernameOptions }) {
  const { currentUser } = useContext(UserContext); // Only show edit button if user is logged in

  // modal state
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // react hook form state
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
      const newRound = await CcgcApi.createRound(roundData);
      // add new round to state so no page refresh necessary!
      setTournament((t) => ({
        ...t,
        rounds: [...t.rounds, newRound],
      }));
      handleClose();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      {currentUser && (
        <div className="flex justify-end">
          <button
            onClick={handleOpen}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 w-16 rounded text-center"
          >
            <AddCircleOutlineIcon sx={{ fontSize: "30px" }} />
          </button>
        </div>
      )}

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 rounded bg-blue-600 shadow-lg">
          <div className="p-4">
            <h3 className="font-cubano text-3xl text-white text-center mb-4">
              Add Round
            </h3>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4">
                <select
                  {...register("username")}
                  className="w-full py-2 px-4 rounded font-gothic text-2xl cursor-pointer bg-white"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Choose Player...
                  </option>
                  {usernameOptions.map((username) => (
                    <option key={username} value={username}>
                      {username}
                    </option>
                  ))}
                </select>
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
            </form>
          </div>
        </div>
      </Modal>
    </div>
  );
}
