import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import CcgcApi from "../../api/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import GreenieForm from "./GreenieForm";

/** This component is used to fetch tournament data to pass to <GreenieForm/>
 *
 * Routed as /greenies/update/:id
 */

export default function UpdateGreenie() {
  const { id } = useParams();

  /** Fetch the greenie data first to set formData state properly */
  const [greenie, setGreenie] = useState(null);

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
