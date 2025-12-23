import React from "react";
import Login from "./Pages/Auth/Login";
import RegisterPage from "./Pages/Auth/Register";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./Pages/Auth/Login";
import CompleteInscription from "./Pages/Auth/completeRegister";
import { ProtectedRoute } from "./Services/ProtectedRoute";
import { NonProtectedRoute } from "./Services/ProtectedRoute";

import { AuthProvider } from "./Context/AuthContext";
import Profile from "./Pages/Profile/ProfilePage";
import ProfileSettings from "./Pages/Profile/ProfileSettings";
import ArticlePage from "./Pages/Articles/ArticlePage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          
          <Route element={<NonProtectedRoute />}>
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<h1>Home</h1>} />
          </Route>

          {/* Les routes protégés */}
          <Route element={<ProtectedRoute />}>
            <Route path="/Home" element={<ArticlePage />} />
            <Route path="/Profile" element={<Profile />} />
            <Route path="/complete-inscription" element={<CompleteInscription />} />
            <Route path="/Profile/settings" element={<ProfileSettings />} />

          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

