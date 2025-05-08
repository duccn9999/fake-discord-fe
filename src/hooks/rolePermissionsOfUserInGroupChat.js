import { useSelector } from "react-redux";
import useJwtDecode from "./jwtDecode";
import { useEffect, useState } from "react";
import axios from "axios";

const useRolePermissionsOfUserInGroupChat = (groupChatId) => {
  const [permissions, setPermissions] = useState([]);
  var token = useSelector((state) => state.token.value);
  var user = useJwtDecode(token);
  // get permissions name of each role in each group chat of user
  useEffect(() => {
    if (!token || !groupChatId) return;
    axios
      .get(`https://localhost:7065/RolePermissions/${user.userId}/${groupChatId}`)
      .then((response) => {
        setPermissions(response.data);
      })
      .catch((err) => {
        console.error("Failed to fetch role permissions:", err);
      });
  }, [token, groupChatId]); // Only run when groupChatId or token changes
  return permissions;
};
export default useRolePermissionsOfUserInGroupChat;
