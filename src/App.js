import logo from "./logo.svg";
import { useState, useEffect } from "react";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Loading from "./pages/Loading/Loading";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import SignUp from "./pages/SignUp/SignUp";
import COMMON from "./utils/Common";
function Navigator() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  // Sync session with localStorage
  useEffect(() => {
    const storedSession = COMMON.SESSION;
    setSession(storedSession);
    setLoading(false);
  }, []);

  if (loading) {
    return <Loading />;
  }
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login session={session} setSession={setSession}/>} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/home" element={<Home session={session}/> } />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <div className="App">
      <Navigator />
    </div>
  );
}

export default App;
