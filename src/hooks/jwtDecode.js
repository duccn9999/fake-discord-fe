import { useSelector} from 'react-redux'
import { jwtDecode } from "jwt-decode"; // Correct import for jwt-decode

const useJwtDecode = () => {
  const token = useSelector(state => state.token.value);
  if (token) {
    try {
      const decoded = jwtDecode(token);
      return {
        userId: decoded.userId,
        avatar: decoded.avatar,
        username: decoded.username,
        password: decoded.password,
        email: decoded.email,
        jti: decoded.jti,
        exp: decoded.exp,
      };
    } catch (error) {
      console.error("Invalid token", error);
    }
  }

  return null;
};

export default useJwtDecode;
