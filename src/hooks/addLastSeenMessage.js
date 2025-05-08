import axios from "axios";
import COMMON from "../utils/Common";
import { useSelector } from "react-redux";
export function useAddLastSeenMessage() {
  const token = useSelector((state) => state.token.value);
  const addLastSeenMessage = (message) => {
    // insert last seen message to the last seen message list
    axios
      .post(
        `${COMMON.API_BASE_URL}Messages/AddLastSeenMessage`,
        {
          userId: message.userId,
          channelId: message.channelId,
          messageId: message.messageId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        console.log(response.data || null);
      })
      .catch(() => {
        // display a normal message because this error is normal flow
        console.log("XXXXXXXX");
      });
  };
  return addLastSeenMessage;
}
export default useAddLastSeenMessage;
