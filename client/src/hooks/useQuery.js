import { useLocation } from "react-router-dom";

export default function useQuery() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  let params = {};
  for (let pair of searchParams.entries()) {
    params[pair[0]] = pair[1];
  }

  return params;
}
