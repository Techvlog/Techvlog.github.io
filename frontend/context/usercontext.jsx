import React, { useEffect, useState } from "react";
import { checkloogedin } from "../hooks/hooks";
export const UserContext = React.createContext();
export const UserProvider = ({ children }) => {
  const [isloggedin, setisloggedin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [name, setname] = useState("");
  const [userid, setid] = useState(null);
  const [avatar, setavatar] = useState(null);
  useEffect(() => {
    const check = async () => {
      try {
        const { username, id, avatar } = await checkloogedin();
        if (username) {
          setisloggedin(true);
          setname(username);
          setid(id);
          setavatar(avatar);
        }
      } catch (error) {
        setisloggedin(false);
      } finally {
        setLoading(false);
      }
    };
    check();
  }, []);
  return (
    <UserContext.Provider
      value={{ isloggedin, setisloggedin, name, setname, userid, avatar, loading }}
    >
      {children}
    </UserContext.Provider>
  );
};
