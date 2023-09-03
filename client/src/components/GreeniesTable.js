import { Link } from "react-router-dom";
import React, { useContext } from "react";
import UserContext from "../lib/UserContext";
import Button from "@mui/material/Button";
import BorderColorIcon from "@mui/icons-material/BorderColor";

export default function GreeniesTable({ greenies }) {
  const { currentUser } = useContext(UserContext);

  return (
    <table className="table table-striped table-bordered text-center table-light">
      <thead className="table-dark">
        <tr>
          <th className="text-start">PLAYER</th>
          <th>HOLE</th>
          <th>FEET</th>
          <th>INCH</th>
          {currentUser && (
            <th className="fw-normal">
              <BorderColorIcon />
            </th>
          )}
        </tr>
      </thead>
      {greenies.length ? (
        <tbody>
          {greenies.map((g) => (
            <tr key={g.id}>
              <th className="text-start">
                <Link
                  to={`/rounds/${g.roundId}`}
                  className="text-decoration-none"
                >
                  {`${g.firstName} ${g.lastName[0]}`}
                </Link>
              </th>
              <td>#{g?.holeNumber}</td>
              <td>{g.feet}'</td>
              <td>{g.inches}"</td>
              {currentUser && (
                <td>
                  <Button
                    to={`/greenies/update/${g.id}`}
                    component={Link}
                    sx={{
                      p: 0.5,
                      minWidth: "auto",
                      "&:hover": { color: "primary.dark" },
                    }}
                  >
                    <BorderColorIcon />
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      ) : null}
    </table>
  );
}
