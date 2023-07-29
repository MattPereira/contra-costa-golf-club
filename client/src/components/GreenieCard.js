import React from "react";
import { Link } from "react-router-dom";
import {
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
// import { useTheme } from "@mui/material/styles";
import { styled } from "@mui/material/styles";

/** Greenie card component.
 *
 * Show greenie username, date, hole number, feet, inches, course name, and course image.
 * GreenieCard also functions as link to each greenie's detail page.
 *
 * GreenieCard is rendered by GreenieList and GreenieDetails
 *  to show a "card" for each greenie.
 *
 * On the GreenieDetails page, show edit and delete buttons
 * for logged in same user or admin only.
 *
 * GreenieList -> GreenieCard
 * GreenieDetails -> GreenieCard
 *
 */

const GreenieCard = ({ greenie }) => {
  const {
    id,
    holeNumber,
    feet,
    inches,
    firstName,
    lastName,
    courseImg,
    courseName,
  } = greenie;

  // const theme = useTheme();

  // let points = 1;

  // if (feet < 20) {
  //   points += 1;
  // }
  // if (feet < 10) {
  //   points += 1;
  // }
  // if (feet < 2) {
  //   points += 1;
  // }

  const StyledPaper = styled(Paper)(({ theme }) => ({
    borderRadius: "30px",
    backgroundColor: "#eeeeee",
    "&:hover": {
      backgroundColor: "black",
      color: "white",
      ".MuiTable-root": {
        ".MuiTableHead-root": {
          ".MuiTableRow-root": {
            ".MuiTableCell-root": {
              color: "white",
              borderBottom: "1px solid white",
            },
          },
        },
        ".MuiTableBody-root": {
          ".MuiTableRow-root": {
            ".MuiTableCell-root": {
              color: "white",
            },
          },
        },
      },
    },
  }));

  const StyledCardImage = styled(Box)(({ theme }) => ({
    width: "100%",
    height: "203.984px",
    borderRadius: "30px",
    objectFit: "cover",
  }));

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    fontFamily: "Poppins",
  }));

  const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
    fontFamily: "Poppins",
    fontWeight: "bold",
  }));

  const StyledTableHeadRow = styled(TableRow)(({ theme }) => ({
    ".MuiTableCell-root": {
      borderBottom: "1px solid black",
    },
  }));
  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    ".MuiTableCell-root": {
      borderBottom: "none",
    },
  }));

  return (
    <Box sx={{ mb: 3 }}>
      <Link to={`/greenies/${id}`} style={{ textDecoration: "none" }}>
        <StyledPaper elevation={8}>
          <StyledCardImage component="img" src={courseImg} />
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h5">
                {firstName} {lastName}
              </Typography>
            </Box>

            <Box>
              <Table size="small">
                <TableHead>
                  <StyledTableHeadRow sx={{ border: "none" }}>
                    <StyledTableHeadCell align="center">
                      Course
                    </StyledTableHeadCell>
                    <StyledTableHeadCell align="center">
                      Hole
                    </StyledTableHeadCell>
                    <StyledTableHeadCell align="center">
                      Distance
                    </StyledTableHeadCell>
                  </StyledTableHeadRow>
                </TableHead>
                <TableBody>
                  <StyledTableRow>
                    <StyledTableCell align="center">
                      {courseName.split(" ").slice(0, 2).join(" ")}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      #{holeNumber}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {feet}' {inches}"
                    </StyledTableCell>
                  </StyledTableRow>
                </TableBody>
              </Table>
            </Box>
          </Box>
        </StyledPaper>
      </Link>
    </Box>
  );
};

export default GreenieCard;
