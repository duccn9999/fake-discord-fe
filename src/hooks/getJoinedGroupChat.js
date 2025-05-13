import { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { clear } from "../path/to/your/actions"; // Update path
import COMMON from "../path/to/common/constants"; // Update path

const useJoinedGroupChats = () => {
  const [groupChats, setGroupChats] = useState([]);
  const dispatch = useDispatch();
  const token = useSelector((state) => state.token.value); // Adjust if needed

  const fetchGroupChats = useCallback(async (userId) => {
    try {
      const response = await axios.get(
        `${COMMON.API_BASE_URL}GroupChats/GetJoinedGroupChats/${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setGroupChats(response.data);
    } catch (err) {
      console.error("Failed to fetch group chats:", err);
      dispatch(clear(token));
    }
  }, [token, dispatch]);

  return { groupChats, fetchGroupChats };
};

export default useJoinedGroupChats;
