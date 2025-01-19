import { useEffect, useState } from "react";
import useJwtDecode from "./jwtDecode";

const useCheckTokenExpired = () => {
  const user = useJwtDecode();
  const [tokenExpired, setTokenExpired] = useState(true);
  useEffect(() => {
    const checkExpiration = () => {
      if (user && user.exp) {
        setTokenExpired(user.exp * 1000 < Date.now()); // Check if the token is expired
      }
    };
    checkExpiration();
    const interval = setInterval(checkExpiration, 1000);
    return () => clearInterval(interval);
  }, [user]);
  return tokenExpired; // If user or exp is missing, assume expired
};

export default useCheckTokenExpired;
