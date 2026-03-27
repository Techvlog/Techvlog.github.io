import axios from "axios";
import { useEffect, useState } from "react";
const apiUrl = import.meta.env.VITE_icnfinder_api;
function Boda() {
  const [data, setdata] = useState();
  useEffect(() => {
    axios
      .get("https://api.iconfinder.com/v4/icons/search", {
        headers: {
          Authorization:
            `Bearer ${apiUrl}`,
          Accept: "application/json",
        },
        params: {
          query: "arrow",
          count: 1,
        },
      })
      .then((res) => console.log(res.data.icons))
      .catch((err) => console.error(err));
  },[]);

  return <></>;
}

export default Boda;
