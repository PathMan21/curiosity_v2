import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthentification } from '../Context/Auth'

export const ProtectedRoute = () => {

const { isLoading, isLogged } = useAuthentification();


if (isLoading) {
  return <div>chargement...</div>;
}

if (!isLogged) {
  return <Navigate to="/login" replace />
}
else {
  return <Outlet/>
}

}

export const PublicOnlyRoute = () => {

  const {
    isLogged,
    isLoading,
  } = useAuthentification()

  if (isLoading) {
    return <div>Chargement...</div>
  }

  if (isLogged) {
    return <Navigate to="/home" replace />
  }

  return <Outlet />
}