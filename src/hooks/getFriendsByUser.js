import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import COMMON from "../utils/Common"; // Adjust the import path as needed
import { useSelector } from "react-redux";

// In your useFriendsByUser hook
const useFriendsByUser = (userId) => {
  const [friendsData, setFriendsData] = useState([]);
  const token = useSelector((state) => state.token.value);

  useEffect(() => {
    if (!userId || !token) return;
    const fetchFriends = async () => {
      try {
        const response = await axios.get(
          `${COMMON.API_BASE_URL}UserFriends/GetFriendsByUser/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setFriendsData(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchFriends();
  }, [userId, token]);
  return { friendsData }; // Make sure this exactly matches what you're destructuring
};

export default useFriendsByUser;
