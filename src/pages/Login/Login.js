import Styles from "./Login.module.css";
import { Outlet, Link, Navigate } from "react-router-dom";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import COMMON from "../../utils/Common";
import { save } from "../../reducers/tokenReducer";
import axios from "axios";
import { toast } from "react-toastify";
function Login() {
  const [UserName, setUserName] = useState(null);
  const [Password, setPassword] = useState(null);
  const dispatch = useDispatch();
  const token = useSelector((state) => state.token.value);
  if (token) {
    return <Navigate to={"/home"} />;
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios
      .post(
        `${COMMON.API_BASE_URL}Authentication/Login`,
        { UserName: UserName, Password: Password },
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
        toast.error("Failed to login profile: " + err.message, {
          position: "top-right",
          autoClose: 5000,
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
          <button type="submit" className="btn bgDanger">
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
