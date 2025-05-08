// create custom hook with this api
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import COMMON from "../utils/Common";

export function useGetUsersInGroupChatWithRoles(groupChatId) {
  const token = useSelector((state) => state.token.value);
  const [usersInGroupChat, setUsersInGroupChat] = useState([]);

  useEffect(() => {
    if (groupChatId) {
      axios
        .get(
          `${COMMON.API_BASE_URL}Users/GetUsersInGroupChatWithRoles/${groupChatId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        )
        .then((response) => {
          setUsersInGroupChat(response.data);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [groupChatId, token]);

  return usersInGroupChat;
}

export default useGetUsersInGroupChatWithRoles;