import axios from "axios";
import { useState } from "react";
import COMMON from "../utils/Common";
import { useSelector } from "react-redux";
import useJwtDecode from "./jwtDecode";

export function useFetchUsersInGroupChat() {
  const [usersInGroupChat, setUsersInGroupChat] = useState([]);
  const token = useSelector((state) => state.token.value);
  const user = useJwtDecode(token);
  const fetchUsersInGroupChat = async (groupChatId) => {
    if (!groupChatId || !token) return;

    try {
      const response = await axios.get(
        `${COMMON.API_BASE_URL}Users/GetUsersInGroupChat/${groupChatId}/${user.userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUsersInGroupChat(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  return { usersInGroupChat, fetchUsersInGroupChat };
}

export default useFetchUsersInGroupChat;
