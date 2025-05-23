import Styles from "./Login.module.css";
import { Outlet } from "react-router-dom";
import { useState } from "react";
import { useDispatch } from "react-redux";
import COMMON from "../utils/Common";
import { save } from "../reducers/tokenReducer";
import axios from "axios";
import { toast } from "react-toastify";
function Login() {
  const [Username, setUsername] = useState(null);
  const [Password, setPassword] = useState(null);
  const dispatch = useDispatch();
  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios
      .post(
        `${COMMON.API_BASE_URL}Authentication/Login`,
        { Username: Username, Password: Password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        dispatch(save(response.data));
      })
      .catch((err) => {
        toast.error("Failed to login: " + err.message, {
          position: "top-right",
          autoClose: 3000,
        });
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
          <label htmlFor="Username">Username</label>
          <input
            type="text"
            id="Username"
            required
            onChange={(e) => setUsername(e.target.value)}
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
          <button type="submit" className="btn bgDanger">
            Submit
          </button>
        </div>
        <Outlet />
      </form>
    </div>
  );
}

export default Login;
