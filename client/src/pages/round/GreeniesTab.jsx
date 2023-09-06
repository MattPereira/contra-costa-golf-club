import { useState } from "react";
import { Link } from "react-router-dom";
import { Box, Button, Typography, Modal } from "@mui/material";
import GreeniesTable from "../../components/GreeniesTable";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

const modalStyles = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "green",
  borderRadius: "20px",
  boxShadow: 24,
  p: 4,
};

export default function GreeniesTab({ tournamentDate, greenies }) {
  // State & functions for modal that allows greenie creation
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box>
      {greenies.length ? (
        <GreeniesTable greenies={greenies} />
      ) : (
        <div className="text-center font-gothic mb-5 text-xl">
          No greenies entered for this round.
        </div>
      )}
      {/* <Box sx={{ mb: 3, textAlign: "end" }}>
        <button
          onClick={handleOpen}
          className="bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-3 rounded"
        >
          <AddCircleOutlineIcon sx={{ fontSize: "28px" }} />
        </button>
      </Box> */}
      {/* <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyles}>
          <h3 className="text-white font-cubano text-3xl text-center">
            Add Greenie
          </h3>
          <div>
            <label className="text-white">Player Name</label>
            <select
              name="roundId"
              id="roundId"
              className="block w-full bg-white border border-gray-300 rounded py-2 px-3 mt-1 mb-3"
            >
              <option value="">Select Player</option>
              <option value="1">John Doe</option>
              <option value="2">Jane Doe</option>
            </select>
          </div>
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
              color="primary"
              sx={{ color: "white" }}
              onClick={() => console.log("hello")}
            >
              Submit
            </Button>
          </Box>
        </Box>
      </Modal> */}
    </Box>
  );
}
