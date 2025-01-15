import Styles from "./Login.module.css";
import { Outlet, Link, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import COMMON from "../../utils/Common";
import $ from "jquery";

function Login({session, setSession }) {
  const [UserName, setUserName] = useState(null);
  const [Password, setPassword] = useState(null);
  if(session){
    return <Navigate to={"/home"}/>
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    $.ajax({
      url: `${COMMON.API_BASE_URL}Authentication/Login`,
      type: "POST",
      contentType: "application/json", // Specify JSON format
      data: JSON.stringify({ UserName, Password }), // Convert data to JSON string
      success: function (data) {
        window.localStorage.setItem("session", data); // Update localStorage
        setSession(data);
      },
      error: function (xhr, status, error) {
        console.error("Error:", xhr.responseText);
      },
    });
  };

  return (
    <div className="formContainer">
      <form id={Styles.loginForm} onSubmit={handleSubmit} className={`${Styles.form}`}>
        <h1>Login</h1>
        <div className="inputGroup">
          <label htmlFor="username">Username</label>
          <input type="text" id="username" required onChange={(e) => setUserName(e.target.value)}/>
        </div>
        <div className="inputGroup">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" required onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="inputGroup">
          <button type="submit" className="btn btnDanger">Submit</button>
        </div>
        <div>
          Dont have an account? <Link to="/signup">Create now</Link>
        </div>
        <Outlet />
      </form>
    </div>
  );
}

export default Login;
