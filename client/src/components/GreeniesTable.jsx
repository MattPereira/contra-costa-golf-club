import { Link } from "react-router-dom";
import React, { useContext } from "react";
import UserContext from "../lib/UserContext";
import Button from "@mui/material/Button";
import BorderColorIcon from "@mui/icons-material/BorderColor";

export default function GreeniesTable({ greenies }) {
  const { currentUser } = useContext(UserContext);

  console.log("greenies", greenies);

  return (
    <table className="table table-striped table-bordered text-center table-light">
      <thead className="table-dark">
        <tr>
          <th className="text-start">PLAYER</th>
          <th>HOLE</th>
          <th>FEET</th>
          <th>INCH</th>
        </tr>
      </thead>
      {greenies.length ? (
        <tbody>
          {greenies.map((g) => (
            <tr key={g.id}>
              <td className="text-start">
                <Link
                  to={`/rounds/${g.roundId}`}
                  className="text-decoration-none font-gothic text-blue-600"
                >
                  {`${g.firstName} ${g.lastName}`}
                </Link>
              </td>
              <td>#{g?.holeNumber}</td>
              <td>{g.feet}'</td>
              <td>{g.inches}"</td>
            </tr>
          ))}
        </tbody>
      ) : null}
    </table>
  );
}
