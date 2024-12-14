import loginStyles from "./Login.module.css";
import { Outlet, Link, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import $ from "jquery";

function Login({session, setSession }) {
  if(session){
    return <Navigate to={"/home"}/>
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const UserName = $("#username").val();
    const Password = $("#password").val();

    $.ajax({
      url: "https://localhost:7065/Authentication/Login",
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
      <form id={loginStyles.loginForm} onSubmit={handleSubmit}>
        <h1>Login</h1>
        <div className="inputGroup">
          <label htmlFor="username">Username</label>
          <input type="text" id="username" required />
        </div>
        <div className="inputGroup">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" required />
        </div>
        <div className="inputGroup">
          <button type="submit" className="btn btnRed">Submit</button>
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