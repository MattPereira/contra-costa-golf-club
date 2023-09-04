import React from "react";
import { Link } from "react-router-dom";
import { Popover, OverlayTrigger } from "react-bootstrap";

import { Button } from "@mui/material";

/** Admin only buttons component
 *
 * renders an edit and delete button for these compononents:
 * - RoundDetails
 * - TournamentDetails
 * - CourseDetails
 *
 * Props needed:
 *  -updatePath: the path to the edit page
 *  -handleDelete: function to handle the deletion of a round,
 *    tournament, or course
 *
 *  Note: delete button is nested inside popover for extra caution
 */

const AdminButtons = ({ updatePath, handleDelete, light }) => {
  console.debug(
    "EditDeleteBtns",
    "updatePath=",
    updatePath,
    "handleDelete=",
    handleDelete
  );

  // for when buttons are rendered on dark background
  const lightDeleteSX = {
    color: "white",
    border: "1px solid white",
    "&:hover": {
      color: "black",
      backgroundColor: "white",
      border: "1px solid white",
    },
  };

  const lightEditSX = {
    color: "white",
    border: "1px solid white",
    padding: "5px 25px",
    "&:hover": {
      color: "black",
      backgroundColor: "white",
      border: "1px solid white",
    },
  };

  //regular butotns on white background
  const editSX = {
    padding: "5px 25px",
    "&:hover": {
      color: "white",
    },
  };

  const deleteSX = {
    backgroundColor: "#dc3545",
    "&:hover": {
      backgroundColor: "#c82333",
    },
  };

  //grab item for deletion warning message
  const item = updatePath.split("/")[1].slice(0, -1);

  const popover = (
    <Popover id="popover-basic">
      <Popover.Header className="bg-warning text-center">
        WARNING!
      </Popover.Header>
      <Popover.Body>
        <p>
          Are you sure you want to delete this {item}? This action cannot be
          undone!
        </p>
        <Button variant="contained" sx={deleteSX} onClick={handleDelete}>
          Confirm
        </Button>
      </Popover.Body>
    </Popover>
  );

  return (
    <div className="row justify-content-center">
      <div className="col-auto">
        <div>
          <OverlayTrigger trigger="click" placement="bottom" overlay={popover}>
            <Button
              variant={light ? "outlined" : "contained"}
              id="Popover1"
              type="button"
              sx={light ? lightDeleteSX : deleteSX}
            >
              Delete
            </Button>
          </OverlayTrigger>
        </div>
      </div>
      <div className="col-auto">
        <Button
          component={Link}
          variant={light ? "outlined" : "contained"}
          to={updatePath}
          sx={light ? lightEditSX : editSX}
        >
          Edit
        </Button>
      </div>
    </div>
  );
};

export default AdminButtons;
