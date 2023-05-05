import React, { useEffect, useState, useContext } from "react";
import UserContext from "../../lib/UserContext";
import { useParams, useNavigate } from "react-router-dom";
import CcgcApi from "../../api/api";
import { Link } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner";
import { styled } from "@mui/material/styles";

import {
  Typography,
  Button,
  Container,
  Grid,
  Box,
  Modal,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  Paper,
  Table,
} from "@mui/material";

import ArrowCircleUpIcon from "@mui/icons-material/ArrowCircleUp";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";

import PageHero from "../../components/PageHero";

/** Greenie details page.
 *
 * On component mount, load the greenie data from API
 *
 * Also offer edit and delete buttons for logged in same user or admin only.
 *
 * This is routed to path "/greenies/:id"
 *
 * Routes -> GreenieDetails -> {AdminButtons, GreenieCard}
 *
 */

export default function GreenieDetails() {
  const { id } = useParams();
  const { currentUser } = useContext(UserContext);
  let navigate = useNavigate();

  console.debug("GreenieDetails", "id=", id);

  const [greenie, setGreenie] = useState(null);

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleDelete = async (id) => {
    await CcgcApi.deleteGreenie(id);
    navigate(`/rounds/${greenie.roundId}`);
  };

  /* On component mount, load course data from API */
  useEffect(
    function getGreenieOnMount() {
      console.debug("GreenieDetails useEffect getGreenieOnMount");

      async function getGreenie() {
        setGreenie(await CcgcApi.getGreenie(id));
      }
      getGreenie();
    },
    [id]
  );

  if (!greenie) return <LoadingSpinner />;
  console.log(greenie);
  console.log(currentUser);

  const tournamentDate = new Date(greenie.tournamentDate).toLocaleDateString(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }
  );

  const style = {
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

  const memberButtons = (
    <Box sx={{ my: 5 }}>
      <Button
        variant="contained"
        color="error"
        size="large"
        onClick={handleOpen}
        sx={{
          "&:hover": { color: "white" },
          mr: 1,
          borderRadius: "30px",
        }}
      >
        <HighlightOffIcon /> <span className="ms-2">Delete</span>
      </Button>
      <Button
        component={Link}
        to={`/greenies/update/${greenie.id}`}
        variant="contained"
        size="large"
        sx={{ "&:hover": { color: "white" }, borderRadius: "30px" }}
      >
        <ArrowCircleUpIcon /> <span className="ms-2">Update</span>
      </Button>
    </Box>
  );

  const StyledHeaderCell = styled(TableCell)(({ theme }) => ({
    backgroundColor: "black",
    color: theme.palette.common.white,
    fontFamily: "Cubano",
    fontSize: 25,
  }));

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    fontFamily: "Cubano",
    fontSize: 25,
  }));

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    border: "2px solid black",
    // hide last border
    "&:last-child td, &:last-child th": {
      border: 0,
    },
  }));

  return (
    <Box>
      <PageHero
        title="Greenie Details"
        backgroundImage={greenie.courseImg}
        alt="golf course"
      />

      <Container sx={{ my: 3 }}>
        <Grid container justifyContent="center">
          <Grid item xs={12} sm={10} md={8} lg={6} align="center">
            <TableContainer component={Paper} elevation={0}>
              <Table sx={{ border: "2px solid black" }}>
                <TableBody>
                  <StyledTableRow>
                    <StyledHeaderCell>Name</StyledHeaderCell>
                    <StyledTableCell sx={{ border: "none" }}>
                      {greenie.firstName + " " + greenie.lastName}
                    </StyledTableCell>
                  </StyledTableRow>
                  <StyledTableRow>
                    <StyledHeaderCell>Date</StyledHeaderCell>
                    <StyledTableCell>
                      <Link to={`/tournaments/${tournamentDate}`}>
                        {tournamentDate}
                      </Link>
                    </StyledTableCell>
                  </StyledTableRow>
                  <StyledTableRow>
                    <StyledHeaderCell>Course</StyledHeaderCell>
                    <StyledTableCell>{greenie.courseName}</StyledTableCell>
                  </StyledTableRow>
                  <StyledTableRow>
                    <StyledHeaderCell>Hole</StyledHeaderCell>
                    <StyledTableCell># {greenie.holeNumber}</StyledTableCell>
                  </StyledTableRow>
                  <StyledTableRow>
                    <StyledHeaderCell>Distance</StyledHeaderCell>
                    <StyledTableCell>
                      {greenie.feet + " ft " + greenie.inches + " in"}
                    </StyledTableCell>
                  </StyledTableRow>
                </TableBody>
              </Table>
            </TableContainer>
            <Box>{currentUser ? memberButtons : null}</Box>
          </Grid>
        </Grid>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Typography id="modal-modal-title" variant="h4" color="white">
              Are you Sure?
            </Typography>
            <Typography
              id="modal-modal-description"
              sx={{ mt: 2 }}
              color="white"
            >
              This action will permanently erase all data associated with this
              greenie. Please confirm to proceed.
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
                onClick={() => handleDelete(greenie.id)}
              >
                Delete
              </Button>
            </Box>
          </Box>
        </Modal>
      </Container>
    </Box>
  );
}
