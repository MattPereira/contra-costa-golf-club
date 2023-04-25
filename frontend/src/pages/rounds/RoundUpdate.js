import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import CcgcApi from "../../api/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import RoundForm from "./RoundForm";

/** Edit Round component
 *
 * fetch round details from API
 *
 * pass data to EditRoundForm component
 * to populate form fields with existing data
 *
 *
 */

const EditRound = () => {
  const { id } = useParams();
  const [round, setRound] = useState(null);

  /* On component mount, load tournament data from API to populate form inputs */
  useEffect(
    function getRoundDataOnMount() {
      console.debug("EditRound useEffect getRoundDataOnMount");

      async function fetchRound() {
        setRound(await CcgcApi.getRound(id));
      }

      fetchRound();
    },
    [id]
  );

  console.debug("EditRound", "round=", round);

  if (!round) return <LoadingSpinner />;

  console.log("ROUND", round);

  return (
    <div>
      <RoundForm round={round} />
    </div>
  );
};

export default EditRound;
