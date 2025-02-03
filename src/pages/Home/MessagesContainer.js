import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import COMMON from "../../utils/Common";
import { clear } from "../../reducers/tokenReducer";
import { GET_MESSAGES } from "../../reducers/messagesReducer";
import useJwtDecode from "../../hooks/jwtDecode";
import useInfiniteScroll from "../../hooks/infiniteScroll";
import { v4 as uuidv4 } from "uuid";
import { Message } from "./Message";
import $ from "jquery";
export function MessagesContainer({ channel, channelHub }) {
  const token = useSelector((state) => state.token.value);
  const user = useJwtDecode(token);
  const messages = useSelector((state) => state.messages.value);
  const dispatch = useDispatch();
  const [message, setMessage] = useState(null);
  const ITEMS = 3;
  // Display messages
  useEffect(() => {
    axios
      .get(
        `${COMMON.API_BASE_URL}Messages/GetMessagesPaginationByChannelIdAsync/${
          channel.channelId
        }?page=${1}&items=${ITEMS}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        if (response.status === 200) {
          dispatch(GET_MESSAGES(response.data));
        } else if (response.status === 401) {
          dispatch(clear(token));
        }
      });
  }, [channel.channelId, token]);

  // Add message
  const newMessage = {
    UserCreated: user.userId,
    UserName: user.username,
    Avatar: user.avatar,
    ReplyTo: 0,
    Content: message,
    ChannelId: channel.channelId,
  };
  const sendMessage = async (e) => {
    e.preventDefault();
    const response = await axios
      .post(`${COMMON.API_BASE_URL}Messages/CreateMessage`, newMessage, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        $("#msgInput").val("");
        setMessage("");
        console.log(response.data);
        channelHub.invoke("SendMessage", response.data);
      })
      .catch((err) => {
        console.log("Error: ", err);
        dispatch(clear(token));
      });
    return response;
  };
  return (
    <>
      <h1 className="textFaded">Welcome to {channel.channelName}</h1>
      <div className="msgContainer textFaded" style={{ padding: "0 1rem 0 1rem" }}>
        {!messages
          ? "Loading...."
          : messages?.map((message) => (
              <Message key={uuidv4()} message={message} />
            ))}
      </div>
      <div style={{ gridRow: 3 }}>
        <form className="dFlex" onSubmit={sendMessage}>
          <input
            type="text"
            className="dBlock"
            onChange={(e) => setMessage(e.target.value)}
            id="msgInput"
          />
          <button>Submit</button>
        </form>
      </div>
    </>
  );
}
