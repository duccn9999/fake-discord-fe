import logo from "./logo.svg";
import { useState, useEffect } from "react";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import SignUp from "./pages/SignUp/SignUp";
import useCheckTokenExpired from "./hooks/checkTokenExpired";
import { ToastContainer } from "react-toastify";
function Navigator() {
  const [loading, setLoading] = useState(true);
  const isTokenExpired = useCheckTokenExpired();
  // Sync session with localStorage
  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return <h3>Loading.....</h3>;
  }
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login isTokenExpired={isTokenExpired}/>} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/home" element={<Home  isTokenExpired={isTokenExpired}/>} />
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
