import Styles from "./Login.module.css";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import COMMON from "../../utils/Common";
import $ from "jquery";
import { save } from "../../reducers/tokenReducer";
function Login({ isTokenExpired }) {
  const [UserName, setUserName] = useState(null);
  const [Password, setPassword] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    if (!isTokenExpired) {
      navigate("/home");
    }
  },[isTokenExpired]);
  const handleSubmit = (e) => {
    e.preventDefault();
    $.ajax({
      url: `${COMMON.API_BASE_URL}Authentication/Login`,
      type: "POST",
      contentType: "application/json", // Specify JSON format
      data: JSON.stringify({ UserName, Password }), // Convert data to JSON string
      success: function (data) {
        dispatch(save(data));
      },
      error: function (xhr, status, error) {
        console.error("Error:", xhr.responseText);
      },
    });
  };

  return (
    <div className="formContainer">
      <form
        id={Styles.loginForm}
        onSubmit={handleSubmit}
        className={`${Styles.form}`}
      >
        <h1>Login</h1>
        <div className="inputGroup">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            required
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>
        <div className="inputGroup">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            required
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="inputGroup">
          <button type="submit" className="btn btnDanger">
            Submit
          </button>
        </div>
        <div>
          Don't have an account? <Link to="/signup">Create now</Link>
        </div>
        <Outlet />
      </form>
    </div>
  );
}

export default Login;
