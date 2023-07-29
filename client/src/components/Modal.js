import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";

export default function BasicModal({ open, setOpen, message, variant }) {
  const handleClose = () => setOpen(false);

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: variant,
    color: "white",
    borderRadius: "20px",
    boxShadow: 24,
    p: 4,
  };

  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography
            id="modal-modal-title"
            sx={{ fontFamily: "cubano", fontSize: "1.5rem" }}
          >
            {variant.split(".")[0].toUpperCase()}
          </Typography>
          <Typography
            id="modal-modal-description"
            sx={{ mt: 2, fontSize: "1.2rem" }}
          >
            {message}
          </Typography>
        </Box>
      </Modal>
    </div>
  );
}
