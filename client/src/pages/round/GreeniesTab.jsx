import { useState } from "react";
import { Modal } from "@mui/material";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import { useForm } from "react-hook-form";
import CcgcApi from "../../api/api";
import { Link } from "react-router-dom";

export default function GreeniesTab({ tournamentDate, greenies, setRound }) {
  const [selectedGreenie, setSelectedGreenie] = useState(null);
  const [open, setOpen] = useState(false);

  const handleOpen = (greenie) => {
    setSelectedGreenie(greenie);
    setOpen(true);
  };
  const handleClose = () => {
    setSelectedGreenie(null);
    setOpen(false);
  };

  const handleDelete = async (greenieId) => {
    try {
      await CcgcApi.deleteGreenie(greenieId);

      setRound((round) => {
        const updatedGreenies = round.greenies.filter(
          (greenie) => greenie.id !== greenieId
        );

        return {
          ...round,
          greenies: updatedGreenies,
        };
      });

      setOpen(false);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      {/* <h3 className="font-cubano text-4xl text-center mb-4">Greenies</h3> */}

      {greenies.length ? (
        <RoundGreeniesTable greenies={greenies} handleOpen={handleOpen} />
      ) : (
        <div className="font-gothic mb-5 text-xl">
          No greenies entered for this round. To add a greenie, go to the{" "}
          <Link
            to={`/tournaments/${tournamentDate}?tab=greenies`}
            className="text-blue-600 underline"
          >
            tournament greenies tab.
          </Link>
        </div>
      )}
      <EditGreenieModal
        selectedGreenie={selectedGreenie}
        open={open}
        handleClose={handleClose}
        handleDelete={handleDelete}
        setRound={setRound}
      />
    </div>
  );
}

function EditGreenieModal({
  selectedGreenie,
  open,
  handleClose,
  setRound,
  handleDelete,
}) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();
  const onSubmit = async (data) => {
    try {
      const formData = {
        feet: parseInt(data.feet),
        inches: parseInt(data.inches),
      };

      const updatedGreenie = await CcgcApi.updateGreenie(
        selectedGreenie.id,
        formData
      );

      updatedGreenie.firstName = selectedGreenie.firstName;
      updatedGreenie.lastName = selectedGreenie.lastName;

      setRound((round) => {
        const updatedGreenies = round.greenies.map((greenie) =>
          greenie.id === updatedGreenie.id ? updatedGreenie : greenie
        );

        return {
          ...round,
          greenies: updatedGreenies,
        };
      });
      reset();
      handleClose();
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 rounded bg-green-700 shadow-lg">
        <div className="p-4">
          <h3 className="text-white font-cubano text-3xl text-center mb-3">
            Greenie
          </h3>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-[3fr,1fr] gap-4 mb-3">
              <div>
                <label className="text-white">Name</label>
                <div className="bg-white font-gothic rounded py-2 px-2 text-xl">
                  {selectedGreenie?.firstName + " " + selectedGreenie?.lastName}
                </div>
              </div>
              <div>
                <label className="text-white">Hole</label>
                <div className="bg-white font-gothic rounded py-2 px-2 text-xl text-center">
                  #{selectedGreenie?.holeNumber}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-white">Feet</label>
                <input
                  {...register("feet", {
                    required: "Must enter feet",
                  })}
                  type="number"
                  className="bg-white font-gothic rounded py-2 px-2 text-xl w-full"
                  defaultValue={selectedGreenie?.feet}
                />
              </div>
              <div>
                <label className="text-white">Inches</label>
                <input
                  {...register("inches", {
                    required: "Must enter inches",
                  })}
                  type="number"
                  className="bg-white font-gothic rounded py-2 px-2 text-xl w-full"
                  defaultValue={selectedGreenie?.inches}
                />
              </div>
            </div>

            <div className="flex gap-4 justify-between">
              <button
                type="button"
                onClick={() => handleDelete(selectedGreenie?.id)}
                className="text-xl bg-red-600 border border-white text-white px-4 py-2 rounded font-cubano"
              >
                delete
              </button>

              <input
                type="submit"
                className="text-xl bg-blue-600 border-1 border-white text-white px-4 py-2 rounded font-cubano"
              />
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
}

function RoundGreeniesTable({ greenies, handleOpen }) {
  return (
    <div className="rounded-xl border overflow-hidden">
      <table className="min-w-full">
        <thead>
          <tr className="py-2 bg-[#212529] text-white text-center">
            <th className="py-2 border-r">Hole</th>
            <th className="py-2 w-1/5 border-r">Feet</th>
            <th className="py-2 w-1/5 border-r">Inch</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          {greenies.map((g, idx) => (
            <tr
              key={g.id}
              className={`text-gray-700 text-center ${
                idx % 2 === 0 ? "bg-gray-200" : "bg-gray-100"
              }`}
            >
              <th className="py-2 border-r bg-[#212529] text-white border-t">
                #{g?.holeNumber}
              </th>
              <td className="py-2 border-r border-[#212529] border-b w-1/4">
                {g.feet}'
              </td>
              <td className="py-2 border-r border-[#212529] border-b w-1/4">
                {" "}
                {g.inches}"
              </td>
              <td className="py-2 border-r border-[#212529] border-b w-1/4">
                <button
                  onClick={() => handleOpen(g)}
                  className="bg-green-600 hover:bg-green-700 text-white rounded px-2"
                >
                  <ModeEditIcon sx={{ fontSize: "20px" }} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
