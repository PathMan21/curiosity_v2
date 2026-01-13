import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";


// const PrivateRoutes: React.FC = () => {

// };


const NonProtectedRoute: React.FC = () => {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (token) {
    console.log("token ", token);
    return <Navigate to="/Home" replace />;
  }

  return <Outlet />;
};

const ProtectedRoute: React.FC = () => {
  const { token, isLoading } = useAuth();



  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (!token) {
    console.log("pas de token");

    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export { ProtectedRoute, NonProtectedRoute };
