import axios from "axios";
import COMMON from "../utils/Common";

export function useUpdateLastSeenMessage() {
  const updateLastSeenMessage = async (userId, channelId, newestId, token) => {
    try {
      const response = await axios.put(
        `${COMMON.API_BASE_URL}Messages/UpdateLastSeenMessage/${userId}/${channelId}`,
        newestId,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.log("Conflict!");
      return null;
    }
  };
  
  return updateLastSeenMessage;
}

export default useUpdateLastSeenMessage;