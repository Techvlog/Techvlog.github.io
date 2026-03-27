import { Navigate } from "react-router-dom";
import { UserContext } from "../../context/usercontext";
import { useContext } from "react";

const ProtectedRoute = ({ children }) => {
  const { isloggedin, loading } = useContext(UserContext);

  if (loading) {
    return null; // Or a loading spinner
  }

  if (!isloggedin) {
    return <Navigate to="/prompt" replace />;
  }

  return children;
};

export default ProtectedRoute;
