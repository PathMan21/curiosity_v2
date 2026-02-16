import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../Context/AuthContext'

// const PrivateRoutes: React.FC = () => {

// };

const NonProtectedRoute: React.FC = () => {
  const { token, isLoading } = useAuth()

  if (isLoading) {
    return <div>Chargement...</div>
  }

  if (token) {
    return <Navigate to="/Home" replace />
  }

  return <Outlet />
}

const AdminProtectedRoute: React.FC = () => {
  // vérifier si il a l'accès verified
  const { token, isLoading } = useAuth()

  if (isLoading) {
    return <div>Chargement...</div>
  }

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

const SimpleProtectedRoute: React.FC = () => {
  // ne pas vérifier si il a besoin d'être vérifié
  const { token, isLoading } = useAuth()

  if (isLoading) {
    return <div>Chargement...</div>
  }

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
export { AdminProtectedRoute, SimpleProtectedRoute, NonProtectedRoute }
