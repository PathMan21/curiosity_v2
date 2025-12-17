import React from "react";
import Login from "./Components/Login";
import RegisterPage from "./Pages/Register";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./Pages/Login";
import CompleteInscription from "./Components/completeRegister";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<h1>Home</h1>} />
        <Route path='/complete-inscription' element={<CompleteInscription/>} />

        {/* <Route element={<PrivateRoutes/>}>
              <Route path='/complete-inscription' element={<completeInscription/>} />
        </Route> */}
      </Routes>
    </BrowserRouter>
  );
}
export default App;
