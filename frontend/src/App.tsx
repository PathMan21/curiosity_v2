import React from 'react'
import Login from './Pages/Auth/Login'

import RegisterPage from './Pages/Auth/Register'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from './Pages/Auth/Login'
import CompleteInscription from './Pages/Auth/completeRegister'

import Layout from './Pages/global/useLayout'

import { AuthentProvider } from './Context/Auth'
import NotFound from './Pages/global/notFound'
import Profile from './Pages/Profile/ProfilePage'

import ProfileSettings from './Pages/Profile/ProfileSettings'
import ArticlePage from './Pages/Articles/ArticlePage'
import { ThemeProvider } from './helpers/ChangeStyle'

import { ProtectedRoute, PublicOnlyRoute } from './Services/ProtectedRoute'
function AppContent() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<NotFound />} />

        <Route element={<PublicOnlyRoute/>}>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<LoginPage />} />
        </Route>

        <Route path="/complete-inscription" element={<CompleteInscription />} />

        <Route element={<Layout />}>
          <Route element={<ProtectedRoute />}>

                <Route path="/Home" element={<ArticlePage />} />
                <Route path="/Profile" element={<Profile />} />
                <Route path="/Profile/settings" element={<ProfileSettings />} />

          </Route>
        </Route>
        
      </Routes>
    </BrowserRouter>
  )
}

function App() {
  return (
    <ThemeProvider>
    <AuthentProvider>
      <AppContent />
    </AuthentProvider>
    </ThemeProvider>
  )
}

export default App
