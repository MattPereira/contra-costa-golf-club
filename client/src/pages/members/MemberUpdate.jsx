import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import CcgcApi from "../../api/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import ProfileForm from "../auth/ProfileForm";

export default function MemberUpdate() {
  const { username } = useParams();
  const [memberData, setMemberData] = useState(null);

  useEffect(
    function getMemberOnMount() {
      async function fetchMember() {
        const response = await CcgcApi.getUser(username);
        setMemberData(response);
      }
      fetchMember();
    },
    [username]
  );

  if (!memberData) return <LoadingSpinner />;
  console.log(memberData);

  return (
    <div>
      <ProfileForm memberData={memberData} />
    </div>
  );
}
