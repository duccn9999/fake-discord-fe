import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";
import SignUp from "./pages/SignUp/SignUp";
import { ToastContainer } from "react-toastify";
import InvitePage from "./pages/Invite/InvitePage";
import { useSelector } from "react-redux";
import useJwtDecode from "./hooks/jwtDecode";
import { useEffect } from "react";
function Navigator() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/home" element={<Home />} />
        <Route path="/invite/:inviteCode" element={<InvitePage />} /> 
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <div className="App">
      <Navigator />
      <ToastContainer />
    </div>
  );
}

export default App;
