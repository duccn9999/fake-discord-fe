import axios from "axios";
import { useState } from "react";
import COMMON from "../utils/Common";
import { useSelector } from "react-redux";

export function useFetchRolesByGroupChat() {
  const [rolesByGroupChat, setRolesByGroupChat] = useState([]);
  const token = useSelector((state) => state.token.value);

  const fetchRolesByGroupChat = async (groupChatId) => {
    if (!groupChatId || !token) return;

    try {
      const response = await axios.get(
        `${COMMON.API_BASE_URL}Roles/GetRolesByGroupChat/${groupChatId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRolesByGroupChat(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  return { rolesByGroupChat, fetchRolesByGroupChat };
}

export default useFetchRolesByGroupChat;
