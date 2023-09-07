import { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";

import UserContext from "../../../lib/UserContext";
import CcgcApi from "../../../api/api";
import LoadingSpinner from "../../../components/LoadingSpinner";

import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import { Modal } from "@mui/material";
import { Table } from "react-bootstrap";

export default function RoundsTab({ rounds, tournamentDate, setTournament }) {
  return (
    <div>
      <p className="text-center text-xl mb-[35px] font-gothic">
        Select player by name to update scores!
      </p>
      <RoundsTable rounds={rounds} />
      <AddRoundModal
        rounds={rounds}
        date={tournamentDate}
        setTournament={setTournament}
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

function AddRoundModal({ rounds, date, setTournament }) {
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
      console.log("newRound", newRound);
      handleClose();
    } catch (e) {
      console.error(e);
    }
  };

  const [members, setMembers] = useState(null);

  // Fetch the members data first to set the available player options for select input
  useEffect(function getMembersOnMount() {
    async function fetchAllMembers() {
      let members = await CcgcApi.getMembers();
      setMembers(members);
    }
    fetchAllMembers();
  }, []);

  if (!members) return <LoadingSpinner />;

  //Filter out users who have already submitted a round for this tournament
  //So they arent added to form select input as an option
  const usernames = members.map((m) => m.username);
  const alreadySubmitted = rounds.map((r) => r.username);
  const availableUsernames = usernames.filter(
    (u) => !alreadySubmitted.includes(u)
  );

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
          <button
            onClick={handleClose}
            className="text-xl text-white font-cubano ml-2 mt-2"
          >
            <CancelOutlinedIcon sx={{ fontSize: "35px" }} />
          </button>
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
                  {availableUsernames.map((username) => (
                    <option key={username} value={username}>
                      {username}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end">
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
