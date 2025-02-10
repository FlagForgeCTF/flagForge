import { useAuth } from "../context";
import { Navigate, Outlet } from "react-router-dom";

const AuthGuard = () => {
  const { unauthenticated } = useAuth();

  if (unauthenticated) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

export default AuthGuard;
