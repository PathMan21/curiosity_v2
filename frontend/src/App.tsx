import React from "react";
import Login from "./Components/Login";
import RegisterPage from "./Pages/Register";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./Pages/Login";
import CompleteInscription from "./Components/completeRegister";
import ProtectedRoute from "./Services/ProtectedRoute";
import { AuthProvider } from "./Context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<h1>Home</h1>} />
          

          {/* Les routes protégés */}
          <Route element={<ProtectedRoute />}>
            <Route path="/complete-inscription" element={<CompleteInscription />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

