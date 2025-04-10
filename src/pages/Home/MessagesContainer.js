import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import COMMON from "../../utils/Common";
import { clear } from "../../reducers/tokenReducer";
import { GET_MESSAGES } from "../../reducers/messagesReducer";
import useJwtDecode from "../../hooks/jwtDecode";
import useInfiniteScroll from "../../hooks/infiniteScroll";
import { Message } from "./Message";
import $ from "jquery";
export function MessagesContainer({ channel, channelHub, groupChatId }) {
  const token = useSelector((state) => state.token.value);
  const user = useJwtDecode(token);
  const messages = useSelector((state) => state.messages.value);
  const dispatch = useDispatch();
  const [message, setMessage] = useState(null);
  const [messageId, setMessageId] = useState(null);
  const [updateBtnClicked, setUpdateButtonClicked] = useState(false);
  const messagesRef = useRef(null);
  const handleUpdateMessage = (id, value) => {
    setMessageId(id);
    $("#msgInput").val(value);
    setUpdateButtonClicked(true);
  };
  // make scrollbar at the bottom by default
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  // Display messages
  const { items, loading, loaderRef } = useInfiniteScroll(
    `${COMMON.API_BASE_URL}Messages/GetMessages`,
    channel.channelId,
    10
  );
  useEffect(() => {
    dispatch(GET_MESSAGES(items));
  }, [items, dispatch]);
  // Add message
  const newMessage = {
    userCreated: user.userId,
    userName: user.username,
    avatar: user.avatar,
    replyTo: 0,
    content: message,
    channelId: channel.channelId,
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
        channelHub.invoke("SendMessage", response.data);
      })
      .catch((err) => {
        console.log("Error: ", err);
        dispatch(clear(token));
      });
    return response;
  };
  // Edit message
  const updatedMessage = {
    MessageId: messageId,
    Content: message,
    ChannelId: channel.channelId,
  };
  const updateMessage = async (e) => {
    e.preventDefault();
    setUpdateButtonClicked(true);
    axios
      .put(`${COMMON.API_BASE_URL}Messages/UpdateMessage`, updatedMessage, {
        headers: {
          Authorization: `bearer ${token}`,
        },
      })
      .then((response) => {
        $("#msgInput").val("");
        setMessage("");
        $(`.optionsBtn${messageId}`).hide();
        channelHub.invoke("UpdateMessage", response.data);
        setUpdateButtonClicked(false);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        width: "90%",
        flexDirection: "column",
      }}
    >
      <h1 className="textFaded" style={{ margin: "auto" }}>
        {channel.channelName}
      </h1>
      <div
        className="msgContainer textFaded dFlex"
        style={{
          padding: "0 1rem 0 1rem",
          overflowY: "auto",
          height: "100%",
          display: "flex",
          flexDirection: "column", // Change to normal column direction
        }}
        ref={messagesRef}
      >
        {/* LoaderRef at the top */}
        {loading && <p>Loading...</p>}
        <div ref={loaderRef} style={{ height: "10px" }}></div>
        <div style={{ flexGrow: 1 }}></div>
        {/* Reverse the messages programmatically */}
        {messages
          ?.slice()
          .reverse()
          .map((message, index) => (
            <Message
              key={index}
              message={message}
              handleUpdateMessage={handleUpdateMessage}
              channelHub={channelHub}
              groupChatId={groupChatId}
            />
          ))}
      </div>
      <div className="posSticky" style={{ bottom: 0 }}>
        <form
          className="dFlex"
          onSubmit={updateBtnClicked ? updateMessage : sendMessage}
        >
          <input
            type="text"
            className="dBlock"
            onChange={(e) => setMessage(e.target.value)}
            id="msgInput"
          />
          <button className="btn bgSuccess">Submit</button>
        </form>
      </div>
    </div>
  );
}
