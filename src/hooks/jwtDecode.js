import { jwtDecode } from "jwt-decode"; // Correct import for jwt-decode

const useJwtDecode = (token) => {
  if (token) {
    const decoded = jwtDecode(token);
    return {
      userId: decoded.userId,
      avatar: decoded.avatar,
      username: decoded.username,
      password: decoded.password,
      email: decoded.email,
      jti: decoded.jti,
      roles: JSON.parse(decoded.roles),
      exp: decoded.exp,
    };
  }
  return null;
};

export default useJwtDecode;
