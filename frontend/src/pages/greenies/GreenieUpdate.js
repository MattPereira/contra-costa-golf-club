import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import CcgcApi from "../../api/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import GreenieForm from "./GreenieForm";

/** This component is used to fetch tournament data to pass to <NewGreenieForm/>
 *  to populate the form's golfer select field with
 *  options from the tournament
 *
 * Path: "/greenies/create/:roundId"
 */

export default function UpdateGreenie() {
  const { id } = useParams();

  /** Fetch the greenie data first to set formData state properly */
  const [greenie, setGreenie] = useState(null);

  // Grab the greenie from API to populate the form data

  /* On component mount, load courses from API */
  useEffect(
    function getGreenieOnMount() {
      console.debug("UpdateGreenie useEffect getDataOnMount");

      async function fetchGreenie() {
        let greenie = await CcgcApi.getGreenie(id);
        setGreenie(greenie);
      }
      fetchGreenie();
    },
    [id]
  );

  if (!greenie) return <LoadingSpinner />;

  console.log(greenie);

  return (
    <div>
      <GreenieForm greenie={greenie} />
    </div>
  );
}
