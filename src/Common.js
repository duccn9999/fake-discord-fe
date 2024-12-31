import { jwtDecode } from "jwt-decode";
const COMMON = {
  API_BASE_URL: "https://localhost:7065/",
  SESSION: window.localStorage.getItem("session"),
  JwtDecode: (obj) => {
    var token = window.localStorage.getItem("session");
    const jwt = jwtDecode(token, { payload: true });
    const user = {
      id: jwt.iss,
      username: jwt.sub,
      email: jwt.email,
      jti: jwt.jti
    }
    return user;
  },
};

export default COMMON;
