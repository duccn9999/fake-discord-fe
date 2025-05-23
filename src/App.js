import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";
import SignUp from "./pages/SignUp/SignUp";
import { ToastContainer } from "react-toastify";
import InvitePage from "./pages/Invite/InvitePage";
import  HomeExport from "./pages/Home/HomeExport";
import EmailConfirmPage from "./pages/Email/EmailChangeConfirmPage";
import AdminLogin from "./Admin/AdminLogin";
import Dashboard from "./Admin/Dashboard";
function Navigator() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/home" element={<HomeExport child={<Home />} />} />
        <Route path="/invite/:inviteCode" element={<InvitePage />} />
        <Route path="/emailConfirm/:email" element={<EmailConfirmPage />} />
        <Route path="/admin/" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
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
