import { useState } from "react";
import Styles from "./SignUp.module.css";
import { Outlet, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import COMMON from "../../utils/Common";
function SignUp() {
  const [username, setUsername] = useState(null);
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const [repeatPassword, setRepeatPassword] = useState(null);
  const navigate = useNavigate();
  const signUpModel = {
    username: username,
    email: email,
    password: password,
    repeatPassword: repeatPassword,
  };
  const signUp = (e) => {
    e.preventDefault();
    axios
      .post(`${COMMON.API_BASE_URL}Authentication/SignUp`, signUpModel)
      .then((response) => {
        if (response.status === 200) {
          navigate("/");
        }
      })
      .catch((err) => {
        Error(err);
      });
  };
  return (
    <div className="formContainer">
      <form id={Styles.signUpForm} className="form" onSubmit={signUp}>
        <h1>Signup</h1>
        <div className="inputGroup">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            className="inputGroup"
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="inputGroup">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            className="inputGroup"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="inputGroup">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            className="inputGroup"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="inputGroup">
          <label htmlFor="repeatPassword">Repeat password</label>
          <input
            type="password"
            id="repeatPassword"
            className="inputGroup"
            onChange={(e) => setRepeatPassword(e.target.value)}
          />
        </div>
        <div className="inputGroup">
          <button type="submit" className="btn bgDanger">
            Submit
          </button>
        </div>
        <div>
          Already have an account ? <Link to="/">Login now</Link>
        </div>
      </form>
    </div>
  );
}
export default SignUp;
