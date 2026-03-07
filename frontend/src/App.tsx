import React from 'react'
import Login from './Pages/Auth/Login'
import RegisterPage from './Pages/Auth/Register'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from './Pages/Auth/Login'
import CompleteInscription from './Pages/Auth/completeRegister'
import TokenLoader from './Pages/Auth/TokenLoader'
import {
  NonProtectedRoute,
  AdminProtectedRoute,
  SimpleProtectedRoute,
} from './Services/ProtectedRoute'


import { AuthProvider } from './Context/AuthContext'
import Profile from './Pages/Profile/ProfilePage'
import ProfileSettings from './Pages/Profile/ProfileSettings'
import ProfileFavorites from './Pages/Profile/ProfileFavorites'

import ArticlePage from './Pages/Articles/ArticlePage'
import { useAutoRefreshToken } from './Hooks/useAutoRefreshToken'
import { ThemeProvider } from './helpers/ChangeStyle'

function AppContent() {
  // Utiliser le hook de refresh automatique
  useAutoRefreshToken()

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<NonProtectedRoute />}>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<LoginPage />} />
        </Route>

        {/* <Route element={<SimpleProtectedRoute />}> */}
        <Route path="/load-token" element={<TokenLoader />} />
        <Route path="/complete-inscription" element={<CompleteInscription />} />
        {/* </Route> */}

        <Route element={<AdminProtectedRoute />}>
          <Route path="/Home" element={<ArticlePage />} />
          <Route path="/Profile" element={<Profile />} />
          <Route path="/Profile/settings" element={<ProfileSettings />} />
          <Route path="/Profile/Favorites" element={<ProfileFavorites />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
    </ThemeProvider>
  )
}

export default App
