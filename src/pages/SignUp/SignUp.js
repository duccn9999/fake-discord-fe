import Styles from "./SignUp.module.css";
import { Outlet, Link } from "react-router-dom";
function SignUp(params) {
  return (
    <div className="formContainer">
      <form id={Styles.signUpForm} className="form">
        <h1>Signup</h1>
        <div className="inputGroup">
          <label htmlFor="username">Username</label>
          <input type="text" id="username" className="inputGroup" />
        </div>
        <div className="inputGroup">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" className="inputGroup" />
        </div>
        <div className="inputGroup">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" className="inputGroup" />
        </div>
        <div className="inputGroup">
          <label htmlFor="repeatPassword">Repeat password</label>
          <input type="password" id="repeatPassword" className="inputGroup" />
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
