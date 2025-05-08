import axios from "axios";
import COMMON from "../utils/Common";
import { useSelector } from "react-redux";
export function useMarkMentionsAsRead() {
  const token = useSelector((state) => state.token.value);
  const markMessageAsRead = async (userId, channelId) => {
    // insert last seen message to the last seen message list
    try {
      const response = await axios.put(
        `${COMMON.API_BASE_URL}Messages/MarkMentionsAsRead/${userId}/${channelId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch {
      return null;
    }
  };
  return markMessageAsRead;
}

export default useMarkMentionsAsRead;
